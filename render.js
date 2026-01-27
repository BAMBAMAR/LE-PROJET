// ==========================================
// RENDER.JS - MOTEUR DE RENDU MODERNE ET INTERACTIF
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
// FONCTIONS PRINCIPALES DE RENDU
// ==========================================

/**
 * Rendu complet du tableau de bord
 */
function renderCompleteDashboard() {
  console.log('🎨 Rendu du tableau de bord...');
  
  // Rendu séquentiel avec animations
  setTimeout(() => renderHeroSection(), 100);
  setTimeout(() => renderKPICards(), 300);
  setTimeout(() => renderCharts(), 500);
  setTimeout(() => renderTimeline(), 700);
  setTimeout(() => renderPromiseCards(), 900);
  setTimeout(() => renderInsights(), 1100);
  setTimeout(() => renderFooter(), 1300);
  
  // Initialiser les interactions après le rendu
  setTimeout(initializeInteractions, 1500);
}

/**
 * Rendu de la section Hero
 */
function renderHeroSection() {
  const stats = calculateCompleteStats();
  
  const heroHTML = `
    <div class="hero-content" data-aos="fade-up">
      <div class="hero-title-wrapper">
        <h1 class="hero-title">
          <span class="title-main">Tableau de Bord Interactif</span>
          <span class="title-sub">Suivi des Engagements du Projet Sénégal</span>
        </h1>
        
        <div class="hero-badges">
          <span class="hero-badge">
            <i class="fas fa-sync-alt fa-spin"></i>
            Données en temps réel
          </span>
          <span class="hero-badge">
            <i class="fas fa-chart-line"></i>
            ${stats.progress}% progression
          </span>
        </div>
      </div>
      
      <div class="hero-stats-container">
        <div class="hero-stats-grid">
          <div class="hero-stat-card" data-aos="zoom-in" data-aos-delay="100">
            <div class="hero-stat-icon">
              <i class="fas fa-bullseye"></i>
            </div>
            <div class="hero-stat-content">
              <div class="hero-stat-value" id="hero-total">${stats.total}</div>
              <div class="hero-stat-label">Engagements totaux</div>
            </div>
          </div>
          
          <div class="hero-stat-card" data-aos="zoom-in" data-aos-delay="200">
            <div class="hero-stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="hero-stat-content">
              <div class="hero-stat-value" id="hero-realised">${stats.realised}</div>
              <div class="hero-stat-label">Réalisés</div>
              <div class="hero-stat-change positive">
                <i class="fas fa-arrow-up"></i>
                ${stats.realisedPercentage}%
              </div>
            </div>
          </div>
          
          <div class="hero-stat-card" data-aos="zoom-in" data-aos-delay="300">
            <div class="hero-stat-icon">
              <i class="fas fa-sync-alt"></i>
            </div>
            <div class="hero-stat-content">
              <div class="hero-stat-value" id="hero-in-progress">${stats.inProgress}</div>
              <div class="hero-stat-label">En cours</div>
              <div class="hero-stat-change">
                ${stats.activeProjects} actifs
              </div>
            </div>
          </div>
          
          <div class="hero-stat-card" data-aos="zoom-in" data-aos-delay="400">
            <div class="hero-stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="hero-stat-content">
              <div class="hero-stat-value" id="hero-overdue">${stats.overdue}</div>
              <div class="hero-stat-label">En retard</div>
              <div class="hero-stat-change negative">
                <i class="fas fa-clock"></i>
                Attention requise
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="hero-progress" data-aos="fade-up" data-aos-delay="500">
        <div class="progress-header">
          <span>Progression globale</span>
          <span>${stats.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.progress}%">
            <div class="progress-glow"></div>
          </div>
        </div>
        <div class="progress-details">
          <span><i class="fas fa-check" style="color: #10b981;"></i> ${stats.realised} réalisés</span>
          <span><i class="fas fa-sync-alt" style="color: #3b82f6;"></i> ${stats.inProgress} en cours</span>
          <span><i class="fas fa-hourglass-start" style="color: #64748b;"></i> ${stats.notStarted} non lancés</span>
        </div>
      </div>
      
      <div class="hero-actions" data-aos="fade-up" data-aos-delay="600">
        <button class="hero-action-btn primary" onclick="APP.showTour()">
          <i class="fas fa-play-circle"></i>
          Démarrer la visite guidée
        </button>
        <button class="hero-action-btn secondary" onclick="APP.refreshData()">
          <i class="fas fa-sync-alt"></i>
          Actualiser les données
        </button>
        <button class="hero-action-btn outline" id="shareHero">
          <i class="fas fa-share-alt"></i>
          Partager ce tableau
        </button>
      </div>
    </div>
  `;
  
  const heroSection = document.getElementById('heroSection') || document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.innerHTML = heroHTML;
    animateHeroElements();
  }
}

