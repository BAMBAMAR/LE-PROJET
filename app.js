// ==========================================
// APP.JS - Tableau de bord avec Supabase - VERSION CORRIGÉE
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
    
    // Vérifier que Supabase est chargé
    if (typeof supabaseService === 'undefined') {
        console.error('❌ Supabase non chargé - vérifiez l\'ordre des scripts');
        showNotification('Service de données temporairement indisponible', 'error');
        // Charger les données de démo
        CONFIG.promises = supabaseService?.loadDemoData?.() || getFallbackDemoData();
        CONFIG.news = supabaseService?.loadDemoNews?.() || getFallbackDemoNews();
        initAfterDataLoad();
        return;
    }
    
    // Initialiser les animations (sans AOS)
    initAnimations();
    
    // Charger les données depuis Supabase
    try {
        await Promise.all([
            loadPromisesFromSupabase(),
            loadNewsFromSupabase()
        ]);
        initAfterDataLoad();
    } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        showNotification('Erreur chargement des données - mode démo activé', 'warning');
        // Fallback sur données de démo
        CONFIG.promises = supabaseService.loadDemoData();
        CONFIG.news = supabaseService.loadDemoNews();
        initAfterDataLoad();
    }
});

function initAfterDataLoad() {
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
    showNotification('Bienvenue sur le tableau de bord citoyen du Projet Sénégal !', 'info');
}

// ==========================================
// ANIMATIONS SANS DÉPENDANCES EXTERNES
// ==========================================
function initAnimations() {
    createParticles();
    // setupCardHoverEffects(); // SUPPRIMÉ - fonction non définie
    setupScrollAnimations();
}

function createParticles() {
    const container = document.createElement('div');
    container.className = 'animated-bg';
    container.id = 'particles';
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 120 + 60 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 30 + 's';
        particle.style.animationDuration = Math.random() * 30 + 15 + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        container.appendChild(particle);
    }
    
    document.body.insertBefore(container, document.body.firstChild);
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.stat-card, .promise-card, .chart-container').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

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
        throw error;
    }
}

