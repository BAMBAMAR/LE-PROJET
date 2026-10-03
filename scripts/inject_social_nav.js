const fs = require('fs');

const adminPath = 'admin.html';
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Check if social nav item already exists
if (!content.includes('data-page="social"')) {
  // Add to sidebar under a new group "Réseaux Sociaux"
  const targetSidebar = '<div class="nav-group-label">Outils</div>';
  const newSidebarSection = `  <div class="nav-group-label">Réseaux Sociaux</div>
  <div class="nav-item" data-page="social"><i class="fas fa-share-nodes"></i><span>Pages Réseaux Sociaux</span></div>
  <div class="nav-item" data-page="kit"><i class="fas fa-bullhorn"></i><span>Studio Affiches HD</span></div>

  <div class="nav-group-label">Outils</div>`;
  
  // Replace the old kit nav item and label
  const oldKitItem = `<div class="nav-group-label">Outils</div>\n  <div class="nav-item" data-page="kit"><i class="fas fa-bullhorn"></i><span>Studio Réseaux Sociaux</span></div>`;
  if (content.includes(oldKitItem)) {
    content = content.replace(oldKitItem, newSidebarSection);
  } else {
    content = content.replace(targetSidebar, newSidebarSection);
  }
  console.log('Sidebar updated with data-page="social"');
}

// 2. Add pageTitle for social
if (!content.includes('social:')) {
  content = content.replace(
    "kit: 'Studio Réseaux Sociaux & Visuels HD',",
    "social: 'Gestion & Personnalisation des Réseaux Sociaux',\n  kit: 'Studio Réseaux Sociaux & Visuels HD',"
  );
  console.log('pageTitles updated with social');
}

// 3. Add social initialization in nav handler
if (!content.includes("if (page === 'social')")) {
  content = content.replace(
    "if (page === 'kit') {",
    "if (page === 'social') {\n      setTimeout(() => { initSocialPage(); }, 50);\n    }\n    if (page === 'kit') {"
  );
  console.log('Nav click handler updated with social hook');
}

console.log('Step 1 successful!');