/**
 * Rendu des cartes KPI
 */
function renderKPICards() {
  const stats = calculateCompleteStats();
  const kpis = generateKPIData(stats);
  
  const kpiGrid = document.getElementById('kpiGrid');
  if (!kpiGrid) return;
  
  kpiGrid.innerHTML = kpis.map((kpi, index) => `
    <div class="kpi-card" 
         data-aos="fade-up" 
         data-aos-delay="${index * 100}"
         data-kpi-id="${kpi.id}">
      <div class="kpi-card-header">
        <div class="kpi-icon" style="background: ${kpi.color}20; color: ${kpi.color};">
          <i class="${kpi.icon}"></i>
        </div>
        <div class="kpi-trend ${kpi.trend}">
          <i class="fas fa-${kpi.trend === 'up' ? 'arrow-up' : kpi.trend === 'down' ? 'arrow-down' : 'minus'}"></i>
          ${kpi.change}%
        </div>
      </div>
      
      <div class="kpi-card-content">
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-description">${kpi.description}</div>
      </div>
      
      <div class="kpi-progress">
        <div class="kpi-progress-bar">
          <div class="kpi-progress-fill" style="width: ${kpi.progress}%; background: ${kpi.color};"></div>
        </div>
        <div class="kpi-progress-label">${kpi.progress}%</div>
      </div>
      
      <div class="kpi-card-footer">
        <button class="kpi-action-btn" onclick="showKpiDetails('${kpi.id}')">
          <i class="fas fa-chart-bar"></i>
          Détails
        </button>
        <button class="kpi-action-btn" onclick="compareKPI('${kpi.id}')">
          <i class="fas fa-exchange-alt"></i>
          Comparer
        </button>
      </div>
    </div>
  `).join('');
  
  // Animer les valeurs KPI
  setTimeout(() => animateKPIValues(), 500);
}

/**
 * Rendu des graphiques
 */
function renderCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js non disponible');
    return;
  }
  
  renderRadarChart();
  renderTimelineChart();
  renderDistributionChart();
  renderHeatmap();
}

function renderRadarChart() {
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
  
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
  
  if (CONFIG.charts.radar) CONFIG.charts.radar.destroy();
  
  CONFIG.charts.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: domains,
      datasets: [{
        label: 'Progression',
        data: progressData,
        backgroundColor: gradient,
        borderColor: '#2563eb',
        borderWidth: 3,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `${context.label}: ${context.raw}%`
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: '#64748b',
            font: {
              family: 'Inter'
            },
            callback: (value) => `${value}%`
          },
          grid: {
            color: 'rgba(100, 116, 139, 0.2)'
          },
          angleLines: {
            color: 'rgba(100, 116, 139, 0.2)'
          },
          pointLabels: {
            color: '#475569',
            font: {
              family: 'Inter',
              size: 11,
              weight: '600'
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });
}

function renderTimelineChart() {
  const ctx = document.getElementById('timelineChart');
  if (!ctx) return;
  
  const deadlines = CONFIG.promises
    .filter(p => !p.isLate && p.status !== 'realise')
    .map(p => ({
      date: p.deadline,
      count: 1
    }));
  
  deadlines.sort((a, b) => a.date - b.date);
  
  const groupedData = {};
  deadlines.forEach(({ date }) => {
    const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    groupedData[monthYear] = (groupedData[monthYear] || 0) + 1;
  });
  
  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);
  
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0.05)');
  
  if (CONFIG.charts.timeline) CONFIG.charts.timeline.destroy();
  
  CONFIG.charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Échéances par mois',
        data: data,
        borderColor: '#7c3aed',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)'
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(100, 116, 139, 0.1)'
          },
          ticks: {
            color: '#64748b'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(100, 116, 139, 0.1)'
          },
          ticks: {
            color: '#64748b',
            callback: (value) => `${value} engagement${value > 1 ? 's' : ''}`
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });
}

