// render.js - Rendu des composants modernes
import { animateCounter, formatDate, showNotification } from './utils.js';

// Stockage des instances de graphiques
const chartInstances = {};

export function renderStats(stats) {
  const container = document.getElementById('stats-container');
  const liveTotal = document.getElementById('live-total');
  const liveRealise = document.getElementById('live-realise');
  const liveProgress = document.getElementById('live-progress');
  const promisesCount = document.getElementById('promises-count');
  
  if (!container) return;
  
  // Mettre à jour les compteurs live
  if (liveTotal) animateCounter(liveTotal, 0, stats.total, 800);
  if (liveRealise) animateCounter(liveRealise, 0, stats.realise, 800);
  if (liveProgress) {
    liveProgress.textContent = `${stats.realisationRate}%`;
  }
  if (promisesCount) {
    promisesCount.textContent = `(${stats.total})`;
  }
  
  const statsElements = [
    {
      id: 'total-promises',
      icon: '📊',
      title: 'Engagements totaux',
      value: stats.total,
      trend: '+5%',
      color: 'primary',
      subtitle: 'Projet complet',
      animate: true
    },
    {
      id: 'realised-promises',
      icon: '✅',
      title: 'Réalisés',
      value: stats.realise,
      percentage: ((stats.realise / stats.total) * 100).toFixed(1) + '%',
      color: 'success',
      subtitle: 'Promesses tenues',
      animate: true
    },
    {
      id: 'in-progress',
      icon: '🔄',
      title: 'En cours',
      value: stats.encours,
      percentage: ((stats.encours / stats.total) * 100).toFixed(1) + '%',
      color: 'info',
      subtitle: 'En réalisation',
      animate: true
    },
    {
      id: 'delayed',
      icon: '⚠️',
      title: 'En retard',
      value: stats.retard,
      percentage: ((stats.retard / stats.total) * 100).toFixed(1) + '%',
      color: 'danger',
      subtitle: 'Dépassement de délai',
      animate: true
    },
    {
      id: 'progress-rate',
      icon: '📈',
      title: 'Taux de réalisation',
      value: stats.realisationRate + '%',
      trend: stats.trend || '+3.2%',
      color: 'primary',
      subtitle: 'Progression globale',
      animate: true
    },
    {
      id: 'average-rating',
      icon: '⭐',
      title: 'Note moyenne',
      value: stats.averageRating || '0.0',
      subtitle: `${stats.ratedCount || 0} votes`,
      color: 'warning',
      animate: true
    },
    {
      id: 'with-updates',
      icon: '📋',
      title: 'Avec mises à jour',
      value: stats.updatesCount || 0,
      percentage: stats.updatesCount ? ((stats.updatesCount / stats.total) * 100).toFixed(1) + '%' : '0%',
      color: 'info',
      subtitle: 'Suivi actif',
      animate: true
    },
    {
      id: 'average-delay',
      icon: '⏱️',
      title: 'Délai moyen restant',
      value: stats.averageDelay || '120j',
      color: 'secondary',
      subtitle: 'Temps estimé',
      animate: false
    }
  ];
  
  container.innerHTML = statsElements.map((stat, index) => `
    <div class="stat-card animate-in animate-delay-${index % 4}" 
         data-id="${stat.id}"
         style="animation-delay: ${index * 0.1}s">
      
      <div class="stat-icon" style="background: rgba(var(--${stat.color}-rgb, 42, 109, 93), 0.1); color: var(--${stat.color})">
        ${stat.icon}
      </div>
      
      <div class="stat-content">
        <div class="stat-value" id="${stat.id}-value">${stat.value}</div>
        <div class="stat-label">${stat.title}</div>
        
        ${stat.percentage ? `
          <div class="stat-subtitle">
            <span class="stat-percentage">${stat.percentage}</span>
            ${stat.subtitle ? `<span class="stat-description">${stat.subtitle}</span>` : ''}
          </div>
        ` : ''}
        
        ${stat.trend ? `
          <div class="stat-trend ${stat.trend.includes('+') ? 'trend-up' : 'trend-down'}">
            <i class="fas fa-arrow-${stat.trend.includes('+') ? 'up' : 'down'}"></i>
            ${stat.trend}
          </div>
        ` : ''}
        
        ${!stat.percentage && !stat.trend && stat.subtitle ? `
          <div class="stat-subtitle">
            <span class="stat-description">${stat.subtitle}</span>
          </div>
        ` : ''}
      </div>
      
      ${stat.animate ? `<div class="stat-pulse"></div>` : ''}
    </div>
  `).join('');
  
  // Animer les compteurs
  document.querySelectorAll('.stat-value').forEach((el, i) => {
    const stat = statsElements[i];
    if (stat.animate && typeof stat.value === 'number') {
      animateCounter(el, 0, stat.value, 1000);
    }
  });
}

