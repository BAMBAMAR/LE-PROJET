const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const PORT = 4040;
const PROJECT_DIR = path.join(__dirname, '..');
const REVUE_DIR = path.join(PROJECT_DIR, 'revuedepresse');
const PRESS_JSON_PATH = path.join(PROJECT_DIR, 'press.json');

if (!fs.existsSync(REVUE_DIR)) {
  fs.mkdirSync(REVUE_DIR, { recursive: true });
}

// Dictionnaire de détection automatique des journaux
const KNOWN_PAPERS = [
  { keywords: ['rewmi sport', 'rewmisport'], name: 'Rewmi Sports' },
  { keywords: ['rewmi quotidien', 'rewmi'], name: 'Rewmi Quotidien' },
  { keywords: ['soleil', 'le soleil', 'lesoleil'], name: 'Le Soleil' },
  { keywords: ['sud quotidien', 'sudonline', 'sudquotidien', 'sud'], name: 'Sud Quotidien' },
  { keywords: ['liberation'], name: 'Libération' },
  { keywords: ['observateur', 'lobservateur', "l'observateur"], name: "L'Observateur" },
  { keywords: ['le quotidien', 'lequotidien'], name: 'Le Quotidien' },
  { keywords: ['evidence', 'levidence', "l'evidence"], name: "L'Évidence" },
  { keywords: ['echos', 'les echos'], name: 'Les Échos' },
  { keywords: ['point actu', 'le point', 'le epoint'], name: 'Le Point' },
  { keywords: ['tribune sport', 'tribunesport', 'tribune'], name: 'Tribune' },
  { keywords: ['republicain', 'lerepublicain'], name: 'Le Républicain' },
  { keywords: ['las', "l'as"], name: "L'As" },
  { keywords: ['enquete'], name: 'Enquête' },
  { keywords: ['record'], name: 'Record' },
  { keywords: ['yoor-yoor', 'yooryoor', 'yoor'], name: 'Yoor-Yoor' },
  { keywords: ['direct news', 'directnews'], name: 'Direct News' },
  { keywords: ['linfo', "l'info"], name: "L'Info" },
  { keywords: ['populaire', 'pop', 'le populaire'], name: 'Le Populaire' },
  { keywords: ['bes bi', 'besbi', 'le jour'], name: 'Bès Bi' },
  { keywords: ['source a', 'sourcea'], name: 'Source A' },
  { keywords: ['walf', 'walfadjri'], name: 'Walf Quotidien' },
  { keywords: ['lii quotidien', 'lii'], name: 'Lii Quotidien' },
  { keywords: ['temoin', 'le temoin'], name: 'Le Témoin' },
  { keywords: ['vox populi', 'voxpopuli', 'vox'], name: 'Vox Populi' },
  { keywords: ['stade'], name: 'Stade' },
  { keywords: ['grand panel', 'panel'], name: 'Grand Panel' },
  { keywords: ['scoop', 'digital scoop'], name: 'Scoop' },
  { keywords: ['alerte'], name: 'Alerte Quotidien' },
  { keywords: ['independant', "l'independant"], name: "L'Indépendant" },
  { keywords: ['informateur', "l'informateur"], name: "L'Informateur" },
  { keywords: ['solo quotidien', 'solo'], name: 'Solo Quotidien' },
  { keywords: ['peuple', 'le peuple'], name: 'Le Peuple' }
];

