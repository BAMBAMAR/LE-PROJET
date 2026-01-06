// Rendu des statistiques
function renderStats() {
  const promises = CONFIG.promises;
  const total = promises.length;
  const realise = promises.filter(p => p.status === 'realise').length;
  const encours = promises.filter(p => p.status === 'encours').length;
  const retard = promises.filter(p => p.isLate).length;
  
  document.getElementById('total').textContent = total;
  document.getElementById('realise').textContent = realise;
  document.getElementById('encours').textContent = encours;
  document.getElementById('retard').textContent = retard;
  document.getElementById('total-count').textContent = total;
}

// Rendu des filtres
function renderFilters() {
  const domainFilter = document.getElementById('domaine');
  const domains = [...new Set(CONFIG.promises.map(p => p.domaine))].sort();
  
  domains.forEach(domain => {
    const option = document.createElement('option');
    option.value = domain;
    option.textContent = domain;
    domainFilter.appendChild(option);
  });
}

// Rendu des promesses
function renderPromises(promises) {
  const container = document.getElementById('promises-container');
  
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
  
  // Attacher les événements de notation
  attachRatingEvents();
}

// Créer une carte de promesse
function createPromiseCard(promise) {
  const avgRating = calculateAverageRating(promise.votes);
  const starsHTML = createStarsHTML(promise.id, avgRating);
  const delayBadgeHTML = createDelayBadgeHTML(promise);
  const statusHTML = createStatusHTML(promise.status);
  const updatesHTML = createUpdatesHTML(promise);
  const detailsBtnHTML = promise.mises_a_jour?.length > 0 ? createDetailsButtonHTML(promise.id) : '';
  
  return `
    <div class="promise-card" data-id="${promise.id}">
      <span class="domain-badge">${promise.domaine}</span>
      <h3 class="promise-title">${promise.engagement}</h3>
      
      <div class="result-box">
        <i class="fas fa-bullseye"></i> 
        <strong>Résultat attendu :</strong> ${promise.resultat}
      </div>
      
      <div class="promise-meta">
        <div class="meta-row">
          <span><i class="fas fa-clock"></i> Délai : <strong>${promise.delai}</strong></span>
          ${delayBadgeHTML}
        </div>
        <div class="meta-row">
          <span>Statut :</span>
          ${statusHTML}
        </div>
      </div>
      
      ${detailsBtnHTML}
      ${updatesHTML}
      
      <div class="rating-section">
        <div class="stars" data-id="${promise.id}">
          ${starsHTML}
        </div>
        <span class="rating-label">
          ${avgRating > 0 ? `Note : ${avgRating}/5` : 'Noter cet engagement'}
        </span>
      </div>
      
      <div class="share-section">
        ${createShareButtonsHTML(promise)}
      </div>
    </div>
  `;
}

// Calculer la note moyenne
function calculateAverageRating(votes) {
  if (!votes || votes.length === 0) return 0;
  const sum = votes.reduce((a, b) => a + b, 0);
  return (sum / votes.length).toFixed(1);
}

// Créer les étoiles
function createStarsHTML(promiseId, avgRating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(avgRating);
    stars += `<i class="${filled ? 'fas' : 'far'} fa-star" data-val="${i}"></i>`;
  }
  return stars;
}

// Créer le badge de délai
function createDelayBadgeHTML(promise) {
  if (promise.status === 'realise') {
    return '<span class="delay-badge delay-success"><i class="fas fa-check-circle"></i> Terminé</span>';
  } else if (promise.isLate) {
    return '<span class="delay-badge delay-danger"><i class="fas fa-exclamation-triangle"></i> En Retard</span>';
  } else {
    return '<span class="delay-badge delay-success"><i class="fas fa-hourglass-half"></i> Dans les délais</span>';
  }
}

// Créer le badge de statut
function createStatusHTML(status) {
  const statusConfig = {
    'realise': { class: 'status-realise', text: '✅ Réalisé' },
    'encours': { class: 'status-encours', text: '🔄 En Cours' },
    'non-lance': { class: 'status-nonlance', text: '⏱️ Attente' }
  };
  
  const config = statusConfig[status] || statusConfig.encours;
  return `<span class="status-badge ${config.class}">${config.text}</span>`;
}

// Créer le bouton de détails
function createDetailsButtonHTML(promiseId) {
  return `
    <button class="details-btn" onclick="toggleUpdates('${promiseId}')">
      <i class="fas fa-info-circle"></i> Voir les mises à jour
    </button>
  `;
}

// Créer les mises à jour
function createUpdatesHTML(promise) {
  if (!promise.mises_a_jour || promise.mises_a_jour.length === 0) return '';
  
  const updatesHTML = promise.mises_a_jour.map(update => `
    <div class="update-item">
      <span class="update-date">
        <i class="fas fa-calendar-alt"></i> ${update.date}
      </span>
      <span class="update-text">${update.text}</span>
    </div>
  `).join('');
  
  return `<div id="updates-${promise.id}" class="updates-container">${updatesHTML}</div>`;
}

// Créer les boutons de partage
function createShareButtonsHTML(promise) {
  const shareText = `📊 Engagement: ${promise.engagement}`;
  const shareUrl = encodeURIComponent(window.location.href);
  
  return `
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}" 
       target="_blank" class="share-btn share-twitter" 
       aria-label="Partager sur X">
      <i class="fab fa-x-twitter"></i>
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" 
       target="_blank" class="share-btn share-facebook" 
       aria-label="Partager sur Facebook">
      <i class="fab fa-facebook-f"></i>
    </a>
    <a href="https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}" 
       target="_blank" class="share-btn share-whatsapp" 
       aria-label="Partager sur WhatsApp">
      <i class="fab fa-whatsapp"></i>
    </a>
  `;
}

// Attacher les événements de notation
function attachRatingEvents() {
  document.querySelectorAll('.stars').forEach(stars => {
    stars.addEventListener('click', handleStarClick);
  });
}

// Gérer le clic sur les étoiles
function handleStarClick(event) {
  if (event.target.tagName === 'I') {
    const rating = parseInt(event.target.dataset.val);
    const promiseId = event.target.parentElement.dataset.id;
    saveVote(promiseId, rating);
  }
}

// Basculer l'affichage des mises à jour
window.toggleUpdates = function(promiseId) {
  const updatesEl = document.getElementById(`updates-${promiseId}`);
  const btn = updatesEl.previousElementSibling;
  
  if (updatesEl.classList.contains('show')) {
    updatesEl.classList.remove('show');
    btn.innerHTML = '<i class="fas fa-info-circle"></i> Voir les mises à jour';
  } else {
    updatesEl.classList.add('show');
    btn.innerHTML = '<i class="fas fa-times-circle"></i> Masquer les mises à jour';
  }
};