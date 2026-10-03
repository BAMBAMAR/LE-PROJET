const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

const regexTabs = /<div class="social-tabs">[\s\S]*?<\/div>/;
const newTabs = `<div class="social-tabs">
        <button class="social-tab-btn active" id="stb-profiles" onclick="switchSocialTab('profiles')"><i class="fas fa-id-card"></i> 1. Profils Officiels</button>
        <button class="social-tab-btn" id="stb-metadata" onclick="switchSocialTab('metadata')"><i class="fas fa-tags"></i> 2. Méta Open Graph & X</button>
        <button class="social-tab-btn" id="stb-simulator" onclick="switchSocialTab('simulator')"><i class="fas fa-eye"></i> 3. Simulateur Live</button>
        <button class="social-tab-btn" id="stb-generator" onclick="switchSocialTab('generator')"><i class="fas fa-bullhorn"></i> 4. Générateur de Posts</button>
        <button class="social-tab-btn" id="stb-public" onclick="switchSocialTab('public')"><i class="fas fa-globe"></i> 5. Intégration Site Public</button>
      </div>`;

admin = admin.replace(regexTabs, newTabs);

// Update CSS for .social-tabs
admin = admin.replace(
  /\.social-tabs\s*\{[\s\S]*?\}/,
  `.social-tabs {
  display: flex;
  gap: .5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: .75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}`
);

fs.writeFileSync('admin.html', admin, 'utf8');
console.log('Tabs perfectly updated!');
