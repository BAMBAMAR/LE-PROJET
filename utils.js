// ==========================================
// UTILS.JS - FONCTIONS UTILITAIRES MODERNES
// ==========================================

// Gestion des dates modernes
const DateUtils = {
  format: (date, format = 'fr-FR') => {
    return new Intl.DateTimeFormat(format, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  },
  
  relative: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days/7)} semaines`;
    if (days < 365) return `Il y a ${Math.floor(days/30)} mois`;
    return `Il y a ${Math.floor(days/365)} ans`;
  },
  
  isOverdue: (deadline) => {
    return new Date(deadline) < new Date();
  },
  
  daysUntil: (date) => {
    const deadline = new Date(date);
    const now = new Date();
    const diff = deadline - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
};

// Gestion des données
const DataUtils = {
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  },
  
  sortBy: (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      
      if (order === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
  },
  
  filterBy: (array, filters) => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (typeof value === 'function') return value(item[key]);
        return item[key] === value;
      });
    });
  },
  
  calculateStats: (promises) => {
    const total = promises.length;
    const realised = promises.filter(p => p.status === 'realise').length;
    const inProgress = promises.filter(p => p.status === 'encours').length;
    const notStarted = promises.filter(p => p.status === 'non-lance').length;
    const overdue = promises.filter(p => p.isLate).length;
    
    const progress = promises.reduce((sum, p) => {
      return sum + (p.status === 'realise' ? 100 : 
                   p.status === 'encours' ? 50 : 0);
    }, 0) / (total * 100) * 100;
    
    return {
      total,
      realised,
      inProgress,
      notStarted,
      overdue,
      progress: Math.round(progress)
    };
  }
};

// Gestion du stockage local
const Storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Erreur de stockage:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Erreur de lecture:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// Gestion des animations
const Animation = {
  fadeIn: (element, duration = 300) => {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    }
    
    window.requestAnimationFrame(step);
  },
  
  slideDown: (element, duration = 300) => {
    element.style.maxHeight = '0';
    element.style.overflow = 'hidden';
    element.style.transition = `max-height ${duration}ms ease`;
    
    setTimeout(() => {
      element.style.maxHeight = `${element.scrollHeight}px`;
    }, 10);
  },
  
  slideUp: (element, duration = 300) => {
    element.style.maxHeight = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `max-height ${duration}ms ease`;
    
    setTimeout(() => {
      element.style.maxHeight = '0';
    }, 10);
  }
};

// Gestion des erreurs
const ErrorHandler = {
  log: (error, context = '') => {
    console.error(`[${context}]`, error);
    
    // Envoyer à un service de suivi des erreurs
    if (window.SENTRY_DSN) {
      // Intégration avec Sentry ou autre service
    }
  },
  
  show: (message, type = 'error') => {
    const notification = document.createElement('div');
    notification.className = `error-notification error-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

// Gestion des performances
const Performance = {
  measure: (name, callback) => {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Gestion du réseau
const Network = {
  isOnline: () => navigator.onLine,
  
  checkConnection: async () => {
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  
  retry: async (callback, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await callback();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }
};

// Export global
window.Utils = {
  Date: DateUtils,
  Data: DataUtils,
  Storage,
  Animation,
  Error: ErrorHandler,
  Performance,
  Network
};