// ==========================================
// APP.JS - PROJET SÉNÉGAL MODERNISÉ
// ==========================================

// Configuration globale
const CONFIG = // ==========================================
// APP.JS - PROJET SÉNÉGAL MODERNISÉ
// ==========================================

// Configuration globale
const CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: [],
  charts: {}
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initAnimations();
  await loadData();
  setupEventListeners();
  createCharts();
  updateScrollProgress();
  console.log('✅ Application initialisée');
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
    const response = await fetch('promises.json');
    const data = await response.json();
    
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(p => ({
      ...p,
      deadline: calculateDeadline(p.delai),
      isLate: checkIfLate(p.status, calculateDeadline(p.delai))
    }));
    
    renderAll();
  } catch (error) {
    console.error('Erreur chargement:', error);
    showNotification('Erreur de chargement des données', 'error');
  }
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
// RENDU
// ==========================================
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
  
  // Animer la barre de progression
  const progressBar = document.getElementById('progressBarFill');
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = stats.tauxRealisation + '%';
    }, 100);
  }
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
    <div class="promise-card" data-id="${promise.id}" onmousemove="handleCardHover(event, this)">
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
// GRAPHIQUES (Chart.js)
// ==========================================
function createCharts() {
  // Chart.js doit être chargé dans index.html
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js non chargé');
    return;
  }
  
  const stats = calculateStats();
  
  // Graphique de statut (Donut)
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    CONFIG.charts.status = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Réalisés', 'En Cours', 'En Retard', 'Non Lancés'],
        datasets: [{
          data: [stats.realise, stats.encours, stats.retard, stats.nonLance],
          backgroundColor: [
            'rgba(42, 157, 143, 0.8)',
            'rgba(74, 144, 226, 0.8)',
            'rgba(231, 111, 81, 0.8)',
            'rgba(108, 117, 125, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#141b2d'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#b8c1ec',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  }
  
  // Graphique mensuel (Barres)
  const monthlyCtx = document.getElementById('monthlyChart');
  if (monthlyCtx) {
    CONFIG.charts.monthly = new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Engagements Réalisés',
          data: [3, 5, 4, 6, 4, 3],
          backgroundColor: 'rgba(42, 157, 143, 0.8)',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#b8c1ec',
              font: { family: 'Inter' }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#b8c1ec' },
            grid: { color: 'rgba(184, 193, 236, 0.1)' }
          },
          y: {
            ticks: { color: '#b8c1ec' },
            grid: { color: 'rgba(184, 193, 236, 0.1)' }
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
    CONFIG.charts.status.update();
  }
}

// ==========================================
// INTERACTIONS
// ==========================================
function setupEventListeners() {
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
  
  // Scroll progress
  window.addEventListener('scroll', updateScrollProgress);
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

window.handleCardHover = function(e, card) {
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty('--mouse-x', x + '%');
  card.style.setProperty('--mouse-y', y + '%');
};

window.toggleDetails = function(promiseId) {
  const card = document.querySelector(`[data-id="${promiseId}"]`);
  if (card) {
    // Toggle details logic
    console.log('Toggle details for:', promiseId);
  }
};

// ==========================================
// UTILITAIRES
// ==========================================
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

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export pour utilisation globale
window.APP = {
  CONFIG,
  renderAll,
  applyFilters
};

  CURRENT_DATE: new Date(),
  promises: [],
  charts: {}
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initAnimations();
  await loadData();
  setupEventListeners();
  createCharts();
  updateScrollProgress();
  console.log('✅ Application initialisée');
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
    const response = await fetch('promises.json');
    const data = await response.json();
    
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(p => ({
      ...p,
      deadline: calculateDeadline(p.delai),
      isLate: checkIfLate(p.status, calculateDeadline(p.delai))
    }));
    
    renderAll();
  } catch (error) {
    console.error('Erreur chargement:', error);
    showNotification('Erreur de chargement des données', 'error');
  }
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
// RENDU
// ==========================================
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
  
  // Animer la barre de progression
  const progressBar = document.getElementById('progressBarFill');
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = stats.tauxRealisation + '%';
    }, 100);
  }
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
    <div class="promise-card" data-id="${promise.id}" onmousemove="handleCardHover(event, this)">
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
// GRAPHIQUES (Chart.js)
// ==========================================
function createCharts() {
  // Chart.js doit être chargé dans index.html
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js non chargé');
    return;
  }
  
  const stats = calculateStats();
  
  // Graphique de statut (Donut)
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    CONFIG.charts.status = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Réalisés', 'En Cours', 'En Retard', 'Non Lancés'],
        datasets: [{
          data: [stats.realise, stats.encours, stats.retard, stats.nonLance],
          backgroundColor: [
            'rgba(42, 157, 143, 0.8)',
            'rgba(74, 144, 226, 0.8)',
            'rgba(231, 111, 81, 0.8)',
            'rgba(108, 117, 125, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#141b2d'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#b8c1ec',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  }
  
  // Graphique mensuel (Barres)
  const monthlyCtx = document.getElementById('monthlyChart');
  if (monthlyCtx) {
    CONFIG.charts.monthly = new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Engagements Réalisés',
          data: [3, 5, 4, 6, 4, 3],
          backgroundColor: 'rgba(42, 157, 143, 0.8)',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#b8c1ec',
              font: { family: 'Inter' }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#b8c1ec' },
            grid: { color: 'rgba(184, 193, 236, 0.1)' }
          },
          y: {
            ticks: { color: '#b8c1ec' },
            grid: { color: 'rgba(184, 193, 236, 0.1)' }
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
    CONFIG.charts.status.update();
  }
}

// ==========================================
// INTERACTIONS
// ==========================================
function setupEventListeners() {
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
  
  // Scroll progress
  window.addEventListener('scroll', updateScrollProgress);
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

window.handleCardHover = function(e, card) {
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty('--mouse-x', x + '%');
  card.style.setProperty('--mouse-y', y + '%');
};

window.toggleDetails = function(promiseId) {
  const card = document.querySelector(`[data-id="${promiseId}"]`);
  if (card) {
    // Toggle details logic
    console.log('Toggle details for:', promiseId);
  }
};

// ==========================================
// UTILITAIRES
// ==========================================
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

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export pour utilisation globale
window.APP = {
  CONFIG,
  renderAll,
  applyFilters
};
// ==========================================
// DASHBOARD ÉDITORIAL (NON INTRUSIF)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initEditorialDashboard();
});

function initEditorialDashboard() {
  loadPromiseOfDay();
  loadEditorialData();
}

function loadPromiseOfDay() {
  if (!CONFIG.promises || CONFIG.promises.length === 0) return;

  const dayIndex = new Date().getDate() % CONFIG.promises.length;
  const promise = CONFIG.promises[dayIndex];

  const el = document.getElementById('promiseOfDay');
  if (el) {
    el.textContent = promise.titre || promise.intitule || "Promesse citoyenne à suivre aujourd’hui.";
  }
}

function loadEditorialData() {
  const news = [
    "Lancement du comité de suivi des engagements",
    "Audit public annoncé sur les finances",
    "Réforme administrative en discussion"
  ];

  const press = [
    "Le Soleil – Analyse des 100 premiers jours",
    "Sud Quotidien – Transparence et gouvernance",
    "Walf – Le défi des promesses électorales"
  ];

  const updates = [
    "Promesse #12 passée à EN COURS",
    "Ajout de nouvelles données sectorielles",
    "Correction méthodologique des délais"
  ];

  populateList('newsList', news);
  populateList('pressReview', press);
  populateList('lastUpdates', updates);
}

function populateList(id, items) {
  const ul = document.getElementById(id);
  if (!ul) return;

  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
}