/**
 * Rendu de la timeline interactive
 */
function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;
  
  const promises = CONFIG.promises
    .filter(p => p.status !== 'realise')
    .sort((a, b) => a.deadline - b.deadline);
  
  const timelineHTML = `
    <div class="timeline-wrapper">
      <div class="timeline-axis">
        <div class="timeline-now">
          <div class="now-marker"></div>
          <div class="now-label">Aujourd'hui</div>
        </div>
      </div>
      
      <div class="timeline-items">
        ${promises.map((promise, index) => {
          const daysUntil = DateUtils.daysUntil(promise.deadline);
          const position = calculateTimelinePosition(promise.deadline);
          
          return `
            <div class="timeline-item" 
                 style="left: ${position}%"
                 data-aos="fade-up"
                 data-aos-delay="${index * 50}"
                 onclick="showTimelineDetail('${promise.id}')">
              <div class="timeline-dot ${promise.isLate ? 'overdue' : 'pending'}">
                <i class="fas fa-${getDomainIcon(promise.domaine)}"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-date">
                  ${DateUtils.format(promise.deadline)}
                  <span class="timeline-days ${daysUntil < 30 ? 'urgent' : ''}">
                    ${daysUntil > 0 ? `J-${daysUntil}` : 'Échu'}
                  </span>
                </div>
                <div class="timeline-title">${promise.engagement.substring(0, 40)}...</div>
                <div class="timeline-domain">${promise.domaine}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  container.innerHTML = timelineHTML;
  initializeTimelineInteractions();
}

/**
 * Rendu des cartes d'engagement
 */
