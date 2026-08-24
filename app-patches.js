// ════════════════════════════════════════════════════════════════════
// app-patches.js — corrections ciblées à appliquer dans votre app.js
// ════════════════════════════════════════════════════════════════════
//
// Ce fichier N'EST PAS à charger directement. Il documente les 8 modifications
// chirurgicales à apporter à votre app.js existant (4 764 lignes).
//
// Cherchez chaque "PATCH X" dans votre app.js et appliquez le remplacement.
// Ordre : du plus important (sécurité) au moins critique (qualité).
// ════════════════════════════════════════════════════════════════════


// ────────────────────────────────────────────────
// PATCH 1 — Supprimer les `console.log` / `console.error`
// ────────────────────────────────────────────────
// Localisation : lignes 117, 2026, 2048 et environ 23 autres
// Pourquoi : 26 console statements visibles en production = fuite d'info de debug
//            + signalent au visiteur curieux des points d'entrée potentiels
//
// Action : remplacer toutes les occurrences par silenc() :

function silenc() { /* no-op — remplace les console en prod */ }

// Recherche/remplace dans app.js :
//   console.error(...)  →  silenc(...)
//   console.warn(...)   →  silenc(...)
//   console.log(...)    →  silenc(...)
//
// Ou plus simplement, en haut du fichier app.js, ajouter :
if (location.hostname !== 'localhost' && !location.hostname.startsWith('127.')) {
    ['log', 'error', 'warn', 'debug', 'info'].forEach(m => {
        console[m] = function() {};
    });
}


// ────────────────────────────────────────────────
// PATCH 2 — Supprimer le tableau press en dur (lignes 127-134)
// ────────────────────────────────────────────────
// Localisation : dans CONFIG = { ... press: [...] ... }
// Pourquoi : duplique press.json — devient incohérent dès qu'on met press.json à jour
//
// AVANT :
//   const CONFIG = {
//       ...
//       press: [
//           { id: '1', title: 'Le Soleil', date: '28/01/2026', ... },
//           ...
//       ],
//       ...
//   };
//
// APRÈS :
//   const CONFIG = {
//       ...
//       press: [],   // vide — sera rempli par le fetch de press.json
//       ...
//   };


// ────────────────────────────────────────────────
// PATCH 3 — Système de délégation d'événements (à AJOUTER au début)
// ────────────────────────────────────────────────
// Pourquoi : élimine les 31 onclick inline générés dans les templates
//            permet de retirer 'unsafe-inline' du CSP plus tard
//
// À ajouter en haut du fichier, après les fonctions escapeHTML :

document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const action = el.dataset.action;
    const id     = el.dataset.id;
    const param  = el.dataset.param;

    switch (action) {
        case 'share-promise':       sharePromise(id); break;
        case 'rate-promise':        showRatingModal(id); break;
        case 'toggle-updates':      toggleUpdates(id); break;
        case 'reset-filters':       resetFilters(); break;
        case 'share-news':          shareNews(id, param); break;
        case 'open-news':           openNewsModal(id, e); break;
        case 'share-platform':      shareToPlatform(id, param); break;
        case 'show-all-ratings':    showAllRatings(param); break;
        case 'goto-promise':        goToPromiseSection(id); break;
        case 'open-photo':          openPhotoViewer(id); break;
        case 'goto-carousel-slide': goToCarouselSlide(parseInt(param, 10)); break;
        case 'close-modal':         closeRatingModal(); break;
        case 'submit-rating':       submitRating(); break;
    }
});

// Ensuite, dans les fonctions qui génèrent du HTML, remplacer
// progressivement :
//
//   `<button onclick="shareToPlatform('${id}', 'facebook')">`
//
// par :
//
//   `<button data-action="share-platform" data-id="${escapeHTML(id)}" data-param="facebook">`


// ────────────────────────────────────────────────
// PATCH 4 — Sécurisation des onerror sur les images
// ────────────────────────────────────────────────
// Localisation : lignes 244 (img logo nav), 388 (img sonko), 2110, 2167, 2434
// Pourquoi : les onerror inline empêchent un CSP strict
//
// AVANT :
//   <img src="..." onerror="newsFallbackImg(this, 'cat', '200px', '12px 12px 0 0')">
//
// APRÈS :
//   <img src="..." class="js-news-img" data-cat="cat" data-h="200px" data-r="12px 12px 0 0">
//
// Et dans app.js, après chaque rendu de news, ajouter :

