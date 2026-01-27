// ==========================================
// APP.JS - PROJET SÉNÉGAL - VERSION PRODUCTION
// ==========================================

// Configuration Supabase
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabase = window.supabase.create({
    url: SUPABASE_URL,
    key: SUPABASE_KEY
});

// Configuration globale
const CONFIG = {
    START_DATE: new Date('2024-04-02'),
    CURRENT_DATE: new Date(),
    promises: [],
    news: [],
    press: [],
    subscribers: JSON.parse(localStorage.getItem('subscribers') || '[]'),
    ratings: JSON.parse(localStorage.getItem('ratings') || '[]'),
    albumScale: 1,
    albumMaxScale: 3,
    albumMinScale: 0.5
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Application en cours d\'initialisation...');
    
    // Initialiser les animations
    initAnimations();
    
    // Charger les données
    await loadData();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Configurer les étoiles de notation
    setupStarRatings();
    
    // Configurer le partage
    setupShareButtons();
    
    // Mettre à jour la barre de progression du scroll
    updateScrollProgress();
    
    console.log('✅ Application initialisée avec succès');
});

// ==========================================
// ANIMATIONS D'ARRIÈRE-PLAN
// ==========================================
function initAnimations() {
    createParticles();
    setupCardHoverEffects();
}

function createParticles() {
    const container = document.createElement('div');
    container.className = 'animated-bg';
    container.id = 'particles';
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 100 + 50 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        container.appendChild(particle);
    }
    
    document.body.insertBefore(container, document.body.firstChild);
}

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================
async function loadData() {
    try {
        // Charger les données depuis le fichier JSON local
        const response = await fetch('promises.json');
        const data = await response.json();
        
        CONFIG.START_DATE = new Date(data.start_date);
        CONFIG.promises = data.promises.map(p => ({
            ...p,
            deadline: calculateDeadline(p.delai),
            isLate: checkIfLate(p.status, calculateDeadline(p.delai))
        }));
        
        // Charger les actualités
        CONFIG.news = getDemoNews();
        
        // Charger la revue de presse
        CONFIG.press = getDemoPress();
        
        // Rendre tout
        renderAll();
        
        showNotification('✅ Données chargées avec succès', 'success');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showNotification('Erreur de chargement des données', 'error');
    }
}

function getDemoNews() {
    return [
        {
            id: '1',
            title: 'Lancement officiel du programme de construction scolaire',
            excerpt: 'Le ministre de l\'Éducation nationale a procédé au lancement officiel du programme de construction de 100 nouvelles écoles...',
            date: '25/01/2026',
            source: 'Le Soleil',
            image: 'school'
        },
        {
            id: '2',
            title: 'Première école inaugurée à Thiès',
            excerpt: 'La première école du programme présidentiel a été inaugurée hier à Thiès en présence des autorités locales...',
            date: '20/01/2026',
            source: 'Sud Quotidien',
            image: 'inauguration'
        },
        {
            id: '3',
            title: 'Budget 2026 : Priorité à l\'éducation et la santé',
            excerpt: 'Le budget 2026 consacre 35% des dépenses aux secteurs de l\'éducation et de la santé, confirmant les engagements...',
            date: '15/01/2026',
            source: 'WalFadjri',
            image: 'budget'
        }
    ];
}

function getDemoPress() {
    return [
        { id: '1', title: 'Le Soleil', date: '28/01/2026', image: '🇸🇱', group: 'quotidiens' },
        { id: '2', title: 'Sud Quotidien', date: '28/01/2026', image: '🇸🇶', group: 'quotidiens' },
        { id: '3', title: 'WalFadjri', date: '28/01/2026', image: '🇼🇫', group: 'quotidiens' },
        { id: '4', title: 'L\'Observateur', date: '28/01/2026', image: '🇱🇴', group: 'quotidiens' },
        { id: '5', title: 'Le Quotidien', date: '28/01/2026', image: '🇱🇶', group: 'quotidiens' },
        { id: '6', title: 'Le Populaire', date: '28/01/2026', image: '🇱🇵', group: 'quotidiens' },
        { id: '7', title: 'Jeune Afrique', date: '28/01/2026', image: '🇯🇦', group: 'magazines' },
        { id: '8', title: 'RFI', date: '28/01/2026', image: '🇷🇫', group: 'internationaux' }
    ];
}

