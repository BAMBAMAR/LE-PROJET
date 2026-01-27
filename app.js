// ==========================================
// APP.JS - PROJET SÉNÉGAL MODERNISÉ V2
// ==========================================

// Configuration globale
const CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: [],
  charts: {},
  visiblePromises: 12,
  currentDailyPromise: null
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation de l\'application...');
  
  initAnimations();
  await loadData();
  setupEventListeners();
  setupMobileMenu();
  setupScrollProgress();
  setupScrollToTop();
  updateCurrentDate();
  selectDailyPromise();
  createCharts();
  
  console.log('✅ Application initialisée avec succès');
});

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================
async function loadData() {
  try {
    const response = await fetch('promises.json');
    if (!response.ok) {
      throw new Error('Fichier promises.json non trouvé');
    }
    
    const data = await response.json();
    
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(p => ({
      ...p,
      deadline: calculateDeadline(p.delai),
      isLate: checkIfLate(p.status, calculateDeadline(p.delai))
    }));
    
    console.log(`📊 ${CONFIG.promises.length} promesses chargées`);
    
    renderAll();
    populateFilters();
  } catch (error) {
    console.error('❌ Erreur chargement:', error);
    showNotification('Erreur de chargement des données. Mode démo activé.', 'error');
    
    // Mode démo avec données exemple
    CONFIG.promises = generateDemoData();
    renderAll();
    populateFilters();
  }
}