async function loadNewsFromSupabase() {
    try {
        CONFIG.news = await supabaseService.loadNews();
        renderNews('latest');
        console.log('✅ Actualités chargées depuis Supabase');
    } catch (error) {
        console.error('❌ Erreur chargement actualités:', error);
        throw error;
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
        <p><strong>Note actuelle:</strong> ${promise.average_rating || 0}/5 (${promise.rating_count || 0} votes)</p>
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
            const currentRating = document.querySelector('.star-large.active')?.getAttribute('data-value') || '0';
            highlightStars(parseInt(currentRating));
        });
    });
    
    // Soumission du formulaire
    document.getElementById('submitRatingBtn')?.addEventListener('click', submitRating);
    
    // Fermeture du modal
    document.getElementById('closeRatingModal')?.addEventListener('click', closeRatingModal);
    document.getElementById('ratingModal')?.addEventListener('click', (e) => {
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
            showNotification(`Merci pour votre notation ! Nouvelle moyenne: ${result.average}/5 ⭐`, 'success');
            
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
// FONCTIONS UTILITAIRES
// ==========================================
function calculateDeadline(delaiText) {
    const text = delaiText.toLowerCase();
    const result = new Date(CONFIG.START_DATE);
    
    if (text.includes('immédiat') || text.includes('3 mois')) {
        result.setMonth(result.getMonth() + 3);
    } else if (text.includes('6 mois')) {
        result.setMonth(result.getMonth() + 6);
    } else if (text.includes('1 an') || text.includes('12 mois')) {
        result.setFullYear(result.getFullYear() + 1);
    } else if (text.includes('2 ans')) {
        result.setFullYear(result.getFullYear() + 2);
    } else if (text.includes('3 ans')) {
        result.setFullYear(result.getFullYear() + 3);
    } else if (text.includes('5 ans') || text.includes('quinquennat')) {
        result.setFullYear(result.getFullYear() + 5);
    } else {
        result.setFullYear(result.getFullYear() + 5);
    }
    
    return result;
}

function checkIfLate(status, deadline) {
    return status !== 'realise' && CONFIG.CURRENT_DATE > deadline;
}

function calculateProgress(status) {
    switch(status) {
        case 'realise': return 100;
        case 'encours': return 50;
        case 'non-lance': return 0;
        default: return 0;
    }
}

function calculateStats() {
    const total = CONFIG.promises.length;
    const realise = CONFIG.promises.filter(p => p.status === 'realise').length;
    const encours = CONFIG.promises.filter(p => p.status === 'encours').length;
    const nonLance = CONFIG.promises.filter(p => p.status === 'non-lance').length;
    const retard = CONFIG.promises.filter(p => p.isLate).length;
    const withUpdates = CONFIG.promises.filter(p => p.mises_a_jour && p.mises_a_jour.length > 0).length;
    
    // Domaine principal
    const domains = CONFIG.promises.reduce((acc, p) => {
        acc[p.domaine] = (acc[p.domaine] || 0) + 1;
        return acc;
    }, {});
    
    const mainDomain = Object.entries(domains).sort(([,a], [,b]) => b - a)[0];
    
    // Prochaines échéances (30 jours)
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const upcomingDeadlines = CONFIG.promises.filter(p => 
        p.deadline <= next30Days && p.status !== 'realise'
    ).length;
    
    return {
        total,
        realise,
        encours,
        nonLance,
        retard,
        withUpdates,
        realisePercentage: total > 0 ? ((realise / total) * 100).toFixed(1) : 0,
        encoursPercentage: total > 0 ? ((encours / total) * 100).toFixed(1) : 0,
        retardPercentage: total > 0 ? ((retard / total) * 100).toFixed(1) : 0,
        updatesPercentage: total > 0 ? ((withUpdates / total) * 100).toFixed(1) : 0,
        tauxRealisation: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0,
        mainDomain: mainDomain ? mainDomain[0] : '-',
        mainDomainCount: mainDomain ? mainDomain[1] : 0,
        upcomingDeadlines
    };
}

function renderAll() {
    const stats = calculateStats();
    animateStats(stats);
    renderPromisesPaginated(CONFIG.promises, CONFIG.currentPage);
    updateCharts(stats);
}

function animateStats(stats) {
    setTimeout(() => animateValue(document.getElementById('total-promises'), 0, stats.total, 1500), 100);
    setTimeout(() => animateValue(document.getElementById('realized'), 0, stats.realise, 1500), 200);
    setTimeout(() => animateValue(document.getElementById('inProgress'), 0, stats.encours, 1500), 300);
    setTimeout(() => animateValue(document.getElementById('delayed'), 0, stats.retard, 1500), 400);
    setTimeout(() => animateValue(document.getElementById('withUpdates'), 0, stats.withUpdates, 1500), 500);
    setTimeout(() => animateValue(document.getElementById('nextDeadlines'), 0, stats.upcomingDeadlines, 1500), 600);
    
    setTimeout(() => {
        document.getElementById('globalProgress').textContent = stats.tauxRealisation + '%';
        document.getElementById('realized-percentage').textContent = stats.realisePercentage + '%';
        document.getElementById('inprogress-percentage').textContent = stats.encoursPercentage + '%';
        document.getElementById('delayed-percentage').textContent = stats.retardPercentage + '%';
        document.getElementById('updates-percentage').textContent = stats.updatesPercentage + '%';
        document.getElementById('mainDomain').textContent = stats.mainDomain;
        document.getElementById('domainCount').textContent = `${stats.mainDomainCount} engagements`;
        
        const progressBar = document.getElementById('progressBarFill');
        if (progressBar) {
            progressBar.style.width = stats.tauxRealisation + '%';
        }
    }, 700);
}

function displaySpotlightPromise() {
    if (CONFIG.promises.length === 0) return;
    
    const unreached = CONFIG.promises.filter(p => p.status !== 'realise');
    const spotlightPromise = unreached.length > 0 
        ? unreached[Math.floor(Math.random() * unreached.length)]
        : CONFIG.promises[Math.floor(Math.random() * CONFIG.promises.length)];
    
    const spotlightCard = document.getElementById('spotlightCard');
    if (!spotlightCard) return;
    
    // Formatage des étoiles pour la promesse du jour
    const starsHTML = [1,2,3,4,5].map(i => `
        <i class="fas fa-star ${spotlightPromise.average_rating >= i ? 'star-filled' : 
                               spotlightPromise.average_rating > i - 0.5 ? 'star-half' : 'star-empty'}"></i>
    `).join('');
    
    spotlightCard.innerHTML = `
        <div class="spotlight-badge">
            <i class="fas fa-star"></i> Promesse du Jour
        </div>
        <h3 class="spotlight-title">${spotlightPromise.engagement}</h3>
        <div class="spotlight-result">
            <strong>Résultat attendu :</strong> ${spotlightPromise.resultat}
        </div>
        <div class="spotlight-meta">
            <div class="spotlight-meta-item">
                <div class="spotlight-meta-label">Domaine</div>
                <div class="spotlight-meta-value">${spotlightPromise.domaine}</div>
            </div>
            <div class="spotlight-meta-item">
                <div class="spotlight-meta-label">Statut</div>
                <div class="spotlight-meta-value">
                    <span class="status-badge status-${spotlightPromise.status === 'realise' ? 'realise' : spotlightPromise.status === 'encours' ? 'encours' : 'nonlance'}">
                        ${spotlightPromise.status === 'realise' ? '✅ Réalisé' : spotlightPromise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé'}
                    </span>
                </div>
            </div>
            <div class="spotlight-meta-item">
                <div class="spotlight-meta-label">Note citoyenne</div>
                <div class="spotlight-meta-value">
                    <div class="stars" style="justify-content: center; gap: 3px; margin-bottom: 4px;">
                        ${starsHTML}
                    </div>
                    <span style="font-weight: 800; color: var(--primary);">${spotlightPromise.average_rating || 0}/5</span>
                </div>
            </div>
            <div class="spotlight-meta-item">
                <div class="spotlight-meta-label">Délai</div>
                <div class="spotlight-meta-value">${spotlightPromise.delai}</div>
            </div>
        </div>
        <div class="progress-container" style="margin-top: 1.5rem;">
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${spotlightPromise.progress || 0}%; height: 12px;"></div>
            </div>
        </div>
        <button class="rate-btn" style="margin-top: 1rem; width: 100%;" onclick="window.openRatingModal('${spotlightPromise.id}')">
            <i class="fas fa-star"></i> Noter cette promesse
        </button>
    `;
}

function renderNews(tabType = 'latest') {
    const newsContent = document.getElementById('newsContent');
    if (!newsContent) return;
    
    const filteredNews = CONFIG.news.filter(news => news.type === tabType || tabType === 'latest');
    
    if (filteredNews.length === 0) {
        newsContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-newspaper fa-3x" style="color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary);">Aucune actualité disponible pour le moment</p>
            </div>
        `;
        return;
    }
    
    newsContent.innerHTML = filteredNews.map(news => `
        <div class="news-item">
            <div class="news-date">
                <span class="news-date-day">${news.date.split(' ')[0]}</span>
                <span class="news-date-month">${news.date.split(' ')[1]}</span>
            </div>
            <div class="news-content-text">
                <h4 class="news-title">${news.title}</h4>
                <p class="news-excerpt">${news.excerpt}</p>
                <div class="news-meta">
                    <span class="news-source">
                        <i class="fas fa-newspaper"></i> ${news.source}
                    </span>
                </div>
                <div class="news-actions">
                    <a href="${news.url}" class="news-btn news-btn-read">
                        <i class="fas fa-book-open"></i> Lire plus
                    </a>
                    <a href="#" class="news-btn news-btn-share" onclick="window.shareNews?.(${news.id}); return false;">
                        <i class="fas fa-share-alt"></i> Partager
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function shareNews(newsId) {
    const news = CONFIG.news.find(n => n.id === newsId);
    if (news) {
        const text = encodeURIComponent(`Actualité: ${news.title} - ${news.excerpt.substring(0, 100)}...`);
        const url = encodeURIComponent(window.location.href);
        
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            '_blank',
            'width=600,height=400'
        );
        
        showNotification('Actualité partagée avec succès !', 'success');
    }
}

function renderPromisesPaginated(promises, page) {
    const startIndex = (page - 1) * CONFIG.itemsPerPage;
    const paginatedPromises = promises.slice(startIndex, startIndex + CONFIG.itemsPerPage);
    
    renderPromises(paginatedPromises);
    renderPagination(Math.ceil(promises.length / CONFIG.itemsPerPage), page);
}

function renderPagination(totalPages, currentPage) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.style.display = 'none';
        return;
    }
    
    paginationEl.style.display = 'flex';
    paginationEl.style.justifyContent = 'center';
    paginationEl.style.marginTop = '2rem';
    paginationEl.style.gap = '0.5rem';
    
    let html = '';
    
    html += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="window.changePage?.(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.changePage?.(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }
    
    html += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="window.changePage?.(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationEl.innerHTML = html;
}

