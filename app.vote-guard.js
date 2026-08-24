/**
 * app.vote-guard.js — Protection anti-doublon pour votes et notations.
 *
 * À charger APRÈS app.js (et app.perf.js / app.harden.js si présents).
 *
 * STRATÉGIE EN DEUX COUCHES :
 *
 *   COUCHE 1 — Verrou localStorage (UX, dissuasion)
 *     • Empêche un même navigateur de voter plusieurs fois sur la même promesse
 *     • Empêche un même navigateur de noter plusieurs fois le même service en
 *       moins de 24 h
 *     • Affiche immédiatement le statut "déjà voté" — pas de cycle aller-retour
 *     • Contournable (effacer localStorage / onglet privé), mais bloque le cas
 *       du clic répété accidentel et l'utilisateur honnête qui ne sait plus
 *
 *   COUCHE 2 — Empreinte client envoyée à Supabase
 *     • Génère un identifiant stable de navigateur (UUID v4 stocké dans
 *       localStorage), envoyé avec chaque vote dans le champ `client_id`
 *     • Avec la contrainte UNIQUE (promise_id, client_id) côté BDD
 *       (cf. supabase-schema.sql), l'INSERT est rejeté en doublon
 *     • L'IP n'est plus du tout récupérée côté client (suppression de
 *       getIPAddress qui passe par api.ipify.org — problème CSP + RGPD)
 *
 *   COUCHE 3 (recommandation, hors de ce fichier) :
 *     • Edge function Supabase qui voit la vraie IP via les headers HTTP
 *     • Hash SHA-256(IP + secret + jour) → champ `ip_fingerprint`
 *     • RLS policy rate-limit : max N votes par ip_fingerprint par fenêtre
 *
 * Voir supabase-schema.sql pour le SQL à exécuter dans le dashboard.
 */