function detectPaperName(filename) {
  if (!filename) return 'Quotidien';
  const clean = filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]/g, ' ');

  for (const paper of KNOWN_PAPERS) {
    for (const kw of paper.keywords) {
      if (clean.includes(kw)) return paper.name;
    }
  }

  const base = path.parse(filename).name
    .replace(/^revue_\d{4}-\d{2}-\d{2}_\d+$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  if (base && base.length > 2) {
    return base.charAt(0).toUpperCase() + base.slice(1);
  }
  return 'Quotidien';
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestionnaire Revue de Presse — Publication Directe</title>
  <style>
    :root {
      --primary: #0F5132;
      --primary-hover: #0a3622;
      --accent: #E5A823;
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-bright: #f0f6fc;
      --danger: #da3633;
      --success: #238636;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    h1 { color: var(--text-bright); font-size: 1.6rem; display: flex; align-items: center; gap: 10px; }
    .badge { background: var(--primary); color: white; font-size: 0.8rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
    
    .drop-zone {
      border: 2px dashed #388bfd;
      background: rgba(56, 139, 253, 0.05);
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 24px;
    }
    .drop-zone:hover, .drop-zone.dragover {
      background: rgba(56, 139, 253, 0.12);
      border-color: #58a6ff;
      transform: translateY(-2px);
    }
    .drop-zone-icon { font-size: 3rem; margin-bottom: 12px; }
    .drop-zone h3 { color: var(--text-bright); margin-bottom: 6px; font-size: 1.2rem; }
    .drop-zone p { color: #8b949e; font-size: 0.9rem; }
    
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .date-picker-group { display: flex; align-items: center; gap: 10px; }
    .date-picker-group label { font-size: 0.9rem; font-weight: 500; }
    input[type="date"] {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-bright);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .btn-primary { background: var(--success); color: white; }
    .btn-primary:hover { background: #2ea043; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger { background: rgba(218, 54, 51, 0.2); color: #f85149; border: 1px solid rgba(218, 54, 51, 0.4); }
    .btn-danger:hover { background: var(--danger); color: white; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 18px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { border-color: #58a6ff; transform: translateY(-3px); }
    .card-img-wrap {
      width: 100%;
      height: 250px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .card-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1; }
    .card-title-input {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-bright);
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 100%;
      font-weight: 600;
    }
    .card-title-input:focus { border-color: #58a6ff; outline: none; }
    .card-index {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
    }
    .card-del {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(218, 54, 51, 0.85);
      color: white;
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-del:hover { background: var(--danger); }
    
    #statusOverlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(13, 17, 23, 0.85);
      backdrop-filter: blur(4px);
      z-index: 999;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
    }
    .spinner {
      width: 44px; height: 44px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #58a6ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #238636;
      color: white;
      padding: 14px 22px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      font-weight: 500;
      z-index: 1000;
      display: none;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📰 Revue de Presse — Publication Immédiate</h1>
      <span class="badge" id="paperCountBadge">0 journaux</span>
    </header>

    <div class="drop-zone" id="dropZone">
      <div class="drop-zone-icon">📥</div>
      <h3>Glissez-déposez les images des journaux du jour ici</h3>
      <p>ou cliquez pour sélectionner plusieurs fichiers (JPG, PNG, WEBP)</p>
      <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" style="display:none">
    </div>

    <div class="action-bar">
      <div class="date-picker-group">
        <label for="revueDate">📅 Date de la revue :</label>
        <input type="date" id="revueDate">
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-danger" id="clearBtn" onclick="clearAll()">Vider la liste</button>
        <button class="btn btn-primary" id="publishBtn" onclick="publishRevue()" disabled>
          🚀 Publier & Mettre à jour press.json
        </button>
      </div>
    </div>

    <div class="grid" id="papersGrid"></div>
  </div>

  <div id="statusOverlay">
    <div class="spinner"></div>
    <h3 id="overlayText" style="color:white">Publication en cours...</h3>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    let papers = [];
    const today = new Date();
    document.getElementById('revueDate').value = today.toISOString().split('T')[0];

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const papersGrid = document.getElementById('papersGrid');
    const publishBtn = document.getElementById('publishBtn');
    const paperCountBadge = document.getElementById('paperCountBadge');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    async function handleFiles(fileList) {
      if (!fileList || fileList.length === 0) return;
      showOverlay('Chargement des images...');

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await readFileAsBase64(file);
        const autoTitle = guessTitle(file.name);
        papers.push({
          id: Date.now() + Math.random().toString(36).substring(2, 6),
          filename: file.name,
          title: autoTitle,
          dataUrl: base64
        });
      }

      hideOverlay();
      renderGrid();
    }

    function readFileAsBase64(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    function guessTitle(name) {
      const clean = name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[_-]/g, ' ');
      const map = {
        'soleil': 'Le Soleil', 'observateur': "L'Observateur", 'liberation': 'Libération',
        'enquete': 'Enquête', 'record': 'Record', 'sud': 'Sud Quotidien',
        'quotidien': 'Le Quotidien', 'evidence': "L'Évidence", 'echos': 'Les Échos',
        'point': 'Le Point', 'tribune': 'Tribune', 'las': "L'As",
        'yoor': 'Yoor-Yoor', 'direct': 'Direct News', 'info': "L'Info",
        'populaire': 'Le Populaire', 'bes bi': 'Bès Bi', 'source a': 'Source A',
        'walf': 'Walf Quotidien', 'lii': 'Lii Quotidien', 'temoin': 'Le Témoin',
        'vox': 'Vox Populi', 'stade': 'Stade', 'rewmi': 'Rewmi Quotidien'
      };
      for (const [kw, title] of Object.entries(map)) {
        if (clean.includes(kw)) return title;
      }
      return 'Quotidien';
    }

    function renderGrid() {
      paperCountBadge.textContent = \`\${papers.length} journaux\`;
      publishBtn.disabled = papers.length === 0;

      if (papers.length === 0) {
        papersGrid.innerHTML = '';
        return;
      }

      papersGrid.innerHTML = papers.map((p, index) => \`
        <div class="card" id="card-\${p.id}">
          <span class="card-index">#\${index + 1}</span>
          <button class="card-del" onclick="removePaper('\${p.id}')" title="Supprimer">&times;</button>
          <div class="card-img-wrap">
            <img src="\${p.dataUrl}" alt="\${p.title}">
          </div>
          <div class="card-body">
            <input type="text" class="card-title-input" value="\${p.title}" oninput="updateTitle('\${p.id}', this.value)" placeholder="Titre du journal">
          </div>
        </div>
      \`).join('');
    }

    function updateTitle(id, newTitle) {
      const p = papers.find(item => item.id === id);
      if (p) p.title = newTitle;
    }

    function removePaper(id) {
      papers = papers.filter(p => p.id !== id);
      renderGrid();
    }

    function clearAll() {
      if (papers.length > 0 && !confirm('Voulez-vous vraiment vider la liste ?')) return;
      papers = [];
      renderGrid();
    }

    async function publishRevue() {
      if (papers.length === 0) return;
      const dateVal = document.getElementById('revueDate').value;
      const [y, m, d] = dateVal.split('-');
      const dateFr = \`\${d}/\${m}/\${y}\`;

      showOverlay(\`Enregistrement de \${papers.length} journaux et mise à jour...\`);

      try {
        const payload = {
          dateIso: dateVal,
          dateFr: dateFr,
          papers: papers.map(p => ({
            title: p.title || 'Quotidien',
            dataUrl: p.dataUrl
          }))
        };

        const res = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        hideOverlay();

        if (result.success) {
          showToast(\`🎉 \${result.count} journaux publiés avec succès ! Le site est à jour.\`);
          setTimeout(() => {
            alert(\`✅ Succès ! \\n\\n\${result.count} journaux ont été enregistrés dans 'revuedepresse/' et press.json a été mis à jour.\\n\\nGitHub a été synchronisé automatiquement.\`);
          }, 300);
        } else {
          alert('Erreur: ' + (result.error || 'Erreur inconnue'));
        }
      } catch (err) {
        hideOverlay();
        alert('Erreur réseau ou serveur: ' + err.message);
      }
    }

    function showOverlay(txt) {
      document.getElementById('overlayText').textContent = txt;
      document.getElementById('statusOverlay').style.display = 'flex';
    }
    function hideOverlay() {
      document.getElementById('statusOverlay').style.display = 'none';
    }
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_PAGE);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/current') {
    try {
      const current = fs.existsSync(PRESS_JSON_PATH)
        ? JSON.parse(fs.readFileSync(PRESS_JSON_PATH, 'utf8'))
        : { press: [] };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(current));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/publish') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protection anti-dépassement max 100MB
      if (body.length > 100 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload trop volumineux' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { dateIso, dateFr, papers } = payload;

        if (!papers || !Array.isArray(papers) || papers.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Aucun journal fourni' }));
          return;
        }

        const savedPapers = [];
        let counter = 1;

        for (const p of papers) {
          const matches = p.dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (!matches) continue;

          let ext = matches[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `revue_${dateIso}_${counter}.${ext}`;
          const filePath = path.join(REVUE_DIR, filename);

          fs.writeFileSync(filePath, buffer);

          savedPapers.push({
            id: String(counter),
            title: p.title || 'Quotidien',
            date: dateFr,
            image: `revuedepresse/${filename}`,
            link: '#'
          });

          counter++;
        }

        // Mettre à jour press.json
        const pressData = {
          last_updated: new Date().toISOString(),
          press: savedPapers
        };
        fs.writeFileSync(PRESS_JSON_PATH, JSON.stringify(pressData, null, 2), 'utf8');

        // Synchroniser Git
        try {
          execSync('git add revuedepresse/ press.json', { cwd: PROJECT_DIR, stdio: 'inherit' });
          const status = execSync('git status --porcelain', { cwd: PROJECT_DIR, encoding: 'utf8' }).trim();
          if (status) {
            execSync(`git commit -m "Mise à jour manuelle revue de presse du ${dateFr} (${savedPapers.length} journaux)"`, { cwd: PROJECT_DIR, stdio: 'inherit' });
            try { execSync('git pull --rebase --autostash origin main', { cwd: PROJECT_DIR, stdio: 'inherit' }); } catch(e) {}
            execSync('git push origin main', { cwd: PROJECT_DIR, stdio: 'inherit' });
          }
        } catch (gitErr) {
          console.warn('Avertissement Git:', gitErr.message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, count: savedPapers.length }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('====================================================');
  console.log('  GESTIONNAIRE VISUEL DE REVUE DE PRESSE');
  console.log('====================================================');
  console.log(`\n🚀 Interface disponible sur : ${url}`);
  console.log('   Glissez vos images dans la page web pour mettre à jour press.json.\n');

  if (process.platform === 'win32') {
    exec(`start ${url}`);
  }
});
