function setupEventListeners() {
  document.getElementById('search').addEventListener('input', updateDisplay);
  document.getElementById('domaine').addEventListener('change', updateDisplay);
  document.getElementById('status').addEventListener('change', updateDisplay);
}

function updateDisplay() {
  const search = document.getElementById('search').value.toLowerCase();
  const domaine = document.getElementById('domaine').value;
  const status = document.getElementById('status').value;
  
  const filtered = CONFIG.promises.filter(p => {
    const matchSearch = p.engagement.toLowerCase().includes(search) || 
                       p.resultat.toLowerCase().includes(search);
    const matchDomaine = !domaine || p.domaine === domaine;
    const matchStatus = !status || 
                       (status === 'realise' && p.status === 'realise') ||
                       (status === 'en-retard' && p.isLate) ||
                       (status === 'dans-les-temps' && !p.isLate && p.status !== 'realise');
    
    return matchSearch && matchDomaine && matchStatus;
  });
  
  renderStats();
  renderPromises(filtered);
}

function setupShareButtons() {
  const url = window.location.href;
  const text = 'Suivi des engagements du Président Diomaye Faye';
  
  document.getElementById('share-twitter-dash').href = 
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  document.getElementById('share-facebook-dash').href = 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