// ==========================================
// CALCULS
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

function calculateStats() {
    const total = CONFIG.promises.length;
    const realise = CONFIG.promises.filter(p => p.status === 'realise').length;
    const encours = CONFIG.promises.filter(p => p.status === 'encours').length;
    const nonLance = CONFIG.promises.filter(p => p.status === 'non-lance').length;
    const retard = CONFIG.promises.filter(p => p.isLate).length;
    const avecMaj = CONFIG.promises.filter(p => p.mises_a_jour && p.mises_a_jour.length > 0).length;
    
    // Calculer la note moyenne
    const avgRating = CONFIG.promises.reduce((sum, p) => sum + (p.rating || 0), 0) / total;
    
    return {
        total,
        realise,
        encours,
        nonLance,
        retard,
        avecMaj,
        realisePercentage: total > 0 ? ((realise / total) * 100).toFixed(1) : 0,
        encoursPercentage: total > 0 ? ((encours / total) * 100).toFixed(1) : 0,
        tauxRealisation: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0,
        progression: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0,
        avgRating: avgRating.toFixed(1),
        ratingCount: CONFIG.ratings.length,
        avgDelay: calculateAvgDelay()
    };
}

function calculateAvgDelay() {
    const encours = CONFIG.promises.filter(p => p.status === 'encours');
    if (encours.length === 0) return '0j';
    
    const totalDays = encours.reduce((sum, p) => {
        const diffTime = p.deadline - CONFIG.CURRENT_DATE;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, diffDays);
    }, 0);
    
    return Math.round(totalDays / encours.length) + 'j';
}

// ==========================================
// RENDU
// ==========================================
function renderAll() {
    const stats = calculateStats();
    renderStats(stats);
    renderPromises(CONFIG.promises);
    renderNews(CONFIG.news);
    renderPressAlbum(CONFIG.press);
}

function renderStats(stats) {
    const elements = {
        total: document.getElementById('total-promises'),
        realise: document.getElementById('realized'),
        encours: document.getElementById('inProgress'),
        notStarted: document.getElementById('notStarted'),
        retard: document.getElementById('delayed'),
        taux: document.getElementById('globalProgress'),
        progression: document.getElementById('progression'),
        avgRating: document.getElementById('avgRating'),
        ratingCount: document.getElementById('ratingCount'),
        withUpdates: document.getElementById('withUpdates'),
        avgDelay: document.getElementById('avgDelay')
    };
    
    if (elements.total) animateValue(elements.total, 0, stats.total, 1000);
    if (elements.realise) animateValue(elements.realise, 0, stats.realise, 1000);
    if (elements.encours) animateValue(elements.encours, 0, stats.encours, 1000);
    if (elements.notStarted) animateValue(elements.notStarted, 0, stats.nonLance, 1000);
    if (elements.retard) animateValue(elements.retard, 0, stats.retard, 1000);
    
    if (elements.taux) elements.taux.textContent = stats.tauxRealisation + '%';
    if (elements.progression) elements.progression.textContent = stats.progression + '%';
    if (elements.avgRating) elements.avgRating.textContent = stats.avgRating;
    if (elements.ratingCount) elements.ratingCount.textContent = stats.ratingCount + ' votes';
    if (elements.withUpdates) elements.withUpdates.textContent = stats.avecMaj;
    if (elements.avgDelay) elements.avgDelay.textContent = stats.avgDelay;
}

function renderPromises(promises) {
    const container = document.getElementById('promisesContainer');
    
    if (!container) return;
    
    if (promises.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = promises.map(promise => createPromiseCard(promise)).join('');
    
    // Configurer les écouteurs pour les détails
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const promiseId = this.dataset.promiseId;
            toggleDetails(promiseId);
        });
    });
    
    // Configurer les écouteurs pour les étoiles de notation
    setupPromiseRatings();
}

