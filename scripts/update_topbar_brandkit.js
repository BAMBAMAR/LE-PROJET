const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

const target = `<div class="topbar-right">
      <a href="/" target="_blank" rel="noopener noreferrer" class="topbar-btn"><i class="fas fa-external-link-alt"></i> Voir le site</a>
      <button class="topbar-btn danger" onclick="logout()"><i class="fas fa-right-from-bracket"></i> Déconnexion</button>
    </div>`;

const replacement = `<div class="topbar-right">
      <button class="topbar-btn" onclick="document.querySelector('.nav-item[data-page=\\'branding\\']').click()" style="background:rgba(45,95,63,0.08);color:var(--green);border-color:rgba(45,95,63,0.25);font-weight:700">
        <i class="fas fa-swatchbook"></i> Brand Kit
      </button>
      <a href="assets/branding/brand_kit" target="_blank" rel="noopener noreferrer" class="topbar-btn" title="Ouvrir le Brand Kit dans un nouvel onglet">
        <i class="fas fa-arrow-up-right-from-square"></i>
      </a>
      <a href="/" target="_blank" rel="noopener noreferrer" class="topbar-btn"><i class="fas fa-external-link-alt"></i> Voir le site</a>
      <button class="topbar-btn danger" onclick="logout()"><i class="fas fa-right-from-bracket"></i> Déconnexion</button>
    </div>`;

// Replace handling both CRLF and LF
const cNorm = c.replace(/\r\n/g, '\n');
const targetNorm = target.replace(/\r\n/g, '\n');
const repNorm = replacement.replace(/\r\n/g, '\n');

if (cNorm.includes(targetNorm)) {
  c = cNorm.replace(targetNorm, repNorm).replace(/\n/g, '\r\n');
  fs.writeFileSync('admin.html', c, 'utf8');
  console.log('Topbar successfully updated with Brand Kit button!');
} else {
  console.log('Target still not found');
}
