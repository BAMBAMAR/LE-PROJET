// ==========================================
// APP.JS AMÉLIORÉ - NOUVELLES FONCTIONNALITÉS
// ==========================================

const APP_CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: [],
  featuredPromise: null,
  news: [],
  updates: [],
  darkMode: false
};

// Données de démonstration pour les nouvelles sections
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
  }
];

// Initialisation améliorée
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation du site amélioré...');
  
  try {
    // Charger les données existantes
    await loadExistingData();
    
    // Initialiser les nouvelles sections
    initEnhancedSections();
    
    // Configurer les événements améliorés
    setupEnhancedEvents();
    
    // Mettre à jour l'affichage
    updateEnhancedDisplay();
    
    console.log('✅ Site amélioré initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    showNotification('Erreur lors du chargement des données', 'error');
  }
});

// Charger les données existantes
async function loadExistingData() {
  try {
    const response = await fetch('promises.json');
    const data = await response.json();
    
    APP_CONFIG.START_DATE = new Date(data.start_date);
    APP_CONFIG.promises = data.promises.map(p => ({
      ...p,
      deadline: calculateDeadline(p.delai),
      isLate: checkIfLate(p.status, calculateDeadline(p.delai))
    }));
    
    // Charger les nouvelles et mises à jour
    APP_CONFIG.news = DEMO_NEWS;
    APP_CONFIG.updates = DEMO_UPDATES;
    
    // Sélectionner une promesse du jour
    selectFeaturedPromise();
    
  } catch (error) {
    console.error('Erreur chargement données:', error);
    throw error;
  }
}

// Initialiser les nouvelles sections
function initEnhancedSections() {
  renderFeaturedPromise();
  renderNewsSection();
  renderUpdatesTimeline();
  initDashboardEnhancements();
}

// Sélectionner la promesse du jour
function selectFeaturedPromise() {
  const ongoingPromises = APP_CONFIG.promises.filter(p => p.status === 'encours');
  if (ongoingPromises.length > 0) {
    const randomIndex = Math.floor(Math.random() * ongoingPromises.length);
    APP_CONFIG.featuredPromise = ongoingPromises[randomIndex];
  } else {
    APP_CONFIG.featuredPromise = APP_CONFIG.promises[0];
  }
}

// Afficher la promesse du jour
function renderFeaturedPromise() {
  const container = document.getElementById('featuredPromise');
  if (!container || !APP_CONFIG.featuredPromise) return;
  
  const promise = APP_CONFIG.featuredPromise;
  
  container.innerHTML = `
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
            <i class="fas fa-chart-bar"></i>
            <span>Statut : ${getStatusText(promise.status)}</span>
          </div>
          
          ${promise.isLate ? `
          <div class="meta-item">
            <i class="fas fa-exclamation-triangle"></i>
            <span style="color: var(--danger);">En retard</span>
          </div>
          ` : ''}
        </div>
        
        <div class="featured-actions">
          <button class="details-btn" onclick="focusOnPromise('${promise.id}')">
            <i class="fas fa-search"></i> Voir les détails
          </button>
          
          <button class="details-btn" onclick="shareWithCapture('${promise.id}', 'screenshot')" 
                  style="background: var(--purple); border-color: var(--purple);">
            <i class="fas fa-share-alt"></i> Partager cette promesse
          </button>
        </div>
      </div>
    </div>
  `;
}

// Afficher la section actualités
function renderNewsSection() {
  const container = document.getElementById('newsContainer');
  if (!container) return;
  
  container.innerHTML = APP_CONFIG.news.map(news => `
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <span style="color: var(--text-secondary); font-size: 0.85rem;">
            <i class="fas fa-clock"></i> ${news.readTime} de lecture
          </span>
          <button class="quick-filter-btn" onclick="showNewsDetail(${news.id})" 
                  style="padding: 0.5rem 1rem; font-size: 0.9rem;">
            <i class="fas fa-book-open"></i> Lire
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Afficher la timeline des mises à jour
function renderUpdatesTimeline() {
  const container = document.getElementById('updatesTimeline');
  if (!container) return;
  
  container.innerHTML = APP_CONFIG.updates.map(update => `
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

// Améliorations du dashboard
function initDashboardEnhancements() {
  // Animation des cartes stats
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
  
  // Tooltips pour les KPI
  setupKPITooltips();
}

// Configuration des tooltips KPI
function setupKPITooltips() {
  const tooltips = {
    'total': 'Nombre total d\'engagements du Projet',
    'realise': 'Engagements complètement réalisés',
    'encours': 'Engagements en cours de réalisation',
    'retard': 'Engagements en retard sur le calendrier',
    'taux-realisation': 'Taux global pondéré de réalisation',
    'moyenne-notes': 'Moyenne des notes données par les citoyens'
  };
  
  Object.keys(tooltips).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.title = tooltips[id];
    }
  });
}

// Configurer les événements améliorés
function setupEnhancedEvents() {
  // Mode sombre
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Animation au scroll
  window.addEventListener('scroll', handleEnhancedScroll);
  
  // Interactions cartes promesses
  setupPromiseCardsInteractions();
  
  // Chargement plus d'actualités
  const loadMoreBtn = document.querySelector('[onclick="loadMoreNews()"]');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreNews);
  }
}

// Gestion du scroll amélioré
function handleEnhancedScroll() {
  // Navbar effect
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  // Animation des éléments
  animateOnScroll();
}

