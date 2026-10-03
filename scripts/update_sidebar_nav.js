const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

const oldSnippet = '<div class="nav-group-label">Réseaux Sociaux</div>';
const newSnippet = '<div class="nav-group-label">Marque & Réseaux Sociaux</div>\r\n  <div class="nav-item" data-page="branding"><i class="fas fa-palette"></i><span>Logos & Kit de Marque</span><span class="nav-badge" style="background:var(--gold);font-size:.6rem">HD</span></div>';

if (c.includes(oldSnippet)) {
  c = c.replace(oldSnippet, newSnippet);
  fs.writeFileSync('admin.html', c, 'utf8');
  console.log('Sidebar successfully updated with branding item!');
} else {
  console.log('Snippet not found');
}
