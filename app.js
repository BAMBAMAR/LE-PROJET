// Configuration
const CONFIG = {
  DATA_URL: 'data/promises.json',
  START_DATE: null,
  CURRENT_DATE: new Date(),
  promises: []
};

// Charger les données
async function init() {
  try {
    const response = await fetch(CONFIG.DATA_URL);
    const data = await response.json();
    
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = processPromises(data.promises);
    
    updateCurrentDate();
    renderStats();
    renderFilters();
    renderPromises(CONFIG.promises);
    setupEventListeners();
    setupShareButtons();
    
  } catch (error) {
    console.error('Erreur de chargement:', error);
    showError('Impossible de charger les données. Veuillez réessayer.');
  }
}

// Traiter les promesses
function processPromises(promises) {
  return promises.map(promise => {
    const deadlineDate = calculateDeadline(promise.delai);
    const isLate = checkIfLate(promise.status, deadlineDate);
    
    return {
      ...promise,
      deadline: deadlineDate,
      isLate: isLate,
      votes: loadVotes(promise.id)
    };
  });
}

// Calculer la date limite
function calculateDeadline(delaiText) {
  const text = delaiText.toLowerCase();
  const startDate = CONFIG.START_DATE;
  const result = new Date(startDate);
  
  if (text.includes("immédiat") || text.includes("3 mois")) {
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
  } else if (text.includes("2027")) {
    return new Date('2027-01-01');
  } else if (text.includes("2029")) {
    return new Date('2029-01-01');
  } else if (text.includes("2030")) {
    return new Date('2030-01-01');
  } else {
    result.setFullYear(result.getFullYear() + 5);
  }
  
  return result;
}

// Vérifier si en retard
function checkIfLate(status, deadline) {
  return status !== 'realise' && CONFIG.CURRENT_DATE > deadline;
}

// Charger les votes
function loadVotes(promiseId) {
  return JSON.parse(localStorage.getItem(`vote_${promiseId}`)) || [];
}

// Sauvegarder un vote
function saveVote(promiseId, rating) {
  const promise = CONFIG.promises.find(p => p.id === promiseId);
  if (promise) {
    promise.votes.push(rating);
    localStorage.setItem(`vote_${promiseId}`, JSON.stringify(promise.votes));
    showNotification(`Merci ! Note de ${rating}/5 enregistrée`);
    renderPromises(getFilteredPromises());
  }
}

// Mettre à jour la date actuelle
function updateCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateElement.textContent = CONFIG.CURRENT_DATE.toLocaleDateString('fr-FR', options);
  }
}

// Afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Afficher une erreur
function showError(message) {
  const container = document.getElementById('promises-container');
  container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Erreur de chargement</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-redo"></i> Réessayer
      </button>
    </div>
  `;
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', init);