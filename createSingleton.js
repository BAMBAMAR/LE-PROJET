// createSingleton.js - Version corrigée
(function() {
  'use strict';
  
  console.log('⚡ Initialisation du singleton...');
  
  // S'assurer que applyStyles existe
  if (typeof window.applyStyles !== 'function') {
    window.applyStyles = function() {
      console.log('applyStyles: Applying default styles');
      
      // Appliquer des styles CSS dynamiquement
      try {
        const style = document.createElement('style');
        style.textContent = `
          /* Styles dynamiques pour éviter le tracking prevention */
          .safe-animation {
            transition: all 0.3s ease;
          }
          
          .safe-highlight {
            background: rgba(37, 99, 235, 0.1);
          }
        `;
        
        document.head.appendChild(style);
        return true;
      } catch (error) {
        console.warn('Erreur applyStyles:', error);
        return false;
      }
    };
  }
  
  // Appeler applyStyles immédiatement
  try {
    window.applyStyles();
  } catch (error) {
    console.warn('Échec applyStyles:', error);
  }
  
  // Singleton pattern
  const Configuration = (function() {
    let instance;
    
    function createInstance() {
      const config = {
        version: '2.0.0',
        environment: 'production',
        features: {
          animations: true,
          darkMode: true,
          realTimeUpdates: false, // Désactivé pour éviter tracking prevention
          localStorage: false    // Utiliser sessionStorage à la place
        },
        
        // Gestion du stockage sécurisé
        storage: {
          set: function(key, value) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              return true;
            } catch (e) {
              try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
              } catch (e2) {
                console.warn('Stockage bloqué par le navigateur');
                return false;
              }
            }
          },
          
          get: function(key) {
            try {
              const item = localStorage.getItem(key);
              if (item) return JSON.parse(item);
            } catch (e) {}
            
            try {
              const item = sessionStorage.getItem(key);
              if (item) return JSON.parse(item);
            } catch (e) {}
            
            return null;
          },
          
          remove: function(key) {
            try { localStorage.removeItem(key); } catch (e) {}
            try { sessionStorage.removeItem(key); } catch (e) {}
          }
        },
        
        // Initialisation
        init: function() {
          console.log('Configuration initialisée avec succès');
          
          // Vérifier les fonctionnalités du navigateur
          this.checkBrowserFeatures();
          
          // Charger les préférences
          this.loadPreferences();
          
          return this;
        },
        
        checkBrowserFeatures: function() {
          // Vérifier le support des fonctionnalités
          this.features.localStorage = this.testLocalStorage();
          this.features.animations = this.testCSSAnimations();
          
          console.log('Fonctionnalités navigateur:', this.features);
        },
        
        testLocalStorage: function() {
          try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
          } catch (e) {
            return false;
          }
        },
        
        testCSSAnimations: function() {
          return 'animation' in document.body.style || 
                 'webkitAnimation' in document.body.style;
        },
        
        loadPreferences: function() {
          const prefs = this.storage.get('userPreferences');
          if (prefs) {
            Object.assign(this, prefs);
          }
        },
        
        savePreferences: function() {
          this.storage.set('userPreferences', {
            theme: this.theme,
            language: this.language
          });
        }
      };
      
      return config;
    }
    
    return {
      getInstance: function() {
        if (!instance) {
          instance = createInstance().init();
        }
        return instance;
      }
    };
  })();
  
  // Exposer la configuration globale
  window.AppConfig = Configuration.getInstance();
  
  console.log('✅ Singleton créé avec succès');
})();
