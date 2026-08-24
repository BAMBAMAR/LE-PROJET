// ==========================================
// SÉCURITÉ — Fonctions d'échappement XSS
// ==========================================
/**
 * Échappe les caractères HTML spéciaux pour prévenir les injections XSS.
 * À utiliser systématiquement avant toute insertion de donnée externe dans le DOM.
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}

function escapeHtml(str) {
    return escapeHTML(str);
}

window.escapeHTML = escapeHTML;
window.escapeHtml = escapeHTML;
window.escapeAttr = escapeAttr;

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"'`=]/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',
        "'":'&#39;','`':'&#96;','=':'&#61;'
    })[c]);
}

function escapeJSString(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

/**
 * Tronque un texte et l'échappe de façon sécurisée.
 */
function escapeAndTruncate(str, maxLength = 80) {
    if (!str) return '';
    const truncated = String(str).substring(0, maxLength) + (String(str).length > maxLength ? '...' : '');
    return escapeHTML(truncated);
}


// ==========================================
// FALLBACK IMAGE — Icône catégorie (images Facebook expirées)
// ==========================================
const _NEWS_CAT_ICONS_GLOBAL = {
    'Général':'fa-newspaper','general':'fa-newspaper','autres':'fa-newspaper','Autres':'fa-newspaper',
    'Politique':'fa-landmark','Institutions':'fa-landmark','Gouvernance':'fa-landmark','gouvernance':'fa-landmark',
    'Éducation':'fa-graduation-cap','education':'fa-graduation-cap','Enseignement Supérieur':'fa-university','Formation Pro':'fa-tools',
    'Santé':'fa-heartbeat','sante':'fa-heartbeat',
    'Économie':'fa-chart-line','economie':'fa-chart-line','Commerce':'fa-shopping-cart','Finances':'fa-coins','Monnaie':'fa-money-bill-wave',
    'Infrastructures':'fa-road','infrastructures':'fa-road','Habitat':'fa-home','Urbanisme':'fa-city',
    'Transparence':'fa-eye','Lutte Corruption':'fa-search-dollar','Administration':'fa-file-alt',
    'Agriculture':'fa-seedling','Agro-industrie':'fa-industry','Élevage':'fa-horse','Pêche':'fa-fish',
    'Énergie':'fa-bolt','energie':'fa-bolt','Hydrocarbures':'fa-oil-can',
    'Environnement':'fa-leaf','environnement':'fa-leaf','Hydraulique':'fa-water',
    'Emploi':'fa-briefcase','emploi':'fa-briefcase','Secteur Informel':'fa-store','Industrie':'fa-industry',
    'Sport':'fa-running','Jeunesse & Sports':'fa-running','Culture':'fa-theater-masks',
    'Sécurité':'fa-shield-alt','securite':'fa-shield-alt','Défense':'fa-shield-alt',
    'Justice':'fa-balance-scale','justice':'fa-balance-scale','Justice & Droit':'fa-balance-scale',
    'Numérique':'fa-laptop','numerique':'fa-laptop','Transport':'fa-bus','transport':'fa-bus',
    'Logement':'fa-home','logement':'fa-home','Affaires Sociales':'fa-hand-holding-heart','social':'fa-hand-holding-heart',
    'Relations Internationales':'fa-globe','international':'fa-globe','Intégration Régionale':'fa-globe-africa',
    'Développement Local':'fa-map-marker-alt','Communiqué':'fa-bullhorn'
};

/**
 * Appelé par onerror sur une <img> cassée (URL Facebook expirée, etc.)
 * Remplace l'image par un bloc icône stylé selon la catégorie.
 * @param {HTMLImageElement} el - l'élément img qui a planté
 * @param {string} cat         - catégorie de l'article
 * @param {string} height      - hauteur CSS du bloc de remplacement
 * @param {string} radius      - border-radius CSS
 */
function newsFallbackImg(el, cat, height, radius) {
    el.onerror = null;
    const icon  = _NEWS_CAT_ICONS_GLOBAL[cat] || 'fa-newspaper';
    const label = String(cat || 'Actualité');
    const h     = height  || '200px';
    const r     = radius  || '12px 12px 0 0';
    const parent = el.parentElement;
    if (!parent) return;
    parent.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'height:' + h + ';width:100%;background:linear-gradient(135deg,#1A3D28,#2D5F3F);' +
        'border-radius:' + r + ';gap:.5rem">' +
        '<i class="fas ' + icon + '" style="font-size:2.4rem;color:rgba(255,255,255,.45)"></i>' +
        '<span style="font-size:.7rem;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.05em">' +
        label + '</span></div>';
}

// Mode démo - activé si Supabase échoue
let DEMO_MODE = false;

// Vérifier la connexion Supabase
async function checkSupabaseConnection() {
    if (!supabaseClient) {
        DEMO_MODE = true;
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('service_ratings')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            DEMO_MODE = true;
            showNotification('Mode démo activé - données locales', 'info');
        } else {
            DEMO_MODE = false;
        }
    } catch (error) {
        DEMO_MODE = true;
    }
}

// ==========================================
// Configuration Supabase (clé anon publique — RLS activé côté serveur)
const SUPABASE_URL = 'https://jwsdxttjjbfnoufiidkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_joJuW7-vMiQG302_2Mvj5A_sVaD8Wap';
let supabaseClient = null;

// Initialisation Supabase
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (error) {
    console.error('[Supabase] Initialisation échouée :', error);
    supabaseClient = null;
}

const CONFIG = {
    START_DATE: new Date('2024-04-02'),
    END_DATE: new Date('2029-04-02'), // Fin du mandat
    CURRENT_DATE: new Date(),
    promises: [],
    news: [],
    press: [
        { id: '1', title: 'Le Soleil', date: '28/01/2026', image: 'https://picsum.photos/seed/soleil/400/533', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/6d/Le_Soleil_%28S%C3%A9n%C3%A9gal%29_logo.svg/200px-Le_Soleil_%28S%C3%A9n%C3%A9gal%29_logo.svg.png' },
        { id: '2', title: 'Sud Quotidien', date: '28/01/2026', image: 'https://picsum.photos/seed/sud/400/533', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/5b/Sud_Quotidien_logo.svg/200px-Sud_Quotidien_logo.svg.png' },
        { id: '3', title: 'Libération', date: '28/01/2026', image: 'liberation.jpg', logo: 'iconeliberation.jpg' },
        { id: '4', title: 'L\'Observateur', date: '28/01/2026', image: 'observateur.jpg', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/7/7b/L%27Observateur_logo.svg/200px-L%27Observateur_logo.svg.png' },
        { id: '5', title: 'Le Quotidien', date: '28/01/2026', image: 'https://picsum.photos/seed/quotidien/400/533', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3c/Le_Quotidien_logo.svg/200px-Le_Quotidien_logo.svg.png' },
        { id: '6', title: 'WalFadjri', date: '28/01/2026', image: 'https://picsum.photos/seed/walfadjri/400/533', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/7/7c/Walf_fadjri_logo.svg/200px-Walf_fadjri_logo.svg.png' }
    ],
    currentIndex: 0,
    ratings: [],
    carouselInterval: null,
    visibleCount: 6,
    currentVisible: 6,
    carouselIndex: 0,
    carouselAutoPlay: true,
    animationDuration: 300,
    scrollOffset: 80,
    kpiCarouselIndex: 0,
    kpiAutoPlay: true,
    zoomScale: 1,
    zooming: false,
    dragStartX: 0,
    dragStartY: 0,
    isDragging: false,
    currentRatingPromiseId: null,
    currentRatingValue: 0,
    filteredPromises: []
};
// Variables pour le visualiseur photo
let currentZoom = 1;
let currentPhotoIndex = 0;

// KPIs pour le carousel
const KPI_ITEMS = [
    { label: 'Total Engagements', value: '0', icon: '📊' },
    { label: '✅ Réalisés', value: '0', icon: '✅' },
    { label: '🔄 En Cours', value: '0', icon: '🔄' },
    { label: '⚠️ En Retard', value: '0', icon: '⚠️' },
    { label: '📈 Taux Réalisation', value: '0%', icon: '📈' },
    { label: '⏱️ Retard moyen', value: '0j', icon: '⏱️' },
    { label: '⭐ Note Moyenne', value: '0.0', icon: '⭐' },
    { label: '📋 Avec MAJ', value: '0', icon: '📋' }
];

// ==========================================
// FONCTION DE CONVERSION DES DÉLAIS TEXTE EN JOURS - CORRIGÉE
// ==========================================
function parseDelayToDays(delayText) {
    if (!delayText || delayText.trim() === '') return 365; // 1 an par défaut
    
    const lower = delayText.toLowerCase().trim();
    
    // CORRECTION: Dates trop éloignées
    if (lower.includes('2030')) {
        return 1825; // Fin du mandat (5 ans)
    }
    
    if (lower.includes('2029')) {
        return 1825; // Fin du mandat (5 ans)
    }
    
    // "Immédiat" = 0 jour
    if (lower.includes('immédiat') || lower.includes('immediat') || lower.includes('dès')) {
        return 0;
    }
    
    // "Mandat" ou "Quinquennat" = durée complète du mandat (5 ans)
    if (lower.includes('mandat') || lower.includes('quinquennat')) {
        return 1825; // 5 ans en jours
    }
    
    let totalDays = 0;
    
    // Années complètes
    const yearsMatch = lower.match(/(\d+)\s*an[s]?/i);
    if (yearsMatch) {
        const years = parseInt(yearsMatch[1], 10);
        totalDays += years * 365;
    }
    
    // Mois
    const monthsMatch = lower.match(/(\d+)\s*mois/i);
    if (monthsMatch) {
        const months = parseInt(monthsMatch[1], 10);
        totalDays += months * 30;
    }
    
    // Jours
    const daysMatch = lower.match(/(\d+)\s*jour[s]?/i);
    if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        totalDays += days;
    }
    
    // Expressions comme "6 premiers mois"
    const premiersMoisMatch = lower.match(/(\d+)\s*premiers?\s*mois/i);
    if (premiersMoisMatch) {
        const mois = parseInt(premiersMoisMatch[1], 10);
        totalDays += mois * 30;
    }
    
    // Expressions comme "3 premières années"
    const firstYearsMatch = lower.match(/(\d+)\s*premières?\s*années?/i);
    if (firstYearsMatch) {
        const years = parseInt(firstYearsMatch[1], 10);
        totalDays += years * 365;
    }
    
    // "2 premières années"
    if (lower.includes('2 premières années') || lower.includes('2 premières annees')) {
        totalDays = 730; // 2 ans exactement
    }
    
    // "1ère année"
    if (lower.includes('1ère année') || lower.includes('1ere annee') || lower.includes('1ère annee')) {
        totalDays = 365; // 1 an exactement
    }
    
    // "2 ans" (sans "premières")
    const ansSimpleMatch = lower.match(/(\d+)\s*ans$/i);
    if (ansSimpleMatch && !lower.includes('premières') && !lower.includes('premiere')) {
        const ans = parseInt(ansSimpleMatch[1], 10);
        totalDays = ans * 365;
    }
    
    // "2 à 3 ans" - prendre la moyenne
    const rangeMatch = lower.match(/(\d+)\s*à\s*(\d+)\s*an[s]?/i);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10) * 365;
        const max = parseInt(rangeMatch[2], 10) * 365;
        totalDays = Math.round((min + max) / 2);
    }
    
    // "3 à 5 ans" - prendre la moyenne
    const longRangeMatch = lower.match(/(\d+)\s*à\s*(\d+)\s*an[s]?/i);
    if (longRangeMatch) {
        const min = parseInt(longRangeMatch[1], 10) * 365;
        const max = parseInt(longRangeMatch[2], 10) * 365;
        totalDays = Math.round((min + max) / 2);
    }
    
    // "5 à 10 ans" - prendre la moyenne mais limiter à 5 ans max
    const veryLongRangeMatch = lower.match(/5\s*à\s*10\s*an[s]?/i);
    if (veryLongRangeMatch) {
        totalDays = 1825; // Limiter à 5 ans max (durée du mandat)
    }
    
    // Dates spécifiques (format AAAA-MM-JJ)
    const dateMatch = delayText.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
        try {
            const targetDate = new Date(dateMatch[0]);
            const startDate = CONFIG.START_DATE;
            
            // Calculer la différence en jours
            const diffTime = targetDate.getTime() - startDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Ne pas retourner de valeurs négatives
            totalDays = Math.max(0, diffDays);
            
            // Limiter à la durée du mandat (5 ans max)
            totalDays = Math.min(totalDays, 1825);
            
        } catch (e) {
        }
    }
    
    // Si aucune correspondance, essayer de trouver un nombre simple
    if (totalDays === 0) {
        const num = parseInt(delayText.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) {
            // Si c'est juste un nombre, supposer que c'est des années
            totalDays = num * 365;
        } else {
            totalDays = 365; // 1 an par défaut
        }
    }
    
    // LIMITER À LA DURÉE MAXIMALE DU MANDAT (5 ans = 1825 jours)
    const MANDAT_MAX_DAYS = 1825;
    const result = Math.min(totalDays, MANDAT_MAX_DAYS);
    
    return result;
}

// ==========================================
// FONCTION POUR CALCULER LES JOURS RESTANTS (AVEC SIGNE) - CORRIGÉE
// ==========================================
function getDaysRemaining(deadline) {
    if (!deadline || !(deadline instanceof Date) || isNaN(deadline.getTime())) {
        return 0;
    }
    
    const diff = deadline.getTime() - CONFIG.CURRENT_DATE.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    // Retourne:
    // - Positif: jours restants avant échéance
    // - Négatif: jours de retard
    // - 0: échéance aujourd'hui
    return days;
}

// ==========================================
// FONCTION POUR FORMATER LES JOURS RESTANTS/RETARD
// ==========================================
function formatDaysRemaining(days) {
    if (days > 0) {
        // Jours restants avant échéance
        return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    } else if (days < 0) {
        // En retard
        const absDays = Math.abs(days);
        return `${absDays} jour${absDays > 1 ? 's' : ''} de retard`;
    } else {
        // Échéance aujourd'hui
        return 'Aujourd\'hui';
    }
}

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Initialiser les composants UI & Carrousels interactifs
    initNavigation();
    initScrollEffects();
    initFilters();
    initDateDisplay();
    initPhotoViewer();
    setupKpiCarousel();
    initHeroCarousel();

    // 2. Vérifier Supabase puis charger les données
    await checkSupabaseConnection();
    await loadData();
    
    // 3. IMPORTANT: Initialiser filteredPromises après chargement
    CONFIG.filteredPromises = [...CONFIG.promises];
    CONFIG.currentVisible = Math.min(CONFIG.visibleCount, CONFIG.promises.length);

    // 4. Rendre les données
    renderAll();
    await renderNewsIndex();
    if (typeof renderNewspapers === 'function') {
        renderNewspapers();
    }
    
    // 5. Configurer les composants avec les données chargées
    setupPressCarousel();
    setupServiceRatings();
    setupDailyPromise();
    setupPromisesCarousel();
    renderKpiItem();
    
    // 6. Initialiser les étoiles
    initStarRatings();
    
    // 7. Initialiser le visualiseur photo
    setTimeout(() => {
        if (typeof setupPhotoViewerControls === 'function') {
            setupPhotoViewerControls();
        }
    }, 500);
});
// NAVIGATION - VERSION MODERNE
// ==========================================
function initNavigation() {
    // Nouveau menu moderne
    const modernHamburger = document.getElementById('modernHamburger');
    const modernMenu = document.getElementById('modernMenu');
    const modernLinks = document.querySelectorAll('.modern-link');
    const navLinksContainer = document.getElementById('navLinks');

    // S'assurer que les liens ne sont pas décalés vers la gauche au chargement
    if (navLinksContainer) {
        navLinksContainer.scrollLeft = 0;
    }

    // 1. GESTION DU MENU HAMBURGER
    if (modernHamburger && modernMenu) {
        modernHamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            modernHamburger.classList.toggle('active');
            modernMenu.classList.toggle('active');
        });
    }

    // 2. NAVIGATION FONCTIONNELLE
    // Navigation native (comme le pied de page) — juste fermer le menu mobile au clic
    document.querySelectorAll('.modern-link, .nav-cta-btn').forEach(link => {
        link.addEventListener('click', () => {
            if (modernMenu && modernMenu.classList.contains('active')) {
                modernMenu.classList.remove('active');
                modernHamburger && modernHamburger.classList.remove('active');
            }
        });
    });

    // 3. FERMER LE MENU EN CLIQUANT EN DEHORS
    document.addEventListener('click', (e) => {
        if (modernMenu && modernHamburger) {
            const modernNav = document.getElementById('modernNav');
            if (modernNav && !modernNav.contains(e.target) && modernMenu.classList.contains('active')) {
                modernMenu.classList.remove('active');
                modernHamburger.classList.remove('active');
            }
        }
    });

    // 4. GESTION DU SCROLL POUR ACTIVER LES LIENS
    window.addEventListener('scroll', debounce(() => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        modernLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// Fonction debounce pour optimiser les performances
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// SCROLL EFFECTS
// ==========================================
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const scrollToTop = document.getElementById('scrollToTop');
    const progressIndicator = document.getElementById('progressIndicator');

    window.addEventListener('scroll', () => {
        if (navbar && window.scrollY > 50) navbar.classList.add('scrolled');
        else if (navbar) navbar.classList.remove('scrolled');

        if (scrollToTop) scrollToTop.classList.toggle('visible', window.scrollY > 400);

        if (progressIndicator) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressIndicator.style.width = `${scrolled}%`;
        }
    });

    if (scrollToTop) {
        scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ==========================================
// DATE DISPLAY
// ==========================================
function initDateDisplay() {
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        currentDateEl.textContent = today.toLocaleDateString('fr-FR', options);
    }
}

// ==========================================
// FONCTIONS UTILITAIRES POUR LE LOCALSTORAGE
// ==========================================

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        window.tempStorage = window.tempStorage || {};
        window.tempStorage[key] = value;
        return false;
    }
}

function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        if (window.tempStorage && window.tempStorage[key]) {
            return window.tempStorage[key];
        }
        return defaultValue;
    }
}

// ==========================================
// CHARGEMENT DES DONNÉES - VERSION CORRIGÉE
// ==========================================

async function loadData() {
    try {
        
        // Charger les promesses
        await loadPromisesData();
        
        // Charger la presse (async)
        await loadPressData();
        
        // Charger les actualités (async)
        await loadNewsData();
        
        // Charger les votes publics (avec délai)
        setTimeout(() => {
            fetchAndDisplayPublicVotes().catch(error => {
            });
        }, 1000);
        
        // Rendre tout
        renderAll();
        if (typeof renderNewspapers === 'function') {
            renderNewspapers();
        }

    } catch (error) {
        console.error(error);
        showNotification('Erreur de chargement des données', 'error');
        CONFIG.promises = generateTestPromises();
        CONFIG.press = getDefaultPressData();
        if (typeof renderAll === 'function') {
            renderAll();
        }
    }
}

