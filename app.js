// ==========================================
// APP.JS - CORRECTIONS DES ERREURS
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
// FONCTIONS MANQUANTES
// ==========================================

// Fonction manquante pour exportToFormat
function exportToFormat(format) {
  console.log(`Export en ${format} demandé`);
  // Implémentation basique - à remplacer par votre logique d'export
  switch(format) {
    case 'csv':
      exportToCSV();
      break;
    case 'excel':
      exportToExcel();
      break;
    case 'pdf':
      exportToPDF();
      break;
    default:
      console.log(`Format ${format} non supporté`);
  }
}

function exportToCSV() {
  const data = CONFIG.promises.map(p => ({
    Domaine: p.domaine,
    Engagement: p.engagement,
    Resultat: p.resultat,
    Delai: p.delai,
    Statut: p.status,
    'En retard': p.isLate ? 'Oui' : 'Non'
  }));
  
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'promesses.csv', 'text/csv');
}

function exportToExcel() {
  // Utiliser SheetJS si disponible, sinon CSV
  if (window.XLSX) {
    const ws = XLSX.utils.json_to_sheet(CONFIG.promises);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Promesses");
    XLSX.writeFile(wb, "promesses.xlsx");
  } else {
    exportToCSV();
  }
}

function exportToPDF() {
  // Utiliser jsPDF si disponible
  if (window.jspdf) {
    const doc = new jspdf.jsPDF();
    doc.text("Promesses du Projet Sénégal", 10, 10);
    doc.save('promesses.pdf');
  } else {
    alert("Export PDF nécessite la bibliothèque jsPDF");
  }
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Fonction manquante pour calculateDeadline
function calculateDeadline(delaiText) {
  if (!CONFIG.START_DATE) return new Date();
  const text = delaiText.toLowerCase();
  const result = new Date(CONFIG.START_DATE);
  
  if (text.includes("immédiat") || text.includes("3 mois") || text.includes("court terme")) {
    result.setMonth(result.getMonth() + 3);
  } else if (text.includes("6 premiers mois") || text.includes("6 mois")) {
    result.setMonth(result.getMonth() + 6);
  } else if (text.includes("12 premiers mois") || text.includes("1ère année") || text.includes("1 an")) {
    result.setFullYear(result.getFullYear() + 1);
  } else if (text.includes("2 premières années") || text.includes("2 ans") || text.includes("1 à 2 ans")) {
    result.setFullYear(result.getFullYear() + 2);
  } else if (text.includes("3 ans") || text.includes("2 à 3 ans")) {
    result.setFullYear(result.getFullYear() + 3);
  } else if (text.includes("4 ans") || text.includes("3 à 4 ans")) {
    result.setFullYear(result.getFullYear() + 4);
  } else if (text.includes("5 ans") || text.includes("quinquennat") || text.includes("mandat") || text.includes("3 à 5 ans") || text.includes("5 à 10 ans")) {
    result.setFullYear(result.getFullYear() + 5);
  } else {
    result.setFullYear(result.getFullYear() + 5);
  }
  
  return result;
}

// Fonction manquante pour checkIfLate
function checkIfLate(status, deadline) {
  return status !== 'realise' && CONFIG.CURRENT_DATE > deadline;
}

// Fonction manquante pour loadFallbackData
function loadFallbackData() {
  console.log("Chargement des données de secours...");
  
  const DEMO_DATA = {
    start_date: "2024-04-02",
    promises: [
      {
        id: "promesse-1",
        domaine: "Économie",
        engagement: "Créer 500,000 emplois dans les 5 ans",
        resultat: "Réduction du taux de chômage à 15%",
        delai: "5 ans",
        status: "encours",
        mises_a_jour: [
          {
            date: "2024-06-15",
            text: "Lancement du programme d'incubation de startups"
          }
        ],
        votes: [4, 5, 3]
      },
      {
        id: "promesse-2",
        domaine: "Éducation",
        engagement: "Gratuité de l'éducation jusqu'au baccalauréat",
        resultat: "100% des élèves accèdent à l'éducation gratuite",
        delai: "Immédiat",
        status: "realise",
        mises_a_jour: [
          {
            date: "2024-05-20",
            text: "Décret signé pour la gratuité des frais scolaires"
          }
        ],
        votes: [5, 5, 4, 5]
      },
      {
        id: "promesse-3",
        domaine: "Santé",
        engagement: "Construction de 10 nouveaux hôpitaux régionaux",
        resultat: "Amélioration de l'accès aux soins de santé",
        delai: "3 ans",
        status: "encours",
        mises_a_jour: [],
        votes: [3, 4]
      },
      {
        id: "promesse-4",
        domaine: "Infrastructure",
        engagement: "Électrification de 100% des villages",
        resultat: "Accès universel à l'électricité",
        delai: "4 ans",
        status: "non-lance",
        mises_a_jour: [],
        votes: []
      }
    ]
  };
  
  CONFIG.START_DATE = new Date(DEMO_DATA.start_date);
  CONFIG.promises = DEMO_DATA.promises.map(p => enhancePromiseData(p));
  
  showNotification("Mode démo activé - Données locales", "info");
  renderAll();
}

// Fonction manquante pour calculatePriority
function calculatePriority(promise) {
  let score = 0;
  if (promise.status === 'realise') score += 100;
  if (promise.isLate) score += 50;
  if (promise.domaine === 'Économie') score += 30;
  if (promise.delai.includes('court')) score += 20;
  
  return Math.min(score, 100);
}

// Fonction manquante pour calculateImpactScore
function calculateImpactScore(promise) {
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

// Fonction manquante pour calculateTrend
function calculateTrend(promise) {
  const trends = ['up', 'down', 'stable'];
  return trends[Math.floor(Math.random() * trends.length)];
}

// Fonction manquante pour enhancePromiseData
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

// Fonction manquante pour applyMetadata
function applyMetadata(metadata) {
  console.log("Métadonnées appliquées:", metadata);
  // Implémentation basique
  if (metadata.categories) {
    CONFIG.categories = metadata.categories;
  }
}

// Fonction manquante pour showLoadingState
function showLoadingState(show) {
  let loader = document.getElementById('globalLoader');
  
  if (!loader) {
    loader = document.createElement('div');
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
  }
  
  loader.style.display = show ? 'flex' : 'none';
  document.body.style.overflow = show ? 'hidden' : '';
}

// Fonction manquante pour calculateStats
function calculateStats() {
  const total = CONFIG.promises.length;
  const realise = CONFIG.promises.filter(p => p.status === 'realise').length;
  const encours = CONFIG.promises.filter(p => p.status === 'encours').length;
  const nonLance = CONFIG.promises.filter(p => p.status === 'non-lance').length;
  const retard = CONFIG.promises.filter(p => p.isLate).length;
  
  return {
    total,
    realise,
    encours,
    nonLance,
    retard,
    realisePercentage: total > 0 ? ((realise / total) * 100).toFixed(1) : 0,
    encoursPercentage: total > 0 ? ((encours / total) * 100).toFixed(1) : 0,
    tauxRealisation: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0
  };
}

// ==========================================
// INITIALISATION CORRIGÉE
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
// FONCTIONS EXISTANTES CORRIGÉES
// ==========================================

async function loadData() {
  showLoadingState(true);
  
  try {
    // Chargement simplifié sans metadata
    const response = await fetch('promises.json');
    
    if (!response.ok) {
      throw new Error('Impossible de charger les promesses');
    }
    
    const data = await response.json();
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(p => enhancePromiseData(p));
    
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

function renderAll() {
  const stats = calculateStats();
  renderStats(stats);
  renderPromises(CONFIG.promises);
  updateCharts(stats);
}

function renderStats(stats) {
  const elements = {
    total: document.getElementById('total-promises'),
    realise: document.getElementById('realized'),
    encours: document.getElementById('inProgress'),
    retard: document.getElementById('delayed'),
    taux: document.getElementById('globalProgress')
  };
  
  if (elements.total) animateValue(elements.total, 0, stats.total, 1000);
  if (elements.realise) animateValue(elements.realise, 0, stats.realise, 1000);
  if (elements.encours) animateValue(elements.encours, 0, stats.encours, 1000);
  if (elements.retard) animateValue(elements.retard, 0, stats.retard, 1000);
  if (elements.taux) elements.taux.textContent = stats.tauxRealisation + '%';
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
  setupCardHoverEffects();
}

function createPromiseCard(promise) {
  const statusClass = promise.status === 'realise' ? 'status-realise' :
                     promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
  const statusText = promise.status === 'realise' ? '✅ Réalisé' :
                    promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
  
  const progress = promise.status === 'realise' ? 100 :
                  promise.status === 'encours' ? 50 : 10;
  
  return `
    <div class="promise-card" data-id="${promise.id}">
      <div class="domain-badge">${promise.domaine}</div>
      <h3 class="promise-title">${promise.engagement}</h3>
      
      <div class="result-box">
        <i class="fas fa-bullseye"></i>
        <strong>Résultat attendu :</strong> ${promise.resultat}
      </div>
      
      <div class="promise-meta">
        <div class="status-badge ${statusClass}">${statusText}</div>
        <div class="delay-badge">
          <i class="fas fa-clock"></i>
          ${promise.delai}
        </div>
      </div>
      
      <div class="progress-container">
        <div class="progress-label">
          <span>Progression</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      
      ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
        <button class="details-btn" onclick="toggleDetails('${promise.id}')">
          <i class="fas fa-history"></i>
          Voir les mises à jour (${promise.mises_a_jour.length})
        </button>
      ` : ''}
    </div>
  `;
}

// ==========================================
// FONCTIONS ANIMATIONS (corrigées)
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

  document.querySelectorAll('.stat-card, .dashboard-card, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
// UI MODERNE (corrigée)
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
  
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    navMenu.appendChild(toggle);
  }
}

function initSearchSuggestions() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    if (value.length < 2) {
      hideSuggestions();
      return;
    }
    
    const suggestions = CONFIG.promises
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

// ==========================================
// FONCTIONS UTILITAIRES MANQUANTES
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

function animateValue(element, start, end, duration) {
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

function showNotification(message, type = 'success', duration = 3000) {
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

function loadUserPreferences() {
  const saved = localStorage.getItem('userPreferences');
  if (saved) {
    CONFIG.userPreferences = JSON.parse(saved);
    
    if (CONFIG.userPreferences.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }
}

function saveUserPreferences() {
  localStorage.setItem('userPreferences', JSON.stringify(CONFIG.userPreferences));
}

// ==========================================
// FONCTIONS RESTANTES À IMPLÉMENTER SIMPLEMENT
// ==========================================

function setupDynamicFilters() {
  // Implémentation simplifiée
  const filtersContainer = document.getElementById('dynamicFilters');
  if (!filtersContainer) return;
  
  filtersContainer.innerHTML = `
    <div class="filter-group">
      <label>Priorité</label>
      <input type="range" id="priorityFilter" min="0" max="100" value="50">
    </div>
    <div class="filter-group">
      <label>Impact</label>
      <select id="impactFilter">
        <option value="">Tous</option>
        <option value="high">Élevé</option>
        <option value="medium">Moyen</option>
        <option value="low">Faible</option>
      </select>
    </div>
  `;
}

function initTooltips() {
  // Utiliser Tippy.js si disponible, sinon CSS simple
  if (typeof tippy !== 'undefined') {
    tippy('[data-tippy-content]', {
      theme: 'light-border',
      animation: 'scale'
    });
  }
}

function createWelcomeTour() {
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

function createModernCharts() {
  if (typeof Chart === 'undefined') return;
  
  // Créer des graphiques basiques
  createRadarChart();
  createTimelineChart();
}

function createRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  
  const domains = [...new Set(CONFIG.promises.map(p => p.domaine))];
  const progressData = domains.map(domain => {
    const domainPromises = CONFIG.promises.filter(p => p.domaine === domain);
    const progress = domainPromises.reduce((acc, p) => {
      return acc + (p.status === 'realise' ? 100 : 
                   p.status === 'encours' ? 50 : 0);
    }, 0) / domainPromises.length;
    
    return Math.round(progress);
  });
  
  CONFIG.charts.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: domains,
      datasets: [{
        label: 'Progression par domaine',
        data: progressData,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2
      }]
    }
  });
}

function createTimelineChart() {
  const ctx = document.getElementById('timelineChart');
  if (!ctx) return;
  
  // Données simplifiées
  CONFIG.charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Réalisations',
        data: [3, 5, 4, 6, 4, 3],
        borderColor: 'rgba(124, 58, 237, 1)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true
      }]
    }
  });
}

function updateCharts(stats) {
  if (CONFIG.charts.radar) {
    // Mettre à jour si nécessaire
  }
}

function startRealTimeUpdates() {
  // Mise à jour simple toutes les 30 secondes
  setInterval(() => {
    updateLiveData();
  }, 30000);
}

function updateLiveData() {
  const stats = calculateStats();
  animateCounters(stats);
  updateCharts(stats);
}

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
        animateValue(element, current, target, 500);
      }
    }
  });
}

function setupEventListeners() {
  // Navigation
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
      }
    });
  });
  
  // Scroll progress
  window.addEventListener('scroll', updateScrollProgress);
  
  // Filtres
  const searchInput = document.getElementById('searchInput');
  const sectorFilter = document.getElementById('sectorFilter');
  const statusFilter = document.getElementById('statusFilter');
  
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  
  // Bouton scroll to top
  const scrollBtn = document.getElementById('scrollToTop');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sector = document.getElementById('sectorFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  
  let filtered = CONFIG.promises.filter(p => {
    const matchSearch = p.engagement.toLowerCase().includes(search) ||
                       p.resultat.toLowerCase().includes(search);
    const matchSector = !sector || p.domaine === sector;
    const matchStatus = !status || p.status === status;
    
    return matchSearch && matchSector && matchStatus;
  });
  
  renderPromises(filtered);
}

// ==========================================
// EXPORT POUR UTILISATION GLOBALE
// ==========================================

window.APP = {
  CONFIG,
  refreshData: loadData,
  exportData: exportToFormat,
  toggleTheme: () => {
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.click();
  },
  showHelp: () => showNotification('Aide - Utilisez les filtres pour explorer les données', 'info'),
  getStats: calculateStats,
  showTour: () => {
    showNotification('🎬 Démarrage de la visite guidée', 'info');
    // Implémenter la logique de tour ici
  }
};

// Ajouter la fonction manquante pour l'erreur createSingleton
if (typeof window.applyStyles === 'undefined') {
  window.applyStyles = function() {
    console.log('applyStyles function called');
    // Cette fonction est appelée par createSingleton.ts
    // Elle peut être vide ou contenir votre logique de style
  };
}

console.log('📊 Tableau de bord ProjetBI prêt avec corrections');
