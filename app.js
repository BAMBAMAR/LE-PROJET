// ==========================================
// APP.JS - TABLEAU DE BORD MODERNE ET INTERACTIF
// ==========================================

// Configuration globale
const CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: [],
  charts: {},
  userPreferences: {
    theme: 'light',
    animations: true
  }
};

// ==========================================
// INITIALISATION AVANCÉE
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation du tableau de bord moderne...');
  
  // Charger les préférences utilisateur
  loadUserPreferences();
  
  // Initialiser les animations de fond
  initAdvancedAnimations();
  
  // Charger les données
  await loadData();
  
  // Initialiser l'interface
  initModernUI();
  
  // Configurer les événements
  setupEventListeners();
  
  // Créer les visualisations
  createModernCharts();
  
  // Mettre à jour les données en temps réel
  startRealTimeUpdates();
  
  console.log('✅ Tableau de bord initialisé avec succès');
});

// ==========================================
// ANIMATIONS AVANCÉES
// ==========================================
function initAdvancedAnimations() {
  createFloatingElements();
  setupParallaxEffects();
  initScrollAnimations();
}

function createFloatingElements() {
  const container = document.querySelector('.hero-section');
  if (!container) return;
  
  for (let i = 0; i < 15; i++) {
    const element = document.createElement('div');
    element.className = 'floating-element';
    element.style.cssText = `
      position: absolute;
      width: ${Math.random() * 60 + 20}px;
      height: ${Math.random() * 60 + 20}px;
      background: ${i % 3 === 0 ? 'rgba(37, 99, 235, 0.1)' : 
                   i % 3 === 1 ? 'rgba(124, 58, 237, 0.1)' : 
                   'rgba(245, 158, 11, 0.1)'};
      border-radius: ${Math.random() > 0.5 ? '50%' : '20%'};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      opacity: 0.3;
      pointer-events: none;
    `;
    container.appendChild(element);
  }
}

function setupParallaxEffects() {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observer les éléments à animer
  document.querySelectorAll('.stat-card, .dashboard-card, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
// CHARGEMENT DES DONNÉES AMÉLIORÉ
// ==========================================
async function loadData() {
  showLoadingState(true);
  
  try {
    // Chargement simultané des données principales et des métadonnées
    const [promisesResponse, metadataResponse] = await Promise.allSettled([
      fetch('promises.json'),
      fetch('metadata.json') // Fichier supplémentaire pour les métadonnées
    ]);
    
    if (promisesResponse.status === 'fulfilled') {
      const data = await promisesResponse.value.json();
      CONFIG.START_DATE = new Date(data.start_date);
      CONFIG.promises = data.promises.map(p => enhancePromiseData(p));
    } else {
      throw new Error('Impossible de charger les promesses');
    }
    
    // Charger les métadonnées si disponibles
    if (metadataResponse.status === 'fulfilled') {
      const metadata = await metadataResponse.value.json();
      applyMetadata(metadata);
    }
    
    renderAll();
    showNotification('Données mises à jour', 'success');
    
  } catch (error) {
    console.error('Erreur de chargement:', error);
    showNotification('Erreur de chargement des données', 'error');
    loadFallbackData();
  } finally {
    showLoadingState(false);
  }
}

function enhancePromiseData(promise) {
  const deadline = calculateDeadline(promise.delai);
  const isLate = checkIfLate(promise.status, deadline);
  const priority = calculatePriority(promise);
  const impact = calculateImpactScore(promise);
  
  return {
    ...promise,
    deadline,
    isLate,
    priority,
    impact,
    lastUpdated: new Date().toISOString(),
    trend: calculateTrend(promise)
  };
}

function calculatePriority(promise) {
  let score = 0;
  if (promise.status === 'realise') score += 100;
  if (promise.isLate) score += 50;
  if (promise.domaine === 'Économie') score += 30;
  if (promise.delai.includes('court')) score += 20;
  
  return Math.min(score, 100);
}

function calculateImpactScore(promise) {
  // Score basé sur l'importance perçue
  const impactScores = {
    'Économie': 90,
    'Santé': 85,
    'Éducation': 80,
    'Infrastructure': 75,
    'Agriculture': 70,
    'Environnement': 65
  };
  
  return impactScores[promise.domaine] || 60;
}

// ==========================================
// INTERFACE UTILISATEUR MODERNE
// ==========================================
function initModernUI() {
  createThemeToggle();
  initSearchSuggestions();
  setupDynamicFilters();
  initTooltips();
  createWelcomeTour();
}

function createThemeToggle() {
  const toggle = document.createElement('button');
  toggle.id = 'themeToggle';
  toggle.className = 'interactive-btn';
  toggle.innerHTML = '<i class="fas fa-moon"></i>';
  toggle.title = 'Changer de thème';
  
  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    CONFIG.userPreferences.theme = isDark ? 'dark' : 'light';
    saveUserPreferences();
  });
  
  document.querySelector('.nav-menu').appendChild(toggle);
}

