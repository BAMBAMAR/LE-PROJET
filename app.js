// app.js - Version Modernisée
import { createParticles, animateCounter, showNotification } from './utils.js';
import { renderStats, renderCharts, renderTimeline, renderPromises } from './render.js';

class App {
  constructor() {
    this.config = {
      START_DATE: new Date('2024-04-02'),
      CURRENT_DATE: new Date(),
      promises: [],
      theme: localStorage.getItem('theme') || 'light',
      notifications: []
    };
    
    this.init();
  }
  
  async init() {
    // Initialisation
    this.setupTheme();
    this.createBackground();
    await this.loadData();
    this.setupEventListeners();
    this.render();
    this.setupNotifications();
    
    console.log('🚀 Application initialisée');
  }
  
  setupTheme() {
    document.documentElement.setAttribute('data-theme', this.config.theme);
    
    // Bouton de basculement de thème
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = this.config.theme === 'dark' ? '🌞' : '🌙';
    themeToggle.title = 'Changer de thème';
    themeToggle.addEventListener('click', () => this.toggleTheme());
    
    document.querySelector('.nav-menu').appendChild(themeToggle);
  }
  
  toggleTheme() {
    this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.config.theme);
    localStorage.setItem('theme', this.config.theme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.innerHTML = this.config.theme === 'dark' ? '🌞' : '🌙';
    
    this.showNotification('Thème changé', 'info');
  }
  
  createBackground() {
    createParticles();
    
    // Effet de parallaxe
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      document.querySelector('.bg-animated').style.backgroundPosition = `${x}% ${y}%`;
    });
  }
  
  async loadData() {
    try {
      const response = await fetch('promises.json');
      const data = await response.json();
      
      this.config.START_DATE = new Date(data.start_date);
      this.config.promises = data.promises.map(p => ({
        ...p,
        deadline: this.calculateDeadline(p.delai),
        isLate: this.checkIfLate(p.status, this.calculateDeadline(p.delai)),
        progress: this.calculateProgress(p.status),
        createdAt: new Date(this.config.START_DATE.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000)
      }));
      
      this.showNotification(`${this.config.promises.length} engagements chargés`, 'success');
    } catch (error) {
      console.error('Erreur de chargement:', error);
      this.showNotification('Erreur de chargement des données', 'error');
    }
  }
  
  calculateDeadline(delaiText) {
    const text = delaiText.toLowerCase();
    const result = new Date(this.config.START_DATE);
    
    const delaiMap = {
      'immédiat|3 mois|court terme': 3,
      '6 mois': 6,
      '1 an|12 mois': 12,
      '2 ans': 24,
      '3 ans': 36,
      '5 ans|quinquennat': 60
    };
    
    for (const [key, months] of Object.entries(delaiMap)) {
      if (new RegExp(key).test(text)) {
        result.setMonth(result.getMonth() + months);
        return result;
      }
    }
    
    result.setFullYear(result.getFullYear() + 5);
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
    // Filtres
    document.querySelectorAll('.filter-input').forEach(input => {
      input.addEventListener('input', () => this.filterPromises());
    });
    
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.filterPromises();
      });
    });
    
    // Recherche
    const searchInput = document.getElementById('search');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.filterPromises(), 300);
    });
    
    // Tri
    document.getElementById('sort').addEventListener('change', () => this.filterPromises());
    
    // Partage
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.shareDashboard();
      });
    });
    
    // Scroll animations
    this.setupScrollAnimations();
  }
  
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // Observer les éléments à animer
    document.querySelectorAll('.stat-card, .chart-container, .promise-card').forEach(el => {
      observer.observe(el);
    });
  }
  
  filterPromises() {
    const search = document.getElementById('search').value.toLowerCase();
    const domaine = document.getElementById('domaine').value;
    const status = document.getElementById('status').value;
    const sort = document.getElementById('sort').value;
    
    let filtered = this.config.promises.filter(p => {
      const matchSearch = search === '' || 
        p.engagement.toLowerCase().includes(search) ||
        p.resultat.toLowerCase().includes(search) ||
        p.domaine.toLowerCase().includes(search);
      
      const matchDomaine = !domaine || p.domaine === domaine;
      
      let matchStatus = true;
      if (status === 'realise') matchStatus = p.status === 'realise';
      else if (status === 'en-retard') matchStatus = p.isLate;
      else if (status === 'dans-les-temps') matchStatus = !p.isLate && p.status !== 'realise';
      else if (status === 'non-lance') matchStatus = p.status === 'non-lance';
      
      return matchSearch && matchDomaine && matchStatus;
    });
    
    // Tri
    switch(sort) {
      case 'recent':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'ancien':
        filtered.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'note':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'retard':
        filtered.sort((a, b) => b.isLate - a.isLate);
        break;
    }
    
    renderPromises(filtered);
  }
  
  render() {
    renderStats(this.calculateStats());
    renderCharts(this.config.promises);
    renderTimeline(this.config.promises);
    renderPromises(this.config.promises);
  }
  
  calculateStats() {
    const promises = this.config.promises;
    const total = promises.length;
    const realise = promises.filter(p => p.status === 'realise').length;
    const encours = promises.filter(p => p.status === 'encours').length;
    const nonLance = promises.filter(p => p.status === 'non-lance').length;
    const retard = promises.filter(p => p.isLate).length;
    
    // Calcul de la moyenne des notes
    const ratedPromises = promises.filter(p => p.rating);
    const averageRating = ratedPromises.length > 0 
      ? (ratedPromises.reduce((sum, p) => sum + p.rating, 0) / ratedPromises.length).toFixed(1)
      : 0;
    
    return {
      total,
      realise,
      encours,
      nonLance,
      retard,
      averageRating,
      ratedCount: ratedPromises.length,
      realisationRate: total > 0 ? ((realise * 100 + encours * 50) / (total * 100) * 100).toFixed(1) : 0,
      updatesCount: promises.filter(p => p.mises_a_jour?.length > 0).length
    };
  }
  
  async shareDashboard() {
    const stats = this.calculateStats();
    const text = `📊 Tableau de Bord Projet Sénégal
${stats.realise}/${stats.total} engagements réalisés
Taux de réalisation: ${stats.realisationRate}%
Note moyenne: ${stats.averageRating}/5

👉 Suivez l'avancement: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Projet Sénégal - Tableau de bord',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.log('Erreur de partage:', err);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(text + '\n\n' + window.location.href);
      this.showNotification('Lien copié dans le presse-papier', 'info');
    }
  }
  
  setupNotifications() {
    // Simuler des notifications périodiques
    setInterval(() => {
      if (Math.random() > 0.7) {
        const notifications = [
          'Nouvelle mise à jour disponible',
          'Un engagement vient d\'être réalisé',
          'Nouvelle note ajoutée',
          'Rapport hebdomadaire disponible'
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        this.showNotification(randomNotification, 'info');
      }
    }, 30000);
  }
  
  showNotification(message, type = 'info') {
    showNotification(message, type);
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
