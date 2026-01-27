// ==========================================
// UTILS.JS - Fonctions utilitaires complètes
// ==========================================

// ==========================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ==========================================
function setupEventListeners() {
    // Filtres
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    
    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('show') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Fermer le menu mobile quand on clique sur un lien
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Scroll to top
    const scrollBtn = document.getElementById('backToTop');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('visible', window.scrollY > 500);
        });
    }
    
    // Scroll progress
    window.addEventListener('scroll', updateScrollProgress);
    
    // Modal de contact
    const openContactModal = document.getElementById('openContactModal');
    const contactModal = document.getElementById('contactModal');
    const closeContactModal = document.getElementById('closeContactModal');
    const contactForm = document.getElementById('contactForm');
    
    if (openContactModal && contactModal && closeContactModal) {
        openContactModal.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        
        closeContactModal.addEventListener('click', () => {
            contactModal.classList.remove('show');
            document.body.style.overflow = '';
        });
        
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simuler l'envoi du formulaire
            showNotification('Message envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
            
            // Réinitialiser le formulaire
            contactForm.reset();
            
            // Fermer le modal après un délai
            setTimeout(() => {
                contactModal.classList.remove('show');
                document.body.style.overflow = '';
            }, 2000);
        });
    }
    
    // Modal capture
    const captureModal = document.getElementById('captureModal');
    const closeCapture = document.getElementById('closeCapture');
    const downloadCapture = document.getElementById('downloadCapture');
    const shareCapture = document.getElementById('shareCapture');
    
    if (captureModal && closeCapture) {
        closeCapture.addEventListener('click', () => {
            captureModal.classList.remove('show');
        });
        
        captureModal.addEventListener('click', (e) => {
            if (e.target === captureModal) {
                captureModal.classList.remove('show');
            }
        });
    }
    
    if (downloadCapture) {
        downloadCapture.addEventListener('click', () => {
            const captureImage = document.getElementById('captureImage');
            if (captureImage && captureImage.src) {
                const link = document.createElement('a');
                link.download = `capture-engagement-${new Date().toISOString().slice(0,10)}.png`;
                link.href = captureImage.src;
                link.click();
                showNotification('Image téléchargée avec succès !', 'success');
            }
        });
    }
    
    if (shareCapture) {
        shareCapture.addEventListener('click', () => {
            const captureImage = document.getElementById('captureImage');
            if (captureImage && captureImage.src) {
                if (navigator.share) {
                    navigator.share({
                        title: 'Capture d\'engagement',
                        text: 'Consultez cet engagement du Projet Sénégal',
                        url: window.location.href
                    }).then(() => {
                        showNotification('Partagé avec succès !', 'success');
                    }).catch(() => {});
                } else {
                    showNotification('Fonctionnalité de partage non disponible sur cet appareil', 'info');
                }
            }
        });
    }
    
    // Gestion de l'export dropdown sur mobile
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                const dropdown = exportBtn.querySelector('.export-dropdown');
                dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
            }
        });
        
        // Cacher le dropdown quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !exportBtn.contains(e.target)) {
                const dropdown = exportBtn.querySelector('.export-dropdown');
                dropdown.style.display = 'none';
            }
        });
    }
}

// ==========================================
// PARTAGE
// ==========================================
function setupShareButtons() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Suivi des engagements du Président Diomaye Faye - Le Projet Sénégal');
    const hashtags = 'ProjetSenegal,DiomayeFaye,Souverainete';
    
    // Dashboard shares
    document.getElementById('share-twitter-dash').href = 
        `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
    
    document.getElementById('share-facebook-dash').href = 
        `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    document.getElementById('share-whatsapp-dash').href = 
        `https://wa.me/?text=${text}%20${url}`;
    
    document.getElementById('share-linkedin-dash').href = 
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    
    // Footer shares
    document.getElementById('share-twitter-foot').href = 
        `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
    
    document.getElementById('share-facebook-foot').href = 
        `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    document.getElementById('share-whatsapp-foot').href = 
        `https://wa.me/?text=${text}%20${url}`;
}

// ==========================================
// DÉBOUNCE UTILITY
// ==========================================
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
// DÉTECTION DU MODE SOMBRE
// ==========================================
function setupDarkMode() {
    // Vérifier la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Vous pouvez ajouter un toggle manuel ici si nécessaire
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
}

