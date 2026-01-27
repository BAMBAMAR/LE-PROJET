// ==========================================
// RENDER.JS - Rendu des composants
// ==========================================

function renderPromises(promises) {
    const container = document.getElementById('promisesContainer');
    if (!container) return;
    
    if (promises.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x" style="color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Aucun résultat trouvé</h3>
                <p style="color: var(--text-secondary);">Essayez de modifier vos critères de recherche</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = promises.map(promise => createPromiseCard(promise)).join('');
    setupCardInteractions();
}

function createPromiseCard(promise) {
    const statusClass = promise.status === 'realise' ? 'status-realise' :
                        promise.status === 'encours' ? 'status-encours' : 'status-nonlance';
    
    const statusText = promise.status === 'realise' ? '✅ Réalisé' :
                       promise.status === 'encours' ? '🔄 En cours' : '⏳ Non lancé';
    
    const progress = promise.progress || (promise.status === 'realise' ? 100 :
                                          promise.status === 'encours' ? 50 : 0);
    
    return `
        <div class="promise-card" data-id="${promise.id}" data-status="${promise.status}" data-domaine="${promise.domaine}">
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
            
            ${promise.mises_a_jour && promise.mises_a_jour.length > 0 ? `
            <button class="details-btn" onclick="toggleDetails('${promise.id}')">
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
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="share-section">
                <a href="#" class="share-btn share-twitter" onclick="sharePromise('${promise.id}', 'twitter')" title="Partager sur Twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="share-btn share-facebook" onclick="sharePromise('${promise.id}', 'facebook')" title="Partager sur Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="share-btn share-whatsapp" onclick="sharePromise('${promise.id}', 'whatsapp')" title="Partager sur WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <button class="screenshot-btn" onclick="capturePromise('${promise.id}')" title="Capturer">
                    <i class="fas fa-camera"></i>
                </button>
            </div>
        </div>
    `;
}

function setupCardInteractions() {
    // Effet hover avancé
    document.querySelectorAll('.promise-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
    
    // Gestion du clic sur les badges de statut pour filtrer
    document.querySelectorAll('.status-badge').forEach(badge => {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const status = badge.className.includes('realise') ? 'realise' :
                          badge.className.includes('encours') ? 'encours' : 'non-lance';
            document.getElementById('statusFilter').value = status;
            applyFilters();
            showNotification(`Filtré par statut: ${status === 'realise' ? 'Réalisé' : status === 'encours' ? 'En cours' : 'Non lancé'}`, 'info');
        });
    });
}

function toggleDetails(promiseId) {
    const updatesContainer = document.getElementById(`updates-${promiseId}`);
    const btn = event.currentTarget;
    
    if (updatesContainer) {
        const isVisible = updatesContainer.classList.contains('show');
        updatesContainer.classList.toggle('show', !isVisible);
        btn.innerHTML = !isVisible 
            ? '<i class="fas fa-chevron-up"></i> Masquer les mises à jour'
            : '<i class="fas fa-history"></i> Voir les mises à jour';
    }
}

function sharePromise(promiseId, platform) {
    const promise = CONFIG.promises.find(p => p.id === promiseId);
    if (!promise) return;
    
    const text = encodeURIComponent(`Engagement: ${promise.engagement} - ${promise.resultat.substring(0, 100)}...`);
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=ProjetSenegal,DiomayeFaye`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(`Engagement partagé sur ${platform.charAt(0).toUpperCase() + platform.slice(1)} !`, 'success');
}

function capturePromise(promiseId) {
    const card = document.querySelector(`.promise-card[data-id="${promiseId}"]`);
    if (!card) return;
    
    showNotification('Capture en cours...', 'info');
    
    html2canvas(card, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `engagement-${promiseId}-${new Date().toISOString().slice(0,10)}.png`;
        link.href = imgData;
        link.click();
        
        // Afficher dans le modal
        const captureModal = document.getElementById('captureModal');
        const captureImage = document.getElementById('captureImage');
        
        if (captureModal && captureImage) {
            captureImage.src = imgData;
            captureModal.classList.add('show');
            
            showNotification('Capture effectuée avec succès !', 'success');
        }
    }).catch(error => {
        console.error('Erreur capture:', error);
        showNotification('Erreur lors de la capture', 'error');
    });
}