// Fonction séparée pour charger les promesses
async function loadPromisesData() {
    try {
        const response = await fetch('promises.json');
        
        if (!response.ok) {
            CONFIG.promises = generateTestPromises();
            return;
        }
        
        const data = await response.json();
        
        // Récupérer la date de début depuis le JSON
        if (data.start_date) {
            CONFIG.START_DATE = new Date(data.start_date);
            CONFIG.END_DATE = new Date(CONFIG.START_DATE);
            CONFIG.END_DATE.setFullYear(CONFIG.END_DATE.getFullYear() + 5); // 5 ans après
        }
        
        // Traiter les promesses
        CONFIG.promises = (data.promises || []).map(p => {
            // Normaliser le statut
            let status = 'Non lancé';
            if (p.status) {
                const statusLower = p.status.toLowerCase();
                if (statusLower.includes('realise') || statusLower.includes('réalisé')) {
                    status = 'Réalisé';
                } else if (statusLower.includes('cours') || statusLower.includes('encours')) {
                    status = 'En cours';
                } else if (statusLower.includes('retard')) {
                    status = 'En retard';
                } else if (statusLower.includes('lancé') || statusLower.includes('lance')) {
                    status = 'Non lancé';
                }
            }
            
            // Normaliser le domaine
            const domain = p.domaine || p.domain || p.categorie || 'Autre';
            
            // Convertir le délai en jours
            let delayText = p.delai || '12 premiers mois';
            let delayDays = parseDelayToDays(delayText);
            
            // S'assurer que delayDays est un nombre valide
            if (isNaN(delayDays) || delayDays < 0) {
                delayDays = 365;
            }
            
            // Calculer la date limite
            const deadline = calculateDeadlineFromDays(delayDays);
            
            // Vérifier si en retard
            const isLate = checkIfLate(status, deadline);
            
            // Normaliser les mises à jour
            const updates = (p.mises_a_jour || []).map(update => ({
                date: update.date || '',
                description: update.text || update.description || 'Mise à jour'
            }));
            
            return {
                id: p.id || Math.random().toString(36).substr(2, 9),
                engagement: p.engagement || p.titre || 'Engagement non spécifié',
                domain: domain,
                status: status,
                delai: delayDays,
                delai_texte: delayText,
                resultat: p.resultat || p.objectif || 'Résultats non spécifiés',
                updates: updates,
                deadline: deadline,
                isLate: isLate,
                publicAvg: 0,
                publicCount: 0
            };
        });
        
        // Corriger les délais invalides
        fixInvalidDelays();
        
        // Trier les promesses
        CONFIG.promises.sort((a, b) => {
            if (a.isLate && !b.isLate) return -1;
            if (!a.isLate && b.isLate) return 1;
            return a.deadline - b.deadline;
        });
        
    } catch (error) {
        console.error('[loadData] Erreur chargement promises.json :', error);
        CONFIG.promises = generateTestPromises();
        showNotification('⚠️ Données de test — fichier promises.json introuvable', 'warning');
    }
}

// Fonction séparée pour charger la presse
async function loadPressData() {
    try {
        const pressResponse = await fetch('press.json?v=' + Date.now(), { cache: 'no-store' });
        
        if (!pressResponse.ok) {
            CONFIG.press = getDefaultPressData();
            return;
        }
        
        const pressData = await pressResponse.json();
        
        if (pressData && Array.isArray(pressData.press)) {
            // Trier par date (les plus récents d'abord)
            CONFIG.press = pressData.press.sort((a, b) => {
                try {
                    const dateA = new Date(a.date.split('/').reverse().join('-'));
                    const dateB = new Date(b.date.split('/').reverse().join('-'));
                    return dateB - dateA;
                } catch {
                    return 0;
                }
            });
            
        } else {
            CONFIG.press = getDefaultPressData();
        }
        
    } catch (pressError) {
        console.error(pressError);
        CONFIG.press = getDefaultPressData();
    }
}

// Fonction séparée pour charger les actualités
async function loadNewsData() {
    try {
        const newsResponse = await fetch('news.json');
        
        if (!newsResponse.ok) {
            CONFIG.news = [
                { 
                    id: '1', 
                    title: 'Lancement officiel de la plateforme', 
                    excerpt: 'La plateforme citoyenne de suivi des engagements est désormais opérationnelle.', 
                    date: '25/01/2026', 
                    source: 'Le Soleil', 
                    image: 'school' 
                },
                { 
                    id: '2', 
                    title: 'Première école numérique inaugurée', 
                    excerpt: 'Le gouvernement a inauguré la première école entièrement numérique à Dakar.', 
                    date: '20/01/2026', 
                    source: 'Sud Quotidien', 
                    image: 'school' 
                },
                { 
                    id: '3', 
                    title: 'Budget 2026 axé sur la relance économique', 
                    excerpt: 'Le budget de l\'État pour 2026 prévoit d\'importants investissements dans les infrastructures.', 
                    date: '15/01/2026', 
                    source: 'WalFadjri', 
                    image: 'money' 
                }
            ];
            return;
        }
        
        const newsData = await newsResponse.json();
        
        if (newsData && Array.isArray(newsData.news)) {
            CONFIG.news = newsData.news;
        } else {
            CONFIG.news = [
                { 
                    id: '1', 
                    title: 'Lancement officiel de la plateforme', 
                    excerpt: 'La plateforme citoyenne de suivi des engagements est désormais opérationnelle.', 
                    date: '25/01/2026', 
                    source: 'Le Soleil', 
                    image: 'school' 
                }
            ];
        }
        
    } catch (newsError) {
        console.error(newsError);
        CONFIG.news = [
            { 
                id: '1', 
                title: 'Lancement officiel de la plateforme', 
                excerpt: 'La plateforme citoyenne de suivi des engagements est désormais opérationnelle.', 
                date: '25/01/2026', 
                source: 'Le Soleil', 
                image: 'school' 
            }
        ];
    }
}

// ==========================================
// CORRECTION DES FONCTIONS UTILISANT localStorage
// ==========================================

// Dans saveVoteToSupabase()
async function saveVoteToSupabase(promiseId, rating, comment = '') {
    if (!supabaseClient) {
        showNotification('Mode démo : Vote enregistré localement', 'info');
        // Mode fallback - stocker localement
        const votes = safeGetItem('promise_votes', []);
        votes.push({
            id: Date.now().toString(),
            promise_id: promiseId,
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        });
        safeSetItem('promise_votes', votes);
        return;
    }
    
    try {
        const voteData = { 
            promise_id: promiseId, 
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        };
        
        
        const { error } = await supabaseClient
            .from('votes')
            .insert([voteData]);
        
        if (error) {
            console.error(error);
            
            // Mode fallback - stocker localement
            const votes = safeGetItem('promise_votes', []);
            votes.push({
                id: Date.now().toString(),
                promise_id: promiseId,
                rating: rating,
                comment: comment,
                created_at: new Date().toISOString()
            });
            safeSetItem('promise_votes', votes);
            
            showNotification('Vote enregistré localement (mode démo)', 'info');
        } else {
            showNotification('Merci pour votre vote !', 'success');
        }
        
        // Recharger les votes après un délai
        setTimeout(() => fetchAndDisplayPublicVotes(), 500);
        
    } catch (error) {
        console.error(error);
        showNotification('Mode démo : Vote enregistré localement', 'info');
    }
}

// Dans saveRatingLocally()
function saveRatingLocally(ratingData) {
    const ratings = safeGetItem('service_ratings', []);
    ratings.push({
        id: Date.now().toString(),
        service: ratingData.service,
        accessibility: ratingData.accessibility,
        welcome: ratingData.welcome,
        efficiency: ratingData.efficiency,
        transparency: ratingData.transparency,
        comment: ratingData.comment,
        created_at: new Date().toISOString()
    });
    safeSetItem('service_ratings', ratings);
}

// Dans fetchAndDisplayPublicVotes() ou processVotes()
function processVotes(votes) {
    const votesMap = {};
    
    // D'abord, ajouter les votes de Supabase
    votes.forEach(vote => {
        if (!votesMap[vote.promise_id]) {
            votesMap[vote.promise_id] = { sum: 0, count: 0 };
        }
        votesMap[vote.promise_id].sum += vote.rating;
        votesMap[vote.promise_id].count += 1;
    });
    
    // Ajouter les votes locaux
    const localVotes = safeGetItem('promise_votes', []);
    localVotes.forEach(vote => {
        if (!votesMap[vote.promise_id]) {
            votesMap[vote.promise_id] = { sum: 0, count: 0 };
        }
        votesMap[vote.promise_id].sum += vote.rating;
        votesMap[vote.promise_id].count += 1;
    });
    
    // Mettre à jour les promesses
    CONFIG.promises.forEach(promise => {
        if (votesMap[promise.id]) {
            promise.publicAvg = votesMap[promise.id].sum / votesMap[promise.id].count;
            promise.publicCount = votesMap[promise.id].count;
        }
    });
    
    if (typeof renderPromises === 'function') {
        renderPromises(CONFIG.promises.slice(0, CONFIG.currentVisible));
    }
    if (typeof updateStats === 'function') {
        updateStats();
    }
}

// Générer des données de test adaptées à votre structure
function generateTestPromises() {
    return [
        {
            id: 'promise_19',
            domaine: 'Lutte Corruption',
            engagement: 'Loi de protection des lanceurs d\'alerte',
            resultat: 'Encouragement dénonciation civique',
            delai: '3 premières années',
            status: 'realise',
            mises_a_jour: [
                {
                    date: '26/08/2025',
                    text: 'Au Sénégal, la protection des lanceurs d\'alerte est désormais régie par la Loi n° 2025-14, adoptée par l\'Assemblée nationale le 26 août 2025 et promulguée en septembre 2025[...]'
                }
            ]
        },
        {
            id: 'promise_20',
            domaine: 'Éducation',
            engagement: 'Construction de 100 nouvelles écoles',
            resultat: 'Amélioration accès éducation',
            delai: '5 ans',
            status: 'en cours',
            mises_a_jour: [
                {
                    date: '15/10/2025',
                    text: '30 écoles déjà construites, 50 en construction'
                }
            ]
        },
        {
            id: 'promise_21',
            domaine: 'Santé',
            engagement: 'Couverture Santé Universelle',
            resultat: 'Soins accessibles à tous',
            delai: '2 premières années',
            status: 'en retard',
            mises_a_jour: []
        }
    ].map(p => {
        const delayDays = parseDelayToDays(p.delai);
        const deadline = calculateDeadlineFromDays(delayDays);
        const status = p.status === 'realise' ? 'Réalisé' : 
                      p.status === 'en cours' ? 'En cours' : 
                      p.status === 'en retard' ? 'En retard' : 'Non lancé';
        const isLate = checkIfLate(status, deadline);
        
        const updates = (p.mises_a_jour || []).map(update => ({
            date: update.date || '',
            description: update.text || update.description || 'Mise à jour'
        }));
        
        return {
            id: p.id,
            engagement: p.engagement,
            domain: p.domaine || p.domain || 'Autre',
            status: status,
            delai: delayDays.toString(),
            delai_texte: p.delai,
            resultat: p.resultat,
            updates: updates,
            deadline: deadline,
            isLate: isLate,
            publicAvg: 0,
            publicCount: 0
        };
    });
}

// ==========================================
// CALCULS - CORRIGÉS
// ==========================================
function calculateDeadlineFromDays(days) {
    // Garantir que days est un nombre positif
    const daysNum = Math.max(0, parseInt(days, 10) || 0);
    
    const deadline = new Date(CONFIG.START_DATE);
    
    // Si le délai est 0 (immédiat), date limite = date de début
    if (daysNum === 0) {
        return deadline;
    }
    
    // Ajouter les jours
    deadline.setDate(deadline.getDate() + daysNum);
    
    // Ne jamais dépasser la fin du mandat (5 ans après le début)
    if (deadline > CONFIG.END_DATE) {
        return new Date(CONFIG.END_DATE);
    }
    
    return deadline;
}

function checkIfLate(status, deadline) {
    if (status === 'Réalisé') return false;
    
    // Vérifier que la date limite est valide
    if (!deadline || !(deadline instanceof Date) || isNaN(deadline.getTime())) {
        return false;
    }
    
    // Une promesse est en retard si la date actuelle dépasse la date limite
    return CONFIG.CURRENT_DATE > deadline;
}

// ==========================================
// FONCTION POUR CORRIGER LES DÉLAIS INVALIDES
// ==========================================
function fixInvalidDelays() {
    let corrections = 0;
    
    CONFIG.promises.forEach(promise => {
        const currentDelay = parseInt(promise.delai);
        
        // Si délai > 5 ans (1825 jours), le corriger
        if (currentDelay > 1825) {
            
            // Nouveau délai = max 5 ans (durée du mandat)
            promise.delai = '1825';
            promise.delai_texte = 'Quinquennat';
            
            // Recalculer la date limite
            promise.deadline = calculateDeadlineFromDays(1825);
            
            // Recalculer si en retard
            promise.isLate = checkIfLate(promise.status, promise.deadline);
            
            corrections++;
        }
    });
    
    if (corrections > 0) {
    } else {
    }
}