// ==========================================
// ACCESSIBILITÉ
// ==========================================
function setupAccessibility() {
    // Ajouter des attributs ARIA aux éléments interactifs
    document.querySelectorAll('.nav-link, .quick-filter-btn, .share-btn, .details-btn').forEach(el => {
        if (!el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', el.textContent.trim());
        }
    });
    
    // Gestion du focus pour le clavier
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    document.querySelectorAll('.promise-card, .stat-card').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('focus', () => {
            card.style.boxShadow = '0 0 0 3px rgba(42, 109, 93, 0.3)';
        });
        card.addEventListener('blur', () => {
            card.style.boxShadow = '';
        });
    });
}

// ==========================================
// AMÉLIORATIONS DE PERFORMANCE
// ==========================================
function optimizePerformance() {
    // Lazy loading pour les images
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
    }
    
    // Intersection Observer pour le lazy loading des cartes
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.promise-card, .stat-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }
}

// ==========================================
// GESTION DES ERREURS
// ==========================================
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Erreur détectée:', e.error);
        // Vous pouvez ajouter une notification ici si nécessaire
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promesse non gérée:', e.reason);
    });
}

// ==========================================
// ANALYTICS BASIQUES
// ==========================================
function trackEvent(category, action, label) {
    // Pour Google Analytics ou autre service
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    // Pour Matomo/Piwik
    if (typeof _paq !== 'undefined') {
        _paq.push(['trackEvent', category, action, label]);
    }
    
    console.log(`📊 Event: ${category} - ${action} - ${label}`);
}

// ==========================================
// FONCTIONS DE CONVERSION DE DONNÉES
// ==========================================
function exportData(format) {
    const data = CONFIG.promises;
    
    switch(format) {
        case 'csv':
            exportCSV(data);
            break;
        case 'xlsx':
            exportExcel(data);
            break;
        case 'json':
            exportJSON(data);
            break;
        case 'pdf':
            exportPDF(data);
            break;
        default:
            showNotification('Format non supporté', 'error');
    }
}

function exportCSV(data) {
    try {
        const headers = ['ID', 'Domaine', 'Engagement', 'Résultat', 'Statut', 'Délai', 'Progression'];
        const rows = data.map(p => [
            p.id,
            p.domaine,
            `"${p.engagement.replace(/"/g, '""')}"`,
            `"${p.resultat.replace(/"/g, '""')}"`,
            p.status,
            p.delai,
            p.status === 'realise' ? '100' : p.status === 'encours' ? '50' : '0'
        ]);
        
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `engagements-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        
        trackEvent('Export', 'CSV', 'Données engagements');
        showNotification('Export CSV réussi !', 'success');
    } catch (error) {
        console.error('Erreur export CSV:', error);
        showNotification('Erreur lors de l\'export CSV', 'error');
    }
}

function exportJSON(data) {
    try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `engagements-${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        
        trackEvent('Export', 'JSON', 'Données engagements');
        showNotification('Export JSON réussi !', 'success');
    } catch (error) {
        console.error('Erreur export JSON:', error);
        showNotification('Erreur lors de l\'export JSON', 'error');
    }
}

function exportExcel(data) {
    showNotification('Export Excel en développement...', 'info');
    // Cette fonction nécessiterait la bibliothèque SheetJS (xlsx)
}

function exportPDF(data) {
    showNotification('Export PDF en développement...', 'info');
    // Cette fonction nécessiterait la bibliothèque jsPDF
}

// ==========================================
// FONCTIONS D'AIDE À LA NAVIGATION
// ==========================================
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 100; // Pour compenser la navbar fixe
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        trackEvent('Navigation', 'Scroll', sectionId);
    }
}

// ==========================================
// INITIALISATION COMPLÈTE
// ==========================================
function initApp() {
    console.log('🚀 Initialisation de l\'application...');
    
    // Setup des écouteurs
    setupEventListeners();
    
    // Setup du partage
    setupShareButtons();
    
    // Setup du mode sombre
    setupDarkMode();
    
    // Setup de l'accessibilité
    setupAccessibility();
    
    // Optimisation des performances
    optimizePerformance();
    
    // Gestion des erreurs
    setupErrorHandling();
    
    console.log('✅ Application complètement initialisée');
}

// Initialiser l'application quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exporter les fonctions globales nécessaires
window.utils = {
    setupEventListeners,
    setupShareButtons,
    debounce,
    trackEvent,
    exportData,
    scrollToSection,
    showNotification
};