// app.js - Version simplifiée sans tracking prevention

// Configuration globale SIMPLIFIÉE
const CONFIG = {
  START_DATE: new Date('2024-04-02'),
  CURRENT_DATE: new Date(),
  promises: []
};

// Initialisation simple
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation simplifiée...');
  
  try {
    await loadData();
    initializeUI();
    setupEventListeners();
    console.log('✅ Tableau de bord prêt');
  } catch (error) {
    console.error('Erreur:', error);
    loadFallbackData();
  }
});

// Chargement des données SIMPLIFIÉ
async function loadData() {
  try {
    const response = await fetch('promises.json');
    if (!response.ok) throw new Error('Erreur réseau');
    
    const data = await response.json();
    CONFIG.START_DATE = new Date(data.start_date);
    CONFIG.promises = data.promises.map(enhancePromiseData);
    
    if (window.Render && window.Render.dashboard) {
      window.Render.dashboard();
    }
    
    showNotification('Données chargées', 'success');
  } catch (error) {
    console.error('Erreur chargement:', error);
    throw error;
  }
}

function enhancePromiseData(promise) {
  const deadline = calculateDeadline(promise.delai);
  const isLate = checkIfLate(promise.status, deadline);
  
  return {
    ...promise,
    deadline,
    isLate,
    lastUpdated: new Date().toISOString()
  };
}

function calculateDeadline(delaiText) {
  const result = new Date(CONFIG.START_DATE);
  const text = delaiText.toLowerCase();
  
  if (text.includes("immédiat") || text.includes("3 mois")) {
    result.setMonth(result.getMonth() + 3);
  } else if (text.includes("6 mois")) {
    result.setMonth(result.getMonth() + 6);
  } else if (text.includes("1 an")) {
    result.setFullYear(result.getFullYear() + 1);
  } else if (text.includes("2 ans")) {
    result.setFullYear(result.getFullYear() + 2);
  } else if (text.includes("5 ans")) {
    result.setFullYear(result.getFullYear() + 5);
  } else {
    result.setFullYear(result.getFullYear() + 5);
  }
  
  return result;
}

function checkIfLate(status, deadline) {
  return status !== 'realise' && CONFIG.CURRENT_DATE > deadline;
}

function loadFallbackData() {
  console.log('Chargement données de secours...');
  
  const DEMO_DATA = {
    start_date: "2024-04-02",
    promises: [
      {
        id: "promesse-1",
        domaine: "Économie",
        engagement: "Créer 500,000 emplois dans les 5 ans",
        resultat: "Réduction du taux de chômage à 15%",
        delai: "5 ans",
        status: "encours",
        mises_a_jour: []
      },
      {
        id: "promesse-2",
        domaine: "Éducation",
        engagement: "Gratuité de l'éducation jusqu'au baccalauréat",
        resultat: "100% des élèves accèdent à l'éducation gratuite",
        delai: "Immédiat",
        status: "realise",
        mises_a_jour: []
      }
    ]
  };
  
  CONFIG.START_DATE = new Date(DEMO_DATA.start_date);
  CONFIG.promises = DEMO_DATA.promises.map(enhancePromiseData);
  
  if (window.Render && window.Render.dashboard) {
    window.Render.dashboard();
  }
  
  showNotification('Mode démo activé', 'info');
}

function initializeUI() {
  // Thème simple
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
    });
  }
}

function setupEventListeners() {
  // Navigation mobile
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }
  
  // Scroll to top
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.opacity = window.scrollY > 500 ? '1' : '0';
    });
    
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : 
                 type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Export global simple
window.APP = {
  CONFIG,
  refreshData: loadData,
  showTour: () => showNotification('Visite guidée - Explorez les filtres', 'info')
};

console.log('📊 Application simplifiée chargée');
