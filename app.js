// ==========================================
// APP.JS AMÉLIORÉ - PROJET SÉNÉGAL MODERNISÉ
// ==========================================

const CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: [],
  featuredPromise: null,
  news: [],
  updates: []
};

// ==========================================
// DONNÉES DE DÉMO POUR LES NOUVELLES SECTIONS
// ==========================================
const DEMO_NEWS = [
  {
    id: 1,
    title: "Nouveau rapport économique trimestriel publié",
    excerpt: "Le ministère de l'Économie dévoile les premiers résultats des réformes engagées depuis avril 2024.",
    date: "2024-12-15",
    type: "article",
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Interview exclusive sur la chaîne nationale",
    excerpt: "Le ministre de l'Éducation répond aux questions sur la mise en œuvre de la gratuité scolaire.",
    date: "2024-12-14",
    type: "interview",
    readTime: "8 min"
  },
  {
    id: 3,
    title: "Infographie : Les 6 premiers mois en chiffres",
    excerpt: "Visualisez les principales réalisations du projet à travers des données clés et graphiques.",
    date: "2024-12-10",
    type: "infographic",
    readTime: "3 min"
  },
  {
    id: 4,
    title: "Communiqué : Lancement du programme emploi jeunes",
    excerpt: "Le gouvernement annonce le démarrage du programme de création de 500,000 emplois.",
    date: "2024-12-08",
    type: "article",
    readTime: "4 min"
  }
];

const DEMO_UPDATES = [
  {
    id: 1,
    date: "2024-12-15",
    time: "14:30",
    title: "Rapport économique publié",
    description: "Publication du premier rapport trimestriel sur l'avancement des réformes économiques"
  },
  {
    id: 2,
    date: "2024-12-14",
    time: "10:15",
    title: "Mise à jour promesse Éducation",
    description: "Déploiement complet de la gratuité scolaire dans 3 nouvelles régions"
  },
  {
    id: 3,
    date: "2024-12-12",
    time: "16:45",
    title: "Article presse ajouté",
    description: "Nouvel article du journal Le Soleil ajouté à la revue de presse"
  },
  {
    id: 4,
    date: "2024-12-10",
    time: "09:00",
    title: "Données mises à jour",
    description: "Mise à jour des statistiques avec les dernières informations disponibles"
  }
];

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation du site amélioré...');
  
  try {
    // Charger les données principales
    await loadData();
    
    // Initialiser les nouvelles sections
    initNewSections();
    
    // Configurer les événements
    setupEventListeners();
    
    // Initialiser les animations
    initAnimations();
    
    // Mettre à jour l'affichage
    updateDisplay();
    
    console.log('✅ Site amélioré initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    showNotification('Erreur lors du chargement des données', 'error');
  }
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
      isLate: checkIfLate(p.status, calculateDeadline(p.delai)),
      // Ajouter des données de démonstration pour les nouvelles fonctionnalités
      followers: Math.floor(Math.random() * 500) + 50,
      views: Math.floor(Math.random() * 1000) + 100,
      priority: Math.floor(Math.random() * 10) + 1
    }));
    
    // Sélectionner une promesse du jour
    selectFeaturedPromise();
    
    // Charger les nouvelles et mises à jour
    CONFIG.news = DEMO_NEWS;
    CONFIG.updates = DEMO_UPDATES;
    
  } catch (error) {
    console.error('Erreur chargement données:', error);
    throw error;
  }
}

// ==========================================
// NOUVELLES SECTIONS
// ==========================================
function initNewSections() {
  renderFeaturedPromise();
  renderNews();
  renderUpdatesTimeline();
  setupDashboardInteractions();
}

function selectFeaturedPromise() {
  // Sélectionner une promesse aléatoire avec statut "en cours"
  const ongoingPromises = CONFIG.promises.filter(p => p.status === 'encours');
  if (ongoingPromises.length > 0) {
    const randomIndex = Math.floor(Math.random() * ongoingPromises.length);
    CONFIG.featuredPromise = ongoingPromises[randomIndex];
  } else {
    // Fallback: première promesse
    CONFIG.featuredPromise = CONFIG.promises[0];
  }
}

