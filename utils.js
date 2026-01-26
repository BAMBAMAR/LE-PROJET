// utils.js - Fonctions utilitaires

// Créer des particules animées
export function createParticles() {
  const container = document.createElement('div');
  container.className = 'particles';
  
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.width = `${Math.random() * 60 + 20}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = Math.random() * 0.1 + 0.05;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
    container.appendChild(particle);
  }
  
  document.body.appendChild(container);
}

// Animer un compteur
export function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Afficher une notification
export function showNotification(message, type = 'info') {
  const container = document.querySelector('.notification-center');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
    </div>
    <div class="notification-content">
      <p>${message}</p>
      <small>${new Date().toLocaleTimeString()}</small>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Formater une date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Exporter des données
export function exportData(data, format = 'json') {
  const date = new Date().toISOString().split('T')[0];
  let content, mimeType, filename;
  
  switch(format) {
    case 'csv':
      content = convertToCSV(data);
      mimeType = 'text/csv;charset=utf-8;';
      filename = `promesses-${date}.csv`;
      break;
    case 'json':
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      filename = `promesses-${date}.json`;
      break;
    case 'excel':
      content = convertToExcel(data);
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      filename = `promesses-${date}.xls`;
      break;
  }
  
  downloadFile(content, mimeType, filename);
}

function convertToCSV(data) {
  const headers = ['Domaine', 'Engagement', 'Résultat', 'Délai', 'Statut', 'Progression'];
  const rows = data.map(item => [
    item.domaine,
    item.engagement,
    item.resultat,
    item.delai,
    item.status,
    item.progress
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function downloadFile(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
