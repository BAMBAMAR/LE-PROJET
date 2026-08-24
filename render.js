// ==========================================
// RENDER.JS - Fonctions de rendu Ultra-Premium
// ==========================================

// --- Sécurité : Échappement XSS ---
function escH(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}
function escId(str) {
    if (!str) return '';
    return String(str).replace(/[^a-zA-Z0-9_\-]/g, '');
}

function renderStats() {
    if (!window.CONFIG || !CONFIG.promises) return;
    const promises = CONFIG.promises;
    const total = promises.length;
    const realise = promises.filter(p => p.status === 'realise' || (p.status && p.status.includes('alis'))).length;
    const encours = promises.filter(p => p.status === 'encours' || (p.status && p.status.includes('cours'))).length;
    const retard = promises.filter(p => p.isLate).length;
    
    const elTotal = document.getElementById('total-promises');
    const elRealised = document.getElementById('realized');
    const elInProgress = document.getElementById('inProgress');
    const elDelayed = document.getElementById('delayed');
    
    if (elTotal) elTotal.textContent = total;
    if (elRealised) elRealised.textContent = realise;
    if (elInProgress) elInProgress.textContent = encours;
    if (elDelayed) elDelayed.textContent = retard;
}

function renderFilters() {
    const domainFilter = document.getElementById('sectorFilter');
    if (!domainFilter || !window.CONFIG || !CONFIG.promises) return;
    
    while (domainFilter.options.length > 1) {
        domainFilter.remove(1);
    }
    
    const domains = [...new Set(CONFIG.promises.map(p => p.domaine || p.domain))].filter(Boolean).sort();
    
    domains.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain;
        option.textContent = domain;
        domainFilter.appendChild(option);
    });
}

function renderPromises(promises) {
    const container = document.getElementById('promisesContainer') || document.getElementById('promisesGrid');
    if (!container) return;
    
    if (!promises || promises.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background:#fff; border-radius:12px; border:1px solid #E0E5E2;">
                <i class="fas fa-search fa-3x" style="color: #4A9469; margin-bottom: 1rem;"></i>
                <h3 style="margin: 0.5rem 0; color: #0D1B14; font-family: var(--font-family-display, 'Crimson Pro', serif); font-size:1.4rem;">Aucun engagement trouvé</h3>
                <p style="color: #5A6D63; font-size:0.95rem;">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                <button class="filter-btn active" onclick="if(window.resetFilters)resetFilters();" style="margin-top:1rem;">
                    <i class="fas fa-redo"></i> Réinitialiser les filtres
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = promises.map(p => createPromiseCard(p)).join('');
}

function createPromiseCard(promise) {
    const isRealise = promise.status === 'realise' || (promise.status && promise.status.includes('alis'));
    const isEncours = promise.status === 'encours' || (promise.status && promise.status.includes('cours'));
    const isRetard  = Boolean(promise.isLate);

    const statusClass = isRetard ? 'status-retard' :
        isRealise ? 'status-realise' :
        isEncours ? 'status-encours' : 'status-nonlance';
    
    const statusText = isRetard ? 'En retard' :
        isRealise ? 'Réalisé' :
        isEncours ? 'En cours' : 'Non lancé';
    
    const progress = isRealise ? 100 : isEncours ? 55 : isRetard ? 35 : 10;

    const safeId       = escId(promise.id);
    const safeDomaine  = escH(promise.domaine || promise.domain || 'Projet National');
    const safeTitle    = escH(promise.engagement || promise.title || '');
    const safeResultat = escH(promise.resultat || promise.result || 'Mise en oeuvre conforme au programme PASTEF');
    const safeDelai    = escH(promise.delai || promise.deadline || '2024–2029');
    
    return `
        <div class="promise-card ${statusClass}" data-id="${safeId}">
            <div class="promise-header">
                <span class="promise-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </span>
                <span class="promise-domain">${safeDomaine}</span>
            </div>
            
            <h3 class="promise-title">${safeTitle}</h3>
            
            <div class="promise-result">
                <strong><i class="fas fa-bullseye"></i> Résultat attendu :</strong>
                <div>${safeResultat}</div>
            </div>
            
            <div class="promise-meta">
                <span><i class="fas fa-hourglass-half"></i> ${safeDelai}</span>
                <span><i class="fas fa-chart-line"></i> ${progress}%</span>
            </div>
            
            <div class="promise-actions">
                <div class="social-share">
                    <button class="social-btn fb" onclick="if(window.shareToPlatform)shareToPlatform('${safeId}','facebook')" title="Partager sur Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="social-btn tw" onclick="if(window.shareToPlatform)shareToPlatform('${safeId}','twitter')" title="Partager sur X">
                        <i class="fab fa-x-twitter"></i>
                    </button>
                    <button class="social-btn wa" onclick="if(window.shareToPlatform)shareToPlatform('${safeId}','whatsapp')" title="Partager sur WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
                ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
                    <button class="filter-btn" onclick="toggleDetails('${safeId}')" style="padding: 4px 10px; font-size: 0.75rem;">
                        <i class="fas fa-history"></i> Suivi (${promise.mises_a_jour.length})
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Exporter les fonctions
window.renderStats = renderStats;
window.renderFilters = renderFilters;
window.renderPromises = renderPromises;
window.createPromiseCard = createPromiseCard;
