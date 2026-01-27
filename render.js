// ==========================================
// RENDER.JS - Fonctions de rendu corrigées
// ==========================================

function renderStats() {
    const promises = window.CONFIG.promises;
    const total = promises.length;
    const realise = promises.filter(p => p.status === 'realise').length;
    const encours = promises.filter(p => p.status === 'encours').length;
    const retard = promises.filter(p => p.isLate).length;
    
    const totalEl = document.getElementById('total-promises');
    const realisedEl = document.getElementById('realized');
    const inProgressEl = document.getElementById('inProgress');
    const delayedEl = document.getElementById('delayed');
    
    if (totalEl) totalEl.textContent = total;
    if (realisedEl) realisedEl.textContent = realise;
    if (inProgressEl) inProgressEl.textContent = encours;
    if (delayedEl) delayedEl.textContent = retard;
}

function renderFilters() {
    const domainFilter = document.getElementById('sectorFilter');
    if (!domainFilter) return;
    
    // Nettoyer les options existantes (sauf la première)
    while (domainFilter.options.length > 1) {
        domainFilter.remove(1);
    }
    
    const domains = [...new Set(window.CONFIG.promises.map(p => p.domaine))].sort();
    
    domains.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain;
        option.textContent = domain;
        domainFilter.appendChild(option);
    });
}

function renderPromises(promises) {
    const container = document.getElementById('promisesContainer');
    if (!container) return;
    
    if (promises.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search fa-3x" style="color: var(--text-secondary);"></i>
                <h3 style="margin: 1rem 0; color: var(--text-primary);">Aucun résultat trouvé</h3>
                <p style="color: var(--text-secondary);">Essayez de modifier vos critères de recherche</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = promises.map(p => createPromiseCard(p)).join('');
}

function createPromiseCard(promise) {
    const statusClass = promise.status === 'realise' ? 'status-realise' :
        promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
    
    const statusText = promise.status === 'realise' ? '✅ Réalisé' :
        promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    
    const progress = promise.status === 'realise' ? 100 :
        promise.status === 'encours' ? 50 : 10;
    
    return `
        <div class="promise-card" data-id="${promise.id}">
            <span class="domain-badge">${promise.domaine}</span>
            <h3 class="promise-title">${promise.engagement}</h3>
            
            <div class="result-box">
                <i class="fas fa-bullseye"></i>
                <strong>Résultat attendu :</strong> ${promise.resultat}
            </div>
            
            <div class="promise-meta">
                <div class="status-badge ${statusClass}">${statusText}</div>
                <div class="delay-badge">
                    <i class="fas fa-clock"></i>
                    ${promise.delai}
                </div>
            </div>
            
            ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
                <button class="details-btn" onclick="toggleDetails('${promise.id}')">
                    <i class="fas fa-history"></i>
                    Voir les mises à jour (${promise.mises_a_jour.length})
                </button>
            ` : ''}
        </div>
    `;
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
    window.renderStats = renderStats;
    window.renderFilters = renderFilters;
    window.renderPromises = renderPromises;
    window.createPromiseCard = createPromiseCard;
}