function renderFeaturedPromise() {
  const featuredContainer = document.getElementById('featuredPromise');
  if (!featuredContainer || !CONFIG.featuredPromise) return;
  
  const promise = CONFIG.featuredPromise;
  
  featuredContainer.innerHTML = `
    <div class="featured-promise">
      <div class="featured-badge">
        <i class="fas fa-star"></i> PROMESSE DU JOUR
      </div>
      
      <div class="featured-content">
        <h3 class="featured-title">${promise.engagement}</h3>
        
        <div class="featured-domain">${promise.domaine}</div>
        
        <div class="featured-description">
          <strong>Résultat attendu :</strong> ${promise.resultat}
        </div>
        
        <div class="featured-meta">
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span>Délai : ${promise.delai}</span>
          </div>
          
          <div class="meta-item">
            <i class="fas fa-users"></i>
            <span>${promise.followers} citoyens suivent</span>
          </div>
          
          <div class="meta-item">
            <i class="fas fa-eye"></i>
            <span>${promise.views} vues</span>
          </div>
        </div>
        
        <div class="featured-actions">
          <button class="details-btn" onclick="showPromiseDetails('${promise.id}')" style="flex: 1;">
            <i class="fas fa-search"></i> Voir les détails
          </button>
          
          <button class="details-btn" onclick="shareWithCapture('${promise.id}', 'screenshot')" style="flex: 1; background: var(--purple); border-color: var(--purple);">
            <i class="fas fa-share-alt"></i> Partager
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderNews() {
  const newsContainer = document.getElementById('newsContainer');
  if (!newsContainer) return;
  
  newsContainer.innerHTML = CONFIG.news.map(news => `
    <div class="news-card">
      <div class="news-header">
        <div class="news-date">
          <i class="fas fa-calendar-alt"></i> ${formatDate(news.date)}
        </div>
        <div class="news-type ${news.type}">
          ${getNewsTypeIcon(news.type)} ${news.type.toUpperCase()}
        </div>
      </div>
      
      <div class="news-content">
        <h4 class="news-title">${news.title}</h4>
        <p class="news-excerpt">${news.excerpt}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-light); font-size: 0.85rem;">
            <i class="fas fa-clock"></i> ${news.readTime} de lecture
          </span>
          <button class="quick-filter-btn" onclick="readNews(${news.id})" style="padding: 0.5rem 1rem;">
            <i class="fas fa-book-open"></i> Lire
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderUpdatesTimeline() {
  const timelineContainer = document.getElementById('updatesTimeline');
  if (!timelineContainer) return;
  
  timelineContainer.innerHTML = CONFIG.updates.map(update => `
    <div class="timeline-item">
      <div class="timeline-icon">
        <i class="fas fa-bullhorn"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-date">
          <i class="fas fa-calendar-check"></i>
          ${formatDate(update.date)} • ${update.time}
        </div>
        <h5 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary);">
          ${update.title}
        </h5>
        <p class="timeline-text">${update.description}</p>
      </div>
    </div>
  `).join('');
}

function getNewsTypeIcon(type) {
  switch(type) {
    case 'article': return '📄';
    case 'interview': return '🎤';
    case 'infographic': return '📊';
    default: return '📰';
  }
}

