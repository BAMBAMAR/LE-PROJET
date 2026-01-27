// ==========================================
// APP.JS - VERSION FINALE CORRIGÉE (SANS DOUBLONS)
// ==========================================

// Configuration Supabase - UNE SEULE DÉCLARATION
const SUPABASE_URL = 'https://jwsdxttjjbfnoufiidkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_joJuW7-vMiQG302_2Mvj5A_sVaD8Wap';
let supabaseClient = null;

try {
    if (window.supabase) {
        supabaseClient = window.supabase.create({
            url: SUPABASE_URL,
            key: SUPABASE_KEY
        });
        console.log('✅ Supabase initialisé');
    } else {
        console.warn('⚠️ Supabase SDK non disponible');
    }
} catch (error) {
    console.error('❌ Erreur d\'initialisation Supabase:', error);
}

// Configuration globale - UNE SEULE DÉCLARATION
const CONFIG = {
    START_DATE: new Date('2024-04-02'),
    CURRENT_DATE: new Date(),
    promises: [],
    news: [],
    press: [
        { id: '1', title: 'Le Soleil', date: '28/01/2026', image: '🇸🇱' },
        { id: '2', title: 'Sud Quotidien', date: '28/01/2026', image: '🇸🇶' },
        { id: '3', title: 'WalFadjri', date: '28/01/2026', image: '🇼🇫' },
        { id: '4', title: 'L\'Observateur', date: '28/01/2026', image: '🇱🇴' },
        { id: '5', title: 'Le Quotidien', date: '28/01/2026', image: '🇱🇶' }
    ],
    currentIndex: 0,
    subscribers: JSON.parse(localStorage.getItem('subscribers') || '[]'),
    ratings: JSON.parse(localStorage.getItem('ratings') || '[]')
};

// Gestion sécurisée du localStorage
const safeStorage = {
    getItem: function(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: function(key, value) {
        try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
    }
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation...');
    await loadData();
    setupEventListeners();
    setupCarousel();
    setupStarRatings();
    console.log('✅ Initialisation terminée');
});

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================
async function loadData() {
    try {
        const response = await fetch('promises.json');
        const data = await response.json();
        
        CONFIG.START_DATE = new Date(data.start_date);
        CONFIG.promises = data.promises.map(p => ({
            ...p,
            deadline: calculateDeadline(p.delai),
            isLate: checkIfLate(p.status, calculateDeadline(p.delai))
        }));
        
        CONFIG.news = [
            {
                id: '1',
                title: 'Lancement officiel du programme de construction scolaire',
                excerpt: 'Le ministre de l\'Éducation nationale a procédé au lancement officiel...',
                date: '25/01/2026',
                source: 'Le Soleil',
                image: 'school'
            },
            {
                id: '2',
                title: 'Première école inaugurée à Thiès',
                excerpt: 'La première école du programme présidentiel a été inaugurée...',
                date: '20/01/2026',
                source: 'Sud Quotidien',
                image: 'inauguration'
            },
            {
                id: '3',
                title: 'Budget 2026 : Priorité à l\'éducation et la santé',
                excerpt: 'Le budget 2026 consacre 35% des dépenses...',
                date: '15/01/2026',
                source: 'WalFadjri',
                image: 'budget'
            }
        ];
        
        renderAll();
        renderNews(CONFIG.news);
        renderPressCarousel();
        
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        showNotification('Erreur de chargement des données', 'error');
    }
}