// ==========================================
// PROMESSE DU JOUR - FORMAT JOURNAL
// ==========================================
function setupDailyPromise() {
    const promisesWithDetails = CONFIG.promises.filter(p => p.engagement && p.resultat && p.delai);
    
    if (promisesWithDetails.length === 0) return;
    
    const today = new Date().getDate();
    const promiseIndex = today % promisesWithDetails.length;
    const promise = promisesWithDetails[promiseIndex];
    
    const dailyPromiseCard = document.getElementById('dailyPromise');
    if (!dailyPromiseCard) return;

    const daysRemaining = getDaysRemaining(promise.deadline);
    const statusClass = promise.isLate ? 'status-late' : 
                       promise.status === 'Réalisé' ? 'status-realise' :
                       promise.status === 'En cours' ? 'status-encours' : 'status-non-lance';
    
    const statusIcon = promise.isLate ? '⚠️' :
                      promise.status === 'Réalisé' ? '✅' :
                      promise.status === 'En cours' ? '🔄' : '⏳';

    dailyPromiseCard.innerHTML = `
        <div class="daily-newspaper-header">
            <div class="newspaper-badge">
                <i class="fas fa-newspaper"></i>
                PROMESSE DU JOUR
            </div>
            <div class="newspaper-date">
                <i class="fas fa-calendar"></i>
                ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>
        
        <div class="daily-newspaper-article">
            <h2 class="article-title">${escapeHTML(promise.engagement)}</h2>
            
            <div class="article-meta">
                <span class="article-domain"><i class="fas fa-building"></i> ${promise.domain || 'Non spécifié'}</span>
                <span class="article-status ${statusClass}">
                    ${statusIcon} ${promise.isLate ? 'En retard' : promise.status}
                </span>
            </div>
            
            <div class="article-content">
                <p class="article-lead">
                    <strong><i class="fas fa-quote-left"></i></strong>
                    ${escapeHTML(promise.engagement)}
                    <strong><i class="fas fa-quote-right"></i></strong>
                </p>
                
                <div class="article-section">
                    <h3><i class="fas fa-bullseye"></i> Résultats attendus</h3>
                    <p>${promise.resultat || 'Aucun résultat spécifié'}</p>
                </div>
                
                <div class="article-section">
                    <h3><i class="fas fa-clock"></i> Délai de réalisation des mesures clés</h3>
                    <div class="deadline-grid">
                        <div class="deadline-item">
                            <span class="deadline-label">Délai initial :</span>
                            <span class="deadline-value">${promise.delai_texte || promise.delai + ' jours'}</span>
                        </div>
                        <div class="deadline-item">
                            <span class="deadline-label">Date limite :</span>
                            <span class="deadline-value">${formatDate(promise.deadline)}</span>
                        </div>
                        <div class="deadline-item">
                            <span class="deadline-label">Temps restant :</span>
                            <span class="deadline-value ${daysRemaining < 0 ? 'late' : ''}">
                                ${formatDaysRemaining(daysRemaining)}
                            </span>
                        </div>
                    </div>
                </div>
                
                ${promise.updates && promise.updates.length > 0 ? `
                    <div class="article-section updates-section">
                        <h3><i class="fas fa-history"></i> Dernières mises à jour</h3>
                        ${promise.updates.slice(0, 3).map(update => `
                            <div class="update-item-small">
                                <div class="update-date-small">${formatDateProper(update.date || '')}</div>
                                <div class="update-text-small">${update.description || 'Mise à jour'}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="article-footer">
                <button class="btn-article-primary" onclick="sharePromise('${promise.id}')">
                    <i class="fas fa-share-alt"></i> Partager cette promesse
                </button>
                <button class="btn-article-secondary" onclick="showRatingModal('${promise.id}')">
                    <i class="fas fa-star"></i> Noter
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// RENDER ALL
// ==========================================
function renderAll() {
    
    // Initialiser filteredPromises si vide
    if (!CONFIG.filteredPromises || CONFIG.filteredPromises.length === 0) {
        CONFIG.filteredPromises = [...CONFIG.promises];
    }
    
    // Mettre à jour les statistiques
    updateStats();
    
    // Rendre les promesses initiales
    const initialCount = Math.min(CONFIG.visibleCount, CONFIG.filteredPromises.length);
    renderPromises(CONFIG.filteredPromises.slice(0, initialCount));
    
    // Mettre à jour le compteur
    updateResultsCount(CONFIG.filteredPromises.length);
    
    // Mettre à jour les boutons
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    if (CONFIG.filteredPromises.length > CONFIG.visibleCount) {
        if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        if (showLessBtn) showLessBtn.style.display = 'none';
    } else {
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
    
    // Remplir le filtre de domaine
    populateDomainFilter();
}

// ==========================================
// UPDATE STATS - VERSION CORRIGÉE
// ==========================================
    function updateStats() {
 const total = CONFIG.promises.length;
    
    // Logique CORRIGÉE pour le comptage :
    const realise = CONFIG.promises.filter(p => 
        p.status === 'Réalisé' && !p.isLate
    ).length;
    
    const encours = CONFIG.promises.filter(p => 
        p.status === 'En cours' && !p.isLate
    ).length;
    
    const nonLance = CONFIG.promises.filter(p => 
        p.status === 'Non lancé' && !p.isLate
    ).length;
    
    // Les retards sont séparés
    const retard = CONFIG.promises.filter(p => p.isLate).length;
    const withUpdates = CONFIG.promises.filter(p => p.updates && p.updates.length > 0).length;
    const tauxRealisation = total > 0 ? Math.round((realise / total) * 100) : 0;
    
    // ============= CALCUL DU Retard moyen CORRIGÉ =============
    
    // 1. Filtrer seulement les promesses NON RÉALISÉES et NON EN RETARD
    const promisesNonRealiseesNonRetard = CONFIG.promises.filter(p => 
        p.status !== 'Réalisé' && !p.isLate
    );
    
    let avgDelay = 0;
    
    if (promisesNonRealiseesNonRetard.length > 0) {
        // Calculer la somme des jours restants
        let totalDaysRemaining = 0;
        let validPromisesCount = 0;
        
        promisesNonRealiseesNonRetard.forEach(promise => {
            const daysRemaining = getDaysRemaining(promise.deadline);
            
            // Ignorer les valeurs aberrantes (trop grandes)
            if (daysRemaining >= 0 && daysRemaining <= 1825) { // Max 5 ans
                totalDaysRemaining += daysRemaining;
                validPromisesCount++;
            }
        });
        
        if (validPromisesCount > 0) {
            avgDelay = Math.round(totalDaysRemaining / validPromisesCount);
        }
    }
    
    // ============= CALCUL DU RETARD MOYEN =============
    
    const promisesEnRetard = CONFIG.promises.filter(p => p.isLate);
    let avgRetard = 0;
    
    if (promisesEnRetard.length > 0) {
        const totalRetard = promisesEnRetard.reduce((sum, p) => {
            const daysRemaining = getDaysRemaining(p.deadline);
            return sum + Math.abs(daysRemaining);
        }, 0);
        
        avgRetard = Math.round(totalRetard / promisesEnRetard.length);
    }
    
    // ============= NOTE MOYENNE PUBLIQUE =============
    
    const allRatings = CONFIG.promises.filter(p => p.publicCount > 0);
    const avgRating = allRatings.length > 0
        ? (allRatings.reduce((sum, p) => sum + p.publicAvg, 0) / allRatings.length).toFixed(1)
        : '0.0';
    const totalVotes = allRatings.reduce((sum, p) => sum + p.publicCount, 0);
    
    // ============= MISE À JOUR DES KPIs =============
    
    KPI_ITEMS[0].value = total;
    KPI_ITEMS[1].value = realise;
    KPI_ITEMS[2].value = encours;
    KPI_ITEMS[3].value = retard;
    KPI_ITEMS[4].value = `${tauxRealisation}%`;
    
    // Choisir quoi afficher comme KPI[5]
    if (retard > 0) {
        // S'il y a des retards, afficher le retard moyen
        KPI_ITEMS[5].value = `${avgRetard}j`;
        KPI_ITEMS[5].label = '⚠️ Retard Moyen';
        KPI_ITEMS[5].icon = '⚠️';
    } else if (avgDelay > 0) {
        // Sinon, afficher le Retard moyen
        KPI_ITEMS[5].value = `${avgDelay}j`;
        KPI_ITEMS[5].label = '⏱️ Retard moyen';
        KPI_ITEMS[5].icon = '⏱️';
    } else {
        // Cas spécial (toutes réalisées)
        KPI_ITEMS[5].value = 'N/A';
        KPI_ITEMS[5].label = '⏱️ Retard moyen';
        KPI_ITEMS[5].icon = '⏱️';
    }
    
    KPI_ITEMS[6].value = avgRating;
    KPI_ITEMS[7].value = withUpdates;
    
    // ============= MISE À JOUR DES STATISTIQUES =============
    
    updateStatValue('total', total);
    updateStatValue('realise', realise);
    updateStatValue('encours', encours);
    updateStatValue('non-lance', nonLance);
    updateStatValue('retard', retard);
    updateStatValue('avec-maj', withUpdates);
    updateStatValue('taux-realisation', `${tauxRealisation}%`);
    updateStatValue('moyenne-notes', avgRating);
    updateStatValue('votes-total', `${totalVotes.toLocaleString('fr-FR')} votes`);
    
    // Afficher correctement le Retard moyen
    if (retard > 0) {
        updateStatValue('delai-moyen', `${avgRetard}j `);
    } else if (avgDelay > 0) {
        updateStatValue('delai-moyen', `${avgDelay}j restants en moyenne`);
    } else {
        updateStatValue('delai-moyen', 'N/A');
    }
    
    // Pourcentage
    updateStatPercentage('total-percentage', total, total);
    updateStatPercentage('realise-percentage', realise, total);
    updateStatPercentage('encours-percentage', encours, total);
    updateStatPercentage('non-lance-percentage', nonLance, total);
    updateStatPercentage('retard-percentage', retard, total);
    updateStatPercentage('avec-maj-percentage', withUpdates, total);
    
    // Domaines
    const domains = CONFIG.promises.reduce((acc, p) => {
        const domain = p.domain || 'Autre';
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
    }, {});
    
    if (Object.keys(domains).length > 0) {
        const principalDomain = Object.entries(domains).sort((a, b) => b[1] - a[1])[0];
        updateStatValue('domaine-principal', principalDomain[0]);
        updateStatValue('domaine-count', `${principalDomain[1]} engagements`);
    } else {
        updateStatValue('domaine-principal', 'Non spécifié');
        updateStatValue('domaine-count', '0 engagements');
    }

    // Calculs dynamiques pour Volet Exécutif (Présidence) et Volet Législatif (Assemblée)
    if (CONFIG.promises && CONFIG.promises.length > 0) {
        const totalPromises = CONFIG.promises.length;
        const assembleeCount = CONFIG.promises.filter(p => {
            const text = ((p.engagement || '') + ' ' + (p.domain || '') + ' ' + (p.resultat || '')).toLowerCase();
            return text.includes('loi') || text.includes('code') || text.includes('réforme') || 
                   text.includes('statut') || text.includes('assemblée') || text.includes('parlement') || 
                   text.includes('juridique') || text.includes('adoption') || text.includes('vote') ||
                   text.includes('justice') || text.includes('constitution');
        }).length;
        const presidenceCount = totalPromises - assembleeCount;

        updateStatValue('presidence-count', presidenceCount);
        updateStatValue('assemblee-count', assembleeCount);
        updateStatPercentage('presidence-percentage', presidenceCount, totalPromises);
        updateStatPercentage('assemblee-percentage', assembleeCount, totalPromises);
    }
    
    // Mise à jour du carrousel KPI avec les données fraîches
    if (typeof renderKpiItem === 'function') renderKpiItem();
}

function updateStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '0';
}

function updateStatPercentage(id, value, total) {
    const el = document.getElementById(id);
    if (el && total > 0) {
        const percentage = Math.round((value / total) * 100);
        el.textContent = `${percentage}%`;
    } else {
        el.textContent = '0%';
    }
}

// ==========================================
// FILTRES
// ==========================================
function initFilters() {
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const filtersSection = document.getElementById('filtersSection');
    const filterStatus = document.getElementById('filter-status');
    const filterDomain = document.getElementById('filter-domain');
    const filterSearch = document.getElementById('filter-search');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');

    if (filterToggleBtn && filtersSection) {
        filterToggleBtn.addEventListener('click', () => {
            filtersSection.classList.toggle('active');
        });
    }

    // Événements de filtrage
    if (filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }
    
    if (filterDomain) {
        filterDomain.addEventListener('change', applyFilters);
    }
    
    if (filterSearch) {
        filterSearch.addEventListener('input', debounce(applyFilters, 300));
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

    // BOUTONS AFFICHER PLUS/MOINS
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            CONFIG.currentVisible = CONFIG.filteredPromises.length;
            renderPromises(CONFIG.filteredPromises);
            showMoreBtn.style.display = 'none';
            if (showLessBtn) showLessBtn.style.display = 'inline-flex';
        });
    }

    if (showLessBtn) {
        showLessBtn.addEventListener('click', () => {
            CONFIG.currentVisible = CONFIG.visibleCount;
            renderPromises(CONFIG.filteredPromises.slice(0, CONFIG.currentVisible));
            showLessBtn.style.display = 'none';
            if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        });
        // Caché par défaut
        showLessBtn.style.display = 'none';
    }
    
    // Initialiser le filtre de domaine
    populateDomainFilter();
}

function resetFilters() {
    
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-domain').value = '';
    document.getElementById('filter-search').value = '';
    
    // Réinitialiser à toutes les promesses
    CONFIG.filteredPromises = [...CONFIG.promises];
    CONFIG.currentVisible = CONFIG.visibleCount;
    
    // Rendre toutes les promesses
    renderPromises(CONFIG.filteredPromises.slice(0, CONFIG.currentVisible));
    updateResultsCount(CONFIG.filteredPromises.length);
    
    // Mettre à jour les boutons
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    if (CONFIG.promises.length > CONFIG.visibleCount) {
        if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        if (showLessBtn) showLessBtn.style.display = 'none';
    } else {
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
    
    showNotification('Filtres réinitialisés');
}

// Fonction debounce pour la recherche
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resetFilters() {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-domain').value = '';
    document.getElementById('filter-search').value = '';
    
    // Réinitialiser à toutes les promesses
    CONFIG.filteredPromises = [...CONFIG.promises];
    CONFIG.currentVisible = CONFIG.visibleCount;
    
    updateFilteredDisplay();
    
    // Réinitialiser les boutons
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    if (CONFIG.promises.length > CONFIG.visibleCount) {
        if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        if (showLessBtn) showLessBtn.style.display = 'none';
    } else {
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
}

function applyFilters() {
    const filterStatus = document.getElementById('filter-status')?.value || '';
    const filterInstitution = document.getElementById('filter-institution')?.value || '';
    const filterDomain = document.getElementById('filter-domain')?.value || '';
    const filterSearch = document.getElementById('filter-search')?.value.toLowerCase() || '';
    
    let filtered = CONFIG.promises;

    // 1. FILTRAGE PAR INSTITUTION (Présidence vs Assemblée)
    if (filterInstitution) {
        const legDomains = ['Institutions', 'Justice', 'Gouvernance', 'Lutte Corruption', 'Administration'];
        if (filterInstitution === 'assemblee') {
            filtered = filtered.filter(promise => legDomains.includes(promise.domain || promise.domaine));
        } else if (filterInstitution === 'presidence') {
            filtered = filtered.filter(promise => !legDomains.includes(promise.domain || promise.domaine));
        }
    }
    
    // 2. FILTRAGE PAR STATUT
    if (filterStatus) {
        if (filterStatus === 'En retard') {
            filtered = filtered.filter(promise => promise.isLate === true);
        } 
        else if (filterStatus === '✅ Réalisé') {
            filtered = filtered.filter(promise => promise.status === 'Réalisé' && promise.isLate === false);
        } 
        else if (filterStatus === '🔄 En cours') {
            filtered = filtered.filter(promise => promise.status === 'En cours' && promise.isLate === false);
        } 
        else if (filterStatus === '⏳ Non lancé') {
            filtered = filtered.filter(promise => promise.status === 'Non lancé' && promise.isLate === false);
        }
    }
    
    // 3. FILTRAGE PAR DOMAINE
    if (filterDomain && filterDomain !== '') {
        filtered = filtered.filter(promise => promise.domain === filterDomain);
    }
    
    // 4. FILTRAGE PAR RECHERCHE
    if (filterSearch) {
        filtered = filtered.filter(promise => 
            promise.engagement.toLowerCase().includes(filterSearch) ||
            (promise.domain || '').toLowerCase().includes(filterSearch) ||
            (promise.resultat || '').toLowerCase().includes(filterSearch)
        );
    }
    
    
    // Stocker le résultat
    CONFIG.filteredPromises = filtered;
    
    // Mettre à jour l'affichage
    updateFilteredDisplay();
}
function updateFilteredDisplay() {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    
    // Toujours montrer "Afficher plus" s'il y a plus d'éléments
    if (CONFIG.filteredPromises.length > CONFIG.visibleCount) {
        CONFIG.currentVisible = CONFIG.visibleCount;
        if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        if (showLessBtn) showLessBtn.style.display = 'none';
    } else {
        CONFIG.currentVisible = CONFIG.filteredPromises.length;
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
    
    // Rendre les promesses
    renderPromises(CONFIG.filteredPromises.slice(0, CONFIG.currentVisible));
    updateResultsCount(CONFIG.filteredPromises.length);
}

function updateFilteredDisplay() {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    // Déterminer combien de promesses afficher
    if (CONFIG.filteredPromises.length > CONFIG.visibleCount) {
        CONFIG.currentVisible = CONFIG.visibleCount;
        if (showMoreBtn) showMoreBtn.style.display = 'inline-flex';
        if (showLessBtn) showLessBtn.style.display = 'none';
    } else {
        CONFIG.currentVisible = CONFIG.filteredPromises.length;
        if (showMoreBtn) showMoreBtn.style.display = 'none';
        if (showLessBtn) showLessBtn.style.display = 'none';
    }
    
    // Rendre les promesses
    renderPromises(CONFIG.filteredPromises.slice(0, CONFIG.currentVisible));
    updateResultsCount(CONFIG.filteredPromises.length);
}
// Modifier la fonction pour "Afficher plus"
function showMorePromises() {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    CONFIG.currentVisible = CONFIG.filteredPromises.length;
    renderPromises(CONFIG.filteredPromises);
    
    showMoreBtn.style.display = 'none';
    showLessBtn.style.display = 'inline-flex';
}

// Modifier la fonction pour "Afficher moins"
function showLessPromises() {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    
    CONFIG.currentVisible = CONFIG.visibleCount;
    renderPromises(CONFIG.filteredPromises.slice(0, CONFIG.currentVisible));
    
    showLessBtn.style.display = 'none';
    showMoreBtn.style.display = 'inline-flex';
}

function resetFilters() {
    const filterStatus = document.getElementById('filter-status');
    const filterDomain = document.getElementById('filter-domain');
    const filterSearch = document.getElementById('filter-search');
    
    if (filterStatus) filterStatus.value = '';
    if (filterDomain) filterDomain.value = '';
    if (filterSearch) filterSearch.value = '';

    CONFIG.currentVisible = CONFIG.visibleCount;
    renderPromises(CONFIG.promises.slice(0, CONFIG.currentVisible));
    updateResultsCount(CONFIG.promises.length);
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${count} engagement(s) trouvé(s)`;
    }
}

function populateDomainFilter() {
    const filterDomain = document.getElementById('filter-domain');
    if (!filterDomain) return;
    
    const domains = [...new Set(CONFIG.promises.map(p => p.domain || 'Autre'))].filter(d => d !== 'Autre');
    domains.sort();

    filterDomain.innerHTML = '<option value="">Tous les domaines</option>' +
        domains.map(domain => `<option value="${domain}">${domain}</option>`).join('') +
        '<option value="Autre">Autre</option>';
}

// ==========================================
// RENDER PROMISES - AVEC ICÔNES PARTAGE/NOTATION
// ==========================================
function renderPromises(promises) {
    const grid = document.getElementById('promisesGrid');
    if (!grid) return;
    
    
    if (!promises || promises.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <p><i class="fas fa-search"></i> Aucun engagement trouvé avec ces critères.</p>
                <button class="btn-updates" onclick="resetFilters()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Réinitialiser les filtres
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = promises.map(promise => {
        const statusClass = getStatusClass(promise);
        const statusIcon = getStatusIcon(promise);
        const daysRemaining = getDaysRemaining(promise.deadline);
        
        return `
            <div class="promise-card ${statusClass}" data-id="${promise.id}">
                <div class="promise-header">
                   <span class="promise-status">
    ${statusIcon} ${getStatusText(promise)}
</span>
                    <span class="promise-domain">${promise.domain || 'Non spécifié'}</span>
                </div>
               
                <h3 class="promise-title">${escapeHTML(promise.engagement)}</h3>
                
                <div class="promise-result">
                    <strong><i class="fas fa-bullseye"></i> Résultat attendu :</strong>
                    <p>${promise.resultat || 'Non spécifié'}</p>
                </div>
               
                <div class="promise-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(promise.deadline)}</span>
                    <span><i class="fas fa-clock"></i> ${formatDaysRemaining(daysRemaining)}</span>
                </div>
               
                ${promise.updates && promise.updates.length > 0 ? `
                    <div class="promise-updates">
                        <button class="btn-updates" onclick="toggleUpdates('${promise.id}')">
                            <i class="fas fa-info-circle"></i>
                            ${promise.updates.length} mise(s) à jour
                        </button>
                        <div class="updates-list" id="updates-${promise.id}" style="display: none;">
                            ${promise.updates.map(update => `
                                <div class="update-item">
                                    <div class="update-date">${formatDateProper(update.date || '')}</div>
                                    <div class="update-text">${update.description || 'Mise à jour des engagements'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
               
                <div class="promise-actions">
                    <div class="social-share">
                        <!-- FORCER LES COULEURS AVEC STYLE INLINE -->
                        <button class="social-btn fb" onclick="shareToPlatform('${promise.id}', 'facebook')" 
                                title="Partager sur Facebook"
                                style="background-color: #3b5998 !important; border: none !important;">
                            <i class="fab fa-facebook-f" style="color: white !important;"></i>
                        </button>
                        <button class="social-btn tw" onclick="shareToPlatform('${promise.id}', 'twitter')" 
                                title="Partager sur Twitter"
                                style="background-color: #000000 !important; border: none !important;">
                            <i class="fab fa-x-twitter" style="color: white !important;"></i>
                        </button>
                        <button class="social-btn wa" onclick="shareToPlatform('${promise.id}', 'whatsapp')" 
                                title="Partager sur WhatsApp"
                                style="background-color: #25D366 !important; border: none !important;">
                            <i class="fab fa-whatsapp" style="color: white !important;"></i>
                        </button>
                    </div>
                    <button class="btn-stars" onclick="showRatingModal('${promise.id}')" title="Noter cette promesse">
                        <i class="fas fa-star"></i> Noter
                    </button>
                </div>
               
                ${promise.publicCount > 0 ? `
                    <div class="promise-rating">
                        <span class="rating-value">${promise.publicAvg.toFixed(1)}</span>
                        <div class="rating-stars">
                            ${generateStars(promise.publicAvg)}
                        </div>
                        <span class="rating-count">(${promise.publicCount} vote${promise.publicCount > 1 ? 's' : ''})</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // FORCER LA VISIBILITÉ DES BOUTONS APRÈS RENDU
    setTimeout(() => {
        forceSocialButtonsColors();
    }, 100);
}

// NOUVELLE FONCTION POUR FORCER LES COULEURS
function forceSocialButtonsColors() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(btn => {
        // Retirer toutes les classes qui pourraient écraser les couleurs
        btn.className = 'social-btn';
        
        // Ajouter la classe spécifique
        if (btn.innerHTML.includes('fa-facebook')) {
            btn.classList.add('fb');
            btn.style.cssText = `
                background-color: #3b5998 !important;
                color: white !important;
                border: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        } else if (btn.innerHTML.includes('fa-x-twitter') || btn.innerHTML.includes('fa-twitter')) {
            btn.classList.add('tw');
            btn.style.cssText = `
                background-color: #000000 !important;
                color: white !important;
                border: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        } else if (btn.innerHTML.includes('fa-whatsapp')) {
            btn.classList.add('wa');
            btn.style.cssText = `
                background-color: #25D366 !important;
                color: white !important;
                border: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        }
    });
}

function getStatusClass(promise) {
    if (promise.isLate) return 'status-late';
    if (promise.status.includes('Réalisé')) return 'status-realise';
    if (promise.status.includes('cours')) return 'status-encours';
    return 'status-non-lance';
}

function getStatusIcon(promise) {
    if (promise.isLate) return '⚠️';
    if (promise.status.includes('Réalisé')) return '✅';
    if (promise.status.includes('cours')) return '🔄';
    return '⏳';
}

function formatDate(dateInput) {
    let date;
    if (!dateInput) return 'Date inconnue';
    
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else {
        return 'Date inconnue';
    }
    
    if (isNaN(date.getTime())) return 'Date inconnue';
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateProper(dateInput) {
    if (!dateInput) return 'Pas de date';
    
    try {
        // Essayer de parser la date au format DD/MM/YYYY
        const parts = dateInput.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
        }
        
        // Essayer le format standard
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        
        return dateInput; // Retourner la chaîne originale si elle ne peut pas être parsée
    } catch (error) {
        return dateInput;
    }
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// ==========================================
// MODAL DE NOTATION DES PROMESSES
// ==========================================
function showRatingModal(promiseId) {
    const promise = CONFIG.promises.find(p => p.id === promiseId);
    if (!promise) return;
    
    CONFIG.currentRatingPromiseId = promiseId;
    CONFIG.currentRatingValue = 0;
    
    // Créer le modal de notation
    const modal = document.createElement('div');
    modal.className = 'rating-modal';
    modal.id = 'ratingModal';
    modal.innerHTML = `
        <div class="rating-modal-content">
            <div class="rating-modal-header">
                <h3>
                    <i class="fas fa-star"></i>
                    Noter cet engagement
                </h3>
                <button class="close-modal" onclick="closeRatingModal()">&times;</button>
            </div>
            <div class="rating-modal-body">
                <p class="promise-preview">"${promise.engagement.substring(0, 100)}${promise.engagement.length > 100 ? '...' : ''}"</p>
                
                <div class="stars-rating-container">
                    <div class="stars-large" id="ratingStars">
                        <i class="far fa-star" data-value="1"></i>
                        <i class="far fa-star" data-value="2"></i>
                        <i class="far fa-star" data-value="3"></i>
                        <i class="far fa-star" data-value="4"></i>
                        <i class="far fa-star" data-value="5"></i>
                    </div>
                    <div class="rating-label" id="ratingLabel">
                        Sélectionnez une note (1-5 étoiles)
                    </div>
                </div>
                
                <div class="rating-feedback">
                    <label for="ratingComment">
                        <i class="fas fa-comment"></i>
                        Commentaire (optionnel)
                    </label>
                    <textarea 
                        id="ratingComment" 
                        placeholder="Partagez votre avis sur cet engagement..."
                        rows="3"></textarea>
                </div>
            </div>
            <div class="rating-modal-footer">
                <button class="btn-cancel" onclick="closeRatingModal()">
                    Annuler
                </button>
                <button class="btn-submit-rating" onclick="submitRating()" disabled>
                    <i class="fas fa-paper-plane"></i>
                    Soumettre ma note
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser les étoiles
    const stars = modal.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'));
            CONFIG.currentRatingValue = value;
            updateStars(stars, value);
            modal.querySelector('.btn-submit-rating').disabled = false;
            
            const labels = [
                'Mauvais',
                'Passable',
                'Bon',
                'Très bon',
                'Excellent'
            ];
            modal.querySelector('#ratingLabel').textContent = labels[value - 1];
        });
        
        star.addEventListener('mouseenter', () => {
            const value = parseInt(star.getAttribute('data-value'));
            updateStars(stars, value, true);
        });
    });
    
    modal.querySelector('#ratingStars').addEventListener('mouseleave', () => {
        updateStars(stars, CONFIG.currentRatingValue);
    });
    
    modal.style.display = 'flex';
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function updateStars(stars, value, isHover = false) {
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
        
        if (isHover) {
            star.style.transform = 'scale(1.1)';
        } else {
            star.style.transform = 'scale(1)';
        }
    });
}

function submitRating() {
    if (!CONFIG.currentRatingPromiseId || CONFIG.currentRatingValue === 0) {
        showNotification('Veuillez sélectionner une note', 'error');
        return;
    }
    
    const comment = document.getElementById('ratingComment')?.value.trim() || '';
    
    saveVoteToSupabase(CONFIG.currentRatingPromiseId, CONFIG.currentRatingValue, comment);
    closeRatingModal();
}

async function saveVoteToSupabase(promiseId, rating, comment = '') {
    if (!supabaseClient) {
        showNotification('Mode démo : Vote enregistré localement', 'info');
        // Mode fallback - stocker localement
        const votes = JSON.parse(localStorage.getItem('promise_votes') || '[]');
        votes.push({
            id: Date.now().toString(),
            promise_id: promiseId,
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('promise_votes', JSON.stringify(votes));
        return;
    }
    
    try {
        const voteData = { 
            promise_id: promiseId, 
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        };
        
        
        const { error } = await supabaseClient
            .from('votes')
            .insert([voteData]);
        
        if (error) {
            console.error(error);
            
            // Mode fallback - stocker localement
            const votes = JSON.parse(localStorage.getItem('promise_votes') || '[]');
            votes.push({
                id: Date.now().toString(),
                promise_id: promiseId,
                rating: rating,
                comment: comment,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('promise_votes', JSON.stringify(votes));
            
            showNotification('Vote enregistré localement (mode démo)', 'info');
        } else {
            showNotification('Merci pour votre vote !', 'success');
        }
        
        // Recharger les votes après un délai
        setTimeout(() => fetchAndDisplayPublicVotes(), 500);
        
    } catch (error) {
        console.error(error);
        showNotification('Mode démo : Vote enregistré localement', 'info');
    }
}

// ==========================================
// RENDER NEWS
// ==========================================
// ==========================================
// RENDER NEWS — calqué sur actualites.html
// fetch direct + featured + grille + modal
// ==========================================

const _newsIconMap = {
    'Général':'fa-newspaper','general':'fa-newspaper','Autres':'fa-newspaper','autres':'fa-newspaper',
    'Politique':'fa-landmark','Gouvernance':'fa-landmark','gouvernance':'fa-landmark','Institutions':'fa-landmark',
    'Éducation':'fa-graduation-cap','education':'fa-graduation-cap',
    'Santé':'fa-heartbeat','sante':'fa-heartbeat',
    'Économie':'fa-chart-line','economie':'fa-chart-line','Finances':'fa-coins','Commerce':'fa-shopping-cart',
    'Infrastructures':'fa-road','infrastructures':'fa-road','Habitat':'fa-home',
    'Transparence':'fa-eye','Administration':'fa-file-alt',
    'Agriculture':'fa-seedling','Pêche':'fa-fish','Élevage':'fa-horse','Agro-industrie':'fa-industry',
    'Énergie':'fa-bolt','energie':'fa-bolt','Hydrocarbures':'fa-oil-can',
    'Environnement':'fa-leaf','environnement':'fa-leaf','Hydraulique':'fa-water',
    'Emploi':'fa-briefcase','emploi':'fa-briefcase','Industrie':'fa-industry',
    'Jeunesse & Sports':'fa-running','Sport':'fa-running',
    'Culture':'fa-theater-masks',
    'Sécurité':'fa-shield-alt','securite':'fa-shield-alt','Défense':'fa-shield-alt',
    'Justice':'fa-balance-scale','justice':'fa-balance-scale',
    'Numérique':'fa-laptop','numerique':'fa-laptop',
    'Transport':'fa-bus','transport':'fa-bus',
    'Logement':'fa-home','logement':'fa-home',
    'Affaires Sociales':'fa-hand-holding-heart','social':'fa-hand-holding-heart',
    'Relations Internationales':'fa-globe','international':'fa-globe',
    'Communiqué':'fa-bullhorn','Développement Local':'fa-map-marker-alt'
};

function _newsEsc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}
function _newsSafeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const t = url.trim().toLowerCase();
    if (t.startsWith('javascript:') || t.startsWith('data:') || t.startsWith('vbscript:')) return '#';
    return url.trim();
}
function _newsGetIcon(cat) { return _newsIconMap[cat] || 'fa-newspaper'; }
function _newsFallbackImg(el, catLabel, isFeatured) {
    el.onerror = null;
    const icon   = _newsIconMap[catLabel] || 'fa-newspaper';
    const height = isFeatured ? '280px' : '180px';
    el.parentElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    height:${height};width:100%;
                    background:linear-gradient(135deg,#1A3D28,#2D5F3F);
                    border-radius:inherit;gap:.6rem">
            <i class="fas ${icon}" style="font-size:2.4rem;color:rgba(255,255,255,.45)"></i>
            <span style="font-size:.72rem;color:rgba(255,255,255,.35);letter-spacing:.05em;text-transform:uppercase">${catLabel}</span>
        </div>`;
}
window._newsFallbackImg = _newsFallbackImg;

const _indexArticleStore = new Map();

function _ensureIndexModal() {
    let modal = document.getElementById('indexActuModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'indexActuModal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;position:relative;padding:2rem;animation:slideIn .3s ease;">
                <button id="indexActuModalCloseBtn" style="position:absolute;top:1rem;right:1rem;width:40px;height:40px;border-radius:50%;background:#2D5F3F;color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;z-index:2;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:all .2s;" title="Fermer">
                    <i class="fas fa-times"></i>
                </button>
                <div id="indexActuModalBody"></div>
            </div>`;
        modal.addEventListener('click', e => { if (e.target === modal) _closeIndexModal(); });
        document.body.appendChild(modal);
        document.getElementById('indexActuModalCloseBtn').addEventListener('click', _closeIndexModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') _closeIndexModal(); });
    }
    return modal;
}

function _closeIndexModal() {
    const m = document.getElementById('indexActuModal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = '';
}

function _openIndexArticle(key) {
    const n = _indexArticleStore.get(key);
    if (!n) return;
    const modal = _ensureIndexModal();
    const body  = document.getElementById('indexActuModalBody');
    const cat   = n.category || 'Général';
    const fullText = n.content || n.excerpt || '';
    const link  = (n.link && !n.link.startsWith('<iframe') && n.link !== '#') ? n.link : null;
    body.innerHTML = `
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem;">
            <span style="background:#eef6f1;color:#2D5F3F;border:1px solid #c5dbc0;padding:.2rem .75rem;border-radius:20px;font-size:.78rem;font-weight:700">${_newsEsc(cat)}</span>
            <span style="color:#999;font-size:.78rem;margin-left:auto">${_newsEsc(n.date)}</span>
        </div>
        <h2 style="font-size:1.4rem;font-weight:800;color:#1A3D28;margin-bottom:1rem;line-height:1.35;padding-right:2.5rem">${_newsEsc(n.title)}</h2>
        ${n.image_url ? `<div style="width:100%;border-radius:10px;overflow:hidden;margin-bottom:1rem"><img src="${_newsEsc(n.image_url)}" alt="${_newsEsc(n.title)}" style="width:100%;max-height:260px;object-fit:cover;display:block" onerror="_newsFallbackImg(this,'${_newsEsc(cat)}',true)"></div>` : ''}
        <div style="display:flex;gap:1rem;font-size:.8rem;color:#8a9e93;margin-bottom:1.2rem;flex-wrap:wrap">
            <span><i class="fas fa-newspaper" style="color:#2D5F3F;margin-right:.3rem"></i>${_newsEsc(n.source)}</span>
            ${n.read_time ? `<span><i class="fas fa-clock" style="color:#2D5F3F;margin-right:.3rem"></i>${_newsEsc(n.read_time)}</span>` : ''}
        </div>
        <div style="line-height:1.8;color:#333;font-size:.95rem">${fullText.split('\n').filter(l=>l.trim()).map(l=>`<p style="margin-bottom:.85rem">${_newsEsc(l)}</p>`).join('')}</div>
        ${link ? `<div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid #e5ede6">
            <a href="${_newsSafeUrl(link)}" target="_blank" rel="noopener noreferrer" style="color:#2D5F3F;font-weight:700;font-size:.88rem;display:inline-flex;align-items:center;gap:.4rem">
                <i class="fas fa-external-link-alt"></i> Lire l'article original
            </a>
        </div>` : ''}`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window._openIndexArticle = _openIndexArticle;

function _parseNewsDate(str) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str || '');
    if (!m) return 0;
    return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
}

async function renderNewsIndex() {
        const featured = document.getElementById('newsFeatured');
    const grid     = document.getElementById('newsGrid');
    console.log('[renderNews] newsFeatured:', featured, '| newsGrid:', grid);
    if (!featured && !grid) {
        console.warn('[renderNews] ⚠ aucun conteneur trouvé — abandon');
        return;
    }

    let news = [];
    try {
                const res  = await fetch('news.json');
        console.log('[renderNews] réponse HTTP:', res.status, res.ok);
        const data = await res.json();
        news = data.news || [];
        news.sort((a, b) => _parseNewsDate(b.date) - _parseNewsDate(a.date));
        console.log('[renderNews] articles reçus:', news.length, '| 1er:', news[0]?.title);
    } catch(e) {
        console.error('[renderNews] ✗ fetch/parse error:', e);
        if (featured) featured.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">Impossible de charger les actualités.</p>';
        if (grid)     grid.innerHTML = '';
        return;
    }
    if (!news.length) {
        console.warn('[renderNews] tableau vide');
        if (featured) featured.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">Aucune actualité disponible.</p>';
        return;
    }

    // ── Article à la une (position 0 = le plus récent) ──
    if (featured) {
        const f   = news[0];
        const cat = f.category || 'Général';
        const icon = _newsGetIcon(cat);
        _indexArticleStore.set('featured', f);
        featured.innerHTML = `
        <div class="idx-featured" onclick="_openIndexArticle('featured')">
            <div class="idx-featured-img">
                ${f.image_url
                    ? `<img src="${_newsEsc(f.image_url)}" alt="${_newsEsc(f.title)}" onerror="_newsFallbackImg(this,'${_newsEsc(cat)}',true)"><div class="idx-feat-overlay"></div>`
                    : `<i class="fas ${icon}" style="font-size:3.5rem;color:rgba(255,255,255,.3);position:relative;z-index:1"></i>`}
                <div class="idx-feat-badge">À la une</div>
            </div>
            <div class="idx-featured-body">
                <div class="idx-feat-cat">${_newsEsc(cat)}</div>
                <h3 class="idx-feat-title">${_newsEsc(f.title)}</h3>
                <p class="idx-feat-excerpt">${_newsEsc((f.excerpt||'').substring(0,240))}${(f.excerpt||'').length>240?'…':''}</p>
                <div class="idx-feat-meta">
                    <span><i class="fas fa-calendar"></i> ${_newsEsc(f.date)}</span>
                    <span><i class="fas fa-newspaper"></i> ${_newsEsc(f.source||'')}</span>
                </div>
                <button class="idx-feat-btn" onclick="event.stopPropagation();_openIndexArticle('featured')">
                    <i class="fas fa-book-open"></i> Lire l'article
                </button>
            </div>
        </div>`;
    }

    // ── Grille des 7 suivants (positions 1–7) ──
    if (grid) {
        const items = news.slice(1, 8);
        grid.innerHTML = items.map((n, i) => {
            const cat  = n.category || 'Général';
            const icon = _newsGetIcon(cat);
            const key  = 'art_' + i;
            _indexArticleStore.set(key, n);
            return `
            <article class="idx-news-item" onclick="_openIndexArticle('${key}')">
                <div class="idx-news-img">
                    ${n.image_url
                        ? `<img src="${_newsSafeUrl(n.image_url)}" alt="${_newsEsc(n.title)}" loading="lazy" onerror="_newsFallbackImg(this,'${_newsEsc(cat)}',false)">`
                        : `<i class="fas ${icon}"></i>`}
                </div>
                <div class="idx-news-body">
                    <div class="idx-news-head">
                        <span class="idx-news-cat">${_newsEsc(cat)}</span>
                        <span class="idx-news-date">${_newsEsc(n.date)}</span>
                    </div>
                    <h4 class="idx-news-title">${_newsEsc(n.title)}</h4>
                    <p class="idx-news-excerpt">${_newsEsc((n.excerpt||'').substring(0,140))}…</p>
                    <div class="idx-news-foot">
                        <span><i class="fas fa-newspaper"></i> ${_newsEsc(n.source||'')}</span>
                        <button class="idx-news-read" onclick="event.stopPropagation();_openIndexArticle('${key}')">
                            Lire <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>`;
        }).join('');
    }
}
// ==========================================
// RENDER NEWSPAPERS
// ==========================================

async function renderNewspapers() {
    try {
        const grid = document.getElementById('newspapersGrid');
        if (!grid) return;
        
        // Vérifier les images disponibles
        const availablePress = await checkAvailableNewspapers();
        
        if (!availablePress || availablePress.length === 0) {
            grid.innerHTML = `
                <div class="loading-state" style="grid-column:1/-1">
                    <p><i class="fas fa-newspaper"></i> Aucun journal disponible pour le moment</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = availablePress.map((paper, index) => {
            const paperId = paper.id || (index + 1);
            const title = paper.title || `Quotidien ${index + 1}`;
            const date = paper.date || '';
            const imageSrc = paper.image || '';

            return `
                <div class="newspaper-card" onclick="openPhotoViewer('${escapeAttr(paperId)}')">
                    <div class="newspaper-preview">
                        <img src="${escapeAttr(imageSrc)}" alt="${escapeAttr(title)}" 
                             onerror="this.onerror=null; this.src='https://picsum.photos/400/533?random=${paperId}'"
                             loading="lazy">
                    </div>
                    ${title ? `<h4>${escapeHTML(title)}</h4>` : ''}
                    ${date ? `<p class="newspaper-date"><i class="far fa-calendar-alt"></i> ${escapeHTML(date)}</p>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('[renderNewspapers] Erreur:', err);
    }
}


// ==========================================
// CONFIGURATION PRESSE - AVEC VOS FICHIERS
// ==========================================

// Données par défaut (vide si press.json non chargé)
const DEFAULT_PRESS = [];

let PRESS_DATA = [];

// ==========================================
// CHARGEMENT DES DONNÉES PRESSE
// ==========================================

async function loadPressData() {
    try {
        const response = await fetch('press.json?v=' + Date.now());
        
        if (!response.ok) {
            PRESS_DATA = [];
            CONFIG.press = [];
            return;
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data.press)) {
            PRESS_DATA = data.press;
            CONFIG.press = data.press;
            if (typeof renderPressCarousel === 'function') renderPressCarousel();
            if (typeof renderNewspapers === 'function') renderNewspapers();
        } else {
            PRESS_DATA = [];
            CONFIG.press = [];
        }
        
    } catch (error) {
        console.error(error);
        PRESS_DATA = [];
        CONFIG.press = [];
    }
}

// ==========================================
// FONCTION POUR DÉTECTER LES IMAGES DISPONIBLES
// ==========================================

async function checkAvailableNewspapers() {
    if (Array.isArray(CONFIG.press) && CONFIG.press.length > 0) {
        return CONFIG.press;
    }
    if (Array.isArray(PRESS_DATA) && PRESS_DATA.length > 0) {
        return PRESS_DATA;
    }
    return [];
}

// ==========================================
// MODIFIEZ VOTRE FONCTION setupPressCarousel
// ==========================================

async function setupPressCarousel() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const autoPlayToggle = document.getElementById('autoPlayToggle');
    const indicators = document.getElementById('carouselIndicators');
    
    if (!prevBtn || !nextBtn || !indicators) {
        console.error();
        return;
    }

    // Vérifier les images disponibles
    const availablePress = await checkAvailableNewspapers();
    
    if (availablePress.length === 0) {
        console.error();
        document.getElementById('pressCarousel').innerHTML = `
            <div class="loading-state">
                <p><i class="fas fa-newspaper"></i> Aucun journal disponible pour le moment</p>
            </div>
        `;
        return;
    }

    // Mettre à jour CONFIG.press avec les journaux disponibles
    CONFIG.press = availablePress;
    CONFIG.currentIndex = 0;
    CONFIG.zoomScale = 1;

    // Configuration des boutons
    prevBtn.addEventListener('click', () => {
        CONFIG.currentIndex = (CONFIG.currentIndex - 1 + CONFIG.press.length) % CONFIG.press.length;
        CONFIG.zoomScale = 1;
        renderPressCarousel();
    });

    nextBtn.addEventListener('click', () => {
        CONFIG.currentIndex = (CONFIG.currentIndex + 1) % CONFIG.press.length;
        CONFIG.zoomScale = 1;
        renderPressCarousel();
    });

    if (autoPlayToggle) {
        autoPlayToggle.addEventListener('click', () => {
            CONFIG.carouselAutoPlay = !CONFIG.carouselAutoPlay;
            autoPlayToggle.innerHTML = CONFIG.carouselAutoPlay ? 
                '<i class="fas fa-pause"></i> Pause' : 
                '<i class="fas fa-play"></i> Lecture auto';
            
            if (CONFIG.carouselAutoPlay) startCarouselAutoPlay();
            else stopCarouselAutoPlay();
        });
    }

    renderPressCarousel();
    startCarouselAutoPlay();
}

function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    CONFIG.carouselInterval = setInterval(() => {
        if (CONFIG.carouselAutoPlay) {
            CONFIG.currentIndex = (CONFIG.currentIndex + 1) % CONFIG.press.length;
            CONFIG.zoomScale = 1; // Reset zoom when changing slide
            renderPressCarousel();
        }
    }, 10000);
}

function stopCarouselAutoPlay() {
    if (CONFIG.carouselInterval) {
        clearInterval(CONFIG.carouselInterval);
        CONFIG.carouselInterval = null;
    }
}

function renderPressCarousel() {
    try {
        const carousel = document.getElementById('pressCarousel');
        const indicators = document.getElementById('carouselIndicators');
        if (!carousel) return;

        if (!CONFIG.press || CONFIG.press.length === 0 || !CONFIG.press[CONFIG.currentIndex]) {
            carousel.innerHTML = `
                <div class="loading-state">
                    <p><i class="fas fa-newspaper"></i> Aucun journal disponible pour le moment</p>
                </div>
            `;
            return;
        }

        const currentPaper = CONFIG.press[CONFIG.currentIndex];

        // Utiliser une image plus grande pour le carousel
        let imageUrl = currentPaper.image || '';
        if (imageUrl.includes('picsum.photos')) {
            imageUrl = imageUrl.replace('/400/533', '/700/933');
        }

        carousel.innerHTML = `
            <div class="carousel-item active">
                <div class="carousel-image-container" onclick="openPressLightbox('${escapeAttr(imageUrl)}', '${escapeAttr(currentPaper.title || 'Quotidien')}')" title="Cliquez pour agrandir en plein écran" style="cursor:zoom-in;">
                    <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(currentPaper.title || 'Quotidien')}"
                         onerror="this.onerror=null; this.src='https://picsum.photos/700/933?random=${CONFIG.currentIndex}'"
                         id="pressImage"
                         style="transform: scale(${CONFIG.zoomScale || 1})">
                    <div class="press-lightbox-hint"><i class="fas fa-expand-alt"></i> Plein Écran</div>
                </div>
            </div>
        `;

        if (indicators) {
            const total = CONFIG.press.length;
            const current = CONFIG.currentIndex + 1;
            const currentTitle = currentPaper.title || 'Quotidien';
            indicators.innerHTML = `
                <div class="carousel-counter-widget" role="group" aria-label="Navigation diapositive">
                    <button class="carousel-nav-btn" onclick="document.getElementById('prevBtn').click()" aria-label="Journal précédent">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <div class="carousel-counter-info">
                        <span class="carousel-counter-badge">
                            <i class="fas fa-newspaper"></i> <strong>${escapeHTML(currentTitle)}</strong> &nbsp;•&nbsp; 
                            <span class="counter-numbers">${current.toString().padStart(2, '0')} / ${total.toString().padStart(2, '0')}</span>
                        </span>
                    </div>
                    <button class="carousel-nav-btn" onclick="document.getElementById('nextBtn').click()" aria-label="Journal suivant">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>
            `;
        }

        // Setup drag and drop
        const pressImage = document.getElementById('pressImage');
        const imageContainer = carousel.querySelector('.carousel-image-container');
        
        if (pressImage && imageContainer) {
            let isDragging = false;
            let startX, startY, translateX = 0, translateY = 0;
            
            imageContainer.addEventListener('mousedown', (e) => {
                if (CONFIG.zoomScale > 1) {
                    isDragging = true;
                    startX = e.clientX - translateX;
                    startY = e.clientY - translateY;
                    pressImage.style.cursor = 'grabbing';
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging || CONFIG.zoomScale <= 1) return;
                e.preventDefault();
                
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                
                // Limiter le déplacement pour éviter de sortir de l'image
                const maxX = (pressImage.clientWidth * CONFIG.zoomScale - imageContainer.clientWidth) / 2;
                const maxY = (pressImage.clientHeight * CONFIG.zoomScale - imageContainer.clientHeight) / 2;
                
                translateX = Math.max(-maxX, Math.min(maxX, translateX));
                translateY = Math.max(-maxY, Math.min(maxY, translateY));
                
                pressImage.style.transform = `scale(${CONFIG.zoomScale}) translate(${translateX}px, ${translateY}px)`;
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
                if (CONFIG.zoomScale > 1) {
                    pressImage.style.cursor = 'grab';
                } else {
                    pressImage.style.cursor = 'default';
                }
            });
            
            pressImage.addEventListener('mouseenter', () => {
                if (CONFIG.zoomScale > 1) {
                    pressImage.style.cursor = 'grab';
                }
            });
            
            pressImage.addEventListener('mouseleave', () => {
                if (!isDragging) {
                    pressImage.style.cursor = 'default';
                }
            });
            
            // Reset position when zoom changes
            if (CONFIG.zoomScale === 1) {
                translateX = 0;
                translateY = 0;
                pressImage.style.transform = 'scale(1)';
            }
        }
    } catch (err) {
        console.error('[renderPressCarousel] Erreur:', err);
    }
}


function togglePressZoom(action) {
    const pressImage = document.getElementById('pressImage');
    if (!pressImage) return;
    
    switch(action) {
        case 'in':
            CONFIG.zoomScale = Math.min(CONFIG.zoomScale + 0.2, 3);
            break;
        case 'out':
            CONFIG.zoomScale = Math.max(CONFIG.zoomScale - 0.2, 1);
            break;
        case 'reset':
            CONFIG.zoomScale = 1;
            break;
    }
    
    pressImage.style.transform = `scale(${CONFIG.zoomScale})`;
    document.querySelector('.carousel-zoom-info').textContent = `${Math.round(CONFIG.zoomScale * 100)}%`;
    
    // Reset drag position when zoom changes
    if (action === 'reset') {
        pressImage.style.transform = 'scale(1)';
    }
}

function goToSlide(index) {
    CONFIG.currentIndex = index;
    CONFIG.zoomScale = 1; // Reset zoom when changing slide
    renderPressCarousel();
}

// ==========================================
// CAROUSEL PROMESSES VEDETTE
// ==========================================
let _promisesCurrentSlide = 0;
let _promisesCarouselInterval = null;
let _promisesEventsBound = false;

function renderPromisesCarousel() {
    const carouselGrid = document.getElementById('promisesCarouselGrid');
    const dotsContainer = document.getElementById('carouselDots');
    if (!carouselGrid) return;

    const carouselPromises = (CONFIG.promises && CONFIG.promises.length > 0) 
        ? CONFIG.promises.slice(0, 6) 
        : [];
    
    if (carouselPromises.length === 0) {
        carouselGrid.innerHTML = `
            <div class="loading-state">
                <p><i class="fas fa-tasks"></i> Chargement des engagements...</p>
            </div>
        `;
        return;
    }

    const itemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    const totalSlides = Math.ceil(carouselPromises.length / itemsPerSlide) || 1;
    
    if (_promisesCurrentSlide >= totalSlides) {
        _promisesCurrentSlide = 0;
    }

    const startIdx = _promisesCurrentSlide * itemsPerSlide;
    const visiblePromises = carouselPromises.slice(startIdx, startIdx + itemsPerSlide);
    
    carouselGrid.innerHTML = visiblePromises.map((promise) => {
        const statusClass = getStatusClass(promise);
        const statusIcon = getStatusIcon(promise);
        const daysRemaining = getDaysRemaining(promise.deadline);
        
        return `
            <div class="carousel-promise-card ${statusClass}" onclick="goToPromiseSection('${escapeAttr(promise.id)}')">
                <div class="promise-card-header">
                    <span class="promise-status">${statusIcon} ${promise.isLate ? 'En retard' : escapeHTML(promise.status || 'Non lancé')}</span>
                    <span class="promise-domain">${escapeHTML(promise.domain || 'Non spécifié')}</span>
                </div>
                <h4 class="promise-card-title">${escapeHTML((promise.engagement || '').substring(0, 80))}${(promise.engagement || '').length > 80 ? '...' : ''}</h4>
                <div class="promise-card-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(promise.deadline)}</span>
                    <span><i class="fas fa-clock"></i> ${formatDaysRemaining(daysRemaining)}</span>
                </div>
                ${promise.publicCount > 0 ? `
                    <div class="promise-card-rating">
                        <i class="fas fa-star"></i> ${(promise.publicAvg || 0).toFixed(1)} (${promise.publicCount})
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    if (dotsContainer) {
        dotsContainer.innerHTML = Array.from({length: totalSlides}, (_, i) => 
            `<button class="carousel-dot ${i === _promisesCurrentSlide ? 'active' : ''}" onclick="goToCarouselSlide(${i})" aria-label="Page ${i + 1}"></button>`
        ).join('');
    }
}

function startPromisesCarouselAutoPlay() {
    if (_promisesCarouselInterval) clearInterval(_promisesCarouselInterval);
    _promisesCarouselInterval = setInterval(() => {
        if (CONFIG.carouselAutoPlay) {
            const carouselPromises = (CONFIG.promises && CONFIG.promises.length > 0) ? CONFIG.promises.slice(0, 6) : [];
            const itemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
            const totalSlides = Math.ceil(carouselPromises.length / itemsPerSlide) || 1;
            _promisesCurrentSlide = (_promisesCurrentSlide + 1) % totalSlides;
            renderPromisesCarousel();
        }
    }, 5000);
}

function stopPromisesCarouselAutoPlay() {
    if (_promisesCarouselInterval) {
        clearInterval(_promisesCarouselInterval);
        _promisesCarouselInterval = null;
    }
}

function setupPromisesCarousel() {
    const carouselGrid = document.getElementById('promisesCarouselGrid');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const autoPlayToggle = document.getElementById('carouselAutoPlayToggle');
    
    if (!carouselGrid) return;
    renderPromisesCarousel();
    startPromisesCarouselAutoPlay();

    if (!_promisesEventsBound) {
        _promisesEventsBound = true;

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const carouselPromises = (CONFIG.promises && CONFIG.promises.length > 0) ? CONFIG.promises.slice(0, 6) : [];
                const itemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
                const totalSlides = Math.ceil(carouselPromises.length / itemsPerSlide) || 1;
                _promisesCurrentSlide = (_promisesCurrentSlide - 1 + totalSlides) % totalSlides;
                renderPromisesCarousel();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const carouselPromises = (CONFIG.promises && CONFIG.promises.length > 0) ? CONFIG.promises.slice(0, 6) : [];
                const itemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
                const totalSlides = Math.ceil(carouselPromises.length / itemsPerSlide) || 1;
                _promisesCurrentSlide = (_promisesCurrentSlide + 1) % totalSlides;
                renderPromisesCarousel();
            });
        }
        
        if (autoPlayToggle) {
            autoPlayToggle.addEventListener('click', () => {
                CONFIG.carouselAutoPlay = !CONFIG.carouselAutoPlay;
                autoPlayToggle.innerHTML = CONFIG.carouselAutoPlay ? 
                    '<i class="fas fa-pause"></i> Pause' : 
                    '<i class="fas fa-play"></i> Lecture auto';
                if (CONFIG.carouselAutoPlay) startPromisesCarouselAutoPlay();
                else stopPromisesCarouselAutoPlay();
            });
        }

        const section = carouselGrid.closest('.promises-carousel-section');
        if (section) {
            section.addEventListener('mouseenter', stopPromisesCarouselAutoPlay);
            section.addEventListener('mouseleave', () => {
                if (CONFIG.carouselAutoPlay) startPromisesCarouselAutoPlay();
            });
        }

        window.addEventListener('resize', debounce(() => {
            renderPromisesCarousel();
        }, 150));
    }
}

function goToCarouselSlide(index) {
    _promisesCurrentSlide = index;
    renderPromisesCarousel();
}

function goToPromiseSection(promiseId) {
    const promisesSection = document.getElementById('engagements');
    if (promisesSection) {
        const offset = CONFIG.scrollOffset || 80;
        const targetPosition = promisesSection.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            const card = document.querySelector(`.promise-card[data-id="${promiseId}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                card.style.boxShadow = '0 0 0 3px var(--primary)';
                setTimeout(() => { card.style.boxShadow = ''; }, 3000);
            }
        }, 500);
    }
}

// ==========================================
// CAROUSEL KPI (Desktop Navbar & Mobile Menu)
// ==========================================
let _kpiInterval = null;
let _kpiEventsBound = false;

function renderKpiItem() {
    const currentItem = (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS[CONFIG.kpiCarouselIndex]) 
        ? KPI_ITEMS[CONFIG.kpiCarouselIndex] 
        : (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS[0] ? KPI_ITEMS[0] : { label: 'Engagements', value: '300', icon: '📊' });
    
    if (!currentItem) return;

    const kpiCarousel = document.getElementById('kpiCarousel');
    if (kpiCarousel) {
        kpiCarousel.innerHTML = `
            <div class="kpi-item" style="display:flex;align-items:center;gap:0.4rem;">
                <span class="kpi-icon" style="font-size:0.95rem;">${currentItem.icon}</span>
                <div class="kpi-content" style="display:flex;flex-direction:column;line-height:1.1;">
                    <span class="kpi-value" style="font-weight:800;color:#2D5F3F;font-size:0.95rem;">${currentItem.value}</span>
                    <span class="kpi-label" style="font-size:0.68rem;color:#5A6D63;font-weight:700;letter-spacing:0.02em;">${currentItem.label}</span>
                </div>
            </div>
        `;
    }

    const menuKpiDisplay = document.getElementById('menuKpiDisplay');
    if (menuKpiDisplay) {
        menuKpiDisplay.innerHTML = `
            <div class="kpi-item">
                <div class="kpi-content">
                    <span class="kpi-value" style="font-size:1.8rem;font-weight:800;color:#2D5F3F">${currentItem.value}</span>
                    <span class="kpi-label" style="font-size:.72rem;color:#8a9e93;text-transform:uppercase;letter-spacing:.06em;font-weight:600">${currentItem.icon} ${currentItem.label}</span>
                </div>
            </div>
        `;
    }
}

function startKpiAutoPlay() {
    if (_kpiInterval) clearInterval(_kpiInterval);
    _kpiInterval = setInterval(() => {
        if (CONFIG.kpiAutoPlay && typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS.length > 0) {
            CONFIG.kpiCarouselIndex = (CONFIG.kpiCarouselIndex + 1) % KPI_ITEMS.length;
            renderKpiItem();
        }
    }, 3000);
}

function stopKpiAutoPlay() {
    if (_kpiInterval) {
        clearInterval(_kpiInterval);
        _kpiInterval = null;
    }
}

function setupKpiCarousel() {
    renderKpiItem();
    startKpiAutoPlay();

    if (!_kpiEventsBound) {
        _kpiEventsBound = true;
        const kpiPrev = document.getElementById('kpiPrev');
        const kpiNext = document.getElementById('kpiNext');
        const kpiAutoPlayToggle = document.getElementById('kpiAutoPlayToggle');
        
        if (kpiPrev) {
            kpiPrev.addEventListener('click', () => {
                if (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS.length > 0) {
                    CONFIG.kpiCarouselIndex = (CONFIG.kpiCarouselIndex - 1 + KPI_ITEMS.length) % KPI_ITEMS.length;
                    renderKpiItem();
                }
            });
        }
        
        if (kpiNext) {
            kpiNext.addEventListener('click', () => {
                if (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS.length > 0) {
                    CONFIG.kpiCarouselIndex = (CONFIG.kpiCarouselIndex + 1) % KPI_ITEMS.length;
                    renderKpiItem();
                }
            });
        }
        
        if (kpiAutoPlayToggle) {
            kpiAutoPlayToggle.addEventListener('click', () => {
                CONFIG.kpiAutoPlay = !CONFIG.kpiAutoPlay;
                kpiAutoPlayToggle.innerHTML = CONFIG.kpiAutoPlay ? 
                    '<i class="fas fa-pause"></i>' : 
                    '<i class="fas fa-play"></i>';
                if (CONFIG.kpiAutoPlay) startKpiAutoPlay();
                else stopKpiAutoPlay();
            });
        }
    }
}

function updateKpiCarousel() {
    renderKpiItem();
}

// Fonctions globales pour les boutons onclick dans index.html
window.kpiNextSlide = function() {
    if (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS.length > 0) {
        CONFIG.kpiCarouselIndex = (CONFIG.kpiCarouselIndex + 1) % KPI_ITEMS.length;
        renderKpiItem();
    }
};

window.kpiPrevSlide = function() {
    if (typeof KPI_ITEMS !== 'undefined' && KPI_ITEMS.length > 0) {
        CONFIG.kpiCarouselIndex = (CONFIG.kpiCarouselIndex - 1 + KPI_ITEMS.length) % KPI_ITEMS.length;
        renderKpiItem();
    }
};

// ==========================================
// INITIALISATION DES ÉTOILES DE NOTATION DES SERVICES
// ==========================================
function initStarRatings() {
    
    // Fonction pour mettre à jour l'affichage des étoiles
    function updateStars(container, rating) {
        const stars = container.querySelectorAll('i.far, i.fas');
        stars.forEach((star, index) => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'star-active');
            } else {
                star.classList.remove('fas', 'star-active');
                star.classList.add('far');
            }
        });
    }
    
    // Initialiser chaque ensemble d'étoiles
    document.querySelectorAll('.stars-rating').forEach(container => {
        const criteria = container.getAttribute('data-criteria');
        const input = container.querySelector(`input[name="${criteria}"]`);
        
        if (!input) return;
        
        const stars = container.querySelectorAll('i[data-value]');
        
        // Valeur par défaut
        const defaultValue = parseInt(input.value) || 3;
        updateStars(container, defaultValue);
        
        // Gestion des clics
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                input.value = value;
                updateStars(container, value);
            });
            
            // Effet hover
            star.addEventListener('mouseenter', () => {
                const hoverValue = parseInt(star.getAttribute('data-value'));
                updateStars(container, hoverValue);
            });
            
            star.addEventListener('mouseleave', () => {
                const currentValue = parseInt(input.value) || 3;
                updateStars(container, currentValue);
            });
        });
    });
}

