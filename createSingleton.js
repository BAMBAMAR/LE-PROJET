// createSingleton.js - Fichier corrigé
(function() {
  'use strict';
  
  // Déclarer la fonction applyStyles si elle n'existe pas
  if (typeof window.applyStyles === 'undefined') {
    window.applyStyles = function() {
      console.log('applyStyles: Applying styles...');
      
      // Appliquer des styles CSS dynamiquement si nécessaire
      const style = document.createElement('style');
      style.textContent = `
        /* Styles dynamiques */
        .dynamic-highlight {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `;
      
      document.head.appendChild(style);
      return true;
    };
  }
  
  // Singleton pattern pour la configuration
  const Configuration = (function() {
    let instance;
    
    function createInstance() {
      return {
        version: '2.0.0',
        environment: 'production',
        features: {
          animations: true,
          darkMode: true,
          realTimeUpdates: true
        },
        init: function() {
          console.log('Configuration initialisée');
          // Appeler applyStyles si elle existe
          if (typeof window.applyStyles === 'function') {
            window.applyStyles();
          }
          return this;
        }
      };
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
  
  // Initialiser la configuration
  window.AppConfig = Configuration.getInstance();
  
  console.log('Singleton créé avec succès');
})();