// ==========================================
// FONCTIONS DE FILTRE
// ==========================================
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sector = document.getElementById('sectorFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'recent';
    
    let filtered = CONFIG.promises.filter(p => {
        const matchSearch = p.engagement.toLowerCase().includes(search) ||
                           p.resultat.toLowerCase().includes(search) ||
                           p.domaine.toLowerCase().includes(search);
        const matchSector = !sector || p.domaine === sector;
        const matchStatus = !status || 
                           (status === 'en-retard' && p.isLate) ||
                           (status !== 'en-retard' && p.status === status);
        
        return matchSearch && matchSector && matchStatus;
    });
    
    // Trier
    switch(sort) {
        case 'oldest':
            filtered.sort((a, b) => a.id - b.id);
            break;
        case 'rating':
            // Simuler un tri par note
            filtered.sort(() => Math.random() - 0.5);
            break;
        case 'delay':
            filtered.sort((a, b) => b.isLate - a.isLate);
            break;
        default: // recent
            filtered.sort((a, b) => b.id - a.id);
    }
    
    // Réinitialiser la pagination
    CONFIG.currentPage = 1;
    
    // Rendre les résultats paginés
    renderPromisesPaginated(filtered, CONFIG.currentPage);
    
    // Mettre à jour les statistiques
    const stats = calculateStatsFromFiltered(filtered);
    animateStats(stats);
    
    // Message de feedback
    if (filtered.length === 0) {
        showNotification('Aucun engagement ne correspond aux critères de recherche', 'warning');
    } else if (filtered.length < CONFIG.promises.length) {
        showNotification(`${filtered.length} engagements trouvés`, 'info');
    }
}

function calculateStatsFromFiltered(filtered) {
    const total = filtered.length;
    const realise = filtered.filter(p => p.status === 'realise').length;
    const encours = filtered.filter(p => p.status === 'encours').length;
    const retard = filtered.filter(p => p.isLate).length;
    const withUpdates = filtered.filter(p => p.mises_a_jour && p.mises_a_jour.length > 0).length;
    
    return {
        total,
        realise,
        encours,
        retard,
        withUpdates,
        realisePercentage: total > 0 ? ((realise / total) * 100).toFixed(1) : 0,
        encoursPercentage: total > 0 ? ((encours / total) * 100).toFixed(1) : 0,
        retardPercentage: total > 0 ? ((retard / total) * 100).toFixed(1) : 0,
        updatesPercentage: total > 0 ? ((withUpdates / total) * 100).toFixed(1) : 0,
        tauxRealisation: total > 0 ? (((realise * 100 + encours * 50) / (total * 100)) * 100).toFixed(1) : 0,
        mainDomain: '-',
        mainDomainCount: 0,
        upcomingDeadlines: 0
    };
}

// ==========================================
// QUICK FILTERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            switch(filter) {
                case 'all':
                    document.getElementById('searchInput').value = '';
                    document.getElementById('sectorFilter').value = '';
                    document.getElementById('statusFilter').value = '';
                    break;
                case 'realise':
                    document.getElementById('statusFilter').value = 'realise';
                    break;
                case 'encours':
                    document.getElementById('statusFilter').value = 'encours';
                    break;
                case 'retard':
                    document.getElementById('statusFilter').value = 'en-retard';
                    break;
                case 'updates':
                    // Filtrer manuellement les engagements avec mises à jour
                    const withUpdates = CONFIG.promises.filter(p => p.mises_a_jour && p.mises_a_jour.length > 0);
                    renderPromisesPaginated(withUpdates, 1);
                    return;
                case 'reset':
                    document.getElementById('searchInput').value = '';
                    document.getElementById('sectorFilter').value = '';
                    document.getElementById('statusFilter').value = '';
                    document.getElementById('sortFilter').value = 'recent';
                    break;
            }
            
            applyFilters();
        });
    });
    
    // News tabs
    document.querySelectorAll('.news-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.news-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNews(btn.dataset.tab);
        });
    });
});

// Export des fonctions nécessaires
window.renderPromises = renderPromises;
window.renderPromisesPaginated = renderPromisesPaginated;
window.applyFilters = applyFilters;
window.toggleDetails = toggleDetails;
window.sharePromise = sharePromise;
window.capturePromise = capturePromise;