const fs = require('fs');

const adminPath = 'admin.html';
let content = fs.readFileSync(adminPath, 'utf8');

const target = '  <div class="nav-group-label">Outils</div>\r\n  <div class="nav-item" data-page="kit"><i class="fas fa-bullhorn"></i><span>Studio Réseaux Sociaux</span></div>';

const replacement = '  <div class="nav-group-label">Réseaux Sociaux</div>\r\n  <div class="nav-item" data-page="social"><i class="fas fa-share-nodes"></i><span>Pages Réseaux Sociaux</span></div>\r\n  <div class="nav-item" data-page="kit"><i class="fas fa-bullhorn"></i><span>Studio Affiches HD</span></div>\r\n\r\n  <div class="nav-group-label">Outils</div>';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('Sidebar successfully updated with CRLF target!');
} else {
  // Try LF target
  const targetLF = target.replace(/\r\n/g, '\n');
  const replacementLF = replacement.replace(/\r\n/g, '\n');
  if (content.includes(targetLF)) {
    content = content.replace(targetLF, replacementLF);
    console.log('Sidebar successfully updated with LF target!');
  } else {
    console.error('Target not found in content!');
  }
}

// Also check pageTitles in JS
if (!content.includes('social:')) {
  content = content.replace(
    "kit: 'Studio Réseaux Sociaux & Visuels HD',",
    "social: 'Pages Réseaux Sociaux',\r\n  kit: 'Studio Réseaux Sociaux & Visuels HD',"
  );
}

// Also check nav click handler
if (!content.includes("if (page === 'social')")) {
  content = content.replace(
    "if (page === 'kit') {",
    "if (page === 'social') {\r\n      setTimeout(() => { initSocialPage(); }, 50);\r\n    }\r\n    if (page === 'kit') {"
  );
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Done!');
