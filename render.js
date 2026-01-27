// ==========================================
// RENDER.JS - FONCTIONS DE RENDU COMPLÉMENTAIRES
// ==========================================

/**
 * Fonction pour rendre les statistiques détaillées
 */
function renderDetailedStats() {
  const promises = CONFIG.promises;
  
  // Statistiques par domaine
  const domainStats = {};
  promises.forEach(p => {
    if (!domainStats[p.domaine]) {
      domainStats[p.domaine] = {
        total: 0,
        realise: 0,
        encours: 0,
        nonLance: 0
      };
    }
    domainStats[p.domaine].total++;
    if (p.status === 'realise') domainStats[p.domaine].realise++;
    if (p.status === 'encours') domainStats[p.domaine].encours++;
    if (p.status === 'non-lance') domainStats[p.domaine].nonLance++;
  });
  
  return domainStats;
}

/**
 * Fonction pour créer des badges animés
 */
function createAnimatedBadge(type, value) {
  const colors = {
    success: 'var(--success)',
    info: 'var(--info)',
    warning: 'var(--warning)',
    danger: 'var(--danger)'
  };
  
  return `
    <div class="animated-badge ${type}" style="
      background: ${colors[type] || 'var(--primary)'};
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      animation: fadeIn 0.5s ease;
    ">
      <i class="fas fa-check-circle"></i>
      ${value}
    </div>
  `;
}

/**
 * Fonction pour formater les dates
 */
function formatDate(date) {
  if (!date) return 'Non définie';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(date).toLocaleDateString('fr-FR', options);
}

/**
 * Fonction pour calculer le temps restant
 */
function calculateTimeRemaining(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;
  
  if (diff < 0) {
    return 'Échéance dépassée';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''} restant${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} mois restant${months > 1 ? 's' : ''}`;
  } else {
    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  }
}

/**
 * Fonction pour créer un graphique de progression circulaire
 */
function createCircularProgress(percentage, size = 100) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return `
    <svg width="${size}" height="${size}" class="circular-progress">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="#f0f0f0"
        stroke-width="8"
      />
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="var(--primary)"
        stroke-width="8"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        transform="rotate(-90 ${size / 2} ${size / 2})"
        style="transition: stroke-dashoffset 1s ease;"
      />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dy=".3em"
        font-size="24"
        font-weight="bold"
        fill="var(--primary)"
      >
        ${percentage}%
      </text>
    </svg>
  `;
}

/**
 * Fonction pour rendre une carte de promesse détaillée
 */
function renderDetailedPromiseCard(promise) {
  return `
    <div class="detailed-promise-card">
      <div class="card-header">
        <div class="domain-badge-large">${promise.domaine}</div>
        <div class="promise-id">#${promise.id}</div>
      </div>
      
      <h2 class="promise-title-large">${promise.engagement}</h2>
      
      <div class="promise-details-grid">
        <div class="detail-item">
          <i class="fas fa-bullseye"></i>
          <div>
            <strong>Résultat Attendu</strong>
            <p>${promise.resultat}</p>
          </div>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-clock"></i>
          <div>
            <strong>Délai</strong>
            <p>${promise.delai}</p>
          </div>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <div>
            <strong>Échéance</strong>
            <p>${formatDate(promise.deadline)}</p>
          </div>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-hourglass-half"></i>
          <div>
            <strong>Temps Restant</strong>
            <p>${calculateTimeRemaining(promise.deadline)}</p>
          </div>
        </div>
      </div>
      
      <div class="promise-status-section">
        <h3>Statut Actuel</h3>
        ${renderStatusIndicator(promise.status)}
      </div>
      
      ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
        <div class="updates-section">
          <h3>Mises à Jour</h3>
          ${promise.mises_a_jour.map(update => `
            <div class="update-item">
              <div class="update-date">${formatDate(update.date)}</div>
              <div class="update-content">${update.description}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Fonction pour rendre l'indicateur de statut
 */
function renderStatusIndicator(status) {
  const statusConfig = {
    'realise': {
      icon: 'check-circle',
      color: 'var(--success)',
      text: 'Engagement Réalisé',
      description: 'Cet engagement a été complètement réalisé.'
    },
    'encours': {
      icon: 'sync-alt',
      color: 'var(--info)',
      text: 'En Cours de Réalisation',
      description: 'Des actions sont en cours pour la réalisation de cet engagement.'
    },
    'non-lance': {
      icon: 'hourglass-start',
      color: '#6c757d',
      text: 'Non Lancé',
      description: 'Cet engagement n\'a pas encore été lancé.'
    }
  };
  
  const config = statusConfig[status] || statusConfig['non-lance'];
  
  return `
    <div class="status-indicator" style="border-left: 4px solid ${config.color};">
      <div class="status-icon" style="color: ${config.color};">
        <i class="fas fa-${config.icon}"></i>
      </div>
      <div class="status-content">
        <h4>${config.text}</h4>
        <p>${config.description}</p>
      </div>
    </div>
  `;
}

/**
 * Fonction pour rendre une ligne de timeline
 */
function renderTimelineItem(update, index) {
  const isRecent = index === 0;
  
  return `
    <div class="timeline-item ${isRecent ? 'recent' : ''}">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-date">
          <i class="fas fa-calendar-alt"></i>
          ${formatDate(update.date)}
        </div>
        <h4 class="timeline-title">${update.title}</h4>
        <p class="timeline-description">${update.description}</p>
        ${update.link ? `
          <a href="${update.link}" class="timeline-link" target="_blank">
            <i class="fas fa-external-link-alt"></i>
            En savoir plus
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Fonction pour créer un graphique en barre horizontal
 */
function createHorizontalBarChart(data, container) {
  if (!container) return;
  
  const maxValue = Math.max(...Object.values(data));
  
  container.innerHTML = Object.entries(data).map(([label, value]) => {
    const percentage = (value / maxValue) * 100;
    return `
      <div class="horizontal-bar-item">
        <div class="bar-label">${label}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="bar-value">${value}</div>
      </div>
    `;
  }).join('');
}

/**
 * Fonction pour créer une carte statistique animée
 */
function createStatCard(icon, value, label, color) {
  return `
    <div class="stat-card-animated" style="border-color: ${color};">
      <div class="stat-icon" style="background: ${color}20; color: ${color};">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="stat-info">
        <div class="stat-value" data-target="${value}">0</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

/**
 * Fonction pour animer l'apparition des cartes
 */
function animateCardsAppearance() {
  const cards = document.querySelectorAll('.promise-card, .stat-card, .news-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
}

/**
 * Fonction pour créer un indicateur de progression
 */
function createProgressIndicator(current, total, label) {
  const percentage = (current / total) * 100;
  
  return `
    <div class="progress-indicator">
      <div class="progress-header">
        <span class="progress-label">${label}</span>
        <span class="progress-value">${current}/${total}</span>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar-track"></div>
        <div class="progress-bar-fill" style="width: ${percentage}%">
          <span class="progress-percentage">${percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  `;
}

// Export des fonctions
if (typeof window !== 'undefined') {
  window.RenderHelpers = {
    renderDetailedStats,
    createAnimatedBadge,
    formatDate,
    calculateTimeRemaining,
    createCircularProgress,
    renderDetailedPromiseCard,
    renderStatusIndicator,
    renderTimelineItem,
    createHorizontalBarChart,
    createStatCard,
    animateCardsAppearance,
    createProgressIndicator
  };
}