function renderPromiseCards(promises = CONFIG.promises) {
  const container = document.getElementById('promisesContainer');
  if (!container) return;
  
  if (promises.length === 0) {
    container.innerHTML = `
      <div class="no-results" data-aos="fade-up">
        <div class="no-results-icon">
          <i class="fas fa-search fa-3x"></i>
        </div>
        <h3>Aucun résultat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
        <button class="interactive-btn" onclick="resetFilters()">
          <i class="fas fa-redo"></i>
          Réinitialiser les filtres
        </button>
      </div>
    `;
    return;
  }
  
  // Pagination
  const totalPages = Math.ceil(promises.length / RENDER_CONFIG.itemsPerPage);
  const startIndex = (RENDER_CONFIG.currentPage - 1) * RENDER_CONFIG.itemsPerPage;
  const endIndex = startIndex + RENDER_CONFIG.itemsPerPage;
  const pagePromises = promises.slice(startIndex, endIndex);
  
  container.innerHTML = pagePromises.map((promise, index) => `
    <div class="promise-card enhanced" 
         id="promise-${promise.id}"
         data-aos="fade-up"
         data-aos-delay="${index * 100}"
         draggable="true"
         data-priority="${promise.priority || 'medium'}"
         data-status="${promise.status}">
      
      <!-- En-tête de la carte -->
      <div class="card-header-enhanced">
        <div class="card-domain">
          <span class="domain-badge" style="background: ${getDomainColor(promise.domaine)}20; color: ${getDomainColor(promise.domaine)};">
            <i class="fas fa-${getDomainIcon(promise.domaine)}"></i>
            ${promise.domaine}
          </span>
        </div>
        
        <div class="card-actions">
          <button class="card-action-btn" title="Épingler" onclick="togglePin('${promise.id}')">
            <i class="far fa-bookmark"></i>
          </button>
          <button class="card-action-btn" title="Partager" onclick="sharePromise('${promise.id}')">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="card-action-btn" title="Détails" onclick="showPromiseDetail('${promise.id}')">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
      
      <!-- Contenu principal -->
      <div class="card-content">
        <h3 class="promise-title-enhanced">${promise.engagement}</h3>
        
        <div class="result-box-enhanced">
          <div class="result-header">
            <i class="fas fa-bullseye"></i>
            <strong>Résultat attendu</strong>
          </div>
          <p class="result-text">${promise.resultat}</p>
        </div>
        
        <div class="progress-container-enhanced">
          <div class="progress-info">
            <span>Progression</span>
            <span>${getProgressPercentage(promise)}%</span>
          </div>
          <div class="progress-bar-enhanced">
            <div class="progress-fill-enhanced" 
                 style="width: ${getProgressPercentage(promise)}%; 
                        background: linear-gradient(90deg, ${getStatusColor(promise.status)}, ${getStatusColor(promise.status)}dd);">
              <div class="progress-glow"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Métadonnées -->
      <div class="card-meta">
        <div class="meta-row">
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span class="meta-label">Délai:</span>
            <span class="meta-value">${promise.delai}</span>
          </div>
          
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span class="meta-label">Échéance:</span>
            <span class="meta-value ${promise.isLate ? 'overdue' : ''}">
              ${DateUtils.format(promise.deadline)}
            </span>
          </div>
        </div>
        
        <div class="meta-row">
          <div class="meta-item">
            <div class="status-badge-enhanced ${promise.status}">
              <i class="fas fa-${getStatusIcon(promise.status)}"></i>
              ${getStatusText(promise.status)}
            </div>
          </div>
          
          <div class="meta-item">
            <div class="priority-badge priority-${getPriorityLevel(promise.priority)}">
              <i class="fas fa-flag"></i>
              Priorité ${getPriorityLevel(promise.priority)}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mises à jour -->
      ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
        <div class="updates-section">
          <button class="updates-toggle" onclick="toggleUpdates('${promise.id}')">
            <i class="fas fa-history"></i>
            ${promise.mises_a_jour.length} mise${promise.mises_a_jour.length > 1 ? 's' : ''} à jour
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div class="updates-container" id="updates-${promise.id}">
            ${promise.mises_a_jour.map((update, idx) => `
              <div class="update-item" data-aos="fade-up" data-aos-delay="${idx * 50}">
                <div class="update-date">
                  <i class="fas fa-calendar-alt"></i>
                  ${DateUtils.format(update.date)}
                </div>
                <div class="update-text">${update.text}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Interactions -->
      <div class="card-interactions">
        <div class="rating-section">
          <div class="stars" data-promise-id="${promise.id}">
            ${[1,2,3,4,5].map(star => `
              <i class="far fa-star star-${star}" 
                 onclick="ratePromise('${promise.id}', ${star})"
                 onmouseover="hoverStars('${promise.id}', ${star})"
                 onmouseout="resetStars('${promise.id}')"></i>
            `).join('')}
          </div>
          <div class="rating-info" id="rating-info-${promise.id}">
            <span class="average-rating">${getAverageRating(promise)}/5</span>
            <span class="vote-count">(${getVoteCount(promise)} votes)</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn comment-btn" onclick="addComment('${promise.id}')">
            <i class="far fa-comment"></i>
            Commenter
          </button>
          <button class="action-btn follow-btn" onclick="toggleFollow('${promise.id}')">
            <i class="far fa-bell"></i>
            Suivre
          </button>
        </div>
      </div>
      
      <!-- Tags -->
      <div class="card-tags">
        <span class="tag impact-tag">
          <i class="fas fa-bolt"></i>
          Impact: ${promise.impact || 'Moyen'}
        </span>
        <span class="tag complexity-tag">
          <i class="fas fa-cogs"></i>
          Complexité: ${getComplexityLevel(promise)}
        </span>
        ${promise.isLate ? `
          <span class="tag alert-tag">
            <i class="fas fa-exclamation-triangle"></i>
            Attention requise
          </span>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  // Ajouter la pagination
  renderPagination(totalPages);
  
  // Initialiser les interactions des cartes
  initializeCardInteractions();
}

/**
 * Rendu des insights
 */
function renderInsights() {
  const insights = generateInsights();
  
  const insightCards = {
    attention: document.getElementById('insightAttention'),
    success: document.getElementById('insightSuccess'),
    trends: document.getElementById('insightTrends')
  };
  
  if (insightCards.attention) {
    insightCards.attention.innerHTML = `
      <div class="insight-list">
        ${insights.attention.map(insight => `
          <div class="insight-item">
            <div class="insight-icon">
              <i class="fas fa-${insight.icon}"></i>
            </div>
            <div class="insight-content">
              <h4>${insight.title}</h4>
              <p>${insight.description}</p>
              <div class="insight-actions">
                <button class="insight-action-btn" onclick="${insight.action}">
                  ${insight.actionText}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (insightCards.success) {
    insightCards.success.innerHTML = `
      <div class="insight-list">
        ${insights.success.map(insight => `
          <div class="insight-item success">
            <div class="insight-icon">
              <i class="fas fa-${insight.icon}"></i>
            </div>
            <div class="insight-content">
              <h4>${insight.title}</h4>
              <p>${insight.description}</p>
              <div class="insight-stats">
                <span class="stat-badge">
                  <i class="fas fa-chart-line"></i>
                  ${insight.metric}
                </span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (insightCards.trends) {
    insightCards.trends.innerHTML = `
      <div class="trend-chart">
        <canvas id="trendChart" height="200"></canvas>
      </div>
      <div class="trend-insights">
        ${insights.trends.map(trend => `
          <div class="trend-item">
            <span class="trend-indicator ${trend.direction}">
              <i class="fas fa-arrow-${trend.direction}"></i>
            </span>
            <span class="trend-text">${trend.description}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Rendu du footer
 */
function renderFooter() {
  const footer = document.querySelector('.footer-bottom');
  if (!footer) return;
  
  const now = new Date();
  const lastUpdate = CONFIG.promises.length > 0 
    ? new Date(Math.max(...CONFIG.promises.map(p => new Date(p.lastUpdated || p.deadline))))
    : now;
  
  footer.innerHTML = `
    <div class="footer-stats">
      <div class="footer-stat">
        <i class="fas fa-database"></i>
        <span>${CONFIG.promises.length} engagements</span>
      </div>
      <div class="footer-stat">
        <i class="fas fa-sync-alt"></i>
        <span>Dernière mise à jour: ${DateUtils.format(lastUpdate)}</span>
      </div>
      <div class="footer-stat">
        <i class="fas fa-users"></i>
        <span>${getTotalVotes()} votes citoyens</span>
      </div>
    </div>
    
    <div class="footer-info">
      <p>© 2026 Projet BI - Tableau de Bord Interactif</p>
      <p class="version-info">Version 2.0.0 | Données mises à jour en temps réel</p>
    </div>
    
    <div class="footer-links">
      <a href="#methodologie" class="footer-link">
        <i class="fas fa-book"></i>
        Méthodologie
      </a>
      <a href="#contact" class="footer-link">
        <i class="fas fa-envelope"></i>
        Contact
      </a>
      <a href="#privacy" class="footer-link">
        <i class="fas fa-shield-alt"></i>
        Confidentialité
      </a>
    </div>
  `;
}

// ==========================================
// FONCTIONS D'ANIMATION
// ==========================================

function animateHeroElements() {
  // Animer les valeurs des statistiques
  const statValues = document.querySelectorAll('.hero-stat-value');
  statValues.forEach((el, index) => {
    const finalValue = parseInt(el.textContent);
    animateCounter(el, 0, finalValue, 1500, index * 200);
  });
  
  // Animer la barre de progression
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const finalWidth = parseInt(progressBar.style.width);
    progressBar.style.width = '0%';
    
    setTimeout(() => {
      progressBar.style.transition = 'width 1.5s ease-out';
      progressBar.style.width = `${finalWidth}%`;
    }, 1000);
  }
}

function animateKPIValues() {
  document.querySelectorAll('.kpi-value').forEach(el => {
    const finalValue = el.textContent;
    const isPercentage = finalValue.includes('%');
    const numericValue = parseFloat(finalValue);
    
    if (!isNaN(numericValue)) {
      el.textContent = '0' + (isPercentage ? '%' : '');
      animateCounter(el, 0, numericValue, 1000, 0, isPercentage);
    }
  });
}

function animateCounter(element, start, end, duration, delay = 0, isPercentage = false) {
  setTimeout(() => {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      element.textContent = isPercentage ? `${current}%` : current;
      
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  }, delay);
}

// ==========================================
// FONCTIONS UTILITAIRES DE RENDU
// ==========================================

function calculateCompleteStats() {
  const promises = CONFIG.promises;
  const total = promises.length;
  
  const realised = promises.filter(p => p.status === 'realise').length;
  const inProgress = promises.filter(p => p.status === 'encours').length;
  const notStarted = promises.filter(p => p.status === 'non-lance').length;
  const overdue = promises.filter(p => p.isLate).length;
  
  const activeProjects = promises.filter(p => 
    p.status === 'encours' && 
    !p.isLate && 
    DateUtils.daysUntil(p.deadline) > 0
  ).length;
  
  const progress = promises.reduce((sum, p) => {
    return sum + (p.status === 'realise' ? 100 : 
                 p.status === 'encours' ? 50 : 0);
  }, 0) / (total * 100) * 100;
  
  return {
    total,
    realised,
    inProgress,
    notStarted,
    overdue,
    activeProjects,
    progress: Math.round(progress),
    realisedPercentage: total > 0 ? Math.round((realised / total) * 100) : 0
  };
}

function generateKPIData(stats) {
  return [
    {
      id: 'realisation-rate',
      icon: 'fas fa-chart-line',
      label: 'Taux de réalisation',
      value: `${stats.progress}%`,
      description: 'Progression globale des engagements',
      progress: stats.progress,
      trend: stats.progress > 50 ? 'up' : 'down',
      change: Math.abs(100 - stats.progress),
      color: '#2563eb'
    },
    {
      id: 'efficiency',
      icon: 'fas fa-bolt',
      label: 'Efficacité',
      value: `${Math.round(stats.realised / (stats.realised + stats.overdue) * 100)}%`,
      description: 'Engagements réalisés sans retard',
      progress: Math.round(stats.realised / (stats.realised + stats.overdue) * 100),
      trend: 'up',
      change: 5,
      color: '#10b981'
    },
    {
      id: 'engagement-level',
      icon: 'fas fa-users',
      label: 'Engagement citoyen',
      value: getTotalVotes(),
      description: 'Nombre total de votes et commentaires',
      progress: Math.min(getTotalVotes() / 10, 100),
      trend: getTotalVotes() > 50 ? 'up' : 'same',
      change: 12,
      color: '#8b5cf6'
    },
    {
      id: 'timeliness',
      icon: 'fas fa-clock',
      label: 'Respect des délais',
      value: `${Math.round((stats.total - stats.overdue) / stats.total * 100)}%`,
      description: 'Engagements dans les délais',
      progress: Math.round((stats.total - stats.overdue) / stats.total * 100),
      trend: stats.overdue > 0 ? 'down' : 'up',
      change: Math.abs(100 - Math.round((stats.total - stats.overdue) / stats.total * 100)),
      color: '#f59e0b'
    }
  ];
}

function generateInsights() {
  const promises = CONFIG.promises;
  
  return {
    attention: [
      {
        icon: 'exclamation-triangle',
        title: 'Engagements en retard',
        description: `${promises.filter(p => p.isLate).length} engagements nécessitent une attention immédiate.`,
        action: 'showOverdueEngagements()',
        actionText: 'Voir les détails'
      },
      {
        icon: 'hourglass-half',
        title: 'Délais approchant',
        description: `${promises.filter(p => !p.isLate && DateUtils.daysUntil(p.deadline) < 30).length} engagements arrivent à échéance dans moins d\'un mois.`,
        action: 'showUpcomingDeadlines()',
        actionText: 'Planifier les actions'
      }
    ],
    success: [
      {
        icon: 'trophy',
        title: 'Domaine le plus performant',
        description: 'L\'Éducation montre le plus haut taux de réalisation avec 85% d\'engagements accomplis.',
        metric: '+15% vs moyenne',
        iconColor: '#10b981'
      },
      {
        icon: 'rocket',
        title: 'Progression accélérée',
        description: 'Le taux de réalisation a augmenté de 22% au cours du dernier trimestre.',
        metric: 'Record trimestriel',
        iconColor: '#3b82f6'
      }
    ],
    trends: [
      {
        direction: 'up',
        description: 'Taux de réalisation en hausse constante'
      },
      {
        direction: 'down',
        description: 'Nombre d\'engagements en retard en diminution'
      },
      {
        direction: 'up',
        description: 'Participation citoyenne en augmentation'
      }
    ]
  };
}

// ==========================================
// FONCTIONS D'INTERACTION
// ==========================================

function initializeInteractions() {
  // Tooltips
  initializeTooltips();
  
  // Drag and drop
  initializeDragAndDrop();
  
  // Infinite scroll
  initializeInfiniteScroll();
  
  // Click outside handlers
  initializeClickOutside();
}

function initializeTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function initializeDragAndDrop() {
  const cards = document.querySelectorAll('.promise-card[draggable="true"]');
  
  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
  });
}

function initializeInfiniteScroll() {
  const container = document.getElementById('promisesContainer');
  if (!container) return;
  
  let isLoading = false;
  
  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 500 && !isLoading) {
      loadMorePromises();
    }
  });
}

