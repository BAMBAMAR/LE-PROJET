// corrections.js - Corrections globales
(function() {
  'use strict';
  
  // Patch pour applyStyles
  if (typeof window.applyStyles === 'undefined') {
    window.applyStyles = function() {
      return true;
    };
  }
  
  // Patch pour exportToFormat
  if (typeof window.exportToFormat === 'undefined') {
    window.exportToFormat = function(format) {
      console.log(`Export ${format} requested`);
      return false;
    };
  }
  
  // Patch pour calculateDeadline
  if (typeof window.calculateDeadline === 'undefined') {
    window.calculateDeadline = function(delaiText) {
      const startDate = window.CONFIG?.START_DATE || new Date('2024-04-02');
      const result = new Date(startDate);
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
    };
  }
  
  // Patch pour loadFallbackData
  if (typeof window.loadFallbackData === 'undefined') {
    window.loadFallbackData = function() {
      console.log('Using fallback data');
      return {
        start_date: "2024-04-02",
        promises: []
      };
    };
  }
  
  console.log('✅ All patches applied');
})();