// ==========================================
// CALCULS ORIGINAUX
// ==========================================
function calculateDeadline(delaiText) {
    const text = delaiText.toLowerCase();
    const result = new Date(CONFIG.START_DATE);
    
    if (text.includes('3 mois')) result.setMonth(result.getMonth() + 3);
    else if (text.includes('6 mois')) result.setMonth(result.getMonth() + 6);
    else if (text.includes('1 an') || text.includes('12 mois')) result.setFullYear(result.getFullYear() + 1);
    else if (text.includes('2 ans')) result.setFullYear(result.getFullYear() + 2);
    else if (text.includes('3 ans')) result.setFullYear(result.getFullYear() + 3);
    else if (text.includes('5 ans') || text.includes('quinquennat')) result.setFullYear(result.getFullYear() + 5);
    else result.setFullYear(result.getFullYear() + 5);
    
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
    const avecMaj = CONFIG.promises.filter(p => p.mises_a_jour?.length > 0).length;
    
    // CALCULS EXACTS DE LA VERSION ORIGINALE
    const tauxRealisation = total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0;
    const progression = tauxRealisation;
    const avgRating = CONFIG.promises.reduce((sum, p) => sum + (p.rating || 0), 0) / total;
    const avgDelay = calculateAvgDelay();
    
    return {
        total, realise, encours, nonLance, retard, avecMaj,
        realisePercentage: total > 0 ? ((realise / total) * 100).toFixed(1) : 0,
        encoursPercentage: total > 0 ? ((encours / total) * 100).toFixed(1) : 0,
        tauxRealisation, progression,
        avgRating: avgRating.toFixed(1),
        ratingCount: CONFIG.ratings.length,
        avecMajPercentage: total > 0 ? ((avecMaj / total) * 100).toFixed(1) : 0,
        avgDelay
    };
}

function calculateAvgDelay() {
    const encours = CONFIG.promises.filter(p => p.status === 'encours');
    if (encours.length === 0) return '0j';
    
    const totalDays = encours.reduce((sum, p) => {
        const diff = p.deadline - CONFIG.CURRENT_DATE;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, days);
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
}

function renderStats(stats) {
    const map = {
        total: 'total-promises', realise: 'realized', encours: 'inProgress',
        notStarted: 'notStarted', retard: 'delayed', taux: 'globalProgress',
        progression: 'progression', avgRating: 'avgRating', ratingCount: 'ratingCount',
        withUpdates: 'withUpdates', avgDelay: 'avgDelay'
    };
    
    Object.entries(map).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (key === 'total') animateValue(el, 0, stats.total, 1000);
        else if (key === 'realise') animateValue(el, 0, stats.realise, 1000);
        else if (key === 'encours') animateValue(el, 0, stats.encours, 1000);
        else if (key === 'notStarted') animateValue(el, 0, stats.nonLance, 1000);
        else if (key === 'retard') animateValue(el, 0, stats.retard, 1000);
        else if (key === 'taux') el.textContent = stats.tauxRealisation + '%';
        else if (key === 'progression') el.textContent = stats.progression + '%';
        else if (key === 'avgRating') el.textContent = stats.avgRating;
        else if (key === 'ratingCount') el.textContent = stats.ratingCount + ' votes';
        else if (key === 'withUpdates') el.textContent = stats.avecMaj;
        else if (key === 'avgDelay') el.textContent = stats.avgDelay;
    });
}