// ==========================================
// GÉNÉRATION DONNÉES DÉMO
// ==========================================
function generateDemoData() {
  const domains = ['Gouvernance', 'Économie', 'Social', 'Éducation', 'Santé', 'Infrastructure'];
  const statuses = ['realise', 'encours', 'non-lance'];
  const delays = ['3 mois', '6 mois', '1 an', '2 ans', '5 ans'];
  
  return Array.from({ length: 99 }, (_, i) => ({
    id: `demo-${i + 1}`,
    engagement: `Engagement démo ${i + 1}: ${generateRandomEngagement()}`,
    domaine: domains[Math.floor(Math.random() * domains.length)],
    resultat: `Résultat attendu pour l'engagement ${i + 1}`,
    delai: delays[Math.floor(Math.random() * delays.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    mises_a_jour: []
  })).map(p => ({
    ...p,
    deadline: calculateDeadline(p.delai),
    isLate: checkIfLate(p.status, calculateDeadline(p.delai))
  }));
}

function generateRandomEngagement() {
  const engagements = [
    'Améliorer les services publics',
    'Développer les infrastructures',
    'Renforcer la sécurité',
    'Promouvoir l\'éducation',
    'Améliorer la santé',
    'Créer des emplois',
    'Soutenir l\'agriculture',
    'Développer le tourisme'
  ];
  return engagements[Math.floor(Math.random() * engagements.length)];
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
    nonLancePercentage: total > 0 ? ((nonLance / total) * 100).toFixed(1) : 0,
    retardPercentage: total > 0 ? ((retard / total) * 100).toFixed(1) : 0,
    tauxRealisation: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0
  };
}

// ==========================================
// RENDU PRINCIPAL
// ==========================================
function renderAll() {
  const stats = calculateStats();
  renderStats(stats);
  renderPromises(CONFIG.promises.slice(0, CONFIG.visiblePromises));
  updateCharts(stats);
  updatePromisesCount();
}

function renderStats(stats) {
  // Mise à jour des statistiques
  animateValue(document.getElementById('total-promises'), 0, stats.total, 1000);
  animateValue(document.getElementById('realized'), 0, stats.realise, 1000);
  animateValue(document.getElementById('inProgress'), 0, stats.encours, 1000);
  animateValue(document.getElementById('delayed'), 0, stats.retard, 1000);
  
  // Mise à jour des pourcentages
  const realizedPercent = document.getElementById('realized-percent');
  const progressPercent = document.getElementById('progress-percent');
  const delayedPercent = document.getElementById('delayed-percent');
  
  if (realizedPercent) realizedPercent.textContent = stats.realisePercentage + '%';
  if (progressPercent) progressPercent.textContent = stats.encoursPercentage + '%';
  if (delayedPercent) delayedPercent.textContent = stats.retardPercentage + '%';
  
  // Mise à jour de la barre de progression globale
  const globalProgress = document.getElementById('globalProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  
  if (globalProgress) globalProgress.textContent = stats.tauxRealisation + '%';
  if (progressBarFill) {
    setTimeout(() => {
      progressBarFill.style.width = stats.tauxRealisation + '%';
    }, 300);
  }
  
  // Mise à jour du compteur total
  const totalCount = document.getElementById('total-count');
  if (totalCount) totalCount.textContent = stats.total;
}

function renderPromises(promises) {
  const container = document.getElementById('promisesContainer');
  if (!container) return;
  
  if (promises.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>Aucun résultat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = promises.map(promise => createPromiseCard(promise)).join('');
  
  // Animation d'apparition progressive
  const cards = container.querySelectorAll('.promise-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

function createPromiseCard(promise) {
  const statusClass = promise.status === 'realise' ? 'status-realise' :
                     promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
  const statusText = promise.status === 'realise' ? '✅ Réalisé' :
                    promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
  
  const progress = promise.status === 'realise' ? 100 :
                  promise.status === 'encours' ? 50 : 10;
  
  const lateWarning = promise.isLate ? `
    <div class="late-warning">
      <i class="fas fa-exclamation-circle"></i>
      En retard
    </div>
  ` : '';
  
  return `
    <div class="promise-card" data-id="${promise.id}">
      <div class="domain-badge">${promise.domaine}</div>
      <h3 class="promise-title">${promise.engagement}</h3>
      
      <div class="result-box">
        <i class="fas fa-bullseye"></i>
        <div>
          <strong>Résultat attendu :</strong>
          ${promise.resultat}
        </div>
      </div>
      
      <div class="promise-meta">
        <div class="status-badge ${statusClass}">${statusText}</div>
        <div class="delay-badge">
          <i class="fas fa-clock"></i>
          ${promise.delai}
        </div>
      </div>
      
      ${lateWarning}
      
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
// PROMESSE DU JOUR
// ==========================================
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('fr-FR', options);
  }
}

function selectDailyPromise() {
  if (CONFIG.promises.length === 0) return;
  
  // Sélectionner une promesse aléatoire basée sur la date du jour
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % CONFIG.promises.length;
  CONFIG.currentDailyPromise = CONFIG.promises[index];
  
  renderDailyPromise();
}

function renderDailyPromise() {
  if (!CONFIG.currentDailyPromise) return;
  
  const promise = CONFIG.currentDailyPromise;
  
  document.getElementById('dailyDomain').textContent = promise.domaine;
  document.getElementById('dailyTitle').textContent = promise.engagement;
  document.getElementById('dailyResult').textContent = promise.resultat;
  document.getElementById('dailyDeadline').textContent = promise.delai;
  
  const progress = promise.status === 'realise' ? 100 :
                  promise.status === 'encours' ? 50 : 10;
  
  const statusText = promise.status === 'realise' ? 'Réalisé' :
                     promise.status === 'encours' ? 'En cours' : 'Non lancé';
  
  document.getElementById('dailyStatus').innerHTML = `
    <i class="fas fa-${promise.status === 'realise' ? 'check-circle' : promise.status === 'encours' ? 'sync-alt' : 'hourglass-start'}"></i>
    ${statusText}
  `;
  
  document.getElementById('dailyProgressPercent').textContent = progress + '%';
  document.getElementById('dailyProgressBar').style.width = progress + '%';
  
  // Événement pour voir les détails
  const viewDetailsBtn = document.getElementById('viewDailyDetails');
  if (viewDetailsBtn) {
    viewDetailsBtn.onclick = () => {
      // Scroller vers la promesse dans la liste
      const promiseCard = document.querySelector(`[data-id="${promise.id}"]`);
      if (promiseCard) {
        promiseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        promiseCard.style.animation = 'highlight 2s ease';
      }
    };
  }
}

// ==========================================
// GRAPHIQUES
// ==========================================
function createCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js non chargé');
    return;
  }
  
  const stats = calculateStats();
  
  // Graphique de statut (Donut)
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    CONFIG.charts.status = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Réalisés', 'En Cours', 'Non Lancés', 'En Retard'],
        datasets: [{
          data: [stats.realise, stats.encours, stats.nonLance, stats.retard],
          backgroundColor: [
            'rgba(42, 157, 143, 0.8)',
            'rgba(74, 144, 226, 0.8)',
            'rgba(108, 117, 125, 0.6)',
            'rgba(231, 111, 81, 0.8)'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { family: 'Inter', size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: '600' },
            bodyFont: { size: 13 }
          }
        }
      }
    });
  }
  
  // Graphique par domaine
  const domainCtx = document.getElementById('domainChart');
  if (domainCtx) {
    const domainCounts = {};
    CONFIG.promises.forEach(p => {
      domainCounts[p.domaine] = (domainCounts[p.domaine] || 0) + 1;
    });
    
    CONFIG.charts.domain = new Chart(domainCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(domainCounts),
        datasets: [{
          label: 'Nombre d\'engagements',
          data: Object.values(domainCounts),
          backgroundColor: 'rgba(42, 109, 93, 0.7)',
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(42, 109, 93, 0.9)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: { family: 'Inter', size: 11 },
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  // Graphique d'évolution mensuelle
  const monthlyCtx = document.getElementById('monthlyChart');
  if (monthlyCtx) {
    CONFIG.charts.monthly = new Chart(monthlyCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Engagements Réalisés',
          data: [2, 3, 5, 4, 6, 7, 5, 6, 8, 7, 9, 10],
          borderColor: 'rgba(42, 157, 143, 1)',
          backgroundColor: 'rgba(42, 157, 143, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(42, 157, 143, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { family: 'Inter', size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: { family: 'Inter', size: 11 }
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
      stats.realise, stats.encours, stats.nonLance, stats.retard
    ];
    CONFIG.charts.status.update('none');
  }
}

// ==========================================
// FILTRES
// ==========================================
function populateFilters() {
  // Remplir le filtre des domaines
  const sectorFilter = document.getElementById('sectorFilter');
  if (sectorFilter) {
    const domains = [...new Set(CONFIG.promises.map(p => p.domaine))].sort();
    domains.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain;
      option.textContent = domain;
      sectorFilter.appendChild(option);
    });
  }
}

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sector = document.getElementById('sectorFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  const delay = document.getElementById('delayFilter')?.value || '';
  
  let filtered = CONFIG.promises.filter(p => {
    const matchSearch = p.engagement.toLowerCase().includes(search) ||
                       p.resultat.toLowerCase().includes(search);
    const matchSector = !sector || p.domaine === sector;
    
    let matchStatus = true;
    if (status === 'retard') {
      matchStatus = p.isLate;
    } else if (status) {
      matchStatus = p.status === status;
    }
    
    let matchDelay = true;
    if (delay === 'immediat') {
      matchDelay = p.delai.toLowerCase().includes('3 mois') || p.delai.toLowerCase().includes('immédiat');
    } else if (delay === 'court') {
      matchDelay = p.delai.toLowerCase().includes('6 mois') || p.delai.toLowerCase().includes('1 an');
    } else if (delay === 'moyen') {
      matchDelay = p.delai.toLowerCase().includes('2 ans') || p.delai.toLowerCase().includes('3 ans');
    } else if (delay === 'long') {
      matchDelay = p.delai.toLowerCase().includes('5 ans');
    }
    
    return matchSearch && matchSector && matchStatus && matchDelay;
  });
  
  renderPromises(filtered.slice(0, CONFIG.visiblePromises));
  updatePromisesCount(filtered.length);
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('sectorFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('delayFilter').value = '';
  
  CONFIG.visiblePromises = 12;
  renderPromises(CONFIG.promises.slice(0, CONFIG.visiblePromises));
  updatePromisesCount();
}

function updatePromisesCount(count = null) {
  const promisesCount = document.getElementById('promisesCount');
  if (promisesCount) {
    promisesCount.textContent = count !== null ? count : CONFIG.promises.length;
  }
}

// ==========================================
// ÉVÉNEMENTS
// ==========================================
function setupEventListeners() {
  // Filtres
  const searchInput = document.getElementById('searchInput');
  const sectorFilter = document.getElementById('sectorFilter');
  const statusFilter = document.getElementById('statusFilter');
  const delayFilter = document.getElementById('delayFilter');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const clearSearch = document.getElementById('clearSearch');
  
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (delayFilter) delayFilter.addEventListener('change', applyFilters);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
  if (clearSearch) clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    applyFilters();
  });
  
  // Bouton "Charger plus"
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      CONFIG.visiblePromises += 12;
      renderPromises(CONFIG.promises.slice(0, CONFIG.visiblePromises));
      
      if (CONFIG.visiblePromises >= CONFIG.promises.length) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }
  
  // Toggle vue grille/liste
  const viewBtns = document.querySelectorAll('.view-btn');
  const promisesGrid = document.getElementById('promisesContainer');
  
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      if (view === 'list') {
        promisesGrid.style.gridTemplateColumns = '1fr';
      } else {
        promisesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
      }
    });
  });
  
  // Boutons de partage
  setupShareButtons();
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    // Fermer le menu au clic sur un lien
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

function setupScrollProgress() {
  window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;
    
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';
  });
}

function setupScrollToTop() {
  const scrollBtn = document.getElementById('scrollToTop');
  
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });
    
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function setupShareButtons() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Suivi des engagements du Président Diomaye Faye');
  
  const shareTwitter = document.getElementById('share-twitter-dash');
  const shareFacebook = document.getElementById('share-facebook-dash');
  const shareWhatsapp = document.getElementById('share-whatsapp-dash');
  const shareLinkedin = document.getElementById('share-linkedin-dash');
  
  if (shareTwitter) {
    shareTwitter.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }
  if (shareFacebook) {
    shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }
  if (shareWhatsapp) {
    shareWhatsapp.href = `https://wa.me/?text=${text}%20${url}`;
  }
  if (shareLinkedin) {
    shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  }
}

// ==========================================
// ANIMATIONS
// ==========================================
function initAnimations() {
  // Animations subtiles d'arrière-plan
  createFloatingElements();
}

function createFloatingElements() {
  // Création d'éléments flottants pour l'animation de fond (optionnel)
  // Peut être ajouté si souhaité
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

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    <span style="margin-left: 0.5rem;">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Fonction globale pour toggle des détails
window.toggleDetails = function(promiseId) {
  console.log('Toggle details for:', promiseId);
  // À implémenter: afficher modal avec détails de la promesse
};

// Export des fonctions pour utilisation globale
window.APP = {
  CONFIG,
  renderAll,
  applyFilters,
  resetFilters
};