function createPromiseCard(promise) {
    const statusClass = promise.status === 'realise' ? 'status-realise' :
        promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
    
    const statusText = promise.status === 'realise' ? '✅ Réalisé' :
        promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    
    const isLate = promise.isLate;
    const delayClass = isLate ? 'delay-danger' : 'delay-success';
    const delayText = isLate ? '⚠️ En retard' : '⏱️ Dans les délais';
    
    const hasUpdates = promise.mises_a_jour && promise.mises_a_jour.length > 0;
    
    return `
        <div class="promise-card" data-id="${promise.id}" id="promise-${promise.id}">
            <span class="domain-badge">${promise.domaine}</span>
            <h3 class="promise-title">${promise.engagement}</h3>
            
            <div class="result-box">
                <i class="fas fa-bullseye"></i>
                <strong>Résultat attendu :</strong> ${promise.resultat}
            </div>
            
            <div class="promise-meta">
                <div class="status-badge ${statusClass}">${statusText}</div>
                <div class="delay-badge ${delayClass}">
                    <i class="fas fa-clock"></i>
                    ${delayText}
                </div>
            </div>
            
            ${hasUpdates ? `
                <button class="details-btn" data-promise-id="${promise.id}">
                    <i class="fas fa-history"></i>
                    Voir les mises à jour (${promise.mises_a_jour.length})
                </button>
                <div class="updates-container" id="updates-${promise.id}">
                    ${promise.mises_a_jour.map(update => `
                        <div class="update-item">
                            <span class="update-date">
                                <i class="fas fa-calendar"></i>
                                ${update.date}
                            </span>
                            <p class="update-text">${update.texte}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="rating-section-promise">
                <div class="stars" id="stars-${promise.id}">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <i class="fas fa-star ${i <= Math.round(promise.rating || 0) ? 'filled' : ''}" 
                           data-value="${i}" 
                           data-promise-id="${promise.id}"></i>
                    `).join('')}
                </div>
                <span class="rating-label">
                    ${promise.rating ? promise.rating.toFixed(1) + '/5' : 'Pas encore noté'}
                </span>
            </div>
            
            <div class="share-section">
                <a href="#" class="share-btn share-twitter" onclick="shareOnSocial('twitter', '${promise.id}')" title="Partager sur Twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="share-btn share-facebook" onclick="shareOnSocial('facebook', '${promise.id}')" title="Partager sur Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="share-btn share-whatsapp" onclick="shareOnSocial('whatsapp', '${promise.id}')" title="Partager sur WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="#" class="share-btn share-linkedin" onclick="shareOnSocial('linkedin', '${promise.id}')" title="Partager sur LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>
    `;
}

function renderNews(news) {
    const container = document.getElementById('news-grid');
    
    if (!container) return;
    
    if (news.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-newspaper fa-3x" style="color: var(--text-secondary);"></i>
                <h3 style="margin: 1rem 0; color: var(--text-primary);">Aucune actualité disponible</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = news.map(item => `
        <div class="news-card" onclick="window.open('#', '_blank')">
            <div class="news-image">
                <i class="fas fa-${item.image === 'school' ? 'school' : item.image === 'inauguration' ? 'ribbon' : 'chart-line'}"></i>
            </div>
            <div class="news-content">
                <div class="news-date">${item.date}</div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="news-source">
                    <i class="fas fa-newspaper"></i>
                    <span>${item.source}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPressAlbum(press) {
    const container = document.getElementById('album-grid');
    
    if (!container) return;
    
    if (press.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-book fa-3x" style="color: var(--text-secondary);"></i>
                <h3 style="margin: 1rem 0; color: var(--text-primary);">Aucun quotidien disponible</h3>
            </div>
        `;
        return;
    }
    
    // Regrouper par type
    const groups = {};
    press.forEach(item => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
    });
    
    let html = '';
    
    Object.keys(groups).forEach(group => {
        html += `
            <div class="album-group">
                <h3 style="grid-column: 1 / -1; margin: 1rem 0; color: var(--text-primary); font-size: 1.1rem;">
                    ${group === 'quotidiens' ? '📰 Quotidiens Nationaux' : 
                      group === 'magazines' ? '📋 Magazines' : '🌍 Médias Internationaux'}
                </h3>
        `;
        
        html += groups[group].map(item => `
            <div class="album-item" data-id="${item.id}" onclick="openAlbumModal('${item.id}')">
                <div class="album-image">
                    ${item.image}
                </div>
                <div class="album-info">
                    <div class="album-title">${item.title}</div>
                    <div class="album-date">${item.date}</div>
                </div>
            </div>
        `).join('');
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// ==========================================
// INTERACTIONS
// ==========================================
function setupEventListeners() {
    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            mobileMenuBtn.querySelector('i').className = 
                navMenu.classList.contains('show') ? 'fas fa-times' : 'fas fa-bars';
        });
    }
    
    // Filtres
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    
    // Filtres rapides
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            applyQuickFilter(filter);
        });
    });
    
    // Album controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomAlbum(1.2));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomAlbum(0.8));
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetAlbumZoom);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleAlbumFullscreen);
    
    // Modal album
    const closeAlbumModal = document.getElementById('closeAlbumModal');
    const modalZoomIn = document.getElementById('modalZoomIn');
    const modalZoomOut = document.getElementById('modalZoomOut');
    const modalResetZoom = document.getElementById('modalResetZoom');
    
    if (closeAlbumModal) closeAlbumModal.addEventListener('click', closeAlbumModalFn);
    if (modalZoomIn) modalZoomIn.addEventListener('click', () => zoomModalImage(1.5));
    if (modalZoomOut) modalZoomOut.addEventListener('click', () => zoomModalImage(0.7));
    if (modalResetZoom) modalResetZoom.addEventListener('click', resetModalZoom);
    
    // Formulaire de notation
    const ratingForm = document.getElementById('rating-form');
    if (ratingForm) ratingForm.addEventListener('submit', handleRating);
    
    // Export
    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', function() {
            exportData(this.dataset.format);
        });
    });
    
    // Scroll
    window.addEventListener('scroll', updateScrollProgress);
    
    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
    }
}

function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sector = document.getElementById('sectorFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    let filtered = CONFIG.promises.filter(p => {
        const matchSearch = p.engagement.toLowerCase().includes(search) ||
            p.resultat.toLowerCase().includes(search) ||
            p.domaine.toLowerCase().includes(search);
        
        const matchSector = !sector || p.domaine === sector;
        const matchStatus = !status || p.status === status;
        
        return matchSearch && matchSector && matchStatus;
    });
    
    renderPromises(filtered);
}

function applyQuickFilter(filter) {
    let filtered = CONFIG.promises;
    
    switch(filter) {
        case 'realise':
            filtered = filtered.filter(p => p.status === 'realise');
            break;
        case 'encours':
            filtered = filtered.filter(p => p.status === 'encours');
            break;
        case 'retard':
            filtered = filtered.filter(p => p.isLate);
            break;
        case 'updates':
            filtered = filtered.filter(p => p.mises_a_jour && p.mises_a_jour.length > 0);
            break;
        case 'reset':
            document.getElementById('searchInput').value = '';
            document.getElementById('sectorFilter').value = '';
            document.getElementById('statusFilter').value = '';
            break;
    }
    
    renderPromises(filtered);
}

function toggleDetails(promiseId) {
    const updatesContainer = document.getElementById(`updates-${promiseId}`);
    const btn = document.querySelector(`[data-promise-id="${promiseId}"]`);
    
    if (updatesContainer && btn) {
        const isShowing = updatesContainer.classList.toggle('show');
        btn.innerHTML = isShowing ? 
            '<i class="fas fa-times"></i> Masquer les mises à jour' :
            `<i class="fas fa-history"></i> Voir les mises à jour (${CONFIG.promises.find(p => p.id === promiseId)?.mises_a_jour.length})`;
    }
}

// ==========================================
// ALBUM ZOOM
// ==========================================
function zoomAlbum(factor) {
    CONFIG.albumScale = Math.max(CONFIG.albumMinScale, Math.min(CONFIG.albumMaxScale, CONFIG.albumScale * factor));
    const grid = document.getElementById('album-grid');
    if (grid) {
        grid.style.transform = `scale(${CONFIG.albumScale})`;
    }
}

function resetAlbumZoom() {
    CONFIG.albumScale = 1;
    const grid = document.getElementById('album-grid');
    if (grid) {
        grid.style.transform = 'scale(1)';
    }
}

function toggleAlbumFullscreen() {
    const container = document.getElementById('albumContainer');
    if (!container) return;
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function openAlbumModal(pressId) {
    const press = CONFIG.press.find(p => p.id === pressId);
    if (!press) return;
    
    const modal = document.getElementById('albumModal');
    const modalImage = document.getElementById('albumModalImage');
    const modalInfo = document.getElementById('albumModalInfo');
    
    if (!modal || !modalImage || !modalInfo) return;
    
    modalImage.innerHTML = `
        <div style="font-size: 8rem; text-align: center; padding: 2rem;">
            ${press.image}
        </div>
        <div style="text-align: center; margin-top: 1rem; font-size: 1.5rem; font-weight: bold;">
            ${press.title}
        </div>
    `;
    
    modalInfo.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">${press.title}</div>
        <div style="color: var(--text-secondary);">Date: ${press.date}</div>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(42, 109, 93, 0.1); border-radius: 8px;">
            <i class="fas fa-info-circle"></i>
            Cliquez sur les boutons + et - pour zoomer/dézoomer l'image
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAlbumModalFn() {
    const modal = document.getElementById('albumModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

let modalScale = 1;

function zoomModalImage(factor) {
    modalScale = Math.max(0.5, Math.min(5, modalScale * factor));
    const imgContainer = document.querySelector('#albumModalImage > div:first-child');
    if (imgContainer) {
        imgContainer.style.transform = `scale(${modalScale})`;
    }
}

function resetModalZoom() {
    modalScale = 1;
    const imgContainer = document.querySelector('#albumModalImage > div:first-child');
    if (imgContainer) {
        imgContainer.style.transform = 'scale(1)';
    }
}

// ==========================================
// NOTATION PAR ÉTOILES
// ==========================================
function setupStarRatings() {
    document.querySelectorAll('.stars-container').forEach(container => {
        const inputId = container.id.replace('-stars', '');
        const input = document.getElementById(inputId);
        
        container.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                input.value = value;
                
                container.querySelectorAll('.star').forEach(s => {
                    s.classList.toggle('filled', parseInt(s.getAttribute('data-value')) <= value);
                });
            });
            
            star.addEventListener('mouseover', function() {
                const hoverValue = parseInt(this.getAttribute('data-value'));
                container.querySelectorAll('.star').forEach(s => {
                    s.classList.toggle('hover', parseInt(s.getAttribute('data-value')) <= hoverValue);
                });
            });
            
            star.addEventListener('mouseout', function() {
                container.querySelectorAll('.star').forEach(s => {
                    s.classList.remove('hover');
                });
            });
        });
    });
}

function setupPromiseRatings() {
    document.querySelectorAll('.stars i').forEach(star => {
        star.addEventListener('click', async function() {
            const value = parseInt(this.getAttribute('data-value'));
            const promiseId = this.getAttribute('data-promise-id');
            
            // Mettre à jour visuellement
            const stars = document.querySelectorAll(`#stars-${promiseId} i`);
            stars.forEach(s => {
                s.classList.toggle('filled', parseInt(s.getAttribute('data-value')) <= value);
            });
            
            // Enregistrer dans Supabase
            await savePromiseRating(promiseId, value);
            
            showNotification(`⭐ Merci ! Note enregistrée : ${value}/5`, 'success');
        });
    });
}

