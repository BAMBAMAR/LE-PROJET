// app.js - Version simplifiée et corrigée
import { createParticles, showNotification } from './utils.js';
import { renderStats, renderCharts, renderTimeline, renderPromises } from './render.js';

class App {
  constructor() {
    this.config = {
      START_DATE: new Date('2024-04-02'),
      CURRENT_DATE: new Date(),
      promises: [],
      theme: localStorage.getItem('theme') || 'light'
    };
    
    this.init();
  }
  
  async init() {
    try {
      console.log('🚀 Initialisation de l\'application...');
      
      // Initialisation basique
      this.setupTheme();
      this.createBackground();
      this.setupEventListeners();
      
      // Charger les données
      await this.loadData();
      
      // Rendu initial
      this.render();
      
      console.log('✅ Application initialisée avec succès');
      showNotification('Tableau de bord chargé', 'success');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      showNotification('Erreur lors du chargement', 'error');
      
      // Mode démo en cas d'erreur
      await this.loadDemoData();
      this.render();
    }
  }
  
  setupTheme() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = this.config.theme === 'dark' ? '🌞' : '🌙';
    themeToggle.title = 'Changer de thème';
    themeToggle.addEventListener('click', () => this.toggleTheme());
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.appendChild(themeToggle);
    }
  }
  
  toggleTheme() {
    this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.config.theme);
    localStorage.setItem('theme', this.config.theme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = this.config.theme === 'dark' ? '🌞' : '🌙';
    }
  }
  
  createBackground() {
    createParticles();
  }
  
  async loadData() {
    try {
      // Essayer de charger depuis le fichier local
      const response = await fetch('promises.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.config.START_DATE = new Date(data.start_date);
      this.config.promises = data.promises.map(p => this.processPromise(p));
      
      console.log(`📊 ${this.config.promises.length} engagements chargés`);
      
    } catch (error) {
      console.warn('Chargement local échoué, utilisation des données de démo');
      await this.loadDemoData();
    }
  }
  
  processPromise(p) {
    const deadline = this.calculateDeadline(p.delai);
    
    return {
      ...p,
      id: p.id || `promesse-${Math.random().toString(36).substr(2, 9)}`,
      deadline: deadline,
      isLate: this.checkIfLate(p.status, deadline),
      progress: this.calculateProgress(p.status),
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(this.config.START_DATE),
      rating: p.rating || Math.random() * 2 + 3,
      votes: p.votes || Math.floor(Math.random() * 100),
      domaine: p.domaine || 'Non spécifié',
      engagement: p.engagement || 'Engagement sans titre',
      resultat: p.resultat || 'Résultat non spécifié',
      delai: p.delai || 'Non spécifié',
      status: p.status || 'non-lance'
    };
  }
  
  async loadDemoData() {
    const demoData = {
      start_date: "2024-04-02",
      promises: Array.from({ length: 10 }, (_, i) => ({
        id: `promesse-${i + 1}`,
        domaine: ['Économie', 'Éducation', 'Santé', 'Infrastructure', 'Agriculture'][i % 5],
        engagement: `Engagement démo ${i + 1}: Créer des opportunités dans le secteur`,
        resultat: `Résultat attendu ${i + 1}: Amélioration des conditions`,
        delai: i % 3 === 0 ? 'Immédiat' : i % 3 === 1 ? '1 an' : '3 ans',
        status: i % 4 === 0 ? 'realise' : i % 4 === 1 ? 'encours' : 'non-lance',
        mises_a_jour: i % 2 === 0 ? [{
          date: "2024-06-15",
          text: "Mise à jour de démonstration"
        }] : [],
        tags: ["démo", "test"]
      }))
    };
    
    this.config.START_DATE = new Date(demoData.start_date);
    this.config.promises = demoData.promises.map(p => this.processPromise(p));
    
    showNotification('Mode démo activé', 'warning');
  }
  
  calculateDeadline(delaiText) {
    const result = new Date(this.config.START_DATE);
    
    if (delaiText?.includes('Immédiat') || delaiText?.includes('3 mois')) {
      result.setMonth(result.getMonth() + 3);
    } else if (delaiText?.includes('6 mois')) {
      result.setMonth(result.getMonth() + 6);
    } else if (delaiText?.includes('1 an')) {
      result.setFullYear(result.getFullYear() + 1);
    } else if (delaiText?.includes('2 ans')) {
      result.setFullYear(result.getFullYear() + 2);
    } else if (delaiText?.includes('3 ans')) {
      result.setFullYear(result.getFullYear() + 3);
    } else if (delaiText?.includes('5 ans')) {
      result.setFullYear(result.getFullYear() + 5);
    } else {
      result.setFullYear(result.getFullYear() + 5);
    }
    
    return result;
  }
  
  checkIfLate(status, deadline) {
    return status !== 'realise' && this.config.CURRENT_DATE > deadline;
  }
  
  calculateProgress(status) {
    switch(status) {
      case 'realise': return 100;
      case 'encours': return Math.floor(Math.random() * 50) + 50;
      case 'non-lance': return Math.floor(Math.random() * 30);
      default: return 0;
    }
  }
  
  setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('search');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.filterPromises(), 300);
      });
    }
    
    // Filtres
    ['domaine', 'status', 'sort'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => this.filterPromises());
    });
    
    // Menu mobile
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
      menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuBtn.innerHTML = navMenu.classList.contains('active') 
          ? '<i class="fas fa-times"></i>' 
          : '<i class="fas fa-bars"></i>';
      });
    }
    
    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (navMenu?.classList.contains('active') && 
          !navMenu.contains(e.target) && 
          !menuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }
  
  filterPromises() {
    const search = document.getElementById('search')?.value.toLowerCase() || '';
    const domaine = document.getElementById('domaine')?.value || '';
    const status = document.getElementById('status')?.value || '';
    
    const filtered = this.config.promises.filter(p => {
      const matchSearch = !search || 
        p.engagement.toLowerCase().includes(search) ||
        p.resultat.toLowerCase().includes(search) ||
        p.domaine.toLowerCase().includes(search);
      
      const matchDomaine = !domaine || p.domaine === domaine;
      
      const matchStatus = !status || 
        (status === 'realise' && p.status === 'realise') ||
        (status === 'en-retard' && p.isLate) ||
        (status === 'dans-les-temps' && !p.isLate && p.status !== 'realise') ||
        (status === 'non-lance' && p.status === 'non-lance');
      
      return matchSearch && matchDomaine && matchStatus;
    });
    
    renderPromises(filtered);
  }
  
  calculateStats() {
    const promises = this.config.promises;
    const total = promises.length;
    const realise = promises.filter(p => p.status === 'realise').length;
    const encours = promises.filter(p => p.status === 'encours').length;
    const nonLance = promises.filter(p => p.status === 'non-lance').length;
    const retard = promises.filter(p => p.isLate).length;
    
    return {
      total,
      realise,
      encours,
      nonLance,
      retard,
      realisationRate: total > 0 ? ((realise * 100 + encours * 50) / (total * 100) * 100).toFixed(1) : 0
    };
  }
  
  render() {
    const stats = this.calculateStats();
    renderStats(stats);
    renderCharts(this.config.promises);
    renderTimeline(this.config.promises);
    renderPromises(this.config.promises);
    this.updateDomainFilter();
  }
  
  updateDomainFilter() {
    const select = document.getElementById('domaine');
    if (!select) return;
    
    const domaines = [...new Set(this.config.promises.map(p => p.domaine))].sort();
    const current = select.value;
    
    select.innerHTML = `
      <option value="">Tous les domaines</option>
      ${domaines.map(d => `<option value="${d}" ${d === current ? 'selected' : ''}>${d}</option>`).join('')}
    `;
  }
}

// Initialiser
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  
  // Exposer des méthodes globales
  window.resetFilters = () => {
    document.getElementById('search').value = '';
    document.getElementById('domaine').value = '';
    document.getElementById('status').value = '';
    document.getElementById('sort').value = '';
    window.app.filterPromises();
    showNotification('Filtres réinitialisés', 'info');
  };
});
// app.js - Ajoutez en haut du fichier

// Configuration Supabase
const SUPABASE_CONFIG = {
  URL: "https://jwsdxttjjbfnoufiidkd.supabase.co",
  KEY: "sb_publishable_joJuW7-vMiQG302_2Mvj5A_sVaD8Wap",
  TABLE: "votes"
};

// Initialiser Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY) : null;