// Animation des éléments au scroll
function animateOnScroll() {
  const elements = document.querySelectorAll('.promise-card, .news-card, .stat-card');
  
  elements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// Interactions avec les cartes promesses
function setupPromiseCardsInteractions() {
  document.querySelectorAll('.promise-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
    
    // Clic pour focus (si pas sur un bouton)
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || 
          e.target.closest('button') || e.target.closest('a')) {
        return;
      }
      
      const promiseId = this.dataset.id || this.id.replace('promise-', '');
      if (promiseId) {
        focusOnPromise(promiseId);
      }
    });
  });
}

// Mettre à jour l'affichage amélioré
function updateEnhancedDisplay() {
  // Les fonctions existantes continuent de fonctionner
  updateDisplay();
  
  // Mettre à jour les nouvelles sections si besoin
  renderFeaturedPromise();
}

// Fonction pour charger plus d'actualités
function loadMoreNews() {
  // Simuler le chargement de plus d'actualités
  const moreNews = [
    {
      id: APP_CONFIG.news.length + 1,
      title: "Communiqué : Lancement du programme emploi jeunes",
      excerpt: "Le gouvernement annonce le démarrage du programme de création de 500,000 emplois.",
      date: "2024-12-08",
      type: "article",
      readTime: "4 min"
    },
    {
      id: APP_CONFIG.news.length + 2,
      title: "Reportage : Visite des nouveaux hôpitaux",
      excerpt: "Suivez la visite des chantiers des nouveaux hôpitaux régionaux en construction.",
      date: "2024-12-05",
      type: "article",
      readTime: "6 min"
    }
  ];
  
  APP_CONFIG.news.push(...moreNews);
  renderNewsSection();
  
  showNotification(`${moreNews.length} nouvelles actualités chargées`);
}

// Fonction pour afficher le détail d'une actualité
function showNewsDetail(newsId) {
  const news = APP_CONFIG.news.find(n => n.id === newsId);
  if (!news) return;
  
  const modalContent = `
    <div style="padding: 2rem; max-width: 800px;">
      <h2 style="color: var(--primary); margin-bottom: 1rem;">${news.title}</h2>
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; color: var(--text-secondary);">
        <span><i class="fas fa-calendar-alt"></i> ${formatDate(news.date)}</span>
        <span><i class="fas fa-clock"></i> ${news.readTime} de lecture</span>
        <span class="news-type ${news.type}">${news.type.toUpperCase()}</span>
      </div>
      <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
        <p style="line-height: 1.8; color: var(--text-primary);">
          ${news.excerpt}<br><br>
          Ceci est une démonstration de l'article. Dans la version finale, 
          le contenu complet de l'article serait affiché ici avec des images,
          des citations et des liens vers les sources.
        </p>
      </div>
      <button onclick="closeModal()" 
              style="background: var(--primary); color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%;">
        <i class="fas fa-times"></i> Fermer
      </button>
    </div>
  `;
  
  showModal('Actualité', modalContent);
}

// Fonction pour focus sur une promesse
function focusOnPromise(promiseId) {
  const element = document.getElementById(`promise-${promiseId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('pulse-animation');
    setTimeout(() => {
      element.classList.remove('pulse-animation');
    }, 1000);
  }
}

// Basculer mode sombre/clair
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  APP_CONFIG.darkMode = !APP_CONFIG.darkMode;
  localStorage.setItem('darkMode', APP_CONFIG.darkMode);
  
  const icon = document.querySelector('#darkModeToggle i');
  if (APP_CONFIG.darkMode) {
    icon.className = 'fas fa-sun';
    showNotification('Mode sombre activé');
  } else {
    icon.className = 'fas fa-moon';
    showNotification('Mode clair activé');
  }
}

// Fonctions utilitaires
function getNewsTypeIcon(type) {
  switch(type) {
    case 'article': return '📄';
    case 'interview': return '🎤';
    case 'infographic': return '📊';
    default: return '📰';
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

function getStatusText(status) {
  switch(status) {
    case 'realise': return '✅ Réalisé';
    case 'encours': return '🔄 En cours';
    case 'non-lance': return '⏳ Non lancé';
    default: return '🔄 En cours';
  }
}

// Fonctions existantes (conservées pour compatibilité)
function calculateDeadline(delaiText) {
  // Votre fonction existante
  const text = delaiText.toLowerCase();
  const result = new Date(APP_CONFIG.START_DATE);
  
  if (text.includes("immédiat") || text.includes("3 mois")) {
    result.setMonth(result.getMonth() + 3);
  } else if (text.includes("6 premiers mois") || text.includes("6 mois")) {
    result.setMonth(result.getMonth() + 6);
  } else if (text.includes("12 premiers mois") || text.includes("1ère année")) {
    result.setFullYear(result.getFullYear() + 1);
  } else if (text.includes("2 premières années")) {
    result.setFullYear(result.getFullYear() + 2);
  } else if (text.includes("5 ans") || text.includes("quinquennat")) {
    result.setFullYear(result.getFullYear() + 5);
  } else {
    result.setFullYear(result.getFullYear() + 5);
  }
  
  return result;
}

function checkIfLate(status, deadline) {
  return status !== 'realise' && APP_CONFIG.CURRENT_DATE > deadline;
}

// Fonction pour afficher une modal
function showModal(title, content) {
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
    background: var(--bg-card);
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
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
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

// Notification améliorée
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

// Exposer les fonctions globalement
window.APP_ENHANCED = {
  config: APP_CONFIG,
  focusOnPromise,
  showNewsDetail,
  loadMoreNews,
  toggleDarkMode
};

// Initialiser le mode sombre si sauvegardé
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  const icon = document.querySelector('#darkModeToggle i');
  if (icon) icon.className = 'fas fa-sun';
}