function renderPromises(promises) {
    const container = document.getElementById('promisesContainer');
    if (!container) return;
    
    if (promises.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem">
                <i class="fas fa-search fa-3x" style="color:var(--text-secondary)"></i>
                <h3 style="margin:1rem 0;color:var(--text-primary)">Aucun résultat trouvé</h3>
                <p style="color:var(--text-secondary)">Essayez de modifier vos critères de recherche</p>
            </div>`;
        return;
    }
    
    container.innerHTML = promises.map(p => createPromiseCard(p)).join('');
    setupPromiseRatings();
}

function createPromiseCard(p) {
    const statusClass = p.status === 'realise' ? 'status-realise' : 
                       p.status === 'encours' ? 'status-encours' : 'status-nonlance';
    const statusText = p.status === 'realise' ? '✅ Réalisé' : 
                      p.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    const delayClass = p.isLate ? 'delay-danger' : 'delay-success';
    const delayText = p.isLate ? '⚠️ En retard' : '⏱️ Dans les délais';
    const hasUpdates = p.mises_a_jour?.length > 0;
    
    return `
        <div class="promise-card" data-id="${p.id}">
            <span class="domain-badge">${p.domaine}</span>
            <h3 class="promise-title">${p.engagement}</h3>
            <div class="result-box">
                <i class="fas fa-bullseye"></i>
                <strong>Résultat attendu :</strong> ${p.resultat}
            </div>
            <div class="promise-meta">
                <div class="status-badge ${statusClass}">${statusText}</div>
                <div class="delay-badge ${delayClass}">
                    <i class="fas fa-clock"></i> ${delayText}
                </div>
            </div>
            ${hasUpdates ? `
                <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
                    <small style="color:var(--text-secondary)">
                        <i class="fas fa-history"></i> 
                        ${p.mises_a_jour.length} mise${p.mises_a_jour.length > 1 ? 's' : ''} à jour
                    </small>
                </div>` : ''}
            <div class="rating-section-promise">
                <div class="stars" id="stars-${p.id}">
                    ${[1,2,3,4,5].map(i => `
                        <i class="fas fa-star ${i <= Math.round(p.rating || 0) ? 'filled' : ''}" 
                           data-value="${i}" data-promise-id="${p.id}"></i>`).join('')}
                </div>
                <span class="rating-label">${p.rating ? p.rating.toFixed(1) + '/5' : 'Pas encore noté'}</span>
            </div>
            <div class="share-section">
                <a href="#" class="share-btn share-twitter" onclick="shareOnSocial('twitter','${p.id}')" title="Partager sur Twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="share-btn share-facebook" onclick="shareOnSocial('facebook','${p.id}')" title="Partager sur Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="share-btn share-whatsapp" onclick="shareOnSocial('whatsapp','${p.id}')" title="Partager sur WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="#" class="share-btn share-linkedin" onclick="shareOnSocial('linkedin','${p.id}')" title="Partager sur LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>`;
}

function renderNews(news) {
    const container = document.getElementById('news-grid');
    if (!container) return;
    
    container.innerHTML = news.map(item => `
        <div class="news-card">
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
        </div>`).join('');
}

// ==========================================
// CAROUSEL REVUE DE PRESSE (EBOOK STYLE)
// ==========================================
function renderPressCarousel() {
    const carousel = document.getElementById('pressCarousel');
    const indicators = document.getElementById('carouselIndicators');
    if (!carousel || !indicators) return;
    
    carousel.innerHTML = CONFIG.press.map((item, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''}" data-index="${i}">
            <div style="font-size:8rem;text-align:center;padding:2rem">${item.image}</div>
            <div class="carousel-info">
                <div class="carousel-title">${item.title}</div>
                <div class="carousel-date">${item.date}</div>
            </div>
        </div>`).join('');
    
    indicators.innerHTML = CONFIG.press.map((_, i) => `
        <div class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');
    
    CONFIG.currentIndex = 0;
}

function setupCarousel() {
    document.getElementById('prevBtn')?.addEventListener('click', () => goToSlide(CONFIG.currentIndex - 1));
    document.getElementById('nextBtn')?.addEventListener('click', () => goToSlide(CONFIG.currentIndex + 1));
    
    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            goToSlide(parseInt(indicator.dataset.index));
        });
    });
    
    setInterval(() => goToSlide(CONFIG.currentIndex + 1), 5000);
}

