// ==========================================
// UTILS.JS - FONCTIONS UTILITAIRES
// ==========================================

/**
 * Débounce - Retarde l'exécution d'une fonction
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Limite le nombre d'exécutions d'une fonction
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Génère un ID unique
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formatte un nombre avec des séparateurs de milliers
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Calcule le pourcentage
 */
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
}

/**
 * Vérifie si un élément est visible dans le viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll vers un élément
 */
function smoothScrollTo(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Copie du texte dans le presse-papier
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copié dans le presse-papier !', 'success');
    return true;
  } catch (err) {
    console.error('Erreur de copie:', err);
    showNotification('Erreur lors de la copie', 'error');
    return false;
  }
}

/**
 * Stockage local avec gestion d'erreurs
 */
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Erreur localStorage:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Erreur localStorage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Erreur localStorage:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Erreur localStorage:', e);
      return false;
    }
  }
};

/**
 * Détecte si l'appareil est mobile
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Obtient la largeur de la fenêtre
 */
function getWindowWidth() {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/**
 * Crée un élément DOM à partir d'une chaîne HTML
 */
function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

/**
 * Ajoute une classe avec animation
 */
function addClassWithAnimation(element, className, duration = 300) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.add('animated');
  }, 10);
}

/**
 * Retire une classe avec animation
 */
function removeClassWithAnimation(element, className, duration = 300) {
  element.classList.add('fade-out');
  setTimeout(() => {
    element.classList.remove(className, 'animated', 'fade-out');
  }, duration);
}

/**
 * Gestion des événements de scroll
 */
const scrollHandler = {
  callbacks: [],
  
  init() {
    window.addEventListener('scroll', throttle(() => {
      this.callbacks.forEach(callback => callback());
    }, 100));
  },
  
  add(callback) {
    this.callbacks.push(callback);
  },
  
  remove(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
};

/**
 * Animation de compteur
 */
function animateCounter(element, start, end, duration, suffix = '') {
  if (!element) return;
  
  const range = end - start;
  const increment = range > 0 ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = current + suffix;
    
    if (current === end) {
      clearInterval(timer);
    }
  }, stepTime);
}

/**
 * Charge une image de façon asynchrone
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Gestion des modales
 */
const modalManager = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Fermeture au clic sur le backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close(modalId);
      }
    });
  },
  
  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
  },
  
  toggle(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (modal.classList.contains('show')) {
      this.close(modalId);
    } else {
      this.open(modalId);
    }
  }
};

/**
 * Validation de formulaire
 */
const formValidator = {
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  phone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 9;
  },
  
  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  minLength(value, min) {
    return value.toString().length >= min;
  },
  
  maxLength(value, max) {
    return value.toString().length <= max;
  }
};

/**
 * Gestion des notifications toast
 */
const toastManager = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info', duration = 3000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: ${type === 'success' ? 'var(--success)' : 
                   type === 'error' ? 'var(--danger)' : 
                   type === 'warning' ? 'var(--warning)' : 'var(--info)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 300px;
      animation: slideInRight 0.3s ease;
    `;
    
    const icon = type === 'success' ? 'check-circle' :
                 type === 'error' ? 'exclamation-circle' :
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
      <i class="fas fa-${icon}" style="font-size: 1.2rem;"></i>
      <span>${message}</span>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

/**
 * Gestion des filtres de recherche
 */
class SearchFilter {
  constructor(items, searchFields) {
    this.items = items;
    this.searchFields = searchFields;
    this.filters = {};
  }
  
  setFilter(key, value) {
    this.filters[key] = value;
    return this;
  }
  
  removeFilter(key) {
    delete this.filters[key];
    return this;
  }
  
  clearFilters() {
    this.filters = {};
    return this;
  }
  
  search(query) {
    return this.items.filter(item => {
      // Recherche textuelle
      if (query) {
        const matchesSearch = this.searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query.toLowerCase());
        });
        if (!matchesSearch) return false;
      }
      
      // Autres filtres
      for (const [key, value] of Object.entries(this.filters)) {
        if (value && item[key] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }
}

/**
 * Gestion du temps écoulé (relatif)
 */
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
}

/**
 * Télécharge des données en JSON
 */
function downloadJSON(data, filename = 'data.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Télécharge des données en CSV
 */
function downloadCSV(data, filename = 'data.csv') {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gère les erreurs réseau
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Export des utilitaires
if (typeof window !== 'undefined') {
  window.Utils = {
    debounce,
    throttle,
    generateUniqueId,
    formatNumber,
    calculatePercentage,
    isInViewport,
    smoothScrollTo,
    copyToClipboard,
    storage,
    isMobileDevice,
    getWindowWidth,
    createElementFromHTML,
    addClassWithAnimation,
    removeClassWithAnimation,
    scrollHandler,
    animateCounter,
    loadImage,
    modalManager,
    formValidator,
    toastManager,
    SearchFilter,
    getRelativeTime,
    downloadJSON,
    downloadCSV,
    fetchWithRetry
  };
}