(function () {
    'use strict';

    const STORAGE_KEYS = {
        clientId:     'projetbi_client_id',
        promiseVotes: 'projetbi_voted_promises',   // { [promiseId]: { rating, ts } }
        serviceRatings: 'projetbi_rated_services'  // { [service]:   { ts } }
    };

    // Cooldown : un service ne peut être renoté qu'après 24 h depuis le même navigateur
    const SERVICE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

    // ─────────────────────────────────────────────────────────────
    //  1.  Identifiant stable de navigateur (client_id UUID v4)
    // ─────────────────────────────────────────────────────────────
    function generateUUIDv4() {
        // crypto.randomUUID est dispo sur tout navigateur récent et HTTPS
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        // Fallback pour les navigateurs anciens
        const bytes = new Uint8Array(16);
        (window.crypto || window.msCrypto).getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
        return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
    }

    function getClientId() {
        try {
            let id = localStorage.getItem(STORAGE_KEYS.clientId);
            if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
                id = generateUUIDv4();
                localStorage.setItem(STORAGE_KEYS.clientId, id);
            }
            return id;
        } catch (e) {
            // Stockage indisponible (mode privé restrictif) → ID éphémère par session
            if (!window._sessionClientId) {
                window._sessionClientId = generateUUIDv4();
            }
            return window._sessionClientId;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  2.  Lecture / écriture sûre du registre local de votes
    // ─────────────────────────────────────────────────────────────
    function readMap(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (e) {
            return {};
        }
    }
    function writeMap(key, map) {
        try {
            localStorage.setItem(key, JSON.stringify(map));
            return true;
        } catch (e) {
            return false;
        }
    }

    function hasVotedOnPromise(promiseId) {
        const m = readMap(STORAGE_KEYS.promiseVotes);
        return Boolean(m[promiseId]);
    }
    function recordPromiseVote(promiseId, rating) {
        const m = readMap(STORAGE_KEYS.promiseVotes);
        m[promiseId] = { rating, ts: Date.now() };
        writeMap(STORAGE_KEYS.promiseVotes, m);
    }

    function getServiceCooldownRemaining(service) {
        const m = readMap(STORAGE_KEYS.serviceRatings);
        const entry = m[service];
        if (!entry) return 0;
        const elapsed = Date.now() - entry.ts;
        return Math.max(0, SERVICE_COOLDOWN_MS - elapsed);
    }
    function recordServiceRating(service) {
        const m = readMap(STORAGE_KEYS.serviceRatings);
        m[service] = { ts: Date.now() };
        writeMap(STORAGE_KEYS.serviceRatings, m);
    }

    function formatRemaining(ms) {
        const hours = Math.ceil(ms / (60 * 60 * 1000));
        if (hours <= 1) return 'environ 1 heure';
        if (hours < 24) return 'environ ' + hours + ' heures';
        return 'environ ' + Math.ceil(hours / 24) + ' jour(s)';
    }

    // ─────────────────────────────────────────────────────────────
    //  3.  Wrap saveVoteToSupabase — bloque les doublons + envoie client_id
    // ─────────────────────────────────────────────────────────────
    const _origSaveVoteToSupabase = window.saveVoteToSupabase;
    window.saveVoteToSupabase = async function saveVoteToSupabase(promiseId, rating, comment) {
        comment = comment || '';

        // COUCHE 1 — verrou local
        if (hasVotedOnPromise(promiseId)) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    'Vous avez déjà voté pour cet engagement. Merci de votre participation !',
                    'info'
                );
            }
            // Refermer la modale si elle est ouverte
            if (typeof window.closeRatingModal === 'function') {
                window.closeRatingModal();
            }
            return;
        }

        // COUCHE 2 — l'INSERT enverra client_id via le wrapper safeSupabaseInsert
        // (cf. plus bas). On enregistre LOCALEMENT avant l'envoi : si la requête
        // échoue, le verrou empêchera quand même de re-cliquer immédiatement.
        recordPromiseVote(promiseId, rating);

        // Désactiver le bouton de soumission pour éviter le double-clic
        const submitBtn = document.querySelector('#submitRating, [onclick*="submitRating"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            setTimeout(() => { submitBtn.disabled = false; }, 3000);
        }

        // Délégation à la fonction d'origine (qui appelle safeSupabaseInsert)
        if (typeof _origSaveVoteToSupabase === 'function') {
            return await _origSaveVoteToSupabase.call(this, promiseId, rating, comment);
        }
    };

    // ─────────────────────────────────────────────────────────────
    //  4.  Wrap saveRatingToSupabase — bloque les doublons sur 24 h
    // ─────────────────────────────────────────────────────────────
    const _origSaveRatingToSupabase = window.saveRatingToSupabase;
    window.saveRatingToSupabase = async function saveRatingToSupabase(ratingData) {
        if (!ratingData || !ratingData.service) {
            return _origSaveRatingToSupabase ? _origSaveRatingToSupabase.call(this, ratingData) : false;
        }

        // COUCHE 1 — cooldown 24 h par service
        const remaining = getServiceCooldownRemaining(ratingData.service);
        if (remaining > 0) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    'Vous avez déjà noté ce service. Vous pourrez le renoter dans ' +
                    formatRemaining(remaining) + '.',
                    'info'
                );
            }
            return false;
        }

        recordServiceRating(ratingData.service);

        if (typeof _origSaveRatingToSupabase === 'function') {
            return await _origSaveRatingToSupabase.call(this, ratingData);
        }
        return false;
    };

    // ─────────────────────────────────────────────────────────────
    //  5.  Wrap safeSupabaseInsert — injecte client_id sur les tables sensibles
    // ─────────────────────────────────────────────────────────────
    const _origSafeSupabaseInsert = window.safeSupabaseInsert;
    if (typeof _origSafeSupabaseInsert === 'function') {
        window.safeSupabaseInsert = async function safeSupabaseInsert(table, data, retryCount) {
            // On ne touche qu'aux deux tables de votes
            if ((table === 'votes' || table === 'service_ratings') && data && typeof data === 'object') {
                data = Object.assign({}, data, { client_id: getClientId() });
                // On retire l'ancien user_ip qui transitait par api.ipify.org (CSP + RGPD)
                if ('user_ip' in data) delete data.user_ip;
            }
            return await _origSafeSupabaseInsert.call(this, table, data, retryCount);
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  6.  Neutraliser getIPAddress (api.ipify.org : CSP + privacy)
    //      Remplace par un no-op qui ne bloque pas l'ancien code.
    // ─────────────────────────────────────────────────────────────
    window.getIPAddress = async function getIPAddress() {
        // L'IP réelle est accessible côté serveur via une edge function.
        // Côté client, on ne récupère plus rien.
        return null;
    };

    // ─────────────────────────────────────────────────────────────
    //  7.  Indication visuelle "déjà voté" sur les promesses concernées
    //      Au rendu de la grille, on grise les boutons "Noter" pour les
    //      promesses déjà votées.
    // ─────────────────────────────────────────────────────────────
    function annotateVotedPromises() {
        const voted = readMap(STORAGE_KEYS.promiseVotes);
        const ids = Object.keys(voted);
        if (ids.length === 0) return;

        ids.forEach(id => {
            // Échapper l'ID pour l'utiliser dans un attribute selector
            const safeId = String(id).replace(/[^A-Za-z0-9_\-.]/g, '');
            if (!safeId) return;
            const card = document.querySelector('.promise-card[data-id="' + safeId + '"]');
            if (!card) return;

            const btn = card.querySelector('.btn-stars');
            if (btn && !btn.dataset.alreadyVoted) {
                btn.dataset.alreadyVoted = '1';
                btn.classList.add('btn-stars--voted');
                btn.setAttribute('aria-label',
                    'Vous avez déjà voté pour cet engagement avec ' +
                    voted[id].rating + ' étoile(s)');
                // On garde le bouton cliquable pour que l'utilisateur ait le feedback,
                // mais on change l'icône et le texte
                btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Voté (' +
                                voted[id].rating + '★)';
            }
        });
    }

    // CSS minimal pour le bouton "déjà voté"
    function injectCSS() {
        if (document.getElementById('vote-guard-style')) return;
        const style = document.createElement('style');
        style.id = 'vote-guard-style';
        style.textContent = `
            .btn-stars--voted {
                opacity: 0.6;
                background: #C5DBC0 !important;
                color: #1F4530 !important;
                cursor: default !important;
            }
            .btn-stars--voted:hover {
                opacity: 0.7;
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Réannote après chaque rendu de la grille (le DOM est reconstruit par renderPromises)
    function setupAnnotationObserver() {
        const grid = document.getElementById('promisesGrid');
        if (!grid) return;
        let queued = false;
        const obs = new MutationObserver(() => {
            if (queued) return;
            queued = true;
            // Throttle pour éviter de réannoter à chaque mutation interne
            requestAnimationFrame(() => {
                queued = false;
                annotateVotedPromises();
            });
        });
        obs.observe(grid, { childList: true });
    }

    // ─────────────────────────────────────────────────────────────
    //  8.  Initialisation
    // ─────────────────────────────────────────────────────────────
    function init() {
        injectCSS();
        getClientId();           // crée le client_id s'il n'existe pas
        annotateVotedPromises(); // pour le rendu initial
        setupAnnotationObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose pour debug et utilisation par d'autres modules
    window.voteGuard = {
        getClientId,
        hasVotedOnPromise,
        getServiceCooldownRemaining,
        // Reset uniquement pour debug en console
        _resetAll() {
            try {
                localStorage.removeItem(STORAGE_KEYS.clientId);
                localStorage.removeItem(STORAGE_KEYS.promiseVotes);
                localStorage.removeItem(STORAGE_KEYS.serviceRatings);
                console.log('[vote-guard] Tous les verrous locaux supprimés');
            } catch (e) {}
        }
    };
})();