function bindNewsImageFallbacks() {
    document.querySelectorAll('.js-news-img:not([data-fallback-bound])').forEach(img => {
        img.dataset.fallbackBound = '1';
        img.addEventListener('error', () => {
            newsFallbackImg(img, img.dataset.cat, img.dataset.h, img.dataset.r);
        });
    });
}

// Appeler bindNewsImageFallbacks() après chaque appel à renderNews(), etc.


// ────────────────────────────────────────────────
// PATCH 5 — Validation Supabase plus stricte
// ────────────────────────────────────────────────
// Localisation : ligne 113 (initialisation supabaseClient)
// Pourquoi : si Supabase est down, le code actuel laisse supabaseClient à null
//            et tente quand même certaines opérations → erreurs silencieuses
//
// AVANT :
//   try {
//       if (typeof supabase !== 'undefined' && supabase.createClient) {
//           supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
//       }
//   } catch (error) {
//       supabaseClient = null;
//   }
//
// APRÈS :
async function initSupabase() {
    if (typeof supabase === 'undefined' || !supabase.createClient) {
        DEMO_MODE = true;
        return;
    }
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false,         // pas de session persistante côté public
                autoRefreshToken: false
            },
            global: {
                fetch: (url, opts = {}) => {
                    // Timeout de 10s pour éviter de bloquer la page
                    const ctrl = new AbortController();
                    const timer = setTimeout(() => ctrl.abort(), 10000);
                    return fetch(url, { ...opts, signal: ctrl.signal })
                        .finally(() => clearTimeout(timer));
                }
            }
        });
        // Vérifier la connexion
        const { error } = await supabaseClient.from('service_ratings')
            .select('count', { count: 'exact', head: true });
        if (error) {
            DEMO_MODE = true;
            supabaseClient = null;
        }
    } catch (e) {
        DEMO_MODE = true;
        supabaseClient = null;
    }
}
initSupabase();


// ────────────────────────────────────────────────
// PATCH 6 — Validation des entrées utilisateur (ratings)
// ────────────────────────────────────────────────
// Localisation : fonction submitRating()
// Pourquoi : actuellement, l'utilisateur peut envoyer un rating > 5 ou un
//            comment de 10 000 caractères en bypassant le formulaire HTML.
//            La RLS Supabase est la dernière barrière, mais valider côté
//            client améliore l'UX.
//
// À ajouter au début de submitRating() :

function validateRating(rating, comment) {
    const errors = [];
    const r = parseInt(rating, 10);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
        errors.push('La note doit être comprise entre 1 et 5.');
    }
    if (typeof comment === 'string' && comment.length > 500) {
        errors.push('Le commentaire ne doit pas dépasser 500 caractères.');
    }
    // Anti-spam basique
    if (comment && /https?:\/\//i.test(comment)) {
        errors.push('Les liens ne sont pas autorisés dans les commentaires.');
    }
    return errors;
}

// Usage :
//   const errors = validateRating(rating, comment);
//   if (errors.length) {
//       showNotification(errors.join(' '), 'error');
//       return;
//   }


// ────────────────────────────────────────────────
// PATCH 7 — Bouton "scroll to top" — afficher au scroll
// ────────────────────────────────────────────────
// Si pas déjà fait, ajouter quelque part dans l'init :

(function() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        btn.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
})();


// ────────────────────────────────────────────────
// PATCH 8 — Indicateur de progression du scroll
// ────────────────────────────────────────────────
// Si pas déjà branché, ajouter :

(function() {
    const bar = document.getElementById('progressIndicator');
    if (!bar) return;
    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();


// ════════════════════════════════════════════════════════════════════
// FIN DES PATCHES
// ════════════════════════════════════════════════════════════════════
//
// Tests à effectuer après application :
// ☐ La nav et le hamburger fonctionnent
// ☐ Les engagements se chargent et s'affichent
// ☐ Le formulaire d'évaluation soumet correctement
// ☐ Les boutons sociaux fonctionnent
// ☐ La modale de notation s'ouvre/se ferme
// ☐ Le scroll-to-top apparaît après 600px
// ☐ La barre de progression suit le scroll
// ☐ console.log est silencieux en production
// ☐ Aucune erreur Supabase ne bloque le chargement
// ════════════════════════════════════════════════════════════════════