export function renderCharts(promises) {
  // Nettoyer les anciens graphiques
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.destroy();
  });
  
  // Rendre les graphiques
  renderStatusChart(promises);
  renderTimelineChart(promises);
  renderDomainsChart(promises);
  renderProgressChart(promises);
}

function renderStatusChart(promises) {
  const ctx = document.getElementById('chartStatus');
  if (!ctx) return;
  
  const statusCounts = {
    realise: promises.filter(p => p.status === 'realise').length,
    encours: promises.filter(p => p.status === 'encours').length,
    nonLance: promises.filter(p => p.status === 'non-lance').length,
    enRetard: promises.filter(p => p.isLate).length
  };
  
  const total = promises.length;
  const getPercentage = (count) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  
  chartInstances.status = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        `✅ Réalisés (${getPercentage(statusCounts.realise)}%)`,
        `🔄 En cours (${getPercentage(statusCounts.encours)}%)`,
        `⏳ Non lancés (${getPercentage(statusCounts.nonLance)}%)`,
        `⚠️ En retard (${getPercentage(statusCounts.enRetard)}%)`
      ],
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(0, 184, 148, 0.9)',    // Vert succès
          'rgba(116, 185, 255, 0.9)',   // Bleu info
          'rgba(148, 156, 173, 0.9)',   // Gris neutre
          'rgba(255, 107, 107, 0.9)'    // Rouge danger
        ],
        borderColor: [
          'rgb(0, 184, 148)',
          'rgb(116, 185, 255)',
          'rgb(148, 156, 173)',
          'rgb(255, 107, 107)'
        ],
        borderWidth: 2,
        borderAlign: 'inner',
        hoverOffset: 20,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'var(--text-primary)',
            padding: 20,
            font: {
              family: 'Inter',
              size: 12,
              weight: '500'
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  return {
                    text: `${label}`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].borderColor[i],
                    lineWidth: 2,
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          backgroundColor: 'var(--bg-card)',
          titleColor: 'var(--text-primary)',
          bodyColor: 'var(--text-secondary)',
          borderColor: 'var(--border)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label.split(' (')[0]}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

function renderTimelineChart(promises) {
  const ctx = document.getElementById('chartTimeline');
  if (!ctx) return;
  
  // Données par mois pour l'année en cours
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  const monthlyCreated = Array(12).fill(0);
  const monthlyCompleted = Array(12).fill(0);
  const monthlyInProgress = Array(12).fill(0);
  
  promises.forEach(promise => {
    const date = promise.createdAt || new Date(promise.deadline);
    const month = date.getMonth();
    
    monthlyCreated[month]++;
    
    if (promise.status === 'realise') {
      monthlyCompleted[month]++;
    } else if (promise.status === 'encours') {
      monthlyInProgress[month]++;
    }
  });
  
  chartInstances.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: '📅 Créés',
          data: monthlyCreated,
          borderColor: 'var(--primary)',
          backgroundColor: 'rgba(42, 109, 93, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'var(--primary)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        },
        {
          label: '✅ Réalisés',
          data: monthlyCompleted,
          borderColor: 'var(--success)',
          backgroundColor: 'rgba(0, 184, 148, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointStyle: 'rectRot',
          pointRadius: 4
        },
        {
          label: '🔄 En cours',
          data: monthlyInProgress,
          borderColor: 'var(--info)',
          backgroundColor: 'rgba(116, 185, 255, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointStyle: 'triangle',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'var(--text-primary)',
            padding: 15,
            font: {
              family: 'Inter',
              size: 11
            },
            usePointStyle: true
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'var(--bg-card)',
          titleColor: 'var(--text-primary)',
          bodyColor: 'var(--text-secondary)',
          borderColor: 'var(--border)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'var(--border)',
            drawBorder: false
          },
          ticks: {
            color: 'var(--text-secondary)',
            font: {
              family: 'Inter'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'var(--border)',
            drawBorder: false
          },
          ticks: {
            color: 'var(--text-secondary)',
            precision: 0,
            font: {
              family: 'Inter'
            }
          },
          title: {
            display: true,
            text: 'Nombre d\'engagements',
            color: 'var(--text-secondary)',
            font: {
              family: 'Inter',
              size: 12
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

function renderDomainsChart(promises) {
  const ctx = document.getElementById('chartDomains');
  if (!ctx) return;
  
  // Grouper par domaine
  const domainMap = {};
  promises.forEach(promise => {
    const domaine = promise.domaine || 'Non spécifié';
    domainMap[domaine] = (domainMap[domaine] || 0) + 1;
  });
  
  // Trier par nombre décroissant
  const sortedEntries = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Limiter aux 8 premiers
  
  const labels = sortedEntries.map(([domaine]) => domaine);
  const data = sortedEntries.map(([, count]) => count);
  
  // Couleurs dynamiques
  const colors = generateColors(labels.length);
  
  chartInstances.domains = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nombre d\'engagements',
        data: data,
        backgroundColor: colors.map(c => c.background),
        borderColor: colors.map(c => c.border),
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: colors.map(c => c.hover)
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = promises.length;
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.raw} engagements (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'var(--border)',
            drawBorder: false
          },
          ticks: {
            color: 'var(--text-secondary)',
            precision: 0
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: 'var(--text-primary)',
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

function renderProgressChart(promises) {
  const ctx = document.getElementById('chartProgress');
  if (!ctx) return;
  
  // Calculer la progression moyenne par domaine
  const domainProgress = {};
  const domainCount = {};
  
  promises.forEach(promise => {
    const domaine = promise.domaine || 'Non spécifié';
    const progress = promise.progress || 0;
    
    if (!domainProgress[domaine]) {
      domainProgress[domaine] = 0;
      domainCount[domaine] = 0;
    }
    
    domainProgress[domaine] += progress;
    domainCount[domaine]++;
  });
  
  // Calculer la moyenne
  const domains = Object.keys(domainProgress);
  const averages = domains.map(domaine => 
    Math.round(domainProgress[domaine] / domainCount[domaine])
  );
  
  // Trier par progression
  const sortedIndices = averages.map((_, i) => i)
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 6);
  
  const sortedDomains = sortedIndices.map(i => domains[i]);
  const sortedAverages = sortedIndices.map(i => averages[i]);
  
  chartInstances.progress = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: sortedDomains,
      datasets: [{
        label: 'Progression moyenne (%)',
        data: sortedAverages,
        backgroundColor: 'rgba(42, 109, 93, 0.2)',
        borderColor: 'var(--primary)',
        borderWidth: 2,
        pointBackgroundColor: 'var(--primary)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false
          },
          grid: {
            color: 'var(--border)'
          },
          pointLabels: {
            color: 'var(--text-primary)',
            font: {
              size: 11
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function generateColors(count) {
  const baseColors = [
    { background: 'rgba(42, 109, 93, 0.8)', border: 'rgb(42, 109, 93)', hover: 'rgba(42, 109, 93, 1)' },
    { background: 'rgba(77, 107, 198, 0.8)', border: 'rgb(77, 107, 198)', hover: 'rgba(77, 107, 198, 1)' },
    { background: 'rgba(0, 184, 148, 0.8)', border: 'rgb(0, 184, 148)', hover: 'rgba(0, 184, 148, 1)' },
    { background: 'rgba(255, 107, 107, 0.8)', border: 'rgb(255, 107, 107)', hover: 'rgba(255, 107, 107, 1)' },
    { background: 'rgba(253, 203, 110, 0.8)', border: 'rgb(253, 203, 110)', hover: 'rgba(253, 203, 110, 1)' },
    { background: 'rgba(162, 155, 254, 0.8)', border: 'rgb(162, 155, 254)', hover: 'rgba(162, 155, 254, 1)' },
    { background: 'rgba(225, 112, 85, 0.8)', border: 'rgb(225, 112, 85)', hover: 'rgba(225, 112, 85, 1)' },
    { background: 'rgba(116, 185, 255, 0.8)', border: 'rgb(116, 185, 255)', hover: 'rgba(116, 185, 255, 1)' }
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}

export function renderTimeline(promises) {
  const container = document.getElementById('timeline');
  if (!container) return;
  
  // Prendre les 6 promesses les plus récentes
  const recentPromises = [...promises]
    .sort((a, b) => (b.createdAt || new Date(b.deadline)) - (a.createdAt || new Date(a.deadline)))
    .slice(0, 6);
  
  container.innerHTML = recentPromises.map((promise, index) => {
    const date = promise.createdAt || promise.deadline;
    const statusIcon = getStatusIcon(promise.status);
    const isLate = promise.isLate ? 'late' : '';
    
    return `
      <div class="timeline-item animate-in" style="animation-delay: ${index * 0.1}s">
        <div class="timeline-dot ${isLate}"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-date">${formatDate(date)}</span>
            <span class="timeline-domain">${promise.domaine}</span>
          </div>
          <h4 class="timeline-title">${promise.engagement}</h4>
          <p class="timeline-description">${promise.resultat.substring(0, 120)}...</p>
          
          <div class="timeline-footer">
            <span class="timeline-status ${promise.status}">
              ${statusIcon} ${getStatusText(promise.status)}
            </span>
            <span class="timeline-progress">
              <div class="progress-mini">
                <div class="progress-mini-fill" style="width: ${promise.progress || 0}%"></div>
              </div>
              ${promise.progress || 0}%
            </span>
          </div>
          
          ${promise.mises_a_jour?.length > 0 ? `
            <div class="timeline-updates">
              <i class="fas fa-history"></i>
              ${promise.mises_a_jour.length} mise(s) à jour
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function renderPromises(promises) {
  const container = document.getElementById('promises-container');
  const promisesCount = document.getElementById('promises-count');
  
  if (!container) return;
  
  // Mettre à jour le compteur
  if (promisesCount) {
    promisesCount.textContent = `(${promises.length})`;
  }
  
  if (promises.length === 0) {
    container.innerHTML = `
      <div class="no-results animate-in">
        <div class="no-results-icon">
          <i class="fas fa-search fa-3x"></i>
        </div>
        <h3>Aucun résultat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
        <button class="btn-reset-filters" onclick="resetFilters()">
          <i class="fas fa-redo"></i>
          Réinitialiser les filtres
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = promises.map((promise, index) => {
    const statusIcon = getStatusIcon(promise.status);
    const delayStatus = getDelayStatus(promise);
    const progress = promise.progress || 0;
    const rating = promise.rating || 0;
    const votes = promise.votes || 0;
    
    return `
      <div class="promise-card animate-in animate-delay-${index % 3}" 
           id="${promise.id}"
           data-domain="${promise.domaine}"
           data-status="${promise.status}"
           data-delay="${promise.isLate ? 'late' : 'ontime'}"
           style="animation-delay: ${index * 0.05}s">
        
        <!-- En-tête avec badge de domaine -->
        <div class="card-header">
          <span class="domain-badge">${promise.domaine}</span>
          <span class="card-priority ${promise.priority || 'medium'}">
            ${getPriorityIcon(promise.priority)} Priorité ${promise.priority || 'moyenne'}
          </span>
        </div>
        
        <!-- Titre principal -->
        <h3 class="promise-title">${promise.engagement}</h3>
        
        <!-- Résultat attendu -->
        <div class="result-box">
          <div class="result-icon">
            <i class="fas fa-bullseye"></i>
          </div>
          <div class="result-content">
            <strong>Résultat attendu :</strong>
            <p>${promise.resultat}</p>
          </div>
        </div>
        
        <!-- Métadonnées -->
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-icon"><i class="fas fa-clock"></i></span>
            <span class="meta-label">Délai :</span>
            <span class="meta-value">${promise.delai}</span>
          </div>
          
          <div class="meta-item">
            <span class="meta-icon"><i class="fas fa-flag"></i></span>
            <span class="meta-label">Statut :</span>
            <span class="meta-value status-badge ${promise.status}">
              ${statusIcon} ${getStatusText(promise.status)}
            </span>
          </div>
          
          ${delayStatus ? `
            <div class="meta-item">
              <span class="meta-icon"><i class="fas fa-exclamation-triangle"></i></span>
              <span class="meta-label">Retard :</span>
              <span class="meta-value delay-badge ${promise.isLate ? 'delay-danger' : 'delay-success'}">
                ${delayStatus.icon} ${delayStatus.text}
              </span>
            </div>
          ` : ''}
        </div>
        
        <!-- Barre de progression -->
        <div class="progress-container">
          <div class="progress-label">
            <span>Progression</span>
            <span class="progress-value">${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <div class="progress-marker" style="left: ${progress}%"></div>
          </div>
        </div>
        
        <!-- Notation -->
        <div class="rating-section">
          <div class="stars" data-promise-id="${promise.id}">
            ${[1, 2, 3, 4, 5].map(star => `
              <i class="fas fa-star ${star <= Math.round(rating) ? 'active' : ''}" 
                 data-value="${star}"
                 onclick="ratePromise('${promise.id}', ${star})"
                 onmouseover="hoverStar(this, ${star}, '${promise.id}')"
                 onmouseout="resetStars('${promise.id}')">
              </i>
            `).join('')}
          </div>
          <div class="rating-info">
            <span class="rating-average">${rating.toFixed(1)}/5</span>
            <span class="rating-count">(${votes} votes)</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="card-actions">
          <button class="action-btn btn-details" onclick="toggleDetails('${promise.id}')">
            <i class="fas fa-info-circle"></i>
            Détails
          </button>
          
          <button class="action-btn btn-updates" onclick="showUpdates('${promise.id}')" 
                  ${promise.mises_a_jour?.length ? '' : 'disabled'}>
            <i class="fas fa-history"></i>
            MAJ (${promise.mises_a_jour?.length || 0})
          </button>
          
          <button class="action-btn btn-share" onclick="sharePromise('${promise.id}')">
            <i class="fas fa-share-alt"></i>
            Partager
          </button>
        </div>
        
        <!-- Contenu détaillé (caché par défaut) -->
        <div class="card-details" id="details-${promise.id}" style="display: none;">
          <div class="details-content">
            <h4><i class="fas fa-info-circle"></i> Informations détaillées</h4>
            
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">ID :</span>
                <span class="detail-value">${promise.id}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Date de création :</span>
                <span class="detail-value">${formatDate(promise.createdAt || new Date())}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Date limite :</span>
                <span class="detail-value">${formatDate(promise.deadline)}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Impact :</span>
                <span class="detail-value impact-${promise.impact || 'medium'}">
                  ${promise.impact || 'Moyen'}
                </span>
              </div>
            </div>
            
            ${promise.tags?.length ? `
              <div class="details-tags">
                ${promise.tags.map(tag => `
                  <span class="tag">${tag}</span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Initialiser les événements des étoiles
  initializeStarRatings();
}

// Fonctions helper
function getStatusIcon(status) {
  switch(status) {
    case 'realise': return '✅';
    case 'encours': return '🔄';
    case 'non-lance': return '⏳';
    default: return '📝';
  }
}

function getStatusText(status) {
  switch(status) {
    case 'realise': return 'Réalisé';
    case 'encours': return 'En cours';
    case 'non-lance': return 'Non lancé';
    default: return status;
  }
}

function getDelayStatus(promise) {
  if (promise.status === 'realise') {
    return {
      icon: '✅',
      text: 'Terminé'
    };
  }
  
  if (promise.isLate) {
    const daysLate = Math.floor((new Date() - promise.deadline) / (1000 * 60 * 60 * 24));
    return {
      icon: '⚠️',
      text: `${daysLate} jours de retard`
    };
  }
  
  const daysRemaining = Math.floor((promise.deadline - new Date()) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 30) {
    return {
      icon: '⏰',
      text: `${daysRemaining} jours restants`
    };
  }
  
  return null;
}

function getPriorityIcon(priority) {
  switch(priority) {
    case 'haute': return '🔴';
    case 'moyenne': return '🟡';
    case 'basse': return '🟢';
    default: return '⚪';
  }
}

function initializeStarRatings() {
  // Gestion du survol des étoiles
  window.hoverStar = function(element, value, promiseId) {
    const stars = document.querySelectorAll(`.stars[data-promise-id="${promiseId}"] .fa-star`);
    stars.forEach(star => {
      const starValue = parseInt(star.getAttribute('data-value'));
      if (starValue <= value) {
        star.classList.add('hover');
      } else {
        star.classList.remove('hover');
      }
    });
  };
  
  window.resetStars = function(promiseId) {
    const stars = document.querySelectorAll(`.stars[data-promise-id="${promiseId}"] .fa-star`);
    stars.forEach(star => {
      star.classList.remove('hover');
    });
  };
}

// Fonctions globales pour les boutons
window.toggleDetails = function(promiseId) {
  const details = document.getElementById(`details-${promiseId}`);
  const btn = document.querySelector(`[onclick="toggleDetails('${promiseId}')"]`);
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    btn.innerHTML = '<i class="fas fa-times-circle"></i> Masquer';
    details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    details.style.display = 'none';
    btn.innerHTML = '<i class="fas fa-info-circle"></i> Détails';
  }
};

window.showUpdates = function(promiseId) {
  // À implémenter : ouvrir une modal avec les mises à jour
  showNotification('Fonctionnalité à venir', 'info');
};

window.sharePromise = function(promiseId) {
  const promise = window.app?.config.promises.find(p => p.id === promiseId);
  if (!promise) return;
  
  const text = `📊 "${promise.engagement}"\n\nStatut: ${getStatusText(promise.status)}\nProgression: ${promise.progress}%\n\n👉 Suivez sur: ${window.location.origin}/#${promiseId}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Promesse du Projet Sénégal',
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text);
    showNotification('Texte copié dans le presse-papier', 'success');
  }
};

window.resetFilters = function() {
  document.getElementById('search').value = '';
  document.getElementById('domaine').value = '';
  document.getElementById('status').value = '';
  document.getElementById('sort').value = '';
  
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.classList.remove('active');
  });
  
  if (window.app) {
    window.app.render();
    showNotification('Filtres réinitialisés', 'success');
  }
};

// Exporter les graphiques
window.exportChart = function(chartId, filename = 'chart.png') {
  const chart = chartInstances[chartId];
  if (!chart) return;
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = chart.toBase64Image();
  link.click();
};

// Basculer le type de graphique
window.toggleChartType = function(chartId) {
  const chart = chartInstances[chartId];
  if (!chart) return;
  
  const newType = chart.config.type === 'bar' ? 'horizontalBar' : 'bar';
  chart.config.type = newType;
  chart.update();
  
  showNotification(`Graphique basculé en ${newType}`, 'info');
};