function changePage(page) {
    CONFIG.currentPage = page;
    applyFilters();
    window.scrollTo({ top: document.getElementById('promises')?.offsetTop - 100 || 0, behavior: 'smooth' });
}

function createCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js non chargé');
        return;
    }
    
    const stats = calculateStats();
    
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        CONFIG.charts.status = new Chart(statusCtx, {
            type: 'doughnut',
             {
                labels: ['Réalisés', 'En Cours', 'En Retard', 'Non Lancés'],
                datasets: [{
                    data: [stats.realise, stats.encours, stats.retard, stats.nonLance],
                    backgroundColor: [
                        'rgba(42, 157, 143, 0.85)',
                        'rgba(74, 144, 226, 0.85)',
                        'rgba(231, 111, 81, 0.85)',
                        'rgba(108, 117, 125, 0.85)'
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#495057',
                            font: { family: 'Poppins', size: 11 },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#2a6d5d',
                        bodyColor: '#495057',
                        borderColor: '#dee2e6',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                cutout: '65%'
            }
        });
    }
    
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        CONFIG.charts.monthly = new Chart(monthlyCtx, {
            type: 'bar',
             {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [{
                    label: 'Engagements Réalisés',
                     [3, 5, 4, 6, 4, 3],
                    backgroundColor: 'rgba(42, 157, 143, 0.8)',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#495057', font: { family: 'Poppins' } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(184, 193, 236, 0.1)' },
                        ticks: { color: '#495057', font: { family: 'Poppins' } }
                    }
                }
            }
        });
    }
    
    const timelineCtx = document.getElementById('timelineChart');
    if (timelineCtx) {
        CONFIG.charts.timeline = new Chart(timelineCtx, {
            type: 'line',
             {
                labels: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan'],
                datasets: [{
                    label: 'Taux de Réalisation',
                     [10, 15, 22, 28, 35, 42, 48, 55, 62, 68],
                    borderColor: 'rgba(42, 109, 93, 1)',
                    backgroundColor: 'rgba(42, 109, 93, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'white',
                    pointBorderColor: 'rgba(42, 109, 93, 1)',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#495057', font: { family: 'Poppins' } }
                    },
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(184, 193, 236, 0.1)' },
                        ticks: { 
                            color: '#495057', 
                            font: { family: 'Poppins' },
                            callback: v => v + '%'
                        }
                    }
                }
            }
        });
    }
}