// ==========================================
// NOTATION DES SERVICES PUBLICS - CORRIGÉ
// ==========================================
function setupServiceRatings() {
    const form = document.getElementById('ratingForm');
    
    if (!form) {
        console.error();
        return;
    }
    
    
    // Initialiser les étoiles
    initStarRatings();
    
    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const service = document.getElementById('service').value;
        const accessibility = document.getElementById('accessibility').value;
        const welcome = document.getElementById('welcome').value;
        const efficiency = document.getElementById('efficiency').value;
        const transparency = document.getElementById('transparency').value;
        const comment = document.getElementById('comment').value.trim();
        
        // Validation
        if (!service) {
            showNotification('Veuillez sélectionner un service', 'error');
            return;
        }
        
        // Préparer les données
        const ratingData = {
            service: service,
            accessibility: parseInt(accessibility) || 0,
            welcome: parseInt(welcome) || 0,
            efficiency: parseInt(efficiency) || 0,
            transparency: parseInt(transparency) || 0,
            comment: comment,
            date: new Date().toISOString()
        };
        
        
        // Sauvegarder localement
        saveRatingLocally(ratingData);
        
        // Essayer d'envoyer à Supabase
        const success = await saveRatingToSupabase(ratingData);
        
        if (success) {
            showNotification('Merci pour votre notation !', 'success');
            form.reset();
            resetStars();
            setTimeout(() => fetchAndDisplayServiceRatings(), 1000);
        } else {
            showNotification('Notation enregistrée en local', 'info');
        }
    });
    
    // Charger les notations existantes
    fetchAndDisplayServiceRatings();
}

