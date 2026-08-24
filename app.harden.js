/**
 * app.harden.js — Patch de durcissement sécurité + accessibilité pour projetbi.
 *
 * À charger APRÈS app.js (et après app.perf.js si présent). Mêmes principes :
 * les déclarations de fonctions hissées remplacent celles d'origine.
 *
 * Couvre :
 *   1.  Helpers d'échappement contextuels : HTML / attribut / chaîne JS
 *   2.  Wrap des fonctions à risque XSS (showAllRatings, openNewsModal)
 *   3.  Lecture sûre du localStorage (`safeReadJSON`) — remplace les JSON.parse nus
 *   4.  Modales accessibles : ESC, focus trap, retour de focus, role="dialog"
 *   5.  Carrousels accessibles : pause hover/focus + prefers-reduced-motion
 *   6.  Boutons icône : ajout automatique d'aria-label depuis title
 *   7.  Icônes décoratives : aria-hidden="true" automatique
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    //  1.  ÉCHAPPEMENT CONTEXTUEL
    // ─────────────────────────────────────────────────────────────

    // 1a — HTML body : ce que escapeHTML faisait déjà. On garde celui de app.perf.js
    //      mais on ajoute deux helpers spécialisés que le code originel n'a pas.

    /** Échappe pour un attribut HTML entre guillemets doubles. Plus strict que escapeHTML. */
    const ATTR_ESCAPE_RE = /[&<>"'`=]/g;
    const ATTR_ESCAPES = {
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',
        "'":'&#39;','`':'&#96;','=':'&#61;'
    };
    window.escapeAttr = function escapeAttr(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(ATTR_ESCAPE_RE, c => ATTR_ESCAPES[c]);
    };

    /**
     * Échappe pour un littéral string JavaScript (entre apostrophes simples).
     * Indispensable quand on injecte une valeur dans onclick="fn('${x}')".
     * Bloque : guillemets, backslash, sauts de ligne, balises HTML, séquences U+2028/2029.
     */
    window.escapeJSString = function escapeJSString(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/\\/g,  '\\\\')
            .replace(/'/g,   "\\'")
            .replace(/"/g,   '\\"')
            .replace(/\n/g,  '\\n')
            .replace(/\r/g,  '\\r')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
            .replace(/</g,   '\\x3C')   // empêche </script> dans une chaîne
            .replace(/>/g,   '\\x3E');
    };

    // ─────────────────────────────────────────────────────────────
    //  2.  Lecture sûre du localStorage
    // ─────────────────────────────────────────────────────────────
    window.safeReadJSON = function safeReadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === '') return fallback;
            const parsed = JSON.parse(raw);
            return parsed;
        } catch (e) {
            // Données corrompues : on log discrètement et on les écarte.
            // Important : on ne supprime pas la clé pour permettre le diagnostic ultérieur.
            console.warn('[harden] localStorage corrompu pour la clé', key, ':', e.message);
            return fallback;
        }
    };

    // ─────────────────────────────────────────────────────────────
    //  3.  showAllRatings — version sécurisée (error.message non échappé corrigé)
    // ─────────────────────────────────────────────────────────────
    const _origShowAllRatings = window.showAllRatings;
    if (typeof _origShowAllRatings === 'function') {
        window.showAllRatings = async function showAllRatings(category) {
            const body = document.getElementById('ratingsModalBody');
            try {
                return await _origShowAllRatings.call(this, category);
            } catch (error) {
                console.error('[harden] showAllRatings :', error);
                if (body) {
                    // textContent au lieu d'innerHTML : pas d'interprétation HTML possible.
                    body.innerHTML = '';
                    const wrap = document.createElement('div');
                    wrap.className = 'error-state';
                    wrap.innerHTML =
                        '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>' +
                        '<p>Erreur lors du chargement des notations</p>';
                    const small = document.createElement('small');
                    small.textContent = 'Une erreur est survenue. Veuillez réessayer.';
                    wrap.appendChild(small);
                    body.appendChild(wrap);
                }
            }
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  4.  openNewsModal — versions sûres des injections d'ID
    // ─────────────────────────────────────────────────────────────
    // Le pattern "onclick=\"shareNews('" + news.id + "')\"" laisse passer une apostrophe
    // dans l'ID. On wrap pour s'assurer que l'ID est échappé en chaîne JS.
    const _origOpenNewsModal = window.openNewsModal;
    if (typeof _origOpenNewsModal === 'function') {
        window.openNewsModal = function openNewsModal(newsId, event) {
            // Pré-validation : l'ID ne doit contenir que des caractères alphanumériques,
            // tirets, underscores, points. Toute autre valeur est rejetée.
            if (typeof newsId !== 'string' || !/^[A-Za-z0-9_.\-]{1,128}$/.test(newsId)) {
                console.warn('[harden] openNewsModal : ID invalide rejeté');
                if (event) event.preventDefault();
                return;
            }
            const ret = _origOpenNewsModal.call(this, newsId, event);
            // Après ouverture : appliquer les améliorations a11y
            const modal = document.getElementById('newsModal');
            if (modal) makeModalAccessible(modal, 'closeNewsModal');
            return ret;
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  5.  MODALES ACCESSIBLES
    //      ESC pour fermer, focus trap, retour de focus à l'élément déclencheur,
    //      role="dialog", aria-modal="true".
    // ─────────────────────────────────────────────────────────────
    const _modalState = new WeakMap(); // modal -> { trigger, keyHandler }

    function focusableSelector() {
        return [
            'a[href]:not([disabled])',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
    }

    function makeModalAccessible(modal, closeFnName) {
        if (!modal || _modalState.has(modal)) return; // déjà câblé
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('tabindex', '-1');

        const trigger = document.activeElement; // l'élément qui a ouvert la modale

        // Focus sur le premier élément focusable, ou sur la modale elle-même
        setTimeout(() => {
            const focusables = modal.querySelectorAll(focusableSelector());
            (focusables[0] || modal).focus();
        }, 50);

        const keyHandler = function (e) {
            if (modal.style.display === 'none' || !modal.isConnected) {
                cleanup();
                return;
            }
            if (e.key === 'Escape' || e.key === 'Esc') {
                e.preventDefault();
                if (typeof window[closeFnName] === 'function') {
                    window[closeFnName]();
                } else {
                    modal.style.display = 'none';
                }
                cleanup();
                if (trigger && typeof trigger.focus === 'function') {
                    trigger.focus();
                }
            } else if (e.key === 'Tab') {
                // Focus trap
                const focusables = modal.querySelectorAll(focusableSelector());
                if (focusables.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        function cleanup() {
            document.removeEventListener('keydown', keyHandler);
            _modalState.delete(modal);
        }

        document.addEventListener('keydown', keyHandler);
        _modalState.set(modal, { trigger, keyHandler });
    }

    // Wrap des fonctions de fermeture pour rendre le focus à l'élément déclencheur
    function wrapCloseFn(name) {
        const orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function () {
            // Trouve le modal associé pour récupérer le trigger
            const modalIds = ['newsModal', 'ratingsListModal', 'ratingModal', 'photoViewerModal'];
            let trigger = null;
            for (const id of modalIds) {
                const m = document.getElementById(id);
                if (m && _modalState.has(m)) {
                    trigger = _modalState.get(m).trigger;
                    _modalState.delete(m);
                    break;
                }
            }
            const ret = orig.apply(this, arguments);
            if (trigger && typeof trigger.focus === 'function') {
                setTimeout(() => trigger.focus(), 50);
            }
            return ret;
        };
    }

    // Câbler ESC + focus trap pour les modales statiques (HTML)
    document.addEventListener('DOMContentLoaded', () => {
        const staticModals = [
            { id: 'ratingsListModal', closeFn: 'closeRatingsModal' },
            { id: 'ratingModal',      closeFn: 'closeRatingModal' },
            { id: 'photoViewerModal', closeFn: 'closePhotoViewer' }
        ];
        staticModals.forEach(({ id, closeFn }) => {
            const m = document.getElementById(id);
            if (m) {
                // On ne fait `makeModalAccessible` qu'à l'ouverture (display:flex).
                // On observe les changements de style pour détecter ça.
                const obs = new MutationObserver(() => {
                    if (m.style.display && m.style.display !== 'none') {
                        makeModalAccessible(m, closeFn);
                    }
                });
                obs.observe(m, { attributes: true, attributeFilter: ['style'] });
            }
            wrapCloseFn(closeFn);
        });
        wrapCloseFn('closeNewsModal');
    });

    // ─────────────────────────────────────────────────────────────
    //  6.  CARROUSELS ACCESSIBLES
    //      Pause au survol et au focus, respect de prefers-reduced-motion.
    // ─────────────────────────────────────────────────────────────
    const prefersReducedMotion = () =>
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const _origStartCarouselAutoPlay = window.startCarouselAutoPlay;
    window.startCarouselAutoPlay = function startCarouselAutoPlay() {
        // WCAG 2.3.3 : ne jamais démarrer une animation chez un utilisateur qui la refuse.
        if (prefersReducedMotion()) {
            if (typeof window.CONFIG === 'object') window.CONFIG.carouselAutoPlay = false;
            return;
        }
        if (typeof _origStartCarouselAutoPlay === 'function') {
            return _origStartCarouselAutoPlay.apply(this, arguments);
        }
    };

    // Pause au survol / focus du carrousel de presse
    document.addEventListener('DOMContentLoaded', () => {
        const carouselContainer = document.getElementById('pressCarousel');
        if (carouselContainer && carouselContainer.parentElement) {
            const root = carouselContainer.parentElement;

            const pause = () => {
                if (typeof window.stopCarouselAutoPlay === 'function') {
                    window.stopCarouselAutoPlay();
                }
            };
            const resume = () => {
                if (prefersReducedMotion()) return; // toujours pas de redémarrage forcé
                if (typeof window.startCarouselAutoPlay === 'function' && window.CONFIG && window.CONFIG.carouselAutoPlay) {
                    window.startCarouselAutoPlay();
                }
            };

            root.addEventListener('mouseenter', pause);
            root.addEventListener('mouseleave', resume);
            root.addEventListener('focusin',   pause);
            root.addEventListener('focusout',  resume);
        }

        // Si l'utilisateur change sa préférence en cours de session, on s'adapte.
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            mq.addEventListener('change', () => {
                if (mq.matches && typeof window.stopCarouselAutoPlay === 'function') {
                    window.stopCarouselAutoPlay();
                    if (window.CONFIG) window.CONFIG.carouselAutoPlay = false;
                }
            });
        }
    });

    // ─────────────────────────────────────────────────────────────
    //  7.  BOUTONS ICÔNE — `aria-label` automatique depuis `title`
    //      Icônes Font Awesome décoratives → `aria-hidden="true"`
    // ─────────────────────────────────────────────────────────────
    function annotateIcons(root) {
        const r = root || document;

        // Boutons sans texte visible (icône seule) : copier title -> aria-label
        r.querySelectorAll('button:not([aria-label])').forEach(btn => {
            const title = btn.getAttribute('title');
            const text = btn.textContent.replace(/\s+/g, '').length; // texte non-blanc
            // Si le bouton n'a pas de texte significatif et a un title, on copie.
            if (title && text === 0) {
                btn.setAttribute('aria-label', title);
            }
        });

        // Liens icône-seul : idem
        r.querySelectorAll('a:not([aria-label])').forEach(a => {
            const title = a.getAttribute('title');
            const text = a.textContent.replace(/\s+/g, '').length;
            if (title && text === 0) {
                a.setAttribute('aria-label', title);
            }
        });

        // Icônes Font Awesome qui ne portent pas de texte : décoratives
        r.querySelectorAll('i.fa, i.fas, i.far, i.fab, i.fa-solid, i.fa-regular, i.fa-brands').forEach(i => {
            if (!i.hasAttribute('aria-hidden') && !i.hasAttribute('aria-label')) {
                i.setAttribute('aria-hidden', 'true');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        annotateIcons(document);

        // Re-annoter après chaque modification du DOM (rendu de promesses, news, etc.)
        // Throttlé à 200 ms pour ne pas crouler.
        let queued = false;
        const obs = new MutationObserver(() => {
            if (queued) return;
            queued = true;
            setTimeout(() => {
                queued = false;
                annotateIcons(document);
            }, 200);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    });

    // ─────────────────────────────────────────────────────────────
    //  8.  Indicateurs de carrousel : aria-label + role
    // ─────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        const labelDots = () => {
            document.querySelectorAll('.carousel-dot, .carousel-indicator').forEach((dot, i) => {
                if (!dot.hasAttribute('aria-label')) {
                    dot.setAttribute('aria-label', 'Diapositive ' + (i + 1));
                }
            });
        };
        labelDots();
        // Re-cabler après les rendus de carrousel
        const obs = new MutationObserver(labelDots);
        const wrappers = document.querySelectorAll('#carouselIndicators, [class*="carousel-dots"]');
        wrappers.forEach(w => obs.observe(w, { childList: true }));
    });

})();
