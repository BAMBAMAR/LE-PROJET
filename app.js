// app.js - Version corrigée
import { createParticles, animateCounter, showNotification, formatDate } from './utils.js';
import { renderStats, renderCharts, renderTimeline, renderPromises } from './render.js';

class App {
  constructor() {
    this.config = {
      START_DATE: new Date('2024-04-02'),
      CURRENT_DATE: new Date(),
      promises: [],
      theme: localStorage.getItem('theme') || 'light',
      notifications: [],
      isOnline: navigator.onLine
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
      
      // Configurer les notifications
      this.setupNotifications();
      
      // Vérifier la connexion
      this.setupOnlineStatus();
      
      console.log('✅ Application initialisée avec succès');
      showNotification('Tableau de bord chargé avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      showNotification('Erreur lors du chargement', 'error');
      
      // Mode démo en cas d'erreur
      await this.loadDemoData();
      this.render();
    }
  }
  
  setupTheme() {
    // Détecter la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    
    if (!storedTheme && prefersDark) {
      this.config.theme = 'dark';
    }
    
    document.documentElement.setAttribute('data-theme', this.config.theme);
    
    // Créer le bouton de thème
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = this.config.theme === 'dark' ? '🌞' : '🌙';
    themeToggle.title = 'Changer de thème';
    themeToggle.setAttribute('aria-label', 'Changer de thème');
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
    
    showNotification(`Mode ${this.config.theme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
  }
  
  createBackground() {
    createParticles();
    
    // Effet de parallaxe au survol
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      const bg = document.querySelector('.bg-animated');
      if (bg) {
        bg.style.backgroundPosition = `${x}% ${y}%`;
      }
    });
  }
  
  async loadData() {
    try {
      console.log('📥 Chargement des données...');
      
      // Essayer plusieurs sources
      const sources = [
        'https://raw.githubusercontent.com/votre-utilisateur/votre-repo/main/promises.json',
        'promises.json',
        './promises.json'
      ];
      
      let data = null;
      
      for (const source of sources) {
        try {
          const response = await fetch(source, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (response.ok) {
            data = await response.json();
            console.log(`✅ Données chargées depuis: ${source}`);
            break;
          }
        } catch (err) {
          console.warn(`⚠️ Impossible de charger depuis ${source}:`, err);
        }
      }
      
      if (!data) {
        throw new Error('Aucune source de données disponible');
      }
      
      this.config.START_DATE = new Date(data.start_date);
      this.config.promises = data.promises.map(p => ({
        ...p,
        deadline: this.calculateDeadline(p.delai),
        isLate: this.checkIfLate(p.status, this.calculateDeadline(p.delai)),
        progress: this.calculateProgress(p.status),
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(this.config.START_DATE.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        rating: p.rating || Math.random() * 2 + 3, // Note aléatoire entre 3 et 5 pour la démo
        votes: p.votes || Math.floor(Math.random() * 100)
      }));
      
      console.log(`📊 ${this.config.promises.length} engagements chargés`);
      
    } catch (error) {
      console.error('❌ Erreur de chargement des données:', error);
      throw error;
    }
  }
  
  async loadDemoData() {
    console.log('🔄 Chargement des données de démo...');
    
    // Données de démo
    const demoData = {
      start_date: "2024-04-02",
      promises: [
        {
          id: "promesse-1",
          domaine: "Économie",
          engagement: "Créer 500,000 emplois dans les 5 ans",
          resultat: "Réduction du taux de chômage à 15%",
          delai: "5 ans",
          status: "encours",
          priority: "haute",
          mises_a_jour: [
            {
              date: "2024-06-15",
              text: "Lancement du programme d'incubation de startups"
            }
          ],
          tags: ["emploi", "économie", "développement"]
        },
        {
          id: "promesse-2",
          domaine: "Éducation",
          engagement: "Gratuité de l'éducation jusqu'au baccalauréat",
          resultat: "100% des élèves accèdent à l'éducation gratuite",
          delai: "Immédiat",
          status: "realise",
          priority: "critique",
          mises_a_jour: [
            {
              date: "2024-05-20",
              text: "Décret signé pour la gratuité des frais scolaires"
            }
          ],
          tags: ["éducation", "gratuité", "social"]
        },
        {
          id: "promesse-3",
          domaine: "Santé",
          engagement: "Construction de 10 nouveaux hôpitaux régionaux",
          resultat: "Amélioration de l'accès aux soins de santé",
          delai: "3 ans",
          status: "encours",
          priority: "haute",
          mises_a_jour: [],
          tags: ["santé", "infrastructure"]
        }
      ]
    };
    
    this.config.START_DATE = new Date(demoData.start_date);
    this.config.promises = demoData.promises.map(p => ({
      ...p,
      deadline: this.calculateDeadline(p.delai),
      isLate: this.checkIfLate(p.status, this.calculateDeadline(p.delai)),
      progress: this.calculateProgress(p.status),
      createdAt: new Date(this.config.START_DATE.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      rating: Math.random() * 2 + 3,
      votes: Math.floor(Math.random() * 100)
    }));
    
    showNotification('Mode démo activé - Données de démonstration', 'warning');
  }
  
  calculateDeadline(delaiText) {
    if (!delaiText) return new Date(this.config.START_DATE.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
    
    const text = delaiText.toLowerCase();
    const result = new Date(this.config.START_DATE);
    
    const delaiMap = {
      'immédiat|3 mois|court terme': 3,
      '6 mois': 6,
      '1 an|12 mois': 12,
      '2 ans': 24,
      '3 ans': 36,
      '5 ans|quinquennat': 60,
      'long terme': 60
    };
    
    for (const [pattern, months] of Object.entries(delaiMap)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        result.setMonth(result.getMonth() + months);
        return result;
      }
    }
    
    // Par défaut: 5 ans
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
    // Recherche avec debounce
    const searchInput = document.getElementById('search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.filterPromises(), 300);
      });
    }
    
    // Filtres
    const filters = ['domaine', 'status', 'sort'];
    filters.forEach(filterId => {
      const element = document.getElementById(filterId);
      if (element) {
        element.addEventListener('change', () => this.filterPromises());
      }
    });
    
    // Filtres rapides
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.filterPromises();
      });
    });
    
    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
          ? '<i class="fas fa-times"></i>' 
          : '<i class="fas fa-bars"></i>';
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
      });
    }
    
    // Navigation fluide
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.navbar')?.offsetHeight || 80;
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Fermer le menu mobile si ouvert
          if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
          }
        }
      });
    });
    
    // Scroll pour afficher/masquer le bouton retour en haut
    window.addEventListener('scroll', () => {
      const backToTop = document.getElementById('backToTop');
      if (backToTop) {
        if (window.scrollY > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    });
    
    // Bouton retour en haut
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Gestion du clavier
    document.addEventListener('keydown', (e) => {
      // Échap pour fermer le menu
      if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      }
    });
  }
  
  filterPromises() {
    const search = document.getElementById('search')?.value.toLowerCase() || '';
    const domaine = document.getElementById('domaine')?.value || '';
    const status = document.getElementById('status')?.value || '';
    const sort = document.getElementById('sort')?.value || '';
    
    let filtered = this.config.promises.filter(p => {
      const matchSearch = search === '' || 
        p.engagement.toLowerCase().includes(search) ||
        p.resultat.toLowerCase().includes(search) ||
        p.domaine.toLowerCase().includes(search) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(search)));
      
      const matchDomaine = !domaine || p.domaine === domaine;
      
      let matchStatus = true;
      if (status === 'realise') matchStatus = p.status === 'realise';
      else if (status === 'en-retard') matchStatus = p.isLate;
      else if (status === 'dans-les-temps') matchStatus = !p.isLate && p.status !== 'realise';
      else if (status === 'non-lance') matchStatus = p.status === 'non-lance';
      
      return matchSearch && matchDomaine && matchStatus;
    });
    
    // Trier
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
        filtered.sort((a, b) => (b.isLate ? 1 : 0) - (a.isLate ? 1 : 0));
        break;
      case 'priorite':
        const priorityOrder = { 'critique': 3, 'haute': 2, 'moyenne': 1, 'basse': 0 };
        filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        break;
    }
    
    renderPromises(filtered);
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
      ? (ratedPromises.reduce((sum, p) => sum + (p.rating || 0), 0) / ratedPromises.length).toFixed(1)
      : 0;
    
    // Taux de réalisation pondéré
    const realisationRate = total > 0 
      ? ((realise * 100 + encours * 50 + nonLance * 10) / (total * 100) * 100).toFixed(1)
      : 0;
    
    // Délai moyen restant
    const ongoingPromises = promises.filter(p => p.status !== 'realise' && !p.isLate);
    const averageDelayDays = ongoingPromises.length > 0
      ? Math.round(ongoingPromises.reduce((sum, p) => {
          const daysLeft = Math.max(0, Math.ceil((p.deadline - this.config.CURRENT_DATE) / (1000 * 60 * 60 * 24)));
          return sum + daysLeft;
        }, 0) / ongoingPromises.length)
      : 0;
    
    // Formater le délai moyen
    let averageDelayFormatted = '0j';
    if (averageDelayDays > 365) {
      averageDelayFormatted = `${Math.round(averageDelayDays / 365)}a`;
    } else if (averageDelayDays > 30) {
      averageDelayFormatted = `${Math.round(averageDelayDays / 30)}m`;
    } else {
      averageDelayFormatted = `${averageDelayDays}j`;
    }
    
    // Domaine principal
    const domainCounts = {};
    promises.forEach(p => {
      domainCounts[p.domaine] = (domainCounts[p.domaine] || 0) + 1;
    });
    
    let mainDomain = '-';
    let mainDomainCount = 0;
    if (Object.keys(domainCounts).length > 0) {
      const entries = Object.entries(domainCounts);
      const [domain, count] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
      mainDomain = domain.substring(0, 15) + (domain.length > 15 ? '...' : '');
      mainDomainCount = count;
    }
    
    return {
      total,
      realise,
      encours,
      nonLance,
      retard,
      averageRating,
      ratedCount: ratedPromises.length,
      realisationRate,
      averageDelay: averageDelayFormatted,
      averageDelayDays,
      mainDomain,
      mainDomainCount,
      updatesCount: promises.filter(p => p.mises_a_jour?.length > 0).length,
      trend: realisationRate > 50 ? '+5.2%' : '-2.1%'
    };
  }
  
  render() {
    const stats = this.calculateStats();
    
    // Rendre les stats
    renderStats(stats);
    
    // Rendre les graphiques
    renderCharts(this.config.promises);
    
    // Rendre la timeline
    renderTimeline(this.config.promises);
    
    // Rendre les promesses
    renderPromises(this.config.promises);
    
    // Mettre à jour les filtres de domaine
    this.updateDomainFilter();
    
    // Mettre à jour la date actuelle
    this.updateCurrentDate();
  }
  
  updateDomainFilter() {
    const domaineSelect = document.getElementById('domaine');
    if (!domaineSelect) return;
    
    // Récupérer tous les domaines uniques
    const domaines = [...new Set(this.config.promises.map(p => p.domaine))].sort();
    
    // Sauvegarder la valeur actuelle
    const currentValue = domaineSelect.value;
    
    // Mettre à jour les options
    domaineSelect.innerHTML = `
      <option value="">Tous les domaines</option>
      ${domaines.map(domaine => `
        <option value="${domaine}" ${domaine === currentValue ? 'selected' : ''}>
          ${domaine}
        </option>
      `).join('')}
    `;
  }
  
  updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      dateElement.textContent = this.config.CURRENT_DATE.toLocaleDateString('fr-FR', options);
    }
  }
  
  setupNotifications() {
    // Simuler des mises à jour périodiques
    setInterval(() => {
      if (Math.random() > 0.8 && this.config.isOnline) {
        const notifications = [
          '📊 Nouvelle mise à jour de données disponible',
          '✅ Un engagement vient d\'être réalisé',
          '⭐ Nouvelle note ajoutée à une promesse',
          '📈 Taux de réalisation mis à jour',
          '🔄 Synchronisation des données terminée'
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotification, 'info');
      }
    }, 60000); // Toutes les 60 secondes
  }
  
  setupOnlineStatus() {
    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      this.config.isOnline = true;
      showNotification('Connexion rétablie', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.config.isOnline = false;
      showNotification('Mode hors ligne activé', 'warning');
    });
  }
  
  // Méthodes globales accessibles depuis le window
  shareDashboard() {
    const stats = this.calculateStats();
    const text = `📊 Tableau de Bord Projet Sénégal
${stats.realise}/${stats.total} engagements réalisés
Taux de réalisation: ${stats.realisationRate}%
Note moyenne: ${stats.averageRating}/5

👉 Suivez l'avancement: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Projet Sénégal - Tableau de bord',
        text: text,
        url: window.location.href
      }).catch(err => {
        console.log('Partage annulé:', err);
      });
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(text + '\n\n' + window.location.href)
        .then(() => showNotification('Lien copié dans le presse-papier', 'info'))
        .catch(() => {
          // Fallback ultime
          prompt('Copiez ce lien:', window.location.href);
        });
    }
  }
  
  exportData(format = 'json') {
    const data = {
      metadata: {
        export_date: new Date().toISOString(),
        total_promises: this.config.promises.length,
        version: '1.0'
      },
      promises: this.config.promises
    };
    
    let content, mimeType, filename;
    
    switch(format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = `projet-senegal-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      case 'csv':
        // Convertir en CSV
        const headers = ['Domaine', 'Engagement', 'Statut', 'Progression', 'Délai'];
        const rows = this.config.promises.map(p => [
          `"${p.domaine}"`,
          `"${p.engagement}"`,
          p.status,
          p.progress,
          p.delai
        ]);
        
        content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        mimeType = 'text/csv';
        filename = `projet-senegal-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }
    
    // Télécharger
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Données exportées en ${format.toUpperCase()}`, 'success');
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new App();
    
    // Exposer certaines méthodes globalement
    window.resetFilters = () => window.app.filterPromises();
    window.shareDashboard = () => window.app.shareDashboard();
    window.exportData = (format) => window.app.exportData(format);
    
    console.log('🌍 Application prête');
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    showNotification('Erreur lors du démarrage de l\'application', 'error');
    
    // Afficher un message d'erreur à l'utilisateur
    const container = document.getElementById('promises-container');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
          <h3>Erreur de chargement</h3>
          <p>Impossible de charger l'application. Veuillez rafraîchir la page.</p>
          <button onclick="location.reload()" class="btn-retry">
            <i class="fas fa-redo"></i>
            Réessayer
          </button>
        </div>
      `;
    }
  }
});
