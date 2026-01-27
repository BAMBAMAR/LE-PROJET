// ==========================================
// APP.JS - Tableau de bord avec Supabase
// ==========================================
const CONFIG = {
    START_DATE: new Date('2024-04-02'),
    CURRENT_DATE: new Date(),
    promises: [],
    news: [],
    charts: {},
    currentPage: 1,
    itemsPerPage: 12,
    selectedPromiseForRating: null
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation du tableau de bord avec Supabase...');
    
    // Initialiser Supabase
    if (typeof supabaseService === 'undefined') {
        console.error('❌ Supabase non chargé - vérifiez que supabase.js est inclus');
        return;
    }
    
    // Initialiser les animations
    initAnimations();
    
    // Charger les données depuis Supabase
    await Promise.all([
        loadPromisesFromSupabase(),
        loadNewsFromSupabase()
    ]);
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Créer les graphiques
    createCharts();
    
    // Mettre à jour la barre de progression du scroll
    updateScrollProgress();
    
    // Configurer le partage
    setupShareButtons();
    
    // Afficher la promesse du jour
    displaySpotlightPromise();
    
    console.log('✅ Tableau de bord initialisé avec succès');
    
    // Afficher notification de bienvenue
    showNotification('Bienvenue sur le tableau de bord citoyen du Projet Sénégal !', 'info');
});

// ==========================================
// CHARGEMENT DES DONNÉES SUPABASE
// ==========================================
async function loadPromisesFromSupabase() {
    try {
        const promises = await supabaseService.loadPromises();
        
        CONFIG.START_DATE = new Date('2024-04-02');
        CONFIG.promises = promises.map(p => ({
            ...p,
            deadline: calculateDeadline(p.delai),
            isLate: checkIfLate(p.status, calculateDeadline(p.delai)),
            progress: calculateProgress(p.status)
        }));
        
        renderAll();
        populateSectorFilter();
        
        console.log(`✅ ${CONFIG.promises.length} engagements chargés depuis Supabase`);
    } catch (error) {
        console.error('❌ Erreur chargement engagements:', error);
        showNotification('Erreur de chargement des données', 'error');
    }
}

async function loadNewsFromSupabase() {
    try {
        CONFIG.news = await supabaseService.loadNews();
        renderNews('latest');
        console.log('✅ Actualités chargées depuis Supabase');
    } catch (error) {
        console.error('❌ Erreur chargement actualités:', error);
        showNotification('Erreur de chargement des actualités', 'error');
    }
}

// ==========================================
// NOTATION DES ENGAGEMENTS
// ==========================================
function openRatingModal(promiseId) {
    const promise = CONFIG.promises.find(p => p.id == promiseId);
    if (!promise) return;
    
    CONFIG.selectedPromiseForRating = promise;
    
    // Remplir les informations
    document.getElementById('currentPromiseInfo').innerHTML = `
        <h4>${promise.engagement}</h4>
        <p><strong>Domaine:</strong> ${promise.domaine}</p>
    `;
    
    // Réinitialiser le formulaire
    document.querySelectorAll('.star-large').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('ratingLabel').textContent = 'Sélectionnez une note';
    document.getElementById('ratingLabel').className = 'rating-label';
    document.getElementById('ratingComment').value = '';
    
    // Afficher le modal
    document.getElementById('ratingModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Track event
    trackEvent('Rating', 'Open', `promise-${promiseId}`);
}

function setupRatingStars() {
    document.querySelectorAll('.star-large').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            setRatingValue(value);
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            highlightStars(value);
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(document.querySelector('.star-large.active')?.getAttribute('data-value') || '0');
            highlightStars(currentRating);
        });
    });
    
    // Soumission du formulaire
    document.getElementById('submitRatingBtn').addEventListener('click', submitRating);
    
    // Fermeture du modal
    document.getElementById('closeRatingModal').addEventListener('click', closeRatingModal);
    document.getElementById('ratingModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('ratingModal')) {
            closeRatingModal();
        }
    });
}

function setRatingValue(value) {
    document.querySelectorAll('.star-large').forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        star.classList.toggle('active', starValue <= value);
    });
    
    // Mettre à jour le label
    const label = document.getElementById('ratingLabel');
    label.textContent = getRatingText(value);
    label.className = 'rating-label ' + getRatingClass(value);
}

function highlightStars(value) {
    document.querySelectorAll('.star-large').forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= value) {
            star.style.color = '#ffd700';
            star.style.transform = 'scale(1.15)';
        } else {
            star.style.color = '#e0e0e0';
            star.style.transform = 'scale(1)';
        }
    });
}

function getRatingText(value) {
    const texts = [
        'Très insatisfaisant 😞',
        'Insatisfaisant 😐',
        'Moyen 🙂',
        'Satisfaisant 😊',
        'Excellent 🌟'
    ];
    return texts[value - 1];
}

