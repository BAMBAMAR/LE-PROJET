function renderStats() {
  const promises = CONFIG.promises;
  const total = promises.length;
  const realise = promises.filter(p => p.status === 'realise').length;
  const encours = promises.filter(p => p.status === 'encours').length;
  const retard = promises.filter(p => p.isLate).length;
  
  document.getElementById('total').textContent = total;
  document.getElementById('realise').textContent = realise;
  document.getElementById('encours').textContent = encours;
  document.getElementById('retard').textContent = retard;
  document.getElementById('total-count').textContent = total;
}

function renderFilters() {
  const domainFilter = document.getElementById('domaine');
  const domains = [...new Set(CONFIG.promises.map(p => p.domaine))].sort();
  
  domains.forEach(domain => {
    const option = document.createElement('option');
    option.value = domain;
    option.textContent = domain;
    domainFilter.appendChild(option);
  });
}

function renderPromises(promises) {
  const container = document.getElementById('promises-container');
  
  if (promises.length === 0) {
    container.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
    return;
  }
  
  container.innerHTML = promises.map(p => `
    <div class="promise-card">
      <span class="domain-badge">${p.domaine}</span>
      <h3 class="promise-title">${p.engagement}</h3>
      <p><strong>Résultat:</strong> ${p.resultat}</p>
      <p><strong>Délai:</strong> ${p.delai}</p>
      <div>
        <span class="status-badge ${p.status === 'realise' ? 'status-realise' : 'status-encours'}">
          ${p.status === 'realise' ? '✅ Réalisé' : '🔄 En Cours'}
        </span>
        ${p.isLate ? '<span style="color:#e76f51; margin-left:1rem;">⚠️ En retard</span>' : ''}
      </div>
    </div>
  `).join('');
}