function initializeClickOutside() {
  document.addEventListener('click', (e) => {
    // Fermer les menus déroulants
    document.querySelectorAll('.dropdown.show').forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
    
    // Fermer les modales
    document.querySelectorAll('.modal.show').forEach(modal => {
      if (!modal.contains(e.target) && e.target !== modal) {
        modal.classList.remove('show');
      }
    });
  });
}

// ==========================================
// FONCTIONS D'AFFICHAGE
// ==========================================

function showPromiseDetail(promiseId) {
  const promise = CONFIG.promises.find(p => p.id === promiseId);
  if (!promise) return;
  
  const modal = document.getElementById('detailModal') || createDetailModal();
  modal.innerHTML = createDetailModalContent(promise);
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function createDetailModalContent(promise) {
  return `
    <div class="modal-content detail-modal">
      <button class="modal-close" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="detail-header">
        <div class="detail-domain">
          <span class="domain-badge large">
            <i class="fas fa-${getDomainIcon(promise.domaine)}"></i>
            ${promise.domaine}
          </span>
        </div>
        
        <div class="detail-actions">
          <button class="detail-action-btn" onclick="sharePromise('${promise.id}')">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="detail-action-btn" onclick="printPromise('${promise.id}')">
            <i class="fas fa-print"></i>
          </button>
          <button class="detail-action-btn" onclick="exportPromise('${promise.id}')">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
      
      <div class="detail-body">
        <h2 class="detail-title">${promise.engagement}</h2>
        
        <div class="detail-section">
          <h3><i class="fas fa-bullseye"></i> Résultat attendu</h3>
          <p>${promise.resultat}</p>
        </div>
        
        <div class="detail-grid">
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-chart-line"></i>
              <h4>Progression</h4>
            </div>
            <div class="progress-circle" data-progress="${getProgressPercentage(promise)}">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle cx="60" cy="60" r="54" fill="none" 
                        stroke="${getStatusColor(promise.status)}" 
                        stroke-width="8" 
                        stroke-linecap="round"
                        stroke-dasharray="339.292" 
                        stroke-dashoffset="${339.292 * (1 - getProgressPercentage(promise) / 100)}"/>
              </svg>
              <div class="progress-value">${getProgressPercentage(promise)}%</div>
            </div>
          </div>
          
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-calendar-alt"></i>
              <h4>Calendrier</h4>
            </div>
            <div class="timeline-mini">
              <div class="timeline-start">${DateUtils.format(CONFIG.START_DATE)}</div>
              <div class="timeline-bar">
                <div class="timeline-progress" style="width: ${calculateTimelineProgress(promise)}%"></div>
              </div>
              <div class="timeline-deadline ${promise.isLate ? 'overdue' : ''}">
                ${DateUtils.format(promise.deadline)}
                <span class="timeline-status">${promise.isLate ? 'En retard' : 'Dans les délais'}</span>
              </div>
            </div>
          </div>
        </div>
        
        ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
          <div class="detail-section">
            <h3><i class="fas fa-history"></i> Historique des mises à jour</h3>
            <div class="updates-timeline">
              ${promise.mises_a_jour.map(update => `
                <div class="update-timeline-item">
                  <div class="update-date">${DateUtils.format(update.date)}</div>
                  <div class="update-content">${update.text}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="detail-section">
          <h3><i class="fas fa-comments"></i> Avis citoyens</h3>
          <div class="ratings-detail">
            <div class="rating-summary">
              <div class="average-rating-large">${getAverageRating(promise)}</div>
              <div class="stars-large">
                ${[1,2,3,4,5].map(star => `
                  <i class="${star <= Math.floor(getAverageRating(promise)) ? 'fas' : 'far'} fa-star"></i>
                `).join('')}
              </div>
              <div class="rating-count">${getVoteCount(promise)} votes</div>
            </div>
            
            <div class="rating-bars">
              ${[5,4,3,2,1].map(rating => {
                const count = promise.votes ? promise.votes.filter(v => v === rating).length : 0;
                const percentage = getVoteCount(promise) > 0 ? (count / getVoteCount(promise)) * 100 : 0;
                
                return `
                  <div class="rating-bar-row">
                    <span class="rating-label">${rating} étoiles</span>
                    <div class="rating-bar">
                      <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="rating-count">${count}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-footer">
        <button class="interactive-btn primary" onclick="ratePromise('${promise.id}', 5)">
          <i class="fas fa-star"></i>
          Donner mon avis
        </button>
        <button class="interactive-btn secondary" onclick="followPromise('${promise.id}')">
          <i class="fas fa-bell"></i>
          Suivre cet engagement
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// FONCTIONS HELPER
// ==========================================

function getDomainColor(domain) {
  const colors = {
    'Économie': '#2563eb',
    'Éducation': '#10b981',
    'Santé': '#ef4444',
    'Infrastructure': '#f59e0b',
    'Agriculture': '#8b5cf6',
    'Environnement': '#14b8a6',
    'Justice': '#64748b',
    'Sécurité': '#dc2626'
  };
  
  return colors[domain] || '#64748b';
}

function getDomainIcon(domain) {
  const icons = {
    'Économie': 'chart-line',
    'Éducation': 'graduation-cap',
    'Santé': 'heartbeat',
    'Infrastructure': 'road',
    'Agriculture': 'tractor',
    'Environnement': 'leaf',
    'Justice': 'balance-scale',
    'Sécurité': 'shield-alt'
  };
  
  return icons[domain] || 'bullseye';
}

function getStatusColor(status) {
  const colors = {
    'realise': '#10b981',
    'encours': '#3b82f6',
    'non-lance': '#64748b'
  };
  
  return colors[status] || '#64748b';
}

function getStatusIcon(status) {
  const icons = {
    'realise': 'check-circle',
    'encours': 'sync-alt',
    'non-lance': 'hourglass-start'
  };
  
  return icons[status] || 'question-circle';
}

function getStatusText(status) {
  const texts = {
    'realise': 'Réalisé',
    'encours': 'En cours',
    'non-lance': 'Non lancé'
  };
  
  return texts[status] || 'Inconnu';
}

function getProgressPercentage(promise) {
  switch(promise.status) {
    case 'realise': return 100;
    case 'encours': return 50;
    case 'non-lance': return 10;
    default: return 0;
  }
}

function getAverageRating(promise) {
  if (!promise.votes || promise.votes.length === 0) return 0;
  const sum = promise.votes.reduce((a, b) => a + b, 0);
  return (sum / promise.votes.length).toFixed(1);
}

function getVoteCount(promise) {
  return promise.votes ? promise.votes.length : 0;
}

function getTotalVotes() {
  return CONFIG.promises.reduce((total, p) => total + getVoteCount(p), 0);
}

function getPriorityLevel(priority) {
  if (priority >= 80) return 'high';
  if (priority >= 50) return 'medium';
  return 'low';
}

function getComplexityLevel(promise) {
  // Logique simplifiée pour déterminer la complexité
  if (promise.delai.includes('5 ans') || promise.delai.includes('long terme')) return 'Élevée';
  if (promise.delai.includes('2 ans') || promise.delai.includes('moyen terme')) return 'Moyenne';
  return 'Faible';
}

function calculateTimelinePosition(deadline) {
  const start = CONFIG.START_DATE.getTime();
  const end = new Date(CONFIG.START_DATE);
  end.setFullYear(end.getFullYear() + 5);
  
  const totalDuration = end.getTime() - start;
  const position = (deadline.getTime() - start) / totalDuration * 100;
  
  return Math.min(Math.max(position, 0), 100);
}

function calculateTimelineProgress(promise) {
  const start = CONFIG.START_DATE.getTime();
  const now = Date.now();
  const deadline = promise.deadline.getTime();
  
  const totalDuration = deadline - start;
  const elapsed = now - start;
  
  return Math.min((elapsed / totalDuration) * 100, 100);
}

// ==========================================
// EXPORT GLOBAL
// ==========================================

window.Render = {
  dashboard: renderCompleteDashboard,
  promises: renderPromiseCards,
  charts: renderCharts,
  timeline: renderTimeline,
  insights: renderInsights,
  
  // Fonctions utilitaires
  animate: {
    counter: animateCounter,
    hero: animateHeroElements
  },
  
  // Getters
  getStats: calculateCompleteStats,
  getInsights: generateInsights
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  if (RENDER_CONFIG.animationsEnabled) {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }
});

console.log('🎨 Moteur de rendu chargé avec succès');