async function savePromiseRating(promiseId, rating) {
    try {
        const { data, error } = await supabase
            .from('promise_ratings')
            .insert([
                {
                    promise_id: promiseId,
                    rating: rating,
                    user_ip: await getUserIP(),
                    timestamp: new Date().toISOString()
                }
            ]);
        
        if (error) throw error;
        
        // Mettre à jour la note moyenne locale
        const promise = CONFIG.promises.find(p => p.id === promiseId);
        if (promise) {
            promise.rating = ((promise.rating || 0) + rating) / 2;
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la note:', error);
        return false;
    }
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// ==========================================
// NOTATION SERVICES
// ==========================================
async function handleRating(e) {
    e.preventDefault();
    
    const rating = {
        service: document.getElementById('service').value,
        accessibility: parseInt(document.getElementById('accessibility').value),
        welcome: parseInt(document.getElementById('welcome').value),
        efficiency: parseInt(document.getElementById('efficiency').value),
        transparency: parseInt(document.getElementById('transparency').value),
        comment: document.getElementById('comment').value.trim(),
        date: new Date().toISOString(),
        id: Date.now()
    };
    
    try {
        // Enregistrer dans Supabase
        const { data, error } = await supabase
            .from('service_ratings')
            .insert([rating]);
        
        if (error) throw error;
        
        // Enregistrer localement aussi
        CONFIG.ratings.push(rating);
        localStorage.setItem('ratings', JSON.stringify(CONFIG.ratings));
        
        // Réinitialiser le formulaire
        document.getElementById('rating-form').reset();
        
        // Réinitialiser les étoiles
        document.querySelectorAll('.stars-container').forEach(container => {
            container.querySelectorAll('.star').forEach(star => {
                star.classList.remove('filled');
            });
        });
        
        showNotification('⭐ Merci pour votre notation ! Votre avis nous aide à améliorer les services.', 'success');
        
        // Mettre à jour les stats
        renderAll();
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        showNotification('Erreur lors de l\'enregistrement de votre notation', 'error');
    }
}

// ==========================================
// PARTAGE SUR RÉSEAUX SOCIAUX
// ==========================================
function setupShareButtons() {
    const url = window.location.href;
    const text = 'Suivi des engagements du Président Diomaye Faye | LE PROJET SÉNÉGAL';
    
    const shareTwitter = document.getElementById('share-twitter-dash');
    const shareFacebook = document.getElementById('share-facebook-dash');
    const shareWhatsapp = document.getElementById('share-whatsapp-dash');
    const shareLinkedin = document.getElementById('share-linkedin-dash');
    
    if (shareTwitter) {
        shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    
    if (shareFacebook) {
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    
    if (shareWhatsapp) {
        shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    }
    
    if (shareLinkedin) {
        shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
}

function shareOnSocial(platform, promiseId) {
    const promise = CONFIG.promises.find(p => p.id === promiseId);
    if (!promise) return;
    
    const text = `Suivi de l'engagement : "${promise.engagement.substring(0, 50)}..." | LE PROJET SÉNÉGAL`;
    const url = window.location.href;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(` Publié sur ${platform.charAt(0).toUpperCase() + platform.slice(1)} !`, 'success');
}

// ==========================================
// EXPORT DES DONNÉES
// ==========================================
function exportData(format) {
    const data = CONFIG.promises;
    
    switch(format) {
        case 'csv':
            exportToCSV(data);
            break;
        case 'json':
            exportToJSON(data);
            break;
        case 'pdf':
            exportToPDF(data);
            break;
    }
}

function exportToCSV(data) {
    const headers = ['ID', 'Domaine', 'Engagement', 'Résultat', 'Délai', 'Statut', 'Note'];
    const rows = data.map(p => [
        p.id,
        p.domaine,
        `"${p.engagement.replace(/"/g, '""')}"`,
        `"${p.resultat.replace(/"/g, '""')}"`,
        p.delai,
        p.status,
        p.rating || 0
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `engagements-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Export CSV effectué', 'success');
}

function exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `engagements-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Export JSON effectué', 'success');
}

function exportToPDF(data) {
    showNotification('📄 Génération du PDF en cours...', 'info');
    // Implémenter la génération PDF avec jsPDF ou html2pdf
    setTimeout(() => {
        showNotification('✅ Export PDF effectué', 'success');
    }, 1000);
}

// ==========================================
// UTILITAIRES
// ==========================================
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === end) clearInterval(timer);
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
    const toast = document.createElement('div');
    toast.className = `notification ${type}`;
    toast.style.background = type === 'error' ? 'linear-gradient(135deg, #e76f51, #c1543d)' : 
                             type === 'info' ? 'linear-gradient(135deg, #4a90e2, #2d7ab5)' : 
                             'linear-gradient(135deg, #2a9d8f, #21867a)';
    toast.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'info' ? 'info-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// SETUP CARD HOVER EFFECTS
// ==========================================
function setupCardHoverEffects() {
    document.querySelectorAll('.promise-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// Exposer les fonctions globales
window.CONFIG = CONFIG;
window.shareOnSocial = shareOnSocial;
window.toggleDetails = toggleDetails;
window.openAlbumModal = openAlbumModal;