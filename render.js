// render.js - Rendu des composants
import { animateCounter, formatDate } from './utils.js';

export function renderStats(stats) {
  const container = document.getElementById('stats-container');
  if (!container) return;
  
  const statsElements = [
    {
      icon: '📊',
      title: 'Engagements totaux',
      value: stats.total,
      trend: '+2%',
      color: 'primary'
    },
    {
      icon: '✅',
      title: 'Réalisés',
      value: stats.realise,
      percentage: ((stats.realise / stats.total) * 100).toFixed(1) + '%',
      color: 'success'
    },
    {
      icon: '🔄',
      title: 'En cours',
      value: stats.encours,
      percentage: ((stats.encours / stats.total) * 100).toFixed(1) + '%',
      color: 'info'
    },
    {
      icon: '⚠️',
      title: 'En retard',
      value: stats.retard,
      percentage: ((stats.retard / stats.total) * 100).toFixed(1) + '%',
      color: 'danger'
    },
    {
      icon: '📈',
      title: 'Taux de réalisation',
      value: stats.realisationRate + '%',
      trend: '+5%',
      color: 'primary'
    },
    {
      icon: '⭐',
      title: 'Note moyenne',
      value: stats.averageRating,
      subtitle: `${stats.ratedCount} votes`,
      color: 'warning'
    }
  ];
  
  container.innerHTML = statsElements.map((stat, index) => `
    <div class="stat-card animate-in animate-delay-${index % 3}" style="animation-delay: ${index * 0.1}s">
      <div class="stat-icon" style="background: var(--bg-${stat.color}); color: var(--${stat.color})">
        ${stat.icon}
      </div>
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.title}</div>
      ${stat.percentage ? `<div class="stat-subtitle">${stat.percentage}</div>` : ''}
      ${stat.trend ? `<div class="stat-trend ${stat.trend.includes('+') ? 'trend-up' : 'trend-down'}">${stat.trend}</div>` : ''}
    </div>
  `).join('');
  
  // Animer les compteurs
  document.querySelectorAll('.stat-value').forEach((el, i) => {
    animateCounter(el, 0, statsElements[i].value, 1000);
  });
}

export function renderCharts(promises) {
  const ctx1 = document.getElementById('chartStatus');
  const ctx2 = document.getElementById('chartTimeline');
  
  if (!ctx1 || !ctx2) return;
  
  // Graphique des statuts (Doughnut)
  new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Réalisés', 'En cours', 'Non lancés', 'En retard'],
      datasets: [{
        data: [
          promises.filter(p => p.status === 'realise').length,
          promises.filter(p => p.status === 'encours').length,
          promises.filter(p => p.status === 'non-lance').length,
          promises.filter(p => p.isLate).length
        ],
        backgroundColor: [
          'var(--success)',
          'var(--info)',
          'var(--text-muted)',
          'var(--danger)'
        ],
        borderWidth: 2,
        borderColor: 'var(--bg-card)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'var(--text-primary)',
            padding: 20
          }
        }
      },
      cutout: '70%'
    }
  });
  
  // Graphique de timeline
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthlyData = Array(12).fill(0);
  
  promises.forEach(promise => {
    const month = promise.createdAt.getMonth();
    monthlyData[month]++;
  });
  
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Engagements créés',
        data: monthlyData,
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(42, 109, 93, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'var(--text-primary)'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'var(--border)'
          },
          ticks: {
            color: 'var(--text-secondary)'
          }
        },
        y: {
          grid: {
            color: 'var(--border)'
          },
          ticks: {
            color: 'var(--text-secondary)'
          }
        }
      }
    }
  });
}

export function renderTimeline(promises) {
  const container = document.getElementById('timeline');
  if (!container) return;
  
  const recentPromises = [...promises]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  
  container.innerHTML = recentPromises.map((promise, index) => `
    <div class="timeline-item animate-in animate-delay-${index}">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${formatDate(promise.createdAt)}</div>
        <h4>${promise.engagement}</h4>
        <p>${promise.resultat.substring(0, 100)}...</p>
        <div class="timeline-status ${promise.status}">${promise.status}</div>
      </div>
    </div>
  `).join('');
}

export function renderPromises(promises) {
  const container = document.getElementById('promises-container');
  if (!container) return;
  
  if (promises.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Aucun résultat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = promises.map((promise, index) => `
    <div class="promise-card animate-in animate-delay-${index % 3}">
      <span class="domain-badge">${promise.domaine}</span>
      
      <h3 class="promise-title">${promise.engagement}</h3>
      
      <div class="result-box">
        <strong>🎯 Résultat attendu :</strong>
        <p>${promise.resultat}</p>
      </div>
      
      <div class="progress-container">
        <div class="progress-label">
          <span>Progression</span>
          <span>${promise.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${promise.progress}%"></div>
        </div>
      </div>
      
      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-label">📅 Délai :</span>
          <span class="meta-value">${promise.delai}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">📊 Statut :</span>
          <span class="meta-value status-${promise.status}">${getStatusText(promise.status)}</span>
        </div>
      </div>
      
      ${promise.mises_a_jour?.length > 0 ? `
        <div class="updates-preview">
          <small>📝 ${promise.mises_a_jour.length} mise(s) à jour</small>
        </div>
      ` : ''}
      
      <div class="card-actions">
        <button class="action-btn" onclick="ratePromise('${promise.id}', this)">
          <span class="action-icon">⭐</span>
          Noter
        </button>
        <button class="action-btn" onclick="toggleUpdates('${promise.id}')">
          <span class="action-icon">📋</span>
          Détails
        </button>
        <button class="action-btn" onclick="sharePromise('${promise.id}')">
          <span class="action-icon">📤</span>
          Partager
        </button>
      </div>
    </div>
  `).join('');
}

function getStatusText(status) {
  const statusMap = {
    'realise': '✅ Réalisé',
    'encours': '🔄 En cours',
    'non-lance': '⏳ Non lancé'
  };
  return statusMap[status] || status;
}