// ==========================================
// FONCTIONS AUXILIAIRES POUR LES NOTATIONS DES SERVICES
// ==========================================
function resetStars() {
    document.querySelectorAll('.stars-rating').forEach(container => {
        const criteria = container.getAttribute('data-criteria');
        const input = container.querySelector(`input[name="${criteria}"]`);
        if (input) {
            input.value = '3';
        }
        
        const stars = container.querySelectorAll('i[data-value]');
        stars.forEach((star, index) => {
            if (index < 3) {
                star.classList.remove('far');
                star.classList.add('fas', 'star-active');
            } else {
                star.classList.remove('fas', 'star-active');
                star.classList.add('far');
            }
        });
    });
}

function saveRatingLocally(ratingData) {
    const ratings = JSON.parse(localStorage.getItem('service_ratings') || '[]');
    ratings.push({
        id: Date.now().toString(),
        service: ratingData.service,
        accessibility: ratingData.accessibility,
        welcome: ratingData.welcome,
        efficiency: ratingData.efficiency,
        transparency: ratingData.transparency,
        comment: ratingData.comment,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('service_ratings', JSON.stringify(ratings));
}

async function saveRatingToSupabase(ratingData) {
    if (!supabaseClient) {
        return false;
    }
    
    try {
        
        // Structure des données POUR VOTRE TABLE
        const supabaseData = {
            service: ratingData.service,
            accessibility: ratingData.accessibility,
            welcome: ratingData.welcome,
            efficiency: ratingData.efficiency,
            transparency: ratingData.transparency,
            comment: ratingData.comment || null,
            user_ip: await getIPAddress(),
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
        };
        
        
        const { data, error } = await supabaseClient
            .from('service_ratings')
            .insert([supabaseData]);
        
        if (error) {
            console.error(error);
            return false;
        }
        
        
        // Mettre à jour les statistiques
        await updateServiceStats(ratingData.service);
        
        return true;
        
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// Fonction pour mettre à jour les statistiques du service
async function updateServiceStats(serviceName) {
    if (!supabaseClient) return;
    
    try {
        // Calculer les nouvelles moyennes
        const { data: ratings, error } = await supabaseClient
            .from('service_ratings')
            .select('accessibility, welcome, efficiency, transparency')
            .eq('service', serviceName);
        
        if (error) throw error;
        
        if (ratings.length > 0) {
            const total = ratings.length;
            
            const sums = ratings.reduce((acc, rating) => ({
                accessibility: acc.accessibility + (rating.accessibility || 0),
                welcome: acc.welcome + (rating.welcome || 0),
                efficiency: acc.efficiency + (rating.efficiency || 0),
                transparency: acc.transparency + (rating.transparency || 0)
            }), { accessibility: 0, welcome: 0, efficiency: 0, transparency: 0 });
            
            const stats = {
                service: serviceName,
                total_ratings: total,
                avg_accessibility: (sums.accessibility / total).toFixed(2),
                avg_welcome: (sums.welcome / total).toFixed(2),
                avg_efficiency: (sums.efficiency / total).toFixed(2),
                avg_transparency: (sums.transparency / total).toFixed(2),
                overall_rating: ((sums.accessibility + sums.welcome + sums.efficiency + sums.transparency) / (total * 4)).toFixed(2),
                last_updated: new Date().toISOString()
            };
            
            // Insérer ou mettre à jour dans service_stats
            const { error: statsError } = await supabaseClient
                .from('service_stats')
                .upsert(stats, { onConflict: 'service' });
            
            if (statsError) {
                console.error(statsError);
            } else {
            }
        }
        
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// AFFICHAGE DES RÉSULTATS DE NOTATION DES SERVICES
// ==========================================
async function fetchAndDisplayServiceRatings() {
    
    // D'abord, récupérer les notations locales
    const localRatings = JSON.parse(localStorage.getItem('service_ratings') || '[]');
    
    // Si Supabase est disponible
    if (supabaseClient) {
        try {
            // Récupérer les notations
            const { data: supabaseRatings, error } = await supabaseClient
                .from('service_ratings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error && supabaseRatings) {
                // Récupérer les statistiques
                const { data: stats, error: statsError } = await supabaseClient
                    .from('service_stats')
                    .select('*')
                    .order('overall_rating', { ascending: false });
                
                // Afficher les résultats
                displayRatingResults(supabaseRatings, stats);
                return;
            }
        } catch (error) {
        }
    }
    
    // Mode démo ou fallback
    if (localRatings.length > 0) {
        displayRatingResults(localRatings);
    } else {
        displayDemoRatingResults();
    }
}

function displayRatingResults(ratings, stats = null) {
    if (!ratings || ratings.length === 0) {
        displayEmptyRatingResults();
        return;
    }

    // Si on a des stats pré-calculées, les utiliser
    if (stats && stats.length > 0) {
        // Statistiques Globales
        const totalVotesEl = document.getElementById('totalVotes');
        const totalServicesEl = document.getElementById('totalServices');
        const avgRatingEl = document.getElementById('avgRating');
        
        const totalVotesFromStats = stats.reduce((sum, stat) => sum + (stat.total_ratings || 0), 0);
        const overallAvg = stats.length > 0 
            ? (stats.reduce((sum, stat) => sum + parseFloat(stat.overall_rating || 0), 0) / stats.length).toFixed(1)
            : '0.0';
        
        if (totalVotesEl) totalVotesEl.textContent = totalVotesFromStats;
        if (totalServicesEl) totalServicesEl.textContent = stats.length;
        if (avgRatingEl) avgRatingEl.textContent = overallAvg;
        
        // Afficher les meilleurs services depuis les stats
        const topServicesEl = document.getElementById('topServices');
        if (topServicesEl) {
            topServicesEl.innerHTML = stats.slice(0, 3).map((service, index) => {
                const badges = ['gold', 'silver', 'bronze'];
                return `
                    <div class="service-item-card ${badges[index]}">
                        <div class="service-rank-badge ${badges[index]}">${index + 1}</div>
                        <div class="service-info-card">
                            <div class="service-name-card">${escapeHTML(service.service)}</div>
                            <div class="service-stats-card">
                                <span class="service-score-card">
                                    <i class="fas fa-star"></i> ${parseFloat(service.overall_rating).toFixed(1)}/5
                                </span>
                                <span class="service-count-card">${parseInt(service.total_ratings) || 0} votes</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else {
        // Calcul manuel des statistiques
        const totalVotes = ratings.length;
        const uniqueServices = [...new Set(ratings.map(item => item.service))];
        const avgRating = (ratings.reduce((sum, item) => {
            const accessibility = parseInt(item.accessibility) || 0;
            const welcome = parseInt(item.welcome) || 0;
            const efficiency = parseInt(item.efficiency) || 0;
            const transparency = parseInt(item.transparency) || 0;
            const avg = (accessibility + welcome + efficiency + transparency) / 4;
            return sum + avg;
        }, 0) / totalVotes).toFixed(1);

        // Mettre à jour les statistiques globales
        const totalVotesEl = document.getElementById('totalVotes');
        const totalServicesEl = document.getElementById('totalServices');
        const avgRatingEl = document.getElementById('avgRating');
        
        if (totalVotesEl) totalVotesEl.textContent = totalVotes;
        if (totalServicesEl) totalServicesEl.textContent = uniqueServices.length;
        if (avgRatingEl) avgRatingEl.textContent = avgRating;

        // Calculer les meilleurs services manuellement
        const serviceStats = {};
        ratings.forEach(item => {
            if (!serviceStats[item.service]) {
                serviceStats[item.service] = { sum: 0, count: 0, comments: 0 };
            }
            const rating = calculateAverageRating(item);
            serviceStats[item.service].sum += rating;
            serviceStats[item.service].count += 1;
            if (item.comment && item.comment.trim() !== '') {
                serviceStats[item.service].comments += 1;
            }
        });

        const topServices = Object.entries(serviceStats)
            .map(([service, stats]) => ({
                service,
                avg: stats.sum / stats.count,
                count: stats.count,
                comments: stats.comments
            }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 3);

        const topServicesEl = document.getElementById('topServices');
        if (topServicesEl) {
            topServicesEl.innerHTML = topServices.map((service, index) => {
                const badges = ['gold', 'silver', 'bronze'];
                return `
                    <div class="service-item-card ${badges[index]}">
                        <div class="service-rank-badge ${badges[index]}">${index + 1}</div>
                        <div class="service-info-card">
                            <div class="service-name-card">${escapeHTML(service.service)}</div>
                            <div class="service-stats-card">
                                <span class="service-score-card">
                                    <i class="fas fa-star"></i> ${service.avg.toFixed(1)}/5
                                </span>
                                <span class="service-count-card">${parseInt(service.count) || 0} votes</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Afficher les dernières notations
    const recentRatings = document.getElementById('recentRatings');
    if (recentRatings) {
        recentRatings.innerHTML = ratings.slice(0, 3).map(item => `
            <div class="recent-item">
                <div class="recent-header">
                    <span class="recent-service">${escapeHTML(item.service)}</span>
                    <span class="recent-date">${formatDate(new Date(item.created_at || item.date))}</span>
                </div>
                <div class="recent-score">
                    <i class="fas fa-star"></i> 
                    ${calculateAverageRating(item).toFixed(1)}/5
                </div>
                ${item.comment ? `
                    <div class="recent-comment">"${escapeAndTruncate(item.comment, 80)}"</div>
                ` : ''}
            </div>
        `).join('');
    }
}

function calculateAverageRating(item) {
    const accessibility = parseInt(item.accessibility) || 0;
    const welcome = parseInt(item.welcome) || 0;
    const efficiency = parseInt(item.efficiency) || 0;
    const transparency = parseInt(item.transparency) || 0;
    return (accessibility + welcome + efficiency + transparency) / 4;
}

function displayEmptyRatingResults() {
    const recentRatings = document.getElementById('recentRatings');
    const topServices = document.getElementById('topServices');
    
    if (recentRatings) {
        recentRatings.innerHTML = `
            <div class="rating-placeholder">
                <p>Aucune notation récente</p>
            </div>
        `;
    }
    
    if (topServices) {
        topServices.innerHTML = `
            <div class="rating-placeholder">
                <p>Pas encore de services notés</p>
            </div>
        `;
    }
}

function displayDemoRatingResults() {
    // Statistiques Globales
    const totalVotesEl = document.getElementById('totalVotes');
    const totalServicesEl = document.getElementById('totalServices');
    const avgRatingEl = document.getElementById('avgRating');
    
    if (totalVotesEl) totalVotesEl.textContent = '310';
    if (totalServicesEl) totalServicesEl.textContent = '8';
    if (avgRatingEl) avgRatingEl.textContent = '4.3';

    // Dernières Notations
    const recentRatings = document.getElementById('recentRatings');
    if (recentRatings) {
        recentRatings.innerHTML = `
            <div class="recent-item">
                <div class="recent-header">
                    <span class="recent-service">Santé Publique</span>
                    <span class="recent-date">28/01/2026</span>
                </div>
                <div class="recent-score"><i class="fas fa-star"></i> 5.0/5</div>
                <div class="recent-comment">Très bon accueil et délais réduits</div>
            </div>
            <div class="recent-item">
                <div class="recent-header">
                    <span class="recent-service">Éducation Nationale</span>
                    <span class="recent-date">27/01/2026</span>
                </div>
                <div class="recent-score"><i class="fas fa-star"></i> 4.0/5</div>
                <div class="recent-comment">Amélioration notable des infrastructures</div>
            </div>
            <div class="recent-item">
                <div class="recent-header">
                    <span class="recent-service">Transports</span>
                    <span class="recent-date">26/01/2026</span>
                </div>
                <div class="recent-score"><i class="fas fa-star"></i> 3.5/5</div>
                <div class="recent-comment">Ponctualité à améliorer</div>
            </div>
        `;
    }

    // Meilleurs Services
    const topServices = document.getElementById('topServices');
    if (topServices) {
        topServices.innerHTML = `
            <div class="service-item-card gold">
                <div class="service-rank-badge gold">1</div>
                <div class="service-info-card">
                    <div class="service-name-card">Santé Publique</div>
                    <div class="service-stats-card">
                        <span class="service-score-card"><i class="fas fa-star"></i> 4.7/5</span>
                        <span class="service-count-card">128 votes</span>
                    </div>
                </div>
            </div>
            <div class="service-item-card silver">
                <div class="service-rank-badge silver">2</div>
                <div class="service-info-card">
                    <div class="service-name-card">Éducation Nationale</div>
                    <div class="service-stats-card">
                        <span class="service-score-card"><i class="fas fa-star"></i> 4.3/5</span>
                        <span class="service-count-card">95 votes</span>
                    </div>
                </div>
            </div>
            <div class="service-item-card bronze">
                <div class="service-rank-badge bronze">3</div>
                <div class="service-info-card">
                    <div class="service-name-card">Transports</div>
                    <div class="service-stats-card">
                        <span class="service-score-card"><i class="fas fa-star"></i> 3.9/5</span>
                        <span class="service-count-card">87 votes</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// ==========================================
// VOTES PUBLICS POUR LES PROMESSES
// ==========================================
async function fetchAndDisplayPublicVotes() {
    
    // D'abord, récupérer les votes locaux
    const localVotes = JSON.parse(localStorage.getItem('promise_votes') || '[]');
    
    // Si Supabase est disponible, essayer de récupérer les votes en ligne
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('votes')
                .select('promise_id, rating, comment, created_at');
            
            if (!error && data) {
                // Fusionner votes locaux et en ligne
                const allVotes = [...localVotes, ...data];
                processVotes(allVotes);
                return;
            }
        } catch (error) {
        }
    }
    
    // Utiliser uniquement les votes locaux
    processVotes(localVotes);
}

function processVotes(votes) {
    const votesMap = {};
    votes.forEach(vote => {
        if (!votesMap[vote.promise_id]) {
            votesMap[vote.promise_id] = { sum: 0, count: 0 };
        }
        votesMap[vote.promise_id].sum += vote.rating;
        votesMap[vote.promise_id].count += 1;
    });
    
    CONFIG.promises.forEach(promise => {
        if (votesMap[promise.id]) {
            promise.publicAvg = votesMap[promise.id].sum / votesMap[promise.id].count;
            promise.publicCount = votesMap[promise.id].count;
        }
    });
    
    renderPromises(CONFIG.promises.slice(0, CONFIG.currentVisible));
    updateStats();
}

// ==========================================
// FONCTIONS POUR LA VISUALISATION PHOTO
// ==========================================
function initPhotoViewer() {
    // Cette fonction est appelée au chargement
}

function setupPhotoViewerControls() {
    
    // Créer le modal si nécessaire
    if (!document.getElementById('photoViewerModal')) {
        const modal = document.createElement('div');
        modal.id = 'photoViewerModal';
        modal.className = 'photo-viewer-modal';
        modal.innerHTML = `
            <div class="photo-viewer-content">
                <div class="photo-viewer-header">
                    <div class="pv-header-left">
                        <i class="fas fa-newspaper"></i>
                        <span class="pv-title">Revue de Presse</span>
                        <span class="pv-counter" id="pvCounter">1 / 19</span>
                    </div>
                    <div class="photo-viewer-controls">
                        <button onclick="zoomOut()" title="Zoom -"><i class="fas fa-search-minus"></i></button>
                        <button onclick="zoomReset()" title="Réinitialiser le zoom"><i class="fas fa-expand"></i></button>
                        <button onclick="zoomIn()" title="Zoom +"><i class="fas fa-search-plus"></i></button>
                    </div>
                    <button id="closeViewerBtn" onclick="closePhotoViewer()" title="Fermer">&times;</button>
                </div>
                <div class="photo-viewer-body">
                    <button class="nav-btn prev" onclick="prevPhoto()" aria-label="Photo précédente">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="photo-container">
                        <img id="photoViewerImage" src="" alt="">
                        <div class="pv-paper-badge" id="pvPaperBadge"></div>
                    </div>
                    <button class="nav-btn next" onclick="nextPhoto()" aria-label="Photo suivante">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="photo-viewer-footer">
                    <div class="pv-footer-info">
                        <span id="photoViewerInfo"></span>
                    </div>
                    <div class="pv-thumbnails" id="pvThumbnails"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Fermer en cliquant sur le fond
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closePhotoViewer();
        });

        // Navigation clavier
        document.addEventListener('keydown', function(e) {
            if (modal.style.display !== 'flex') return;
            if (e.key === 'ArrowLeft') prevPhoto();
            else if (e.key === 'ArrowRight') nextPhoto();
            else if (e.key === 'Escape') closePhotoViewer();
            else if (e.key === '+' || e.key === '=') zoomIn();
            else if (e.key === '-') zoomOut();
            else if (e.key === '0') zoomReset();
        });

        // Swipe tactile
        let touchStartX = 0, touchStartY = 0;
        const body = modal.querySelector('.photo-viewer-body');
        body.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        body.addEventListener('touchend', function(e) {
            const dx = e.changedTouches[0].screenX - touchStartX;
            const dy = e.changedTouches[0].screenY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                if (dx > 0) prevPhoto(); else nextPhoto();
            }
        }, { passive: true });
    }
}

function openPhotoViewer(pressId) {
    
    const index = CONFIG.press.findIndex(p => p.id === pressId);
    if (index === -1) return;
    
    currentPhotoIndex = index;
    currentZoom = 1;
    
    const modal = document.getElementById('photoViewerModal');
    
    // Construire les miniatures
    buildThumbnails();
    
    // Mettre à jour l'image
    updateViewerPhoto();
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Setup drag pour le zoom
    const image = document.getElementById('photoViewerImage');
    if (image) setupImageDrag(image);
}

function closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    if (modal) {
        modal.classList.add('pv-closing');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('pv-closing');
            document.body.style.overflow = 'auto';
        }, 250);
    }
}

function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.25, 3);
    updateZoom();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.25, 1);
    updateZoom();
}

function zoomReset() {
    currentZoom = 1;
    updateZoom();
}

function updateZoom() {
    const image = document.getElementById('photoViewerImage');
    if (image) {
        image.style.transform = `scale(${currentZoom})`;
        image.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    }
}

function prevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + CONFIG.press.length) % CONFIG.press.length;
    currentZoom = 1;
    updateViewerPhoto();
}

