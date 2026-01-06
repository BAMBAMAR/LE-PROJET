const CONFIG = {
  DATA_URL: 'promises.json',
  START_DATE: null,
  CURRENT_DATE: new Date(),
  promises: []
};

async function init() {
  try {
    const response = await fetch(CONFIG.DATA_URL);
    const data = await response.json();
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(p => ({
      ...p,
      deadline: calculateDeadline(p.delai),
      isLate: checkIfLate(p.status, calculateDeadline(p.delai)),
      votes: JSON.parse(localStorage.getItem(`vote_${p.id}`)) || []
    }));
    
    updateCurrentDate();
    renderStats();
    renderFilters();
    renderPromises(CONFIG.promises);
    setupEventListeners();
    setupShareButtons();
    
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('promises-container').innerHTML = `
      <div style="text-align:center; padding:3rem; color:#e76f51;">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Erreur de chargement</h3>
        <p>Impossible de charger les données</p>
      </div>
    `;
  }
}

function calculateDeadline(delaiText) {
  const text = delaiText.toLowerCase();
  const result = new Date(CONFIG.START_DATE);
  
  if (text.includes("6 premiers mois")) result.setMonth(result.getMonth() + 6);
  else if (text.includes("1ère année")) result.setFullYear(result.getFullYear() + 1);
  else if (text.includes("2 ans")) result.setFullYear(result.getFullYear() + 2);
  else if (text.includes("3 ans")) result.setFullYear(result.getFullYear() + 3);
  else result.setFullYear(result.getFullYear() + 5);
  
  return result;
}

function checkIfLate(status, deadline) {
  return status !== 'realise' && CONFIG.CURRENT_DATE > deadline;
}

function updateCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateElement.textContent = CONFIG.CURRENT_DATE.toLocaleDateString('fr-FR', options);
  }
}

document.addEventListener('DOMContentLoaded', init);
