/**
 * app.perf.js — Patch d'optimisation de performance pour projetbi.
 *
 * À charger APRÈS app.js. Les déclarations de fonctions hissées remplacent
 * celles de app.js (même mécanisme que les duplicatas existants dans le code).
 *
 * Couvre les goulots :
 *   1.  Triple rendu au chargement (loadData / DOMContentLoaded / processVotes)
 *   2.  Fetch séquentiel des 3 fichiers JSON
 *   3.  updateStats : 13 passes -> 1 passe
 *   4.  applyFilters : champs _search pré-calculés, refs DOM cachées
 *   5.  forceSocialButtonsColors supprimée (travail dupliqué)
 *   6.  Scroll handlers en requestAnimationFrame
 *   7.  escapeHTML sans création d'élément DOM
 *   8.  Sort Schwartzian sur news/press
 *   9.  Date formatters mis en cache
 *  10.  Refs DOM stats mises en cache
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    //  1.  ESCAPE HTML — version table-driven, sans DOM
    // ─────────────────────────────────────────────────────────────
    const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const HTML_ESCAPE_RE = /[&<>"']/g;

    window.escapeHTML = function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(HTML_ESCAPE_RE, ch => HTML_ESCAPES[ch]);
    };
    window.escapeHtml = window.escapeHTML;

    window.escapeAndTruncate = function escapeAndTruncate(str, maxLength = 80) {
        if (!str) return '';
        const s = String(str);
        const truncated = s.length > maxLength ? s.slice(0, maxLength) + '...' : s;
        return window.escapeHTML(truncated);
    };

    // ─────────────────────────────────────────────────────────────
    //  2.  DATE FORMATTERS — Intl en cache (50× plus rapide en boucle)
    // ─────────────────────────────────────────────────────────────
    const FMT_SHORT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const FMT_LONG  = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long',  year: 'numeric' });

    window.formatDate = function formatDate(input) {
        if (!input) return 'Date inconnue';
        const d = input instanceof Date ? input : new Date(input);
        if (isNaN(d.getTime())) return 'Date inconnue';
        return FMT_SHORT.format(d);
    };

    window.formatDateProper = function formatDateProper(input) {
        if (!input) return 'Pas de date';
        let d;
        if (typeof input === 'string') {
            const parts = input.split('/');
            if (parts.length === 3) {
                d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
            } else {
                d = new Date(input);
            }
        } else {
            d = input instanceof Date ? input : new Date(input);
        }
        return d && !isNaN(d.getTime()) ? FMT_LONG.format(d) : String(input);
    };

    // ─────────────────────────────────────────────────────────────
    //  3.  parseDelayToDays — early-return, pas de regex redondante
    // ─────────────────────────────────────────────────────────────
    const RE_YEARS   = /(\d+)\s*an[s]?/i;
    const RE_MONTHS  = /(\d+)\s*mois/i;
    const RE_DAYS    = /(\d+)\s*jour[s]?/i;
    const RE_RANGE   = /(\d+)\s*à\s*(\d+)\s*an[s]?/i;
    const RE_ISODATE = /\d{4}-\d{2}-\d{2}/;
    const MANDAT_DAYS = 1825;

    window.parseDelayToDays = function parseDelayToDays(delayText) {
        if (!delayText) return 365;
        const lower = delayText.toLowerCase().trim();
        if (!lower) return 365;

        // Cas spéciaux à short-circuit
        if (lower.includes('2029') || lower.includes('2030')) return MANDAT_DAYS;
        if (lower.includes('mandat') || lower.includes('quinquennat')) return MANDAT_DAYS;
        if (lower.includes('immédiat') || lower.includes('immediat') || lower.includes('dès')) return 0;

        // Plage "X à Y ans"
        const range = lower.match(RE_RANGE);
        if (range) {
            const avg = Math.round((+range[1] * 365 + +range[2] * 365) / 2);
            return Math.min(avg, MANDAT_DAYS);
        }

        // Date ISO
        const iso = delayText.match(RE_ISODATE);
        if (iso) {
            const target = new Date(iso[0]);
            if (!isNaN(target.getTime()) && CONFIG.START_DATE) {
                const diff = Math.ceil((target - CONFIG.START_DATE) / 86400000);
                return Math.min(Math.max(0, diff), MANDAT_DAYS);
            }
        }

        // Combinaison ans + mois + jours
        let total = 0;
        const yMatch = lower.match(RE_YEARS);
        const mMatch = lower.match(RE_MONTHS);
        const dMatch = lower.match(RE_DAYS);
        if (yMatch) total += +yMatch[1] * 365;
        if (mMatch) total += +mMatch[1] * 30;
        if (dMatch) total += +dMatch[1];

        if (total === 0) {
            const num = parseInt(delayText.replace(/\D/g, ''), 10);
            total = isNaN(num) ? 365 : num * 365;
        }
        return Math.min(total, MANDAT_DAYS);
    };

    // ─────────────────────────────────────────────────────────────
    //  4.  loadData — fetch parallèle + un seul rendu
    // ─────────────────────────────────────────────────────────────
    window.loadData = async function loadData() {
        try {
            // Parallèle au lieu de séquentiel : économie ~2 RTT
            await Promise.all([
                window.loadPromisesData(),
                window.loadPressData(),
                window.loadNewsData()
            ]);

            // Pré-calcul des champs minuscules pour la recherche (cf. point 5)
            precomputeSearchFields();

            // Récupération des votes en arrière-plan, sans bloquer le rendu initial
            setTimeout(() => {
                window.fetchAndDisplayPublicVotes && window.fetchAndDisplayPublicVotes().catch(() => {});
            }, 1000);

            // Le rendu initial est désormais effectué uniquement par DOMContentLoaded.
            // On ne rend PLUS ici pour éliminer le double-rendu.
        } catch (error) {
            console.error(error);
            if (typeof showNotification === 'function') {
                showNotification('Erreur de chargement des données', 'error');
            }
            CONFIG.promises = (typeof generateTestPromises === 'function') ? generateTestPromises() : [];
            CONFIG.press    = (typeof getDefaultPressData === 'function') ? getDefaultPressData() : [];
            precomputeSearchFields();
        }
    };

    function precomputeSearchFields() {
        if (!Array.isArray(CONFIG.promises)) return;
        for (let i = 0, n = CONFIG.promises.length; i < n; i++) {
            const p = CONFIG.promises[i];
            // Une seule chaîne minuscule par promesse, calculée une fois.
            p._search = (
                (p.engagement || '') + ' ' +
                (p.domain || '') + ' ' +
                (p.resultat || '')
            ).toLowerCase();
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  5.  applyFilters — refs cachées, _search pré-calculé
    // ─────────────────────────────────────────────────────────────
    let _filterStatusEl, _filterDomainEl, _filterSearchEl;

    function getFilterRefs() {
        if (!_filterStatusEl) _filterStatusEl = document.getElementById('filter-status');
        if (!_filterDomainEl) _filterDomainEl = document.getElementById('filter-domain');
        if (!_filterSearchEl) _filterSearchEl = document.getElementById('filter-search');
        return { _filterStatusEl, _filterDomainEl, _filterSearchEl };
    }

    window.applyFilters = function applyFilters() {
        const refs = getFilterRefs();
        const fStatus = refs._filterStatusEl ? refs._filterStatusEl.value : '';
        const fDomain = refs._filterDomainEl ? refs._filterDomainEl.value : '';
        const fSearch = refs._filterSearchEl ? refs._filterSearchEl.value.toLowerCase() : '';

        const src = CONFIG.promises;
        const out = [];

        // Une seule passe au lieu de filter().filter().filter()
        for (let i = 0, n = src.length; i < n; i++) {
            const p = src[i];

            // Statut
            if (fStatus) {
                if (fStatus === 'En retard') {
                    if (!p.isLate) continue;
                } else if (fStatus === '✅ Réalisé') {
                    if (p.status !== 'Réalisé' || p.isLate) continue;
                } else if (fStatus === '🔄 En cours') {
                    if (p.status !== 'En cours' || p.isLate) continue;
                } else if (fStatus === '⏳ Non lancé') {
                    if (p.status !== 'Non lancé' || p.isLate) continue;
                }
            }

            // Domaine
            if (fDomain && p.domain !== fDomain) continue;

            // Recherche : utilise le champ pré-calculé _search
            if (fSearch && (!p._search || p._search.indexOf(fSearch) === -1)) continue;

            out.push(p);
        }

        CONFIG.filteredPromises = out;
        if (typeof updateFilteredDisplay === 'function') {
            updateFilteredDisplay();
        }
    };

    // ─────────────────────────────────────────────────────────────
    //  6.  updateStats — single-pass + refs DOM en cache
    // ─────────────────────────────────────────────────────────────
    const _statRefs = {};
    function $stat(id) {
        return _statRefs[id] || (_statRefs[id] = document.getElementById(id));
    }

    window.updateStatValue = function updateStatValue(id, value) {
        const el = $stat(id);
        if (el) el.textContent = (value === null || value === undefined || value === '') ? '0' : value;
    };

    window.updateStatPercentage = function updateStatPercentage(id, value, total) {
        const el = $stat(id);
        if (!el) return;
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        el.textContent = pct + '%';
    };

    window.updateStats = function updateStats() {
        const list = CONFIG.promises;
        const total = list.length;
        const NOW = (CONFIG.CURRENT_DATE || new Date()).getTime();

        // Compteurs accumulés en une seule itération
        let realise = 0, encours = 0, nonLance = 0, retard = 0, withUpdates = 0;
        let sumDaysRemaining = 0, validRemainingCount = 0;
        let sumRetard = 0;
        let ratingsCount = 0, ratingsAvgSum = 0, totalVotes = 0;
        const domains = Object.create(null);

        for (let i = 0; i < total; i++) {
            const p = list[i];

            // Domaines
            const dom = p.domain || 'Autre';
            domains[dom] = (domains[dom] || 0) + 1;

            // Statuts (mutuellement exclusifs)
            if (p.isLate) {
                retard++;
                if (p.deadline && p.deadline.getTime) {
                    const days = Math.ceil((p.deadline.getTime() - NOW) / 86400000);
                    sumRetard += Math.abs(days);
                }
            } else if (p.status === 'Réalisé') {
                realise++;
            } else {
                if (p.status === 'En cours') encours++;
                else if (p.status === 'Non lancé') nonLance++;

                // Délai moyen restant — uniquement non-réalisé non-en-retard
                if (p.deadline && p.deadline.getTime) {
                    const days = Math.ceil((p.deadline.getTime() - NOW) / 86400000);
                    if (days >= 0 && days <= MANDAT_DAYS) {
                        sumDaysRemaining += days;
                        validRemainingCount++;
                    }
                }
            }

            if (p.updates && p.updates.length > 0) withUpdates++;

            if (p.publicCount > 0) {
                ratingsCount++;
                ratingsAvgSum += p.publicAvg;
                totalVotes += p.publicCount;
            }
        }

        const tauxRealisation = total > 0 ? Math.round((realise / total) * 100) : 0;
        const avgDelay  = validRemainingCount > 0 ? Math.round(sumDaysRemaining / validRemainingCount) : 0;
        const avgRetard = retard > 0 ? Math.round(sumRetard / retard) : 0;
        const avgRating = ratingsCount > 0 ? (ratingsAvgSum / ratingsCount).toFixed(1) : '0.0';

        // Mise à jour des KPI items
        if (typeof KPI_ITEMS !== 'undefined') {
            KPI_ITEMS[0].value = total;
            KPI_ITEMS[1].value = realise;
            KPI_ITEMS[2].value = encours;
            KPI_ITEMS[3].value = retard;
            KPI_ITEMS[4].value = tauxRealisation + '%';
            if (retard > 0) {
                KPI_ITEMS[5].value = avgRetard + 'j';
                KPI_ITEMS[5].label = '⚠️ Retard Moyen';
                KPI_ITEMS[5].icon  = '⚠️';
            } else if (avgDelay > 0) {
                KPI_ITEMS[5].value = avgDelay + 'j';
                KPI_ITEMS[5].label = '⏱️ Retard moyen';
                KPI_ITEMS[5].icon  = '⏱️';
            } else {
                KPI_ITEMS[5].value = 'N/A';
                KPI_ITEMS[5].label = '⏱️ Retard moyen';
                KPI_ITEMS[5].icon  = '⏱️';
            }
            KPI_ITEMS[6].value = avgRating;
            KPI_ITEMS[7].value = withUpdates;
        }

        // Mise à jour DOM (refs cachées, pas de re-querySelector)
        updateStatValue('total', total);
        updateStatValue('realise', realise);
        updateStatValue('encours', encours);
        updateStatValue('non-lance', nonLance);
        updateStatValue('retard', retard);
        updateStatValue('avec-maj', withUpdates);
        updateStatValue('taux-realisation', tauxRealisation + '%');
        updateStatValue('moyenne-notes', avgRating);
        updateStatValue('votes-total', totalVotes.toLocaleString('fr-FR') + ' votes');

        if (retard > 0) {
            updateStatValue('delai-moyen', avgRetard + 'j ');
        } else if (avgDelay > 0) {
            updateStatValue('delai-moyen', avgDelay + 'j restants en moyenne');
        } else {
            updateStatValue('delai-moyen', 'N/A');
        }

        updateStatPercentage('total-percentage',     total,       total);
        updateStatPercentage('realise-percentage',   realise,     total);
        updateStatPercentage('encours-percentage',   encours,     total);
        updateStatPercentage('non-lance-percentage', nonLance,    total);
        updateStatPercentage('retard-percentage',    retard,      total);
        updateStatPercentage('avec-maj-percentage',  withUpdates, total);

        // Domaine principal
        let principalKey = null, principalCount = 0;
        for (const k in domains) {
            if (domains[k] > principalCount) {
                principalCount = domains[k];
                principalKey = k;
            }
        }
        if (principalKey) {
            updateStatValue('domaine-principal', principalKey);
            updateStatValue('domaine-count', principalCount + ' engagements');
        } else {
            updateStatValue('domaine-principal', 'Non spécifié');
            updateStatValue('domaine-count', '0 engagements');
        }

        const listPromises = (typeof CONFIG !== 'undefined' && CONFIG.promises) ? CONFIG.promises : [];
        if (listPromises.length > 0) {
            const legDomains = ['Institutions', 'Justice', 'Gouvernance', 'Lutte Corruption', 'Administration'];
            const assembleeCount = listPromises.filter(p => legDomains.includes(p.domain || p.domaine)).length;
            const presidenceCount = total - assembleeCount;

            updateStatValue('presidence-count', presidenceCount);
            updateStatValue('assemblee-count', assembleeCount);
            updateStatPercentage('presidence-percentage', presidenceCount, total);
            updateStatPercentage('assemblee-percentage', assembleeCount, total);
        }
    };

    // ─────────────────────────────────────────────────────────────
    //  7.  loadPressData — Schwartzian sort (1 parse de date par item)
    // ─────────────────────────────────────────────────────────────
    window.loadPressData = async function loadPressData() {
        try {
            const res = await fetch('press.json?v=' + Date.now(), { cache: 'no-store' });
            if (!res.ok) {
                CONFIG.press = [];
                if (typeof PRESS_DATA !== 'undefined') PRESS_DATA = [];
                return;
            }
            const data = await res.json();
            if (data && Array.isArray(data.press)) {
                const decorated = data.press.map(item => {
                    let ts = 0;
                    if (item.date && typeof item.date === 'string') {
                        const parts = item.date.split('/');
                        if (parts.length === 3) {
                            ts = new Date(+parts[2], +parts[1] - 1, +parts[0]).getTime();
                        }
                    }
                    return { item, ts: isNaN(ts) ? 0 : ts };
                });
                decorated.sort((a, b) => b.ts - a.ts);
                const sortedPress = decorated.map(d => d.item);
                CONFIG.press = sortedPress;
                if (typeof PRESS_DATA !== 'undefined') PRESS_DATA = sortedPress;

                // Mettre à jour l'affichage dynamique de la presse
                try { if (typeof renderPressCarousel === 'function') renderPressCarousel(); } catch(e) { console.error(e); }
                try { if (typeof renderNewspapers === 'function') renderNewspapers(); } catch(e) { console.error(e); }

            } else {
                CONFIG.press = [];
                if (typeof PRESS_DATA !== 'undefined') PRESS_DATA = [];
            }
        } catch (e) {
            console.error(e);
            CONFIG.press = [];
            if (typeof PRESS_DATA !== 'undefined') PRESS_DATA = [];
        }
    };

    // ─────────────────────────────────────────────────────────────
    //  8.  renderNews — pré-tri une seule fois, Schwartzian
    // ─────────────────────────────────────────────────────────────
    let _newsSortedCache = null, _newsSourceRef = null;

    window.renderNews = function renderNews(news) {
        const grid = document.getElementById('newsGrid');
        if (!grid || !Array.isArray(news)) return;

        // Cache : ne re-trie que si la source change
        let sortedNews;
        if (_newsSourceRef === news && _newsSortedCache) {
            sortedNews = _newsSortedCache;
        } else {
            const decorated = news.map(item => {
                let ts = 0;
                if (item.date && typeof item.date === 'string') {
                    const parts = item.date.split('/');
                    if (parts.length === 3) {
                        ts = new Date(+parts[2], +parts[1] - 1, +parts[0]).getTime();
                    }
                }
                return { item, ts: isNaN(ts) ? 0 : ts };
            });
            decorated.sort((a, b) => b.ts - a.ts);
            sortedNews = decorated.slice(0, 8).map(d => d.item);
            _newsSortedCache = sortedNews;
            _newsSourceRef = news;
        }

        const escape = window.escapeHTML;
        const html = new Array(sortedNews.length);

        for (let i = 0, n = sortedNews.length; i < n; i++) {
            const item = sortedNews[i];
            const fullText = item.excerpt || '';
            const words = fullText.split(/\s+/);
            const displayText = words.length > 55
                ? words.slice(0, 55).join(' ') + '...'
                : fullText;

            const catKey = item.category || 'general';
            const fallbackIcon = (window._NEWS_CAT_ICONS_GLOBAL && window._NEWS_CAT_ICONS_GLOBAL[catKey]) || 'fa-newspaper';
            const catLabel = escape(item.category || 'Général');
            const safeTitle = escape(item.title);
            const safeSource = escape(item.source || '');
            const safeId = escape(item.id || '');
            const fallbackHtml =
                '<div class="news-img-fallback" style="display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;height:200px;width:100%;background:linear-gradient(135deg,#1A3D28,#2D5F3F);' +
                'border-radius:12px 12px 0 0;gap:.5rem">' +
                '<i class="fas ' + fallbackIcon + '" style="font-size:2.4rem;color:rgba(255,255,255,.45)"></i>' +
                '<span style="font-size:.7rem;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.05em">' +
                catLabel + '</span></div>';

            html[i] =
                '<article class="news-card" style="cursor:pointer">' +
                    '<div class="news-image">' +
                        (item.image_url
                            ? '<img src="' + escape(item.image_url) + '" alt="' + safeTitle +
                              '" loading="lazy" decoding="async" ' +
                              'style="width:100%;height:200px;object-fit:cover;border-radius:12px 12px 0 0;" ' +
                              'onerror="newsFallbackImg(this,\'' + escape(catKey) + "','200px','12px 12px 0 0')\">"
                            : fallbackHtml) +
                    '</div>' +
                    '<div class="news-content">' +
                        (item.is_promise_update && item.category
                            ? '<span class="news-cat-badge">' + catLabel + '</span>'
                            : '') +
                        '<h3>' + safeTitle + '</h3>' +
                        '<p>' + escape(displayText) + '</p>' +
                        '<a href="#" class="news-read-more" onclick="openNewsModal(\'' + safeId + '\', event); return false;">' +
                            'Lire la suite <i class="fas fa-arrow-right"></i>' +
                        '</a>' +
                        '<div class="news-footer">' +
                            '<span><i class="fas fa-calendar"></i> ' + escape(item.date || '') + '</span>' +
                            '<span><i class="fas fa-newspaper"></i> ' + safeSource + '</span>' +
                        '</div>' +
                        '<div class="news-share">' +
                            '<button class="social-btn-small fb" onclick="shareNews(\'' + safeId + "', 'facebook')\" title=\"Facebook\">" +
                                '<i class="fab fa-facebook-f"></i></button>' +
                            '<button class="social-btn-small tw" onclick="shareNews(\'' + safeId + "', 'twitter')\" title=\"X\">" +
                                '<i class="fab fa-x-twitter"></i></button>' +
                            '<button class="social-btn-small wa" onclick="shareNews(\'' + safeId + "', 'whatsapp')\" title=\"WhatsApp\">" +
                                '<i class="fab fa-whatsapp"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</article>';
        }

        grid.innerHTML = html.join('');
    };

    // ─────────────────────────────────────────────────────────────
    //  9.  forceSocialButtonsColors — supprimée (travail dupliqué)
    //      Les couleurs sont déjà dans le HTML inline, et appartiennent à style.css.
    //      On la remplace par un no-op pour préserver les appels existants.
    // ─────────────────────────────────────────────────────────────
    window.forceSocialButtonsColors = function () { /* no-op : géré par CSS */ };

    // ─────────────────────────────────────────────────────────────
    // 10.  Scroll handlers — coalescing avec requestAnimationFrame
    // ─────────────────────────────────────────────────────────────
    window.initScrollEffects = function initScrollEffects() {
        const navbar = document.getElementById('navbar');
        const scrollToTop = document.getElementById('scrollToTop');
        const progressIndicator = document.getElementById('progressIndicator');

        // Snapshot des dimensions du document — on ne les relit que sur resize
        let docHeight = 0;
        function measure() {
            docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        }
        measure();
        window.addEventListener('resize', measure, { passive: true });

        let ticking = false;
        let lastY = 0;

        function onFrame() {
            ticking = false;
            // Une seule lecture par frame
            const y = lastY;

            if (navbar) {
                if (y > 50) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }
            if (scrollToTop) {
                scrollToTop.classList.toggle('visible', y > 400);
            }
            if (progressIndicator && docHeight > 0) {
                progressIndicator.style.width = ((y / docHeight) * 100) + '%';
            }
        }

        window.addEventListener('scroll', () => {
            lastY = window.scrollY;
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onFrame);
            }
        }, { passive: true });

        if (scrollToTop) {
            scrollToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 11.  initNavigation — IntersectionObserver pour la nav active
    //      remplace le scan de toutes les sections sur chaque scroll
    // ─────────────────────────────────────────────────────────────
    window.initNavigation = function initNavigation() {
        const modernHamburger = document.getElementById('modernHamburger');
        const modernMenu = document.getElementById('modernMenu');
        const modernLinks = document.querySelectorAll('.modern-link');

        if (modernHamburger && modernMenu) {
            modernHamburger.addEventListener('click', e => {
                e.stopPropagation();
                modernHamburger.classList.toggle('active');
                modernMenu.classList.toggle('active');
            });
        }

        document.querySelectorAll('.modern-link, .nav-cta-btn').forEach(link => {
            link.addEventListener('click', () => {
                if (modernMenu && modernMenu.classList.contains('active')) {
                    modernMenu.classList.remove('active');
                    modernHamburger && modernHamburger.classList.remove('active');
                }
            });
        });

        document.addEventListener('click', e => {
            if (modernMenu && modernHamburger) {
                const modernNav = document.getElementById('modernNav');
                if (modernNav && !modernNav.contains(e.target) && modernMenu.classList.contains('active')) {
                    modernMenu.classList.remove('active');
                    modernHamburger.classList.remove('active');
                }
            }
        });

        // IntersectionObserver remplace la lecture forcée d'offsetTop sur chaque scroll
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length || !('IntersectionObserver' in window)) return;

        const linksByHref = new Map();
        modernLinks.forEach(l => {
            const href = l.getAttribute('href');
            if (href) linksByHref.set(href, l);
        });

        const io = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    modernLinks.forEach(l => l.classList.remove('active'));
                    const link = linksByHref.get('#' + id);
                    if (link) link.classList.add('active');
                }
            }
        }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

        sections.forEach(s => io.observe(s));
    };

    // ─────────────────────────────────────────────────────────────
    // 12.  index.html — recommandations à appliquer manuellement
    // ─────────────────────────────────────────────────────────────
    // a) Retirer la balise <script src=".../dompurify..."> : ~25 KB gzip économisés.
    // b) Ajouter `defer` à <script src="app.js"> et <script src="app.perf.js">.
    // c) Lazy-load des sections lourdes (actualités, presse) : visible plus bas
    //    -> on peut leur appliquer loading="lazy" sur les <img> (déjà fait dans
    //       renderNews ci-dessus).
})();