function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % CONFIG.press.length;
    currentZoom = 1;
    updateViewerPhoto();
}

function buildThumbnails() {
    const container = document.getElementById('pvThumbnails');
    if (!container || !CONFIG.press) return;
    
    container.innerHTML = CONFIG.press.map((paper, i) => {
        let thumbUrl = paper.image;
        return `<div class="pv-thumb ${i === currentPhotoIndex ? 'active' : ''}" 
                     onclick="goToViewerPhoto(${i})">
                    <img src="${thumbUrl}" alt="Page ${i + 1}" loading="lazy">
                </div>`;
    }).join('');
}

function goToViewerPhoto(index) {
    currentPhotoIndex = index;
    currentZoom = 1;
    updateViewerPhoto();
}

function updateViewerPhoto() {
    const image = document.getElementById('photoViewerImage');
    const info = document.getElementById('photoViewerInfo');
    const counter = document.getElementById('pvCounter');
    const badge = document.getElementById('pvPaperBadge');
    
    if (!CONFIG.press || !CONFIG.press[currentPhotoIndex]) return;
    const paper = CONFIG.press[currentPhotoIndex];
    
    let imageUrl = paper.image;
    if (imageUrl.includes('picsum.photos')) {
        imageUrl = imageUrl.replace('/400/533', '/600/800');
    }
    
    // Transition d'image fluide
    if (image) {
        image.classList.add('pv-img-transition');
        setTimeout(() => {
            image.src = imageUrl;
            image.alt = `Quotidien ${currentPhotoIndex + 1}`;
            image.style.transform = `scale(${currentZoom})`;
            image.classList.remove('pv-img-transition');
        }, 150);
    }
    
    const displayDate = paper.date && paper.date !== 'undefined' ? paper.date : '';
    if (info) info.textContent = displayDate ? `Revue de presse du ${displayDate}` : '';
    if (counter) counter.textContent = `${currentPhotoIndex + 1} / ${CONFIG.press.length}`;
    if (badge) badge.style.display = 'none';
    
    // Mettre à jour la miniature active
    const thumbs = document.querySelectorAll('.pv-thumb');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentPhotoIndex));
    
    // Scroll la miniature active en vue
    const activeThumb = document.querySelector('.pv-thumb.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function setupImageDrag(image) {
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    image.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            image.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || currentZoom <= 1) return;
        e.preventDefault();
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        // Limiter le déplacement
        const maxX = (image.clientWidth * currentZoom - image.parentElement.clientWidth) / 2;
        const maxY = (image.clientHeight * currentZoom - image.parentElement.clientHeight) / 2;
        
        translateX = Math.max(-maxX, Math.min(maxX, translateX));
        translateY = Math.max(-maxY, Math.min(maxY, translateY));
        
        image.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (currentZoom > 1) {
            image.style.cursor = 'grab';
        }
    });
}