function getRatingClass(value) {
    if (value <= 2) return 'poor';
    if (value === 3) return 'average';
    return 'good';
}

async function submitRating() {
    const stars = document.querySelectorAll('.star-large.active');
    const rating = stars.length;
    const comment = document.getElementById('ratingComment').value.trim();
    
    if (rating === 0) {
        showNotification('Veuillez sélectionner une note', 'warning');
        return;
    }
    
    if (!CONFIG.selectedPromiseForRating) return;
    
    // Désactiver le bouton pendant le traitement
    const btn = document.getElementById('submitRatingBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    try {
        // Envoyer la notation à Supabase
        const result = await supabaseService.ratePromise(
            CONFIG.selectedPromiseForRating.id,
            rating,
            comment
        );
        
        if (result.success) {
            // Mettre à jour l'UI
            const promise = CONFIG.promises.find(p => p.id == CONFIG.selectedPromiseForRating.id);
            if (promise) {
                promise.average_rating = result.average;
                promise.rating_count = result.count;
            }
            
            // Re-rendre les cartes
            applyFilters();
            
            // Fermer le modal
            closeRatingModal();
            
            // Notification de succès
            showNotification(`Merci pour votre notation ! Nouvelle moyenne: ${result.average}/5`, 'success');
            
            // Track event
            trackEvent('Rating', 'Submit', `promise-${CONFIG.selectedPromiseForRating.id}`, rating);
        } else {
            throw new Error(result.error || 'Erreur inconnue');
        }
    } catch (error) {
        console.error('❌ Erreur soumission notation:', error);
        showNotification(`Erreur: ${error.message || 'Impossible d\'enregistrer votre notation'}`, 'error');
    } finally {
        // Réactiver le bouton
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('show');
    document.body.style.overflow = '';
    CONFIG.selectedPromiseForRating = null;
}

// ==========================================
// PARTAGE AMÉLIORÉ AVEC SUPABASE
// ==========================================
async function sharePromise(promiseId, platform) {
    const promise = CONFIG.promises.find(p => p.id == promiseId);
    if (!promise) return;
    
    // URL de partage
    const shareUrl = `${window.location.origin}${window.location.pathname}#promise-${promiseId}`;
    const text = encodeURIComponent(`J'évalue cet engagement du Président Diomaye Faye : "${promise.engagement.substring(0, 80)}..." - Note: ${promise.average_rating}/5 ⭐`);
    
    let shareLink = '';
    
    switch(platform) {
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}&hashtags=ProjetSenegal,DiomayeFaye,Souverainete`;
            break;
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
        case 'whatsapp':
            shareLink = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`;
            break;
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            break;
        default:
            // Copier dans le presse-papier
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('Lien copié dans le presse-papier !', 'success');
            });
            return;
    }
    
    // Ouvrir la fenêtre de partage
    window.open(shareLink, '_blank', 'width=600,height=400');
    
    // Enregistrer le partage dans Supabase (asynchrone)
    supabaseService.sharePromise(promiseId, platform).then(result => {
        if (result.success) {
            // Mettre à jour le compteur local
            promise.share_count = result.count;
            
            // Re-rendre uniquement cette carte si visible
            const card = document.querySelector(`.promise-card[data-id="${promiseId}"]`);
            if (card) {
                card.querySelector('.share-count').innerHTML = `<i class="fas fa-share-alt"></i> ${result.count} partages`;
            }
            
            trackEvent('Share', platform, `promise-${promiseId}`);
        }
    });
    
    showNotification(`Partagé sur ${platform.charAt(0).toUpperCase() + platform.slice(1)} !`, 'success');
}

// ==========================================
// FONCTIONS UTILITAIRES (inchangées mais exportées correctement)
// ==========================================
// ... [inclure toutes les fonctions utilitaires de la version précédente : 
// calculateDeadline, checkIfLate, calculateProgress, calculateStats, 
// renderAll, animateStats, displaySpotlightPromise, renderNews, shareNews, 
// renderPromisesPaginated, renderPagination, changePage, createCharts, 
// updateCharts, populateSectorFilter, animateValue, updateScrollProgress, 
// showNotification, trackEvent] ...

// Export global
window.CONFIG = CONFIG;
window.supabaseService = supabaseService;
window.openRatingModal = openRatingModal;
window.sharePromise = sharePromise;
window.applyFilters = applyFilters;
window.changePage = changePage;
window.renderNews = renderNews;
window.showNotification = showNotification;
window.animateStats = animateStats;
window.calculateStats = calculateStats;
window.renderPromisesPaginated = renderPromisesPaginated;
window.exportData = exportData;

// Initialiser les étoiles après le chargement du DOM
document.addEventListener('DOMContentLoaded', setupRatingStars);

console.log('✅ Tableau de bord Supabase prêt');