function goToSlide(index) {
    const total = CONFIG.press.length;
    index = ((index % total) + total) % total; // Gérer le bouclage
    
    document.querySelectorAll('.carousel-item').forEach((item, i) => {
        item.className = 'carousel-item';
        if (i === index) item.classList.add('active');
        else if (i === (index + 1) % total) item.classList.add('next');
        else if (i === (index - 1 + total) % total) item.classList.add('prev');
    });
    
    document.querySelectorAll('.indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });
    
    CONFIG.currentIndex = index;
}

// ==========================================
// FILTRES COMPLETS
// ==========================================
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sector = document.getElementById('sectorFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'recent';
    
    let filtered = CONFIG.promises.filter(p => {
        const matchSearch = p.engagement.toLowerCase().includes(search) ||
            p.resultat.toLowerCase().includes(search) ||
            p.domaine.toLowerCase().includes(search);
        const matchSector = !sector || p.domaine === sector;
        const matchStatus = !status || p.status === status;
        return matchSearch && matchSector && matchStatus;
    });
    
    filtered = sortPromises(filtered, sort);
    renderPromises(filtered);
}

function sortPromises(promises, type) {
    return [...promises].sort((a, b) => {
        if (type === 'recent') return b.id - a.id;
        if (type === 'ancient') return a.id - b.id;
        if (type === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (type === 'delay') return (a.isLate && !b.isLate) ? -1 : (!a.isLate && b.isLate) ? 1 : 0;
        return 0;
    });
}

function applyQuickFilter(filter) {
    let filtered = CONFIG.promises;
    
    if (filter === 'realise') filtered = filtered.filter(p => p.status === 'realise');
    else if (filter === 'encours') filtered = filtered.filter(p => p.status === 'encours');
    else if (filter === 'retard') filtered = filtered.filter(p => p.isLate);
    else if (filter === 'updates') filtered = filtered.filter(p => p.mises_a_jour?.length > 0);
    else if (filter === 'reset') {
        document.getElementById('searchInput').value = '';
        document.getElementById('sectorFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('sortFilter').value = 'recent';
    }
    
    renderPromises(filtered);
}

// ==========================================
// NOTATION ET PARTAGE
// ==========================================
function setupStarRatings() {
    // Étoiles pour les promesses
    document.querySelectorAll('.stars i').forEach(star => {
        star.addEventListener('click', async function() {
            const value = parseInt(this.getAttribute('data-value'));
            const id = this.getAttribute('data-promise-id');
            
            // Mise à jour visuelle
            document.querySelectorAll(`#stars-${id} i`).forEach(s => {
                s.classList.toggle('filled', parseInt(s.getAttribute('data-value')) <= value);
            });
            
            // Sauvegarde
            await savePromiseRating(id, value);
            showNotification(`⭐ Note enregistrée : ${value}/5`, 'success');
            renderAll();
        });
    });
    
    // Étoiles pour les services
    ['accessibility', 'welcome', 'efficiency', 'transparency'].forEach(field => {
        document.querySelectorAll(`#${field}-stars .star`).forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                document.getElementById(field).value = value;
                document.querySelectorAll(`#${field}-stars .star`).forEach(s => {
                    s.classList.toggle('filled', parseInt(s.getAttribute('data-value')) <= value);
                });
            });
        });
    });
}

async function savePromiseRating(id, rating) {
    try {
        if (supabaseClient) {
            await supabaseClient.from('promise_ratings').insert([{
                promise_id: id,
                rating: rating,
                timestamp: new Date().toISOString()
            }]);
        }
        const p = CONFIG.promises.find(p => p.id === id);
        if (p) p.rating = rating;
        return true;
    } catch (e) {
        console.error('Erreur notation:', e);
        return false;
    }
}

function shareOnSocial(platform, id) {
    const p = CONFIG.promises.find(p => p.id === id);
    if (!p) return;
    
    const text = `Suivi de l'engagement : "${p.engagement.substring(0, 50)}..." | LE PROJET SÉNÉGAL`;
    const url = window.location.href;
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
        case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`; break;
        case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(` Publié sur ${platform} !`, 'success');
}

// ==========================================
// ÉVÉNEMENTS
// ==========================================
function setupEventListeners() {
    ['searchInput', 'sectorFilter', 'statusFilter', 'sortFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', applyFilters);
    });
    
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyQuickFilter(this.dataset.filter);
        });
    });
    
    document.getElementById('rating-form')?.addEventListener('submit', async e => {
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
        
        CONFIG.ratings.push(rating);
        localStorage.setItem('ratings', JSON.stringify(CONFIG.ratings));
        
        document.getElementById('rating-form').reset();
        document.querySelectorAll('.stars-container .star').forEach(s => s.classList.remove('filled'));
        
        showNotification('⭐ Merci pour votre notation !', 'success');
        renderAll();
    });
}

// ==========================================
// UTILITAIRES
// ==========================================
function animateValue(el, start, end, duration) {
    if (!el) return;
    const range = end - start;
    const inc = end > start ? 1 : -1;
    const step = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += inc;
        el.textContent = current;
        if (current === end) clearInterval(timer);
    }, step);
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'notification';
    toast.style.background = type === 'error' ? 'linear-gradient(135deg,#e76f51,#c1543d)' : 
                            type === 'info' ? 'linear-gradient(135deg,#4a90e2,#2d7ab5)' : 
                            'linear-gradient(135deg,#2a9d8f,#21867a)';
    toast.innerHTML = `<i class="fas fa-${type==='error'?'exclamation-circle':type==='info'?'info-circle':'check-circle'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Exposer les fonctions globales
window.shareOnSocial = shareOnSocial;
