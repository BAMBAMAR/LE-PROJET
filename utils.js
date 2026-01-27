// ==========================================
// UTILS.JS - Fonctions utilitaires corrigées
// ==========================================

// ==========================================
// FONCTIONS DE FILTRAGE
// ==========================================
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', updateDisplay);
    if (sectorFilter) sectorFilter.addEventListener('change', updateDisplay);
    if (statusFilter) statusFilter.addEventListener('change', updateDisplay);
}

function updateDisplay() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sector = document.getElementById('sectorFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    const filtered = window.CONFIG.promises.filter(p => {
        const matchSearch = p.engagement.toLowerCase().includes(search) ||
            p.resultat.toLowerCase().includes(search) ||
            p.domaine.toLowerCase().includes(search);
        
        const matchSector = !sector || p.domaine === sector;
        
        const matchStatus = !status ||
            (status === 'realise' && p.status === 'realise') ||
            (status === 'encours' && p.status === 'encours') ||
            (status === 'non-lance' && p.status === 'non-lance');
        
        return matchSearch && matchSector && matchStatus;
    });
    
    renderStats();
    renderPromises(filtered);
}

// ==========================================
// FONCTIONS DE PARTAGE
// ==========================================
function setupShareButtons() {
    const url = window.location.href;
    const text = 'Suivi des engagements du Président Diomaye Faye | LE PROJET SÉNÉGAL';
    
    const shareTwitter = document.getElementById('share-twitter-dash');
    const shareFacebook = document.getElementById('share-facebook-dash');
    const shareWhatsapp = document.getElementById('share-whatsapp-dash');
    const shareLinkedin = document.getElementById('share-linkedin-dash');
    
    if (shareTwitter) {
        shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    
    if (shareFacebook) {
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    
    if (shareWhatsapp) {
        shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    }
    
    if (shareLinkedin) {
        shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
}

// ==========================================
// FONCTIONS D'ANIMATION
// ==========================================
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        if (!element) {
            clearInterval(timer);
            return;
        }
        
        current += increment;
        element.textContent = current;
        if (current === end) clearInterval(timer);
    }, stepTime);
}

function fadeIn(element) {
    if (!element) return;
    
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let opacity = 0;
    const timer = setInterval(() => {
        if (opacity >= 1) {
            clearInterval(timer);
        }
        if (element) {
            element.style.opacity = opacity;
            opacity += 0.1;
        } else {
            clearInterval(timer);
        }
    }, 30);
}

function fadeOut(element) {
    if (!element) return;
    
    let opacity = 1;
    const timer = setInterval(() => {
        if (opacity <= 0) {
            clearInterval(timer);
            if (element) element.style.display = 'none';
        }
        if (element) {
            element.style.opacity = opacity;
            opacity -= 0.1;
        } else {
            clearInterval(timer);
        }
    }, 30);
}

// ==========================================
// FONCTIONS DE VALIDATION
// ==========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhoneNumber(phone) {
    const re = /^(\+?221)?[0-9]{9}$/;
    return re.test(phone);
}

// ==========================================
// FONCTIONS DE STOCKAGE SÉCURISÉES
// ==========================================
function saveToLocalStorage(key, data) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        }
        return false;
    } catch (error) {
        console.warn('⚠️ Impossible d\'écrire dans localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        if (typeof localStorage !== 'undefined') {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Impossible de lire depuis localStorage:', error);
        return null;
    }
}

function clearLocalStorage(key) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
            return true;
        }
        return false;
    } catch (error) {
        console.warn('⚠️ Impossible de supprimer de localStorage:', error);
        return false;
    }
}

// ==========================================
// FONCTIONS DE FORMATAGE
// ==========================================
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('fr-FR').format(number);
}

// ==========================================
// FONCTIONS DE DÉBOGAGE
// ==========================================
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    
    switch(type) {
        case 'error':
            console.error(prefix, message);
            break;
        case 'warn':
            console.warn(prefix, message);
            break;
        case 'success':
            console.log('%c' + prefix + ' ' + message, 'color: green; font-weight: bold;');
            break;
        default:
            console.log(prefix, message);
    }
}

function debugObject(obj, label = 'Debug') {
    console.log(`🔍 ${label}:`, JSON.stringify(obj, null, 2));
}

// ==========================================
// FONCTIONS D'UTILITÉ GÉNÉRALE
// ==========================================
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==========================================
// EXPORTER LES FONCTIONS
// ==========================================
if (typeof window !== 'undefined') {
    window.utils = {
        setupEventListeners,
        updateDisplay,
        setupShareButtons,
        animateValue,
        fadeIn,
        fadeOut,
        validateEmail,
        validatePhoneNumber,
        saveToLocalStorage,
        loadFromLocalStorage,
        clearLocalStorage,
        formatDate,
        formatCurrency,
        formatNumber,
        log,
        debugObject,
        getRandomColor,
        debounce,
        throttle
    };
}
