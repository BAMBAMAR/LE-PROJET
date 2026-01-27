// ... [inclure les fonctions de base : renderPromises, setupCardInteractions, etc.] ...

function createPromiseCard(promise) {
    const statusClass = promise.status === 'realise' ? 'status-realise' :
                        promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
    
    const statusText = promise.status === 'realise' ? '✅ Réalisé' :
                       promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    
    const progress = promise.progress || (promise.status === 'realise' ? 100 :
                                          promise.status === 'encours' ? 50 : 0);
    
    // Formatage des étoiles
    const starsHTML = [1,2,3,4,5].map(i => `
        <i class="fas fa-star ${promise.average_rating >= i ? 'star-filled' : 
                               promise.average_rating > i - 0.5 ? 'star-half' : 'star-empty'}"></i>
    `).join('');
    
    return `
        <div class="promise-card" data-id="${promise.id}" data-status="${promise.status}" data-domaine="${promise.domaine}" id="promise-${promise.id}">
            <span class="domain-badge">${promise.domaine}</span>
            <h3 class="promise-title">${promise.engagement}</h3>
            <div class="result-box">
                <i class="fas fa-bullseye"></i>
                <strong>Résultat attendu :</strong> ${promise.resultat}
            </div>
            
            <div class="promise-meta">
                <div class="meta-row">
                    <span><i class="fas fa-tasks"></i> Statut</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="meta-row">
                    <span><i class="fas fa-clock"></i> Délai</span>
                    <span class="delay-badge">
                        <i class="fas fa-calendar-alt"></i> ${promise.delai}
                    </span>
                </div>
                ${promise.isLate ? `
                <div class="meta-row">
                    <span><i class="fas fa-exclamation-triangle"></i> Retard</span>
                    <span class="delay-badge delay-danger">
                        <i class="fas fa-exclamation-triangle"></i> En retard
                    </span>
                </div>
                ` : ''}
            </div>
            
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progression</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <!-- SECTION NOTATION -->
            <div class="rating-section">
                <div class="rating-display">
                    <div class="stars">
                        ${starsHTML}
                    </div>
                    <span class="rating-value">${promise.average_rating}</span>
                    <span class="rating-count">(${promise.rating_count})</span>
                </div>
                <button class="rate-btn" onclick="window.openRatingModal('${promise.id}')">
                    <i class="fas fa-star"></i> Noter
                </button>
            </div>
            
            ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
            <button class="details-btn" onclick="window.toggleDetails('${promise.id}')">
                <i class="fas fa-history"></i>
                Voir les mises à jour (${promise.mises_a_jour.length})
            </button>
            <div class="updates-container" id="updates-${promise.id}">
                ${promise.mises_a_jour.map(update => `
                    <div class="update-item">
                        <div class="update-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(update.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div class="update-text">${update.texte}</div>
                        ${update.source ? `<div class="update-source">Source: ${update.source}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <!-- STATISTIQUES DE PARTAGE -->
            <div class="share-stats">
                <span class="share-count">
                    <i class="fas fa-share-alt"></i> ${promise.share_count || 0} partages
                </span>
            </div>
            
            <div class="share-section">
                <a href="#" class="share-btn share-twitter" onclick="window.sharePromise('${promise.id}', 'twitter'); return false;" title="Partager sur Twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="share-btn share-facebook" onclick="window.sharePromise('${promise.id}', 'facebook'); return false;" title="Partager sur Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="share-btn share-whatsapp" onclick="window.sharePromise('${promise.id}', 'whatsapp'); return false;" title="Partager sur WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="#" class="share-btn share-linkedin" onclick="window.sharePromise('${promise.id}', 'linkedin'); return false;" title="Partager sur LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </a>
                <button class="screenshot-btn" onclick="window.capturePromise('${promise.id}')" title="Capturer">
                    <i class="fas fa-camera"></i>
                </button>
            </div>
        </div>
    `;
}

// ... [inclure les autres fonctions : toggleDetails, capturePromise, applyFilters, etc.] ...

// Export global
window.renderPromises = renderPromises;
window.renderPromisesPaginated = renderPromisesPaginated;
window.applyFilters = applyFilters;
window.toggleDetails = toggleDetails;
window.sharePromise = sharePromise;
window.capturePromise = capturePromise;