function initSearchSuggestions() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  let suggestions = [];
  
  searchInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    if (value.length < 2) {
      hideSuggestions();
      return;
    }
    
    suggestions = CONFIG.promises
      .filter(p => 
        p.engagement.toLowerCase().includes(value) ||
        p.domaine.toLowerCase().includes(value)
      )
      .slice(0, 5);
    
    showSuggestions(suggestions);
  });
  
  function showSuggestions(items) {
    hideSuggestions();
    
    const container = document.createElement('div');
    container.className = 'suggestions-container';
    container.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
    `;
    
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <strong>${item.domaine}</strong>
        <span>${item.engagement.substring(0, 50)}...</span>
      `;
      div.addEventListener('click', () => {
        searchInput.value = item.engagement;
        hideSuggestions();
        applyFilters();
      });
      container.appendChild(div);
    });
    
    searchInput.parentNode.appendChild(container);
  }
  
  function hideSuggestions() {
    const existing = document.querySelector('.suggestions-container');
    if (existing) existing.remove();
  }
}

function setupDynamicFilters() {
  // Filtres dynamiques basés sur les données
  const filtersContainer = document.getElementById('dynamicFilters');
  if (!filtersContainer) return;
  
  const filters = [
    { id: 'priority', label: 'Priorité', type: 'range', min: 0, max: 100 },
    { id: 'impact', label: 'Impact', type: 'range', min: 0, max: 100 },
    { id: 'timeline', label: 'Échéance', type: 'select', 
      options: ['< 3 mois', '3-6 mois', '6-12 mois', '> 1 an'] }
  ];
  
  filters.forEach(filter => {
    const filterElement = createFilterElement(filter);
    filtersContainer.appendChild(filterElement);
  });
}

function initTooltips() {
  tippy('[data-tippy-content]', {
    theme: 'light-border',
    animation: 'scale',
    duration: [200, 150],
    interactive: true,
    appendTo: document.body
  });
}

function createWelcomeTour() {
  // Tour d'introduction pour les nouveaux utilisateurs
  if (!localStorage.getItem('tourCompleted')) {
    setTimeout(() => {
      showNotification(
        '👋 Bienvenue! Utilisez les filtres pour explorer les engagements.',
        'info',
        5000
      );
      localStorage.setItem('tourCompleted', 'true');
    }, 2000);
  }
}

// ==========================================
// VISUALISATIONS MODERNES
// ==========================================
function createModernCharts() {
  if (typeof Chart === 'undefined') return;
  
  createRadarChart();
  createTimelineChart();
  createHeatmap();
}

function createRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  
  const domains = [...new Set(CONFIG.promises.map(p => p.domaine))];
  const progressByDomain = domains.map(domain => {
    const promises = CONFIG.promises.filter(p => p.domaine === domain);
    const progress = promises.reduce((acc, p) => {
      return acc + (p.status === 'realise' ? 100 : 
                   p.status === 'encours' ? 50 : 10);
    }, 0) / promises.length;
    
    return progress;
  });
  
  CONFIG.charts.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: domains,
      datasets: [{
        label: 'Progression par domaine',
        data: progressByDomain,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw.toFixed(1)}%`
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: (value) => `${value}%`
          }
        }
      }
    }
  });
}

function createTimelineChart() {
  const ctx = document.getElementById('timelineChart');
  if (!ctx) return;
  
  // Grouper par mois
  const monthlyData = {};
  CONFIG.promises.forEach(p => {
    const month = p.deadline.toLocaleDateString('fr-FR', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  
  CONFIG.charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Échéances par mois',
        data: Object.values(monthlyData),
        borderColor: 'rgba(124, 58, 237, 1)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

// ==========================================
// INTERACTIONS AVANCÉES
// ==========================================
function setupEventListeners() {
  // Navigation fluide avec highlight
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
        
        // Highlight temporaire
        targetElement.classList.add('highlight');
        setTimeout(() => targetElement.classList.remove('highlight'), 2000);
      }
    });
  });
  
  // Filtres avancés
  setupAdvancedFilters();
  
  // Drag and drop pour le réarrangement
  setupDragAndDrop();
  
  // Keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Real-time updates
  setupRealTimeListeners();
}

function setupAdvancedFilters() {
  const filterPresets = {
    'highPriority': (p) => p.priority >= 80,
    'needsAttention': (p) => p.isLate || p.status === 'non-lance',
    'recentUpdates': (p) => {
      const lastUpdate = new Date(p.lastUpdated);
      const daysDiff = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    }
  };
  
  Object.entries(filterPresets).forEach(([key, filterFn]) => {
    const btn = document.getElementById(`filter-${key}`);
    if (btn) {
      btn.addEventListener('click', () => {
        const filtered = CONFIG.promises.filter(filterFn);
        renderPromises(filtered);
        showNotification(`${filtered.length} résultats trouvés`, 'info');
      });
    }
  });
}

function setupDragAndDrop() {
  const container = document.getElementById('promisesContainer');
  if (!container) return;
  
  let draggedItem = null;
  
  container.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('promise-card')) {
      draggedItem = e.target;
      e.target.style.opacity = '0.5';
    }
  });
  
  container.addEventListener('dragend', (e) => {
    if (draggedItem) {
      draggedItem.style.opacity = '1';
      draggedItem = null;
    }
  });
  
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedItem && e.target.classList.contains('promise-card')) {
      const parent = container;
      const children = Array.from(parent.children);
      const draggedIndex = children.indexOf(draggedItem);
      const targetIndex = children.indexOf(e.target);
      
      if (draggedIndex < targetIndex) {
        parent.insertBefore(draggedItem, e.target.nextSibling);
      } else {
        parent.insertBefore(draggedItem, e.target);
      }
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + F pour focus la recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.focus();
    }
    
    // Escape pour fermer les modales
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
      });
    }
    
    // ? pour afficher l'aide
    if (e.key === '?') {
      showHelpModal();
    }
  });
}

// ==========================================
// MISE À JOUR EN TEMPS RÉEL
// ==========================================
function startRealTimeUpdates() {
  // Simuler des mises à jour en temps réel
  setInterval(() => {
    updateLiveData();
  }, 30000); // Toutes les 30 secondes
  
  // WebSocket pour les mises à jour en direct
  setupWebSocketConnection();
}

function updateLiveData() {
  // Mettre à jour les compteurs en temps réel
  const stats = calculateStats();
  animateCounters(stats);
  
  // Mettre à jour les graphiques
  updateCharts(stats);
  
  // Vérifier les nouvelles mises à jour
  checkForUpdates();
}

function setupWebSocketConnection() {
  // Connexion WebSocket pour les mises à jour en direct
  const ws = new WebSocket('wss://your-websocket-server.com');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'new_update':
        handleNewUpdate(data.payload);
        break;
      case 'status_change':
        handleStatusChange(data.payload);
        break;
      case 'new_vote':
        handleNewVote(data.payload);
        break;
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected. Retrying in 5 seconds...');
    setTimeout(setupWebSocketConnection, 5000);
  };
}

// ==========================================
// UTILITAIRES AVANCÉS
// ==========================================
function animateCounters(stats) {
  const elements = {
    total: document.getElementById('total-promises'),
    realise: document.getElementById('realized'),
    encours: document.getElementById('inProgress')
  };
  
  Object.entries(elements).forEach(([key, element]) => {
    if (element) {
      const current = parseInt(element.textContent) || 0;
      const target = stats[key];
      
      if (current !== target) {
        animateCounter(element, current, target, 1000);
      }
    }
  });
}

function animateCounter(element, start, end, duration) {
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

function showLoadingState(show) {
  const loader = document.getElementById('globalLoader') || createLoader();
  
  if (show) {
    loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    loader.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function createLoader() {
  const loader = document.createElement('div');
  loader.id = 'globalLoader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 9999;
  `;
  
  loader.innerHTML = `
    <div class="spinner" style="
      width: 60px;
      height: 60px;
      border: 4px solid rgba(37, 99, 235, 0.3);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    "></div>
    <p style="color: white; font-size: 1.1rem;">Chargement des données...</p>
  `;
  
  document.body.appendChild(loader);
  return loader;
}

function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    background: ${type === 'success' ? '#10b981' : 
                 type === 'error' ? '#ef4444' : 
                 type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideIn 0.3s ease, slideOut 0.3s ease ${duration}ms forwards;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `;
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration + 300);
}

// ==========================================
// GESTION DES PRÉFÉRENCES UTILISATEUR
// ==========================================
function loadUserPreferences() {
  const saved = localStorage.getItem('userPreferences');
  if (saved) {
    CONFIG.userPreferences = JSON.parse(saved);
    
    // Appliquer le thème
    if (CONFIG.userPreferences.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    
    // Appliquer les préférences d'animation
    if (!CONFIG.userPreferences.animations) {
      document.body.classList.add('reduce-motion');
    }
  }
}

function saveUserPreferences() {
  localStorage.setItem('userPreferences', JSON.stringify(CONFIG.userPreferences));
}

// ==========================================
// FONCTIONS GLOBALES
// ==========================================
window.APP = {
  CONFIG,
  refreshData: loadData,
  exportData: exportToFormat,
  toggleTheme: () => document.getElementById('themeToggle')?.click(),
  showHelp: showHelpModal,
  getStats: calculateStats
};

// Initialisation finale
console.log('📊 Tableau de bord ProjetBI prêt');