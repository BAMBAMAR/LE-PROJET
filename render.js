// render.js - Version sans AOS
// ==========================================
// RENDER.JS - MOTEUR DE RENDU SANS AOS
// ==========================================

// Configuration du rendu
const RENDER_CONFIG = {
  animationsEnabled: true,
  theme: 'light',
  currentView: 'grid',
  itemsPerPage: 12,
  currentPage: 1
};

// ==========================================
// FONCTIONS PRINCIPALES DE RENDU (SIMPLIFIÉES)
// ==========================================

/**
 * Rendu simplifié du tableau de bord
 */
function renderCompleteDashboard() {
  console.log('🎨 Rendu du tableau de bord...');
  
  // Rendu séquentiel
  renderHeroSection();
  renderKPICards();
  renderCharts();
  renderPromiseCards();
  renderFooter();
  
  // Initialiser les interactions
  initializeInteractions();
}

/**
 * Rendu de la section Hero simplifiée
 */
function renderHeroSection() {
  const stats = calculateCompleteStats();
  const heroSection = document.querySelector('.hero-section .hero-content');
  
  if (!heroSection) return;
  
  heroSection.innerHTML = `
    <h1 class="hero-title">
      Tableau de Bord Interactif
      <span class="title-sub">Suivi des Engagements du Projet Sénégal</span>
    </h1>
    
    <p class="hero-subtitle">
      Visualisez, analysez et interagissez avec les données en temps réel.
    </p>
    
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-value">${stats.total}</div>
        <div class="hero-stat-label">Engagements</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">${stats.realised}</div>
        <div class="hero-stat-label">Réalisés</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">${stats.inProgress}</div>
        <div class="hero-stat-label">En cours</div>
      </div>
    </div>
    
    <div class="hero-progress">
      <div class="progress-header">
        <span>Progression globale</span>
        <span>${stats.progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stats.progress}%"></div>
      </div>
    </div>
  `;
  
  animateHeroElements();
}

/**
 * Rendu des cartes KPI simplifiées
 */
function renderKPICards() {
  const stats = calculateCompleteStats();
  const kpis = generateKPIData(stats);
  const kpiGrid = document.getElementById('kpiGrid');
  
  if (!kpiGrid) return;
  
  kpiGrid.innerHTML = kpis.map(kpi => `
    <div class="stat-card">
      <div class="stat-icon">
        <i class="${kpi.icon}"></i>
      </div>
      <div class="stat-value">${kpi.value}</div>
      <div class="stat-label">${kpi.label}</div>
      <div class="stat-percentage">${kpi.progress}%</div>
    </div>
  `).join('');
}

/**
 * Rendu des graphiques simplifiés
 */
function renderCharts() {
  if (typeof Chart === 'undefined') return;
  
  renderSimpleRadarChart();
  renderSimpleTimelineChart();
}

function renderSimpleRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  
  const domains = ['Économie', 'Éducation', 'Santé', 'Infrastructure'];
  const progressData = [75, 85, 60, 70];
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: domains,
      datasets: [{
        label: 'Progression',
        data: progressData,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function renderSimpleTimelineChart() {
  const ctx = document.getElementById('timelineChart');
  if (!ctx) return;
  
  new Chart(ctx, {
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

/**
 * Rendu des cartes d'engagement simplifiées
 */
function renderPromiseCards(promises = CONFIG.promises) {
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
  
  container.innerHTML = promises.map(promise => {
    const statusClass = promise.status === 'realise' ? 'status-realise' :
                       promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
    const statusText = promise.status === 'realise' ? '✅ Réalisé' :
                      promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    
    const progress = promise.status === 'realise' ? 100 :
                    promise.status === 'encours' ? 50 : 10;
    
    return `
      <div class="promise-card">
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
      </div>
    `;
  }).join('');
}

/**
 * Rendu du footer simplifié
 */
function renderFooter() {
  const footer = document.querySelector('.footer-bottom');
  if (!footer) return;
  
  footer.innerHTML = `
    <p>© 2026 Projet BI - Tableau de Bord Interactif</p>
    <p class="footer-version">Version 2.0.0</p>
  `;
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function calculateCompleteStats() {
  const promises = CONFIG.promises;
  const total = promises.length;
  const realised = promises.filter(p => p.status === 'realise').length;
  const inProgress = promises.filter(p => p.status === 'encours').length;
  const notStarted = promises.filter(p => p.status === 'non-lance').length;
  
  const progress = promises.reduce((sum, p) => {
    return sum + (p.status === 'realise' ? 100 : 
                 p.status === 'encours' ? 50 : 0);
  }, 0) / (total * 100) * 100;
  
  return {
    total,
    realised,
    inProgress,
    notStarted,
    progress: Math.round(progress)
  };
}

function generateKPIData(stats) {
  return [
    {
      icon: 'fas fa-bullseye',
      label: 'Engagements totaux',
      value: stats.total,
      progress: 100
    },
    {
      icon: 'fas fa-check-circle',
      label: 'Taux de réalisation',
      value: `${stats.progress}%`,
      progress: stats.progress
    },
    {
      icon: 'fas fa-sync-alt',
      label: 'En cours',
      value: stats.inProgress,
      progress: Math.round((stats.inProgress / stats.total) * 100)
    },
    {
      icon: 'fas fa-hourglass-start',
      label: 'Non lancés',
      value: stats.notStarted,
      progress: Math.round((stats.notStarted / stats.total) * 100)
    }
  ];
}

function animateHeroElements() {
  // Animation simple des compteurs
  const counters = document.querySelectorAll('.hero-stat-value');
  counters.forEach(counter => {
    const finalValue = parseInt(counter.textContent);
    if (!isNaN(finalValue)) {
      animateCounter(counter, 0, finalValue, 1500);
    }
  });
  
  // Animation de la barre de progression
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const finalWidth = parseInt(progressBar.style.width);
    progressBar.style.width = '0%';
    
    setTimeout(() => {
      progressBar.style.transition = 'width 1s ease-out';
      progressBar.style.width = `${finalWidth}%`;
    }, 500);
  }
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

function initializeInteractions() {
  // Initialiser les filtres
  initializeFilters();
  
  // Initialiser le hover sur les cartes
  initializeCardHover();
}

function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const domainFilter = document.getElementById('domainFilter');
  const statusFilter = document.getElementById('statusFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  
  if (domainFilter) {
    // Remplir les options de domaine
    const domains = [...new Set(CONFIG.promises.map(p => p.domaine))];
    domains.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain;
      option.textContent = domain;
      domainFilter.appendChild(option);
    });
    
    domainFilter.addEventListener('change', applyFilters);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
}

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const domain = document.getElementById('domainFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  
  const filtered = CONFIG.promises.filter(p => {
    const matchSearch = p.engagement.toLowerCase().includes(search) ||
                       p.resultat.toLowerCase().includes(search);
    const matchDomain = !domain || p.domaine === domain;
    const matchStatus = !status || p.status === status;
    
    return matchSearch && matchDomain && matchStatus;
  });
  
  renderPromiseCards(filtered);
}

function initializeCardHover() {
  document.querySelectorAll('.promise-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    });
  });
}

// ==========================================
// EXPORT GLOBAL SIMPLIFIÉ
// ==========================================

window.Render = {
  dashboard: renderCompleteDashboard,
  promises: renderPromiseCards,
  charts: renderCharts
};

console.log('🎨 Moteur de rendu simplifié chargé');