// ==========================================
// TABLEAU DE BORD INTERACTIF
// ==========================================
function setupDashboardInteractions() {
  // Animation des cartes de stats au survol
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Tooltips pour les KPI
  const kpiTooltips = {
    'total': 'Nombre total d\'engagements du Projet',
    'realise': 'Engagements complètement réalisés',
    'encours': 'Engagements en cours de réalisation',
    'non-lance': 'Engagements pas encore démarrés',
    'retard': 'Engagements en retard sur le calendrier',
    'taux-realisation': 'Taux global pondéré de réalisation',
    'moyenne-notes': 'Moyenne des notes données par les citoyens',
    'avec-maj': 'Engagements avec des mises à jour récentes',
    'delai-moyen': 'Délai moyen restant pour les engagements en cours',
    'domaine-principal': 'Domaine avec le plus d\'engagements'
  };
  
  Object.keys(kpiTooltips).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.setAttribute('title', kpiTooltips[id]);
    }
  });
}

// ==========================================
// GESTION DES PROMESSES (SANS BARRE DE PROGRESSION)
// ==========================================
function renderPromises(promises) {
  const container = document.getElementById('promisesContainer');
  if (!container) return;
  
  if (promises.length === 0) {
    container.innerHTML = `
      <div class="no-results" style="text-align:center; padding:3rem; color:var(--text-secondary); grid-column:1/-1;">
        <i class="fas fa-search fa-4x" style="margin-bottom:1.5rem; opacity:0.3;"></i>
        <h3 style="margin-bottom:0.8rem; color:var(--text-primary);">Aucun résultat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
        <button onclick="resetFilters()" class="quick-filter-btn" style="margin-top:1.5rem;">
          <i class="fas fa-redo"></i> Réinitialiser les filtres
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = promises.map(promise => createPromiseCard(promise)).join('');
  setupCardInteractions();
}

function createPromiseCard(promise) {
  const statusClass = `status-${promise.status.replace('-', '')}`;
  const statusText = getStatusText(promise.status);
  const delayBadge = getDelayBadge(promise);
  
  // Calculer la note moyenne
  const avgRating = promise.votes && promise.votes.length > 0 
    ? (promise.votes.reduce((a, b) => a + b, 0) / promise.votes.length).toFixed(1)
    : '0.0';
  
  return `
    <div class="promise-card" id="promise-${promise.id}" data-id="${promise.id}">
      <div class="domain-badge">${promise.domaine}</div>
      
      <h3 class="promise-title">${promise.engagement}</h3>
      
      <div class="result-box">
        <i class="fas fa-bullseye"></i>
        <strong>Résultat attendu :</strong> ${promise.resultat}
      </div>
      
      <div class="promise-meta">
        <div class="meta-row">
          <div class="meta-label">
            <i class="fas fa-clock"></i>
            <span>Délai</span>
          </div>
          <div class="delay-badge ${delayBadge.class}">
            <i class="${delayBadge.icon}"></i>
            ${promise.delai}
          </div>
        </div>
        
        <div class="meta-row">
          <div class="meta-label">
            <i class="fas fa-chart-line"></i>
            <span>Statut</span>
          </div>
          <div class="status-badge ${statusClass}">
            <i class="${getStatusIcon(promise.status)}"></i>
            ${statusText}
          </div>
        </div>
        
        ${promise.isLate ? `
        <div class="meta-row">
          <div class="meta-label">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Retard</span>
          </div>
          <span style="color: var(--danger); font-weight: 600;">
            <i class="fas fa-clock"></i> En retard
          </span>
        </div>
        ` : ''}
        
        <div class="meta-row">
          <div class="meta-label">
            <i class="fas fa-star"></i>
            <span>Note moyenne</span>
          </div>
          <span style="color: var(--warning); font-weight: 700;">
            ${avgRating}/5
          </span>
        </div>
      </div>
      
      ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
        <button class="details-btn" onclick="toggleUpdates('${promise.id}')" aria-expanded="false">
          <i class="fas fa-history"></i> Voir les mises à jour (${promise.mises_a_jour.length})
        </button>
        
        <div id="updates-${promise.id}" class="updates-container">
          ${promise.mises_a_jour.map(update => `
            <div class="update-item">
              <span class="update-date">
                <i class="fas fa-calendar-alt"></i> ${update.date}
              </span>
              <span class="update-text">${update.text}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="rating-section">
        <div class="stars" id="stars-${promise.id}">
          <i class="far fa-star" data-value="1" onclick="ratePromise('${promise.id}', 1)"></i>
          <i class="far fa-star" data-value="2" onclick="ratePromise('${promise.id}', 2)"></i>
          <i class="far fa-star" data-value="3" onclick="ratePromise('${promise.id}', 3)"></i>
          <i class="far fa-star" data-value="4" onclick="ratePromise('${promise.id}', 4)"></i>
          <i class="far fa-star" data-value="5" onclick="ratePromise('${promise.id}', 5)"></i>
        </div>
        <span class="rating-label" id="rating-label-${promise.id}">
          Noter cet engagement
        </span>
        <span class="rating-count" id="rating-count-${promise.id}">
          ${promise.votes ? `${promise.votes.length} votes` : 'Soyez le premier à noter'}
        </span>
      </div>
      
      <div class="share-section">
        <button class="screenshot-btn" onclick="shareWithCapture('${promise.id}', 'screenshot')" title="Capturer et partager">
          <i class="fas fa-camera"></i>
        </button>
        <a href="#" onclick="shareWithCapture('${promise.id}', 'twitter'); return false;" 
           class="share-btn share-twitter" 
           title="Partager sur X">
          <i class="fab fa-x-twitter"></i>
        </a>
        <a href="#" onclick="shareWithCapture('${promise.id}', 'facebook'); return false;" 
           class="share-btn share-facebook" 
           title="Partager sur Facebook">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="#" onclick="shareWithCapture('${promise.id}', 'whatsapp'); return false;" 
           class="share-btn share-whatsapp" 
           title="Partager sur WhatsApp">
          <i class="fab fa-whatsapp"></i>
        </a>
      </div>
    </div>
  `;
}

// ==========================================
// FONCTIONS UTILITAIRES AMÉLIORÉES
// ==========================================
function getStatusText(status) {
  switch(status) {
    case 'realise': return '✅ Réalisé';
    case 'encours': return '🔄 En cours';
    case 'non-lance': return '⏳ Non lancé';
    default: return '🔄 En cours';
  }
}

function getStatusIcon(status) {
  switch(status) {
    case 'realise': return 'fas fa-check-circle';
    case 'encours': return 'fas fa-sync-alt';
    case 'non-lance': return 'fas fa-hourglass-start';
    default: return 'fas fa-sync-alt';
  }
}

function getDelayBadge(promise) {
  if (promise.status === 'realise') {
    return { class: 'delay-success', icon: 'fas fa-check-circle' };
  } else if (promise.isLate) {
    return { class: 'delay-danger', icon: 'fas fa-exclamation-triangle' };
  } else {
    return { class: 'delay-normal', icon: 'fas fa-hourglass-half' };
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ==========================================
// INTERACTIONS AMÉLIORÉES
// ==========================================
function setupEventListeners() {
  // Navigation améliorée
  setupNavigation();
  
  // Filtres
  document.getElementById('search')?.addEventListener('input', debounce(updateDisplay, 300));
  document.getElementById('domaine')?.addEventListener('change', updateDisplay);
  document.getElementById('status')?.addEventListener('change', updateDisplay);
  document.getElementById('sort')?.addEventListener('change', updateDisplay);
  
  // Filtres rapides
  document.querySelectorAll('.quick-filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.dataset.filter;
      applyQuickFilter(filter);
      
      // Animation du bouton
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
  
  // Scroll events
  window.addEventListener('scroll', handleScroll);
  
  // Gestion du mode sombre
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Animation des cartes au survol
  setupCardInteractions();
}

function setupCardInteractions() {
  document.querySelectorAll('.promise-card').forEach(card => {
    // Effet de profondeur au survol
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
    
    // Animation au clic
    card.addEventListener('click', function(e) {
      // Ne pas déclencher si on clique sur un bouton
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
        return;
      }
      
      const promiseId = this.dataset.id;
      showPromiseDetails(promiseId);
    });
  });
}

function handleScroll() {
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  // Bouton retour en haut
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  
  // Animation des éléments au scroll
  animateOnScroll();
}

function animateOnScroll() {
  const elements = document.querySelectorAll('.promise-card, .news-card, .stat-card');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementTop < windowHeight - 100) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// ==========================================
// NOUVELLES FONCTIONNALITÉS
// ==========================================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  
  showNotification(`Mode ${isDarkMode ? 'sombre' : 'clair'} activé`);
}

function showPromiseDetails(promiseId) {
  const promise = CONFIG.promises.find(p => p.id === promiseId);
  if (!promise) return;
  
  // Animation de focus sur la carte
  const card = document.getElementById(`promise-${promiseId}`);
  if (card) {
    card.classList.add('pulse-animation');
    setTimeout(() => {
      card.classList.remove('pulse-animation');
    }, 1000);
  }
  
  // Scroll vers la carte
  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  showNotification(`Détails de "${promise.engagement.substring(0, 50)}..." affichés`);
}

function readNews(newsId) {
  const news = CONFIG.news.find(n => n.id === newsId);
  if (!news) return;
  
  // Simuler l'ouverture de l'article
  const modalContent = `
    <div style="padding: 2rem; max-width: 800px;">
      <h2 style="color: var(--primary); margin-bottom: 1rem;">${news.title}</h2>
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; color: var(--text-light);">
        <span><i class="fas fa-calendar-alt"></i> ${formatDate(news.date)}</span>
        <span><i class="fas fa-clock"></i> ${news.readTime} de lecture</span>
        <span class="news-type ${news.type}">${news.type.toUpperCase()}</span>
      </div>
      <p style="line-height: 1.8; color: var(--text-secondary); margin-bottom: 2rem;">
        ${news.excerpt}<br><br>
        Ceci est une démonstration de l'article. Dans la version finale, 
        le contenu complet de l'article serait affiché ici avec des images,
        des citations et des liens vers les sources.
      </p>
      <button onclick="closeModal()" style="background: var(--primary); color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
        <i class="fas fa-times"></i> Fermer
      </button>
    </div>
  `;
  
  showModal(news.title, modalContent);
}

// ==========================================
// FONCTIONS UTILITAIRES
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

function showModal(title, content) {
  // Créer la modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: white;
    border-radius: 20px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideDown 0.3s ease;
  `;
  
  modalContent.innerHTML = content;
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Fermer en cliquant à l'extérieur
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Empêcher le scroll du body
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==========================================
// FONCTIONS GLOBALES
// ==========================================
window.toggleUpdates = function(promiseId) {
  const updatesEl = document.getElementById(`updates-${promiseId}`);
  const btn = updatesEl.previousElementSibling;
  
  if (updatesEl.classList.contains('show')) {
    updatesEl.classList.remove('show');
    btn.innerHTML = '<i class="fas fa-history"></i> Voir les mises à jour';
  } else {
    updatesEl.classList.add('show');
    btn.innerHTML = '<i class="fas fa-times"></i> Masquer les mises à jour';
  }
};

window.resetFilters = function() {
  document.getElementById('search').value = '';
  document.getElementById('domaine').value = '';
  document.getElementById('status').value = '';
  document.getElementById('sort').value = '';
  
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  renderPromises(CONFIG.promises);
  calculateAllStats();
  showNotification('Filtres réinitialisés');
};

window.shareWithCapture = async function(promiseId, platform) {
  // Cette fonction existe déjà dans index.html
  // On la laisse gérer le partage
  console.log('Partage de la promesse:', promiseId, 'sur', platform);
};

// ==========================================
// EXPORT POUR UTILISATION GLOBALE
// ==========================================
window.APP = {
  CONFIG,
  renderPromises,
  updateDisplay,
  showNotification,
  toggleDarkMode
};

console.log('📦 Module APP chargé');