function updateCharts(stats) {
    if (CONFIG.charts.status) {
        CONFIG.charts.status.data.datasets[0].data = [
            stats.realise, stats.encours, stats.retard, stats.nonLance
        ];
        CONFIG.charts.status.update('none');
    }
}

function populateSectorFilter() {
    const sectorFilter = document.getElementById('sectorFilter');
    if (!sectorFilter) return;
    
    const domains = [...new Set(CONFIG.promises.map(p => p.domaine))].sort();
    
    domains.forEach(domain => {
        if (!sectorFilter.querySelector(`option[value="${domain}"]`)) {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            sectorFilter.appendChild(option);
        }
    });
}

function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    if (!scrollProgress) return;
    
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    scrollProgress.style.width = scrolled + '%';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) return;
    
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    
    void notification.offsetWidth;
    notification.style.animation = 'none';
    setTimeout(() => { notification.style.animation = ''; }, 10);
}

function trackEvent(category, action, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, { event_category: category, event_label: label, value: value });
    }
    if (typeof _paq !== 'undefined') {
        _paq.push(['trackEvent', category, action, label, value]);
    }
    console.log(`📊 Event: ${category} - ${action} - ${label}${value ? ` (${value})` : ''}`);
}

// Données de secours
function getFallbackDemoData() {
    return [
        {
            id: 1,
            domaine: 'Éducation',
            engagement: 'Gratuité totale des frais scolaires dans le public',
            resultat: 'Tous les élèves du public dispensés de payer les frais scolaires',
            delai: 'Immédiat',
            status: 'realise',
            mises_a_jour: [
                { date: '2024-04-15', texte: 'Décret présidentiel signé', source: 'Journal Officiel' },
                { date: '2024-05-02', texte: 'Mise en œuvre effective dans toutes les écoles', source: 'Ministère de l\'Éducation' }
            ],
            average_rating: 4.7,
            rating_count: 243,
            share_count: 1892,
            progress: 100,
            isLate: false,
            deadline: new Date('2024-07-02')
        }
    ];
}

function getFallbackDemoNews() {
    return [
        {
            id: 1,
            date: '27 Jan',
            title: 'Lancement du programme d\'autonomisation des femmes',
            excerpt: 'Le gouvernement annonce le lancement officiel...',
            source: 'APS',
            type: 'latest',
            url: '#'
        }
    ];
}

// Export global - SÉCURISÉ
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
window.displaySpotlightPromise = displaySpotlightPromise;
window.trackEvent = trackEvent;

// Initialiser les étoiles après le chargement
document.addEventListener('DOMContentLoaded', () => {
    setupRatingStars();
    console.log('📊 Tableau de bord ProjetBI prêt');
});