// ==========================================
// FORCER LA VISIBILITÉ DES BOUTONS
// ==========================================
function forceButtonVisibility() {
    
    // Attendre que le DOM soit complètement chargé
    setTimeout(() => {
        const shareButtons = document.querySelectorAll('.promise-actions .social-btn');
        const starButtons = document.querySelectorAll('.promise-actions .btn-stars');
        
        
        // Appliquer des styles inline (priorité maximale)
        shareButtons.forEach(btn => {
            btn.style.cssText = `
                background: #00695f !important;
                color: white !important;
                border: 2px solid white !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
            
            // Classes spécifiques
            if (btn.classList.contains('fb')) {
                btn.style.background = '#3b5998 !important';
            }
            if (btn.classList.contains('tw')) {
                btn.style.background = '#1da1f2 !important';
            }
            if (btn.classList.contains('wa')) {
                btn.style.background = '#25d366 !important';
            }
        });
        
        starButtons.forEach(btn => {
            btn.style.cssText = `
                background: linear-gradient(135deg, #f57c00, #ff6f3c) !important;
                color: white !important;
                border: 2px solid #f57c00 !important;
                font-weight: bold !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                box-shadow: 0 2px 8px rgba(245,124,0,0.4) !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        });
        
        // Améliorer toute la section actions
        const actionSections = document.querySelectorAll('.promise-actions');
        actionSections.forEach(section => {
            section.style.cssText = `
                background: rgba(0,105,95,0.05) !important;
                border: 2px solid #e0e0e0 !important;
                border-radius: 8px !important;
                padding: 12px !important;
                margin-top: 16px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        });
        
    }, 500); // Attendre un peu que tout soit chargé
}

// ==========================================
// ACTIONS
// ==========================================
function toggleUpdates(promiseId) {
    const updatesList = document.getElementById(`updates-${promiseId}`);
    if (updatesList) {
        updatesList.style.display = updatesList.style.display === 'none' ? 'block' : 'none';
    }
}

function sharePromise(promiseId) {
    const promise = CONFIG.promises.find(p => p.id === promiseId);
    if (!promise) return;
    
    const text = `📊 "${promise.engagement.substring(0, 100)}..." - Suivi des engagements du Projet PASTEF`;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({ title: 'Engagement du Projet PASTEF', text: text, url: url })
    } else {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
    }
}

function shareToPlatform(promiseId, platform) {
    const promise = CONFIG.promises.find(p => p.id === promiseId);
    if (!promise) return;
    
    const statusEmoji = {'Réalisé': '✅', 'En cours': '🔄', 'Non lancé': '⏳', 'En retard': '⚠️'};
    const emoji = statusEmoji[promise.status] || '📊';
    
    const engagement = promise.engagement || '';
    const domaine = promise.domain || promise.domaine || 'Non spécifié';
    const status = promise.status || 'Non défini';
    const deadline = promise.deadline || '';
    const resultat = promise.resultat || '';
    const priorite = promise.priorite || '';
    const responsable = promise.responsable || '';
    const budget = promise.budget || '';
    const indicateurs = promise.indicateurs || '';
    
    // Calcul jours restants ou retard
    let joursInfo = '';
    let joursInfoShort = '';
    if (deadline) {
        const d = new Date(deadline);
        const today = new Date();
        const diff = Math.ceil((d - today) / 86400000);
        
        if (diff > 0) {
            joursInfo = `⏰ ${diff} jour${diff > 1 ? 's' : ''} restant${diff > 1 ? 's' : ''}`;
            joursInfoShort = `⏰ ${diff}j restants`;
        } else if (diff < 0) {
            const retard = Math.abs(diff);
            joursInfo = `🚨 EN RETARD de ${retard} jour${retard > 1 ? 's' : ''}`;
            joursInfoShort = `🚨 Retard: ${retard}j`;
        } else {
            joursInfo = `📅 Échéance AUJOURD'HUI`;
            joursInfoShort = `📅 Aujourd'hui`;
        }
    }
    
    // Date de deadline formatée
    let deadlineFormatted = '';
    if (deadline) {
        const d = new Date(deadline);
        deadlineFormatted = d.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Dernière mise à jour
    let derniereUpdate = '';
    if (promise.updates && promise.updates.length > 0) {
        const lastUpdate = promise.updates[promise.updates.length - 1];
        derniereUpdate = lastUpdate.description || 'Mise à jour récente';
    }
    
    const url = window.location.href;
    
    // TEXTE OPTIMISÉ POUR FACEBOOK - VERSION COMPLÈTE
    const facebookText = `🎯 ENGAGEMENT PRÉSIDENTIEL - LE PROJET

━━━━━━━━━━━━━━━━━━━━━━
📋 PROMESSE
━━━━━━━━━━━━━━━━━━━━━━
${engagement}

━━━━━━━━━━━━━━━━━━━━━━
📊 INFORMATIONS CLÉS
━━━━━━━━━━━━━━━━━━━━━━
📍 Domaine: ${domaine}
🔖 Statut: ${emoji} ${status.toUpperCase()}
${priorite ? `🔥 Priorité: ${priorite}` : ''}
${responsable ? `👤 Responsable: ${responsable}` : ''}
${budget ? `💰 Budget: ${budget}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
📅 DÉLAI & ÉCHÉANCE
━━━━━━━━━━━━━━━━━━━━━━
${deadline ? `📆 Date limite: ${deadlineFormatted}` : '⚠️ Pas de délai défini'}
${joursInfo}

${resultat ? `━━━━━━━━━━━━━━━━━━━━━━
📝 RÉSULTAT ATTENDU
━━━━━━━━━━━━━━━━━━━━━━
${resultat.substring(0, 250)}${resultat.length > 250 ? '...' : ''}

` : ''}${indicateurs ? `━━━━━━━━━━━━━━━━━━━━━━
📈 INDICATEURS DE SUCCÈS
━━━━━━━━━━━━━━━━━━━━━━
${indicateurs.substring(0, 200)}${indicateurs.length > 200 ? '...' : ''}

` : ''}${derniereUpdate ? `━━━━━━━━━━━━━━━━━━━━━━
🔄 DERNIÈRE MISE À JOUR
━━━━━━━━━━━━━━━━━━━━━━
${derniereUpdate.substring(0, 180)}${derniereUpdate.length > 180 ? '...' : ''}

` : ''}━━━━━━━━━━━━━━━━━━━━━━
📊 SUIVI EN TEMPS RÉEL
━━━━━━━━━━━━━━━━━━━━━━
Suivez tous les engagements présidentiels sur:
${url}

#Pastef #Sonko #Transparence #Redevabilité #Gouvernance
#${domaine.replace(/\s+/g, '')} #${status.replace(/\s+/g, '')}`;
    
    let shareText = '';
    
    if (platform === 'facebook') {
        shareText = facebookText;
    } else if (platform === 'twitter') {
        // Twitter - Version condensée
        const short = engagement.substring(0, 100);
        shareText = `🎯 ENGAGEMENT: ${short}${engagement.length > 100 ? '...' : ''}

📍 ${domaine}
🔖 ${emoji} ${status}
${deadline ? `📅 ${deadlineFormatted}` : ''}
${joursInfoShort}

📊 Suivi en temps réel: ${url}

#Pastef#Sonko #Transparence`;
    } else if (platform === 'whatsapp') {
        // WhatsApp - Format avec emphase
        shareText = `🎯 *ENGAGEMENT PRÉSIDENTIEL*
_LE PROJET - Transparence & Redevabilité_

━━━━━━━━━━━━━━━━━━
📋 *PROMESSE*
━━━━━━━━━━━━━━━━━━
${engagement}

━━━━━━━━━━━━━━━━━━
📊 *INFORMATIONS*
━━━━━━━━━━━━━━━━━━
📍 *Domaine:* ${domaine}
🔖 *Statut:* ${emoji} *${status.toUpperCase()}*
${priorite ? `🔥 *Priorité:* ${priorite}` : ''}
${responsable ? `👤 *Responsable:* ${responsable}` : ''}
${budget ? `💰 *Budget:* ${budget}` : ''}

━━━━━━━━━━━━━━━━━━
📅 *DÉLAI & ÉCHÉANCE*
━━━━━━━━━━━━━━━━━━
${deadline ? `📆 *Date limite:* ${deadlineFormatted}` : '⚠️ Pas de délai défini'}
${joursInfo}

${resultat ? `━━━━━━━━━━━━━━━━━━
📝 *RÉSULTAT ATTENDU*
━━━━━━━━━━━━━━━━━━
${resultat.substring(0, 200)}${resultat.length > 200 ? '...' : ''}

` : ''}${derniereUpdate ? `━━━━━━━━━━━━━━━━━━
🔄 *DERNIÈRE MISE À JOUR*
━━━━━━━━━━━━━━━━━━
${derniereUpdate.substring(0, 150)}${derniereUpdate.length > 150 ? '...' : ''}

` : ''}━━━━━━━━━━━━━━━━━━
📊 *SUIVI COMPLET SUR:*
${url}

_#Pastef#Sonko #Transparence_`;
    }
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            // Pour Facebook: copier le texte complet + ouvrir la fenêtre de partage
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(() => {
                    // Notification très explicite
                    showNotification('📋 TEXTE COPIÉ ! 👉 Dans Facebook qui va s\'ouvrir, COLLEZ (Ctrl+V ou Cmd+V) le texte dans votre publication', 'info');
                    
                    // Deuxième notification après 3 secondes
                    setTimeout(() => {
                        showNotification('💡 RAPPEL: Faites Ctrl+V (ou Cmd+V sur Mac) pour coller le texte complet dans Facebook', 'info');
                    }, 3000);
                    
                    // Ouvrir Facebook après 4 secondes (laisser temps de lire)
                    setTimeout(() => {
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
                        window.open(shareUrl, '_blank', 'width=600,height=600');
                    }, 4000);
                }).catch(() => {
                    // Fallback si clipboard API échoue
                    const textArea = document.createElement('textarea');
                    textArea.value = shareText;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        showNotification('📋 Texte copié ! COLLEZ-LE (Ctrl+V) dans Facebook qui va s\'ouvrir', 'info');
                        setTimeout(() => {
                            showNotification('💡 N\'oubliez pas: Ctrl+V pour coller !', 'info');
                        }, 2000);
                    } catch (err) {
                        // Dernier fallback: afficher dans une alert
                        alert('📋 IMPORTANT:\n\n1. Copiez le texte ci-dessous\n2. Facebook va s\'ouvrir\n3. COLLEZ (Ctrl+V) dans votre publication\n\n' + shareText);
                    }
                    
                    document.body.removeChild(textArea);
                    
                    setTimeout(() => {
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                        window.open(shareUrl, '_blank', 'width=600,height=600');
                    }, 4000);
                });
            } else {
                // Fallback pour navigateurs très anciens
                alert('📋 INSTRUCTIONS:\n\n1. Copiez le texte ci-dessous\n2. Facebook va s\'ouvrir\n3. Collez (Ctrl+V ou clic droit > Coller)\n\n' + shareText);
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                window.open(shareUrl, '_blank', 'width=600,height=600');
            }
            return;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            break;
        default:
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// ==========================================
// FONCTIONS POUR LES ACTUALITÉS
// ==========================================

// Fonction pour ouvrir le modal de lecture complète d'une actualité
function openNewsModal(newsId, event) {
    if (event) event.preventDefault();

    const news = CONFIG.news.find(n => n.id === newsId);
    if (!news) return;

    let modal = document.getElementById('newsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'newsModal';
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="article-modal-content">
                <button class="article-modal-close" onclick="closeNewsModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div id="newsModalBody"></div>
            </div>
        `;
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeNewsModal();
        });
        document.body.appendChild(modal);
    }

    const isPromiseUpdate = news.is_promise_update === true;
    const modalBody = document.getElementById('newsModalBody');

    if (isPromiseUpdate) {
        // Statuts
        const statusMap = {
            'realise':   ['Realise',   '#27AE60'],
            'encours':   ['En cours',  '#2563A8'],
            'non-lance': ['Non lance', '#888888'],
            'retard':    ['En retard', '#E74C3C'],
        };
        const [sLabel, sColor] = statusMap[news.promise_status] || ['', '#888'];
        const statusEmoji = {'realise':'OK','encours':'->','non-lance':'...','retard':'!'}[news.promise_status] || '';

        // Engagement complet depuis promises
        const promise = (CONFIG.promises || []).find(p => p.id === news.promise_id);
        const engagementFull = promise ? promise.engagement : '';

        // Extraire le texte de la mise a jour (apres "Details :")
        const fullText = news.content || news.excerpt || '';
        const detailMarker = fullText.indexOf('Details :');
        const detailsRaw = detailMarker >= 0 ? fullText.slice(detailMarker + 9) : fullText;
        const detailsClean = detailsRaw
            .split('\n')
            .filter(function(l) { return l.trim() && !l.includes('projetbi.org') && l.indexOf('---') === -1; })
            .join('\n').trim();

        modalBody.innerHTML =
            '<div class="article-full promise-update-article">' +
            // Badges haut
            '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1.1rem;flex-wrap:wrap">' +
            '<span style="background:' + sColor + '22;color:' + sColor + ';border:1px solid ' + sColor + '44;' +
            'padding:.2rem .75rem;border-radius:20px;font-size:.78rem;font-weight:700">' + sLabel + '</span>' +
            '<span style="background:#F0F4F1;color:#2D5F3F;border:1px solid #C5DBC0;' +
            'padding:.2rem .75rem;border-radius:20px;font-size:.78rem;font-weight:600">' + escapeHTML(news.category) + '</span>' +
            '<span style="color:#888;font-size:.78rem;margin-left:auto">' + news.date + '</span>' +
            '</div>' +
            // Titre
            '<h2 style="font-size:1.25rem;margin-bottom:1rem;line-height:1.45;color:#1A3D28">' +
            escapeHTML(news.title) + '</h2>' +
            // Engagement d origine
            (engagementFull ?
                '<div style="background:#F0F7F2;border-left:4px solid #2D5F3F;padding:.9rem 1.1rem;' +
                'border-radius:0 8px 8px 0;margin-bottom:1.1rem">' +
                '<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.07em;' +
                'color:#5C7A58;font-weight:700;margin-bottom:.35rem">Engagement</div>' +
                '<p style="color:#1A3D28;font-size:.88rem;line-height:1.6;margin:0">' +
                escapeHTML(engagementFull) + '</p></div>' : '') +
            // Corps de la mise a jour
            '<div style="background:#fff;border:1px solid #E5EDE6;border-radius:8px;' +
            'padding:1rem 1.1rem;margin-bottom:1rem">' +
            '<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.07em;' +
            'color:#5C7A58;font-weight:700;margin-bottom:.5rem">Mise a jour</div>' +
            '<p style="color:#333;font-size:.92rem;line-height:1.75;margin:0;white-space:pre-line">' +
            escapeHTML(detailsClean) + '</p></div>' +
            // Source
            '<div style="font-size:.78rem;color:#999;padding-top:.6rem;border-top:1px solid #E5EDE6;margin-bottom:.9rem">' +
            'Source : ' + escapeHTML(news.source || 'ProjetBI') +
            (news.promise_id ? ' &nbsp;|&nbsp; <a href="/#' + news.promise_id + '" style="color:#2D5F3F">Voir l\'engagement</a>' : '') +
            '</div>' +
            // Boutons partage
            '<div style="display:flex;gap:.45rem;flex-wrap:wrap">' +
            '<button onclick="shareNews(\'' + news.id + '\',\'facebook\')" ' +
            'style="background:#1877F2;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-facebook-f"></i> Partager</button>' +
            '<button onclick="shareNews(\'' + news.id + '\',\'whatsapp\')" ' +
            'style="background:#25D366;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-whatsapp"></i> WhatsApp</button>' +
            '<button onclick="shareNews(\'' + news.id + '\',\'twitter\')" ' +
            'style="background:#000;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-x-twitter"></i> X</button>' +
            '</div>' +
            '</div>';

    } else {
        // Actualite manuelle classique
        const fullText = news.content || news.excerpt || '';
        const paragraphs = fullText.split('\n').filter(function(l) { return l.trim(); })
            .map(function(l) { return '<p style="margin-bottom:.85rem;line-height:1.8">' + escapeHTML(l) + '</p>'; })
            .join('');

        modalBody.innerHTML =
            '<div class="article-full">' +
            '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">' +
            (news.category ? '<span style="background:#F0F4F1;color:#2D5F3F;border:1px solid #C5DBC0;' +
            'padding:.2rem .75rem;border-radius:20px;font-size:.78rem;font-weight:600">' + escapeHTML(news.category) + '</span>' : '') +
            '<span style="color:#888;font-size:.78rem;margin-left:auto">' + news.date + '</span>' +
            '</div>' +
            '<h2>' + escapeHTML(news.title) + '</h2>' +
            '<div class="article-meta">' +
            '<span><i class="fas fa-newspaper"></i> ' + escapeHTML(news.source || '') + '</span>' +
            (news.author ? '<span><i class="fas fa-user"></i> ' + escapeHTML(news.author) + '</span>' : '') +
            (news.read_time ? '<span><i class="fas fa-clock"></i> ' + escapeHTML(news.read_time) + '</span>' : '') +
            '</div>' +
            (news.image_url ? '<div style="border-radius:8px;overflow:hidden;margin-bottom:1.1rem"><img src="' + escapeHTML(news.image_url) + '" alt="' + escapeHTML(news.title) + '" ' +
            'style="width:100%;max-height:280px;object-fit:cover;display:block" ' +
            'onerror="newsFallbackImg(this,\'' + escapeHTML(news.category || 'Général') + '\',\'220px\',\'0\')"></div>' : '') +
            '<div class="article-content">' + paragraphs + '</div>' +
            (news.link && news.link.indexOf('projetbi.org/#promise_') === -1 ?
            '<div style="margin-top:1rem;padding-top:.9rem;border-top:1px solid #eee">' +
            '<a href="' + escapeHTML(news.link) + '" target="_blank" rel="noopener" ' +
            'style="color:#2D5F3F;font-weight:600;font-size:.86rem">' +
            '<i class="fas fa-external-link-alt"></i> Lire l\'article original</a></div>' : '') +
            '<div style="display:flex;gap:.45rem;margin-top:1rem;flex-wrap:wrap">' +
            '<button onclick="shareNews(\'' + news.id + '\',\'facebook\')" ' +
            'style="background:#1877F2;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-facebook-f"></i> Partager</button>' +
            '<button onclick="shareNews(\'' + news.id + '\',\'whatsapp\')" ' +
            'style="background:#25D366;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-whatsapp"></i> WhatsApp</button>' +
            '<button onclick="shareNews(\'' + news.id + '\',\'twitter\')" ' +
            'style="background:#000;color:white;border:none;padding:.4rem .85rem;border-radius:6px;cursor:pointer;font-size:.78rem">' +
            '<i class="fab fa-x-twitter"></i> X</button>' +
            '</div></div>';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Fonction de partage enrichi pour les actualités
function shareNews(newsId, platform) {
    const news = CONFIG.news.find(n => n.id === newsId);
    if (!news) return;
    
    const shareUrl = news.link && news.link !== '#' ? news.link : window.location.href;
    const source = news.source || 'Le Soleil';
    
    let shareText = '';
    
    if (platform === 'facebook') {
        shareText = `📰 ACTUALITÉ

${news.title}

${news.excerpt || ''}

📅 Date: ${news.date}
📰 Source: ${source}

📊 Restez informé sur:
${shareUrl}

#Pastef #Actualités`;
    } else if (platform === 'twitter') {
        const maxLength = 180;
        const content = news.excerpt || '';
        const truncated = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
        
        shareText = `📰 ${news.title}

${truncated}

📅 ${news.date} | 📰 ${source}

${shareUrl}

#Pastef`;
    } else if (platform === 'whatsapp') {
        shareText = `📰 *ACTUALITÉ*

*${news.title}*

${news.excerpt || ''}

📅 *Date:* ${news.date}
📰 *Source:* ${source}

📊 *Lire plus:*
${shareUrl}

_Via LE PROJET_`;
    }
    
    let url = '';
    switch(platform) {
        case 'facebook':
            // Copier le texte dans le presse-papier puis ouvrir Facebook
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('📋 Texte copié ! Collez-le dans votre publication Facebook', 'success');
                    setTimeout(() => {
                        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                        window.open(url, '_blank', 'width=600,height=400');
                    }, 1000);
                }).catch(() => {
                    alert('📋 Copiez ce texte et collez-le dans votre publication Facebook:\n\n' + shareText);
                    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                    window.open(url, '_blank', 'width=600,height=400');
                });
            } else {
                alert('📋 Copiez ce texte et collez-le dans votre publication Facebook:\n\n' + shareText);
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                window.open(url, '_blank', 'width=600,height=400');
            }
            return;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            break;
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
}

// ==========================================
// MODALS POUR LISTE COMPLÈTE DES NOTATIONS
// ==========================================

async function showAllRatings(category) {
    
    const modal = document.getElementById('ratingsListModal');
    const title = document.getElementById('ratingsModalTitle');
    const body = document.getElementById('ratingsModalBody');
    
    if (!modal || !title || !body) {
        console.error();
        return;
    }
    
    const titles = {
        'top-rated': '<i class="fas fa-trophy"></i> Classement Complet des Services',
        'recent': '<i class="fas fa-clock"></i> Toutes les Notations de la Semaine'
    };
    title.innerHTML = titles[category] || 'Liste complète';
    
    body.innerHTML = '<div class="loading"><div class="spinner"></div><p>Chargement...</p></div>';
    modal.style.display = 'flex';
    
    try {
        let ratings = [];
        
        // Charger depuis Supabase si disponible
        if (supabaseClient && !DEMO_MODE) {
            const { data, error } = await supabaseClient
                .from('service_ratings')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error(error);
                // Fallback sur localStorage
                ratings = JSON.parse(localStorage.getItem('service_ratings') || '[]');
            } else {
                ratings = data || [];
            }
        } else {
            // Mode local
            ratings = JSON.parse(localStorage.getItem('service_ratings') || '[]');
        }
        
        if (ratings.length === 0) {
            body.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Aucune notation disponible</p></div>';
            return;
        }
        
        if (category === 'top-rated') {
            // CLASSEMENT COMPLET PAR SERVICE
            const serviceStats = {};
            
            // Regrouper par service
            ratings.forEach(item => {
                if (!serviceStats[item.service]) {
                    serviceStats[item.service] = { 
                        sum: 0, 
                        count: 0, 
                        comments: 0,
                        accessibility: 0,
                        welcome: 0,
                        efficiency: 0,
                        transparency: 0
                    };
                }
                const acc = parseInt(item.accessibility) || 0;
                const wel = parseInt(item.welcome) || 0;
                const eff = parseInt(item.efficiency) || 0;
                const tra = parseInt(item.transparency) || 0;
                const avg = (acc + wel + eff + tra) / 4;
                
                serviceStats[item.service].sum += avg;
                serviceStats[item.service].count += 1;
                serviceStats[item.service].accessibility += acc;
                serviceStats[item.service].welcome += wel;
                serviceStats[item.service].efficiency += eff;
                serviceStats[item.service].transparency += tra;
                
                if (item.comment && item.comment.trim() !== '') {
                    serviceStats[item.service].comments += 1;
                }
            });
            
            // Créer le tableau trié
            const sortedServices = Object.entries(serviceStats)
                .map(([service, stats]) => ({
                    service,
                    avg: stats.sum / stats.count,
                    count: stats.count,
                    comments: stats.comments,
                    accessibility: (stats.accessibility / stats.count).toFixed(1),
                    welcome: (stats.welcome / stats.count).toFixed(1),
                    efficiency: (stats.efficiency / stats.count).toFixed(1),
                    transparency: (stats.transparency / stats.count).toFixed(1)
                }))
                .sort((a, b) => b.avg - a.avg);
            
            
            // Afficher le classement complet
            body.innerHTML = `
                <div class="full-ranking">
                    ${sortedServices.map((item, index) => {
                        const medals = ['🥇', '🥈', '🥉'];
                        const medal = index < 3 ? medals[index] : '';
                        const rankClass = index < 3 ? `rank-${index + 1}` : '';
                        
                        return `
                            <div class="ranking-item ${rankClass}">
                                <div class="ranking-header">
                                    <div class="ranking-position">
                                        ${medal ? `<span class="medal">${medal}</span>` : `<span class="rank-number">#${index + 1}</span>`}
                                    </div>
                                    <div class="ranking-service">
                                        <div class="service-name">${escapeHTML(item.service)}</div>
                                        <div class="service-meta">${parseInt(item.count) || 0} vote${item.count > 1 ? 's' : ''} • ${parseInt(item.comments) || 0} commentaire${item.comments > 1 ? 's' : ''}</div>
                                    </div>
                                    <div class="ranking-score">
                                        <div class="score-main">
                                            <i class="fas fa-star"></i> ${item.avg.toFixed(1)}/5
                                        </div>
                                    </div>
                                </div>
                                <div class="ranking-details">
                                    <div class="detail-item">
                                        <i class="fas fa-wheelchair"></i>
                                        <span>Accessibilité</span>
                                        <strong>${item.accessibility}/5</strong>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-handshake"></i>
                                        <span>Accueil</span>
                                        <strong>${item.welcome}/5</strong>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-bolt"></i>
                                        <span>Efficacité</span>
                                        <strong>${item.efficiency}/5</strong>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-eye"></i>
                                        <span>Transparence</span>
                                        <strong>${item.transparency}/5</strong>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            // TOUTES LES NOTATIONS PAR DATE (dernière semaine)
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            // Filtrer les notations de la semaine
            const weekRatings = ratings.filter(item => {
                const itemDate = new Date(item.created_at || item.date || 0);
                return itemDate >= oneWeekAgo;
            });
            
            // Calculer la note moyenne pour chaque notation
            const withAvg = weekRatings.map(r => ({
                ...r,
                avg: (parseInt(r.accessibility||0) + parseInt(r.welcome||0) + parseInt(r.efficiency||0) + parseInt(r.transparency||0)) / 4
            }));
            
            // Trier par date (plus récent en premier)
            const sorted = withAvg.sort((a, b) => 
                new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
            );
            
            
            if (sorted.length === 0) {
                body.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>Aucune notation cette semaine</p></div>';
                return;
            }
            
            // Afficher toutes les notations de la semaine
            body.innerHTML = `
                <div class="week-header">
                    <i class="fas fa-calendar-week"></i>
                    <span>${sorted.length} notation${sorted.length > 1 ? 's' : ''} des 7 derniers jours</span>
                </div>
                <div class="recent-ratings">
                    ${sorted.map((item, index) => {
                        const date = new Date(item.created_at || item.date || new Date());
                        const formattedDate = date.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return `
                            <div class="recent-item-expanded">
                                <div class="recent-header">
                                    <span class="recent-service">${escapeHTML(item.service) || 'Service inconnu'}</span>
                                    <span class="recent-date">${formattedDate}</span>
                                </div>
                                <div class="recent-scores-grid">
                                    <div class="score-badge">
                                        <i class="fas fa-star"></i>
                                        <div>
                                            <strong>${item.avg.toFixed(1)}/5</strong>
                                            <span>Global</span>
                                        </div>
                                    </div>
                                    <div class="criteria-scores">
                                        <div><i class="fas fa-wheelchair"></i> ${parseInt(item.accessibility) || 0}/5</div>
                                        <div><i class="fas fa-handshake"></i> ${parseInt(item.welcome) || 0}/5</div>
                                        <div><i class="fas fa-bolt"></i> ${parseInt(item.efficiency) || 0}/5</div>
                                        <div><i class="fas fa-eye"></i> ${parseInt(item.transparency) || 0}/5</div>
                                    </div>
                                </div>
                                ${item.comment ? `
                                    <div class="recent-comment-full">
                                        <i class="fas fa-quote-left"></i>
                                        <p>${escapeAndTruncate(item.comment, 300)}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error(error);
        body.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur lors du chargement des notations</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function closeRatingsModal() {
    const modal = document.getElementById('ratingsListModal');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// NOTIFICATIONS
// ==========================================
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || icons.success}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// FONCTION D'EXPORT DES DONNÉES
// ==========================================
function exportData(format = 'csv') {
    const promises = CONFIG.filteredPromises.length > 0 ? CONFIG.filteredPromises : CONFIG.promises;
    
    if (promises.length === 0) {
        showNotification('Aucune donnée à exporter', 'error');
        return;
    }
    
    if (format === 'csv') {
        // En-têtes CSV
        const headers = [
            'ID',
            'Engagement',
            'Domaine',
            'Statut',
            'Priorité',
            'Délai',
            'Jours Restants',
            'Responsable',
            'Budget',
            'Résultat Attendu',
            'Indicateurs',
            'Dernière Mise à Jour'
        ];
        
        // Données CSV
        const rows = promises.map(p => {
            const deadline = p.deadline ? new Date(p.deadline) : null;
            const joursRestants = deadline ? Math.ceil((deadline - new Date()) / 86400000) : 'N/A';
            const lastUpdate = p.updates && p.updates.length > 0 
                ? p.updates[p.updates.length - 1].description 
                : '';
            
            return [
                p.id || '',
                `"${(p.engagement || '').replace(/"/g, '""')}"`,
                p.domain || p.domaine || '',
                p.statut || '',
                p.priorite || '',
                p.deadline || '',
                joursRestants,
                p.responsable || '',
                p.budget || '',
                `"${(p.resultat || '').replace(/"/g, '""')}"`,
                `"${(p.indicateurs || '').replace(/"/g, '""')}"`,
                `"${lastUpdate.replace(/"/g, '""')}"`
            ].join(',');
        });
        
        // Créer le fichier CSV
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `engagements_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`✅ ${promises.length} engagement(s) exporté(s) en CSV`, 'success');
    }
}

// ==========================================
// GESTION VUE LISTE / GRILLE
// ==========================================
function initializeViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const promisesGrid = document.getElementById('promisesGrid');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Mise à jour des boutons actifs
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mise à jour de la vue
            if (view === 'list') {
                promisesGrid.classList.add('list-view');
                promisesGrid.classList.remove('promises-grid');
            } else {
                promisesGrid.classList.remove('list-view');
                promisesGrid.classList.add('promises-grid');
            }
            
            // Sauvegarder la préférence
            localStorage.setItem('preferredView', view);
        });
    });
    
    // Charger la préférence sauvegardée
    const savedView = localStorage.getItem('preferredView');
    if (savedView === 'list') {
        const listBtn = document.querySelector('[data-view="list"]');
        if (listBtn) listBtn.click();
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initializeViewToggle);

// ==========================================
// EXPORTS GLOBAUX
// ==========================================
window.toggleUpdates = toggleUpdates;
window.showRatingModal = showRatingModal;
window.closeRatingModal = closeRatingModal;
window.submitRating = submitRating;
window.sharePromise = sharePromise;
window.resetFilters = resetFilters;
window.goToSlide = goToSlide;
window.openPhotoViewer = openPhotoViewer;
window.closePhotoViewer = closePhotoViewer;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.zoomReset = zoomReset;
window.prevPhoto = prevPhoto;
window.nextPhoto = nextPhoto;
window.togglePressZoom = togglePressZoom;
window.goToCarouselSlide = goToCarouselSlide;
window.shareToPlatform = shareToPlatform;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;
window.shareNews = shareNews;
window.showAllRatings = showAllRatings;
window.closeRatingsModal = closeRatingsModal;
window.exportData = exportData;

// ==========================================
// FONCTIONS MANQUANTES (pour éviter les erreurs)
// ==========================================

function getDefaultPressData() {
    return [];
}

// ==========================================
// FONCTIONS DE SECOURS POUR SUPABASE
// ==========================================

// Fonction pour insérer avec retry et fallback
async function safeSupabaseInsert(table, data, retryCount = 2) {
    if (!supabaseClient) {
        return { success: false, data: null, error: 'Supabase non disponible' };
    }
    
    for (let i = 0; i <= retryCount; i++) {
        try {
            
            const { data: result, error } = await supabaseClient
                .from(table)
                .insert([data])
                .select();
            
            if (!error) {
                return { success: true, data: result, error: null };
            }
            
            // Si erreur 401 (RLS), essayez avec une méthode différente
            if (error.code === 'PGRST301' || error.code === '42501' || error.message.includes('row-level security')) {
                
                // Mode fallback : stockage local
                const localStorageKey = `supabase_fallback_${table}`;
                const fallbackData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                fallbackData.push({
                    ...data,
                    id: Date.now().toString(),
                    _synced: false,
                    _timestamp: new Date().toISOString()
                });
                localStorage.setItem(localStorageKey, JSON.stringify(fallbackData));
                
                return { 
                    success: false, 
                    data: null, 
                    error: error.message,
                    fallback: true 
                };
            }
            
            // Autre erreur
            console.error(`❌ Erreur insertion ${table}:`, error);
            
        } catch (error) {
            console.error(`❌ Exception insertion ${table}:`, error);
        }
        
        // Attente avant retry
        if (i < retryCount) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    
    return { success: false, data: null, error: 'Toutes les tentatives ont échoué' };
}

// Version corrigée de saveRatingToSupabase
async function saveRatingToSupabase(ratingData) {
    if (!supabaseClient) {
        return false;
    }
    
    try {
        
        // Structure des données
        const supabaseData = {
            service: ratingData.service,
            accessibility: ratingData.accessibility,
            welcome: ratingData.welcome,
            efficiency: ratingData.efficiency,
            transparency: ratingData.transparency,
            comment: ratingData.comment || null,
            user_ip: await getIPAddress(),
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
        };
        
        
        // Utiliser la fonction safe insert
        const result = await safeSupabaseInsert('service_ratings', supabaseData);
        
        if (result.fallback) {
            showNotification('Notation enregistrée localement (problème serveur)', 'info');
            return false;
        }
        
        if (!result.success) {
            console.error();
            showNotification('Mode démo : Notation enregistrée localement', 'info');
            return false;
        }
        
        showNotification('Merci pour votre notation !', 'success');
        
        // Mettre à jour les stats (en arrière-plan)
        setTimeout(() => updateServiceStats(ratingData.service), 1000);
        
        return true;
        
    } catch (error) {
        console.error(error);
        showNotification('Mode démo : Notation enregistrée localement', 'info');
        return false;
    }
}

// Version corrigée de saveVoteToSupabase
async function saveVoteToSupabase(promiseId, rating, comment = '') {
    if (!supabaseClient) {
        showNotification('Mode démo : Vote enregistré localement', 'info');
        const votes = JSON.parse(localStorage.getItem('promise_votes') || '[]');
        votes.push({
            id: Date.now().toString(),
            promise_id: promiseId,
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('promise_votes', JSON.stringify(votes));
        return;
    }
    
    try {
        const voteData = { 
            promise_id: promiseId, 
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        };
        
        
        const result = await safeSupabaseInsert('votes', voteData);
        
        if (result.fallback) {
            showNotification('Vote enregistré localement (problème serveur)', 'info');
        } else if (result.success) {
            showNotification('Merci pour votre vote !', 'success');
        } else {
            showNotification('Vote enregistré localement (mode démo)', 'info');
        }
        
        // Recharger les votes après un délai
        setTimeout(() => fetchAndDisplayPublicVotes(), 500);
        
    } catch (error) {
        console.error(error);
        showNotification('Mode démo : Vote enregistré localement', 'info');
    }
}

// Fonction pour synchroniser les données locales
async function syncLocalDataWithSupabase() {
    
    // Synchroniser service_ratings
    const serviceRatingsLocal = JSON.parse(localStorage.getItem('supabase_fallback_service_ratings') || '[]');
    if (serviceRatingsLocal.length > 0) {
        
        for (const rating of serviceRatingsLocal.filter(r => !r._synced)) {
            try {
                const { success } = await safeSupabaseInsert('service_ratings', {
                    service: rating.service,
                    accessibility: rating.accessibility,
                    welcome: rating.welcome,
                    efficiency: rating.efficiency,
                    transparency: rating.transparency,
                    comment: rating.comment,
                    user_ip: rating.user_ip || 'unknown',
                    user_agent: rating.user_agent || 'local-sync',
                    created_at: rating.created_at || rating._timestamp
                });
                
                if (success) {
                    rating._synced = true;
                }
            } catch (error) {
                console.error(error);
            }
        }
        
        // Mettre à jour le stockage local
        localStorage.setItem('supabase_fallback_service_ratings', JSON.stringify(serviceRatingsLocal));
    }
    
    // Synchroniser votes
    const votesLocal = JSON.parse(localStorage.getItem('promise_votes') || '[]');
    if (votesLocal.length > 0) {
        
        // Logique similaire pour les votes...
    }
}
// ==========================================
// MENU MOBILE - VERSION CORRIGÉE
// ==========================================
function initMobileMenu() {
    const hamburger = document.getElementById('modernHamburger');
    const menu = document.getElementById('modernMenu');
    const menuLinks = document.querySelectorAll('.modern-link');
    
    if (!hamburger || !menu) {
        return;
    }
    
    
    // Toggle du menu hamburger
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher la propagation
        hamburger.classList.toggle('active');
        menu.classList.toggle('active');
    });
    
    // Fermer le menu quand on clique sur un lien
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Laisser le comportement par défaut des liens ancres
            hamburger.classList.remove('active');
            menu.classList.remove('active');
        });
    });
    
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
            hamburger.classList.remove('active');
            menu.classList.remove('active');
        }
    });
}

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});
function getStatusText(promise) {
    if (promise.isLate) return 'En retard';
    return promise.status;
}

/* ── Bascule Interactive & Défilement Automatique (Hero Présidence vs Assemblée) ── */
let _heroCarouselInterval = null;
let _currentHeroTab = 'presidence';

function switchHeroInstitution(inst) {
    _currentHeroTab = inst;
    const tabPresidence = document.getElementById('tabPresidence');
    const tabAssemblee = document.getElementById('tabAssemblee');
    const viewPresidence = document.getElementById('viewPresidence');
    const viewAssemblee = document.getElementById('viewAssemblee');

    if (!tabPresidence || !tabAssemblee || !viewPresidence || !viewAssemblee) return;

    if (inst === 'assemblee') {
        tabPresidence.classList.remove('active');
        tabAssemblee.classList.add('active');
        viewPresidence.style.display = 'none';
        viewPresidence.classList.remove('active');
        viewAssemblee.style.display = 'block';
        viewAssemblee.classList.add('active');
    } else {
        tabAssemblee.classList.remove('active');
        tabPresidence.classList.add('active');
        viewAssemblee.style.display = 'none';
        viewAssemblee.classList.remove('active');
        viewPresidence.style.display = 'block';
        viewPresidence.classList.add('active');
    }
}

function startHeroCarouselAutoPlay() {
    if (_heroCarouselInterval) clearInterval(_heroCarouselInterval);
    _heroCarouselInterval = setInterval(() => {
        const nextTab = _currentHeroTab === 'presidence' ? 'assemblee' : 'presidence';
        switchHeroInstitution(nextTab);
    }, 5000);
}

function stopHeroCarouselAutoPlay() {
    if (_heroCarouselInterval) {
        clearInterval(_heroCarouselInterval);
        _heroCarouselInterval = null;
    }
}

function initHeroCarousel() {
    const card = document.querySelector('.hero-institution-card');
    if (card) {
        card.addEventListener('mouseenter', stopHeroCarouselAutoPlay);
        card.addEventListener('mouseleave', startHeroCarouselAutoPlay);
        card.addEventListener('focusin', stopHeroCarouselAutoPlay);
        card.addEventListener('focusout', startHeroCarouselAutoPlay);
    }
    startHeroCarouselAutoPlay();
}

window.initHeroCarousel = initHeroCarousel;
window.startHeroCarouselAutoPlay = startHeroCarouselAutoPlay;
window.stopHeroCarouselAutoPlay = stopHeroCarouselAutoPlay;

/* ── Lightbox Plein Écran pour la Revue de Presse ── */
function openPressLightbox(imgUrl, title) {
    // Nettoyer tout modal ou fond noir résiduel avant création
    closePressLightbox();

    const lightbox = document.createElement('div');
    lightbox.id = 'pressLightboxModal';
    lightbox.className = 'press-lightbox-modal';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" onclick="window.closePressLightbox()"></div>
        <div class="lightbox-title-badge"><i class="fas fa-newspaper"></i> ${escapeHTML(title || 'Quotidien')}</div>
        <button class="lightbox-close-btn" onclick="window.closePressLightbox()" aria-label="Fermer la vue plein écran">
            <i class="fas fa-times"></i>
        </button>
        <div class="lightbox-body" onclick="window.closePressLightbox()">
            <img src="${escapeAttr(imgUrl)}" alt="${escapeAttr(title || 'Quotidien')}" class="lightbox-img" onclick="event.stopPropagation()">
        </div>
        <div class="lightbox-esc-hint">Appuyez sur <kbd>Échap</kbd> ou cliquez à côté pour fermer</div>
    `;
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Permettre la fermeture avec la touche Échap
    const handleEsc = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closePressLightbox();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function closePressLightbox() {
    const lightbox = document.getElementById('pressLightboxModal');
    if (lightbox) {
        lightbox.remove();
    }
    // Nettoyage absolu de tout arrière-plan ou calque résiduel dans le DOM
    document.querySelectorAll('.press-lightbox-modal, .lightbox-overlay, .modal-backdrop').forEach(el => el.remove());
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.classList.remove('modal-open', 'lightbox-open');
}

// Écouteur global en phase de capture pour garantir la fermeture immédiate au clic
document.addEventListener('click', (e) => {
    const lightbox = document.getElementById('pressLightboxModal');
    if (lightbox) {
        if (e.target.closest('.lightbox-close-btn') || e.target.classList.contains('lightbox-overlay') || e.target.classList.contains('lightbox-body') || e.target === lightbox) {
            closePressLightbox();
        }
    }
}, true);

// Attachement explicite à window pour garantir l'exécution onclick dans le HTML
window.switchHeroInstitution = switchHeroInstitution;
window.openPressLightbox = openPressLightbox;
window.closePressLightbox = closePressLightbox;


