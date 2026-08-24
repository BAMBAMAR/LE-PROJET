/**
 * app.kpi-filters.js — Transforme les cartes KPI du dashboard en filtres cliquables
 * qui renvoient directement vers la liste des engagements correspondants.
 *
 * À charger APRÈS app.js (et app.perf.js / app.harden.js si présents).
 *
 * Cartes câblées :
 *   • #total       → tous les engagements (réinitialise le filtre)
 *   • #realise     → filtre "✅ Réalisé"
 *   • #encours     → filtre "🔄 En cours"
 *   • #non-lance   → filtre "⏳ Non lancé"
 *   • #retard      → filtre "En retard"
 *
 * Fonctionnalités :
 *   • Souris : clic
 *   • Clavier : Entrée ou Espace (focusable via Tab)
 *   • Lecteur d'écran : role="button" + aria-label + aria-pressed
 *   • Deep-linking : #engagements?filter=<valeur>
 *   • État actif visible (carte mise en évidence + autres légèrement atténuées)
 *   • Pas de scroll si l'utilisateur préfère reduced motion
 *   • Aucune modification de app.js : utilise les hooks existants (#filter-status + applyFilters)
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    //  1.  Mapping carte CSS → valeur du select #filter-status
    //      (les valeurs doivent correspondre EXACTEMENT aux <option> du select)
    // ─────────────────────────────────────────────────────────────
    const KPI_FILTERS = [
        { selector: '.stat-card.stat-total',      type: 'status',      value: '',           label: 'Tous les engagements' },
        { selector: '.stat-card.stat-success',    type: 'status',      value: '✅ Réalisé', label: 'engagements réalisés' },
        { selector: '.stat-card.stat-progress',   type: 'status',      value: '🔄 En cours', label: 'engagements en cours' },
        { selector: '.stat-card.stat-pending',    type: 'status',      value: '⏳ Non lancé', label: 'engagements non lancés' },
        { selector: '.stat-card.stat-warning',    type: 'status',      value: 'En retard',   label: 'engagements en retard' },
        { selector: '.stat-card.stat-rate',       type: 'status',      value: '✅ Réalisé', label: 'taux de réalisation' },
        { selector: '.stat-card.stat-time',       type: 'status',      value: 'En retard',   label: 'retard moyen' },
        { selector: '.stat-card.stat-rating',     type: 'status',      value: '',           label: 'note citoyenne' },
        { selector: '.stat-card.stat-update',     type: 'status',      value: '',           label: 'avec mise à jour' },
        { selector: '.stat-card.stat-domain',     type: 'domain',      value: 'Santé',      label: 'domaine principal' },
        { selector: '.stat-card.stat-presidence', type: 'institution', value: 'presidence', label: 'volet exécutif (Présidence)' },
        { selector: '.stat-card.stat-assemblee',  type: 'institution', value: 'assemblee',  label: 'volet législatif (Assemblée)' },
    ];

    // ─────────────────────────────────────────────────────────────
    //  2.  CSS injecté — pas besoin de modifier style.css ni design-system.css
    // ─────────────────────────────────────────────────────────────
    const CSS = `
        .stat-card--clickable {
            cursor: pointer;
            position: relative;
            transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1),
                        opacity   180ms cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        .stat-card--clickable:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 24px -4px rgba(45, 95, 63, 0.22);
        }

        .stat-card--clickable:active {
            transform: translateY(-1px);
        }

        .stat-card--clickable:focus-visible {
            outline: 3px solid #2D5F3F;
            outline-offset: 3px;
        }

        .stat-card--clickable::after {
            content: "🔎 Cliquer pour filtrer";
            position: absolute;
            bottom: 6px;
            right: 10px;
            font-size: 0.62rem;
            font-weight: 700;
            color: #2D5F3F;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 150ms ease, transform 150ms ease;
            pointer-events: none;
        }

        .stat-card--clickable:hover::after,
        .stat-card--clickable:focus-visible::after {
            opacity: 0.85;
            transform: translateY(0);
        }

        .stat-card--active {
            outline: 2.5px solid #2D5F3F !important;
            outline-offset: 2px !important;
            box-shadow: 0 8px 20px -2px rgba(45, 95, 63, 0.25) !important;
        }

        .stat-card--active::before {
            content: "✓ FILTRÉ";
            position: absolute;
            top: 6px;
            right: 8px;
            font-size: 0.58rem;
            font-weight: 800;
            background: #2D5F3F;
            color: #ffffff;
            padding: 1px 6px;
            border-radius: 100px;
            letter-spacing: 0.04em;
        }

        .stats-grid:has(.stat-card--active) .stat-card--clickable:not(.stat-card--active) {
            opacity: 0.75;
        }

        @media (prefers-reduced-motion: reduce) {
            .stat-card--clickable {
                transition: none;
            }
            .stat-card--clickable:hover {
                transform: none;
            }
        }
    `;

    function injectCSS() {
        if (document.getElementById('kpi-filters-styles')) return;
        const style = document.createElement('style');
        style.id = 'kpi-filters-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────────────────────
    //  3.  Application d'un filtre + scroll vers les engagements
    // ─────────────────────────────────────────────────────────────
    function applyFilterAndScroll(filterValue, options) {
        options = options || {};
        const statusSelect      = document.getElementById('filter-status');
        const institutionSelect = document.getElementById('filter-institution');
        const domainSelect      = document.getElementById('filter-domain');
        const searchInput       = document.getElementById('filter-search');
        const filtersSection    = document.getElementById('filtersSection');

        if (filtersSection) filtersSection.style.display = 'block';

        if (options.type === 'institution') {
            if (institutionSelect) institutionSelect.value = filterValue;
            if (statusSelect && options.reset) statusSelect.value = '';
        } else if (options.type === 'domain') {
            if (domainSelect) domainSelect.value = filterValue;
        } else {
            if (statusSelect) statusSelect.value = filterValue;
            if (institutionSelect && options.reset) institutionSelect.value = '';
        }

        if (options.reset) {
            if (domainSelect && options.type !== 'domain') domainSelect.value = '';
            if (searchInput)  searchInput.value  = '';
        }

        if (statusSelect) statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
        if (institutionSelect) institutionSelect.dispatchEvent(new Event('change', { bubbles: true }));

        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }

        markActiveCard(filterValue);

        // Mise à jour du hash pour le partage / deep-linking
        const newHash = filterValue
            ? '#engagements?filter=' + encodeURIComponent(filterValue)
            : '#engagements';
        if (history.replaceState) {
            history.replaceState(null, '', newHash);
        }

        // Défilement (sauf si demandé sans scroll, ex. au chargement initial via hash)
        if (options.scroll !== false) {
            scrollToEngagements();
        }

        // Annonce pour lecteurs d'écran via aria-live
        announceFilter(filterValue);
    }

    // ─────────────────────────────────────────────────────────────
    //  4.  Scroll vers la section #engagements (respecte reduced-motion)
    // ─────────────────────────────────────────────────────────────
    function scrollToEngagements() {
        const target = document.getElementById('engagements');
        if (!target) return;

        const reducedMotion = window.matchMedia &&
                              window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        target.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  5.  Marquage visuel de la carte active + aria-pressed
    // ─────────────────────────────────────────────────────────────
    function markActiveCard(filterValue) {
        KPI_FILTERS.forEach(({ selector, value }) => {
            const card = document.querySelector(selector);
            if (!card) return;

            const isActive = (value === filterValue);
            card.classList.toggle('stat-card--active', isActive);
            card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  6.  Annonce ARIA pour les lecteurs d'écran
    // ─────────────────────────────────────────────────────────────
    let _liveRegion = null;
    function getLiveRegion() {
        if (_liveRegion) return _liveRegion;
        _liveRegion = document.createElement('div');
        _liveRegion.setAttribute('role', 'status');
        _liveRegion.setAttribute('aria-live', 'polite');
        _liveRegion.setAttribute('aria-atomic', 'true');
        _liveRegion.style.cssText =
            'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
            'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        document.body.appendChild(_liveRegion);
        return _liveRegion;
    }
    function announceFilter(filterValue) {
        const entry = KPI_FILTERS.find(f => f.value === filterValue);
        if (!entry) return;
        const region = getLiveRegion();
        // Petit délai pour s'assurer que la mise à jour est annoncée même si l'utilisateur
        // clique plusieurs fois rapidement
        region.textContent = '';
        setTimeout(() => {
            region.textContent = filterValue
                ? 'Filtre appliqué : ' + entry.label + '.'
                : 'Filtres réinitialisés. Tous les engagements affichés.';
        }, 50);
    }

    // ─────────────────────────────────────────────────────────────
    //  7.  Câblage des cartes
    // ─────────────────────────────────────────────────────────────
    function setupKpiFilters() {
        injectCSS();
        const liveRegion = getLiveRegion(); // pré-créée pour minimiser le délai à la 1re annonce

        let wired = 0;
        KPI_FILTERS.forEach(({ selector, value, label, type }) => {
            const card = document.querySelector(selector);
            if (!card) return;

            // Évite le double câblage si la fonction est rappelée
            if (card.dataset.kpiFilterWired === '1') return;
            card.dataset.kpiFilterWired = '1';

            // Sémantique
            card.classList.add('stat-card--clickable');
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-pressed', 'false');
            card.setAttribute(
                'aria-label',
                value === ''
                    ? 'Voir tous les engagements'
                    : 'Filtrer pour voir uniquement les ' + label
            );

            // Clic souris/tactile
            card.addEventListener('click', () => {
                applyFilterAndScroll(value, { reset: value === '', type: type });
            });

            // Clavier : Entrée et Espace
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    applyFilterAndScroll(value, { reset: value === '' });
                }
            });

            wired++;
        });

        // Si le select est modifié par un autre moyen (dropdown, reset),
        // on resynchronise l'état actif des cartes
        const select = document.getElementById('filter-status');
        if (select && !select.dataset.kpiFilterSync) {
            select.dataset.kpiFilterSync = '1';
            select.addEventListener('change', () => markActiveCard(select.value));
        }

        return wired;
    }

    // ─────────────────────────────────────────────────────────────
    //  8.  Deep-linking : si l'URL contient ?filter=..., on l'applique
    //      au chargement (après que les promesses soient chargées)
    // ─────────────────────────────────────────────────────────────
    function applyHashFilter() {
        const match = window.location.hash.match(/[?&]filter=([^&]+)/);
        if (!match) return;

        const filterValue = decodeURIComponent(match[1]);
        const valid = KPI_FILTERS.some(f => f.value === filterValue);
        if (!valid) {
            console.warn('[kpi-filters] Valeur de filtre inconnue :', filterValue);
            return;
        }

        // Attend que la liste des promesses soit rendue (loadData met ~quelques centaines de ms)
        // On poll sur la présence de cartes dans #promisesGrid pour être robuste.
        const start = Date.now();
        const poll = setInterval(() => {
            const grid = document.getElementById('promisesGrid');
            const ready = grid && grid.querySelector('.promise-card');
            if (ready || Date.now() - start > 5000) {
                clearInterval(poll);
                applyFilterAndScroll(filterValue, { reset: true, scroll: true });
            }
        }, 100);
    }

    // ─────────────────────────────────────────────────────────────
    //  9.  Initialisation
    // ─────────────────────────────────────────────────────────────
    function init() {
        const wired = setupKpiFilters();
        if (wired === 0) {
            // Les cartes ne sont peut-être pas encore dans le DOM (édition future).
            // On observe et on retente.
            const obs = new MutationObserver(() => {
                if (setupKpiFilters() > 0) {
                    obs.disconnect();
                    applyHashFilter();
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            // Sécurité : on arrête d'observer après 10 s
            setTimeout(() => obs.disconnect(), 10000);
        } else {
            applyHashFilter();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
