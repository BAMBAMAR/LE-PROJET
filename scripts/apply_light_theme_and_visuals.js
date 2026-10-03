const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. UPDATE :ROOT CSS VARIABLES TO BRIGHT / CLEAR REPUBLICAN THEME
const oldRootRegex = /:root\s*\{[\s\S]*?--shadow:\s*0 4px 24px rgba\(0,0,0,\.4\);\s*\}/;

const newRootCss = `:root {
  --bg:       #F5F8F5;   /* Fond principal clair, doux et reposant */
  --bg2:      #FFFFFF;   /* Surfaces, cartes, sidebar, topbar : blanc pur */
  --bg3:      #EEF4EE;   /* Hover, boutons secondaires, séparateurs doux */
  --bg4:      #E2ECE2;   /* Éléments sélectionnés, tags actifs */
  --border:   #DCE5DC;   /* Bordures nettes et précises */
  --border2:  #C4D5C5;   /* Bordures de focus et cartes actives */
  --green:    #1E6E3E;   /* Vert PASTEF officiel, profond et lisible sur fond blanc */
  --green-d:  #16542F;
  --green-dd: #0F3C21;
  --green-bg: rgba(30, 110, 62, 0.08);
  --gold:     #A67C19;   /* Or républicain contrasté sur fond blanc */
  --gold-bg:  rgba(166, 124, 25, 0.09);
  --red:      #D92D20;   /* Rouge républicain vif */
  --red-bg:   rgba(217, 45, 32, 0.08);
  --blue:     #1D64D8;
  --blue-bg:  rgba(29, 100, 216, 0.08);
  --text:     #111D14;   /* Texte principal : anthracite profond haute lisibilité */
  --text2:    #354B3C;   /* Texte secondaire */
  --text3:    #637C6A;   /* Texte tertiaire / légendes */
  --radius:   10px;
  --shadow:   0 2px 12px rgba(18, 30, 20, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
}`;

if (oldRootRegex.test(content)) {
  content = content.replace(oldRootRegex, newRootCss);
  console.log(':root variables updated to light theme!');
} else {
  console.warn('oldRootRegex did not match directly, checking :root...');
}

// 2. POLISH AUTH SCREEN TO LIGHT THEME
// .auth-screen { background: var(--bg); }
// .auth-card { background: var(--bg2); border: 1px solid var(--border); box-shadow: var(--shadow); }
content = content.replace(
  '.auth-card{\r\n  background:var(--bg2);border:1px solid var(--border);border-radius:18px;\r\n  padding:2.5rem;width:100%;max-width:400px;text-align:center;\r\n}',
  '.auth-card{\r\n  background:var(--bg2);border:1px solid var(--border);border-radius:18px;\r\n  padding:2.5rem;width:100%;max-width:400px;text-align:center;box-shadow:0 8px 30px rgba(18,30,20,0.08);\r\n}'
);

// 3. REMOVE DARK GRADIENT ON TOP BANNERS IN PAGE-SOCIAL AND PAGE-KIT
// Replace dark background gradients with light republican card headers
content = content.replace(
  'background:linear-gradient(135deg,rgba(26,43,30,.85),rgba(13,24,18,.95));border-color:var(--border2)',
  'background:var(--bg2);border-color:var(--border);box-shadow:var(--shadow)'
);
content = content.replace(
  'background:linear-gradient(135deg,rgba(26,43,30,.85),rgba(13,24,18,.95));border-color:var(--border2)',
  'background:var(--bg2);border-color:var(--border);box-shadow:var(--shadow)'
);

// 4. POLISH SOCIAL SIMULATOR MOCKUPS TO AVOID EXCESSIVELY DARK BOXES
// In social simulator:
content = content.replace(
  '.sim-box {\r\n  background: var(--bg);\r\n  border: 1px solid var(--border);\r\n  border-radius: var(--radius);\r\n  padding: 1.25rem;\r\n}',
  '.sim-box {\r\n  background: var(--bg2);\r\n  border: 1px solid var(--border);\r\n  border-radius: var(--radius);\r\n  padding: 1.25rem;\r\n  box-shadow: var(--shadow);\r\n}'
);

// 5. MAKE "WHITE_REPUBLICAN" DEFAULT THEME IN STUDIO (page-kit)
// Change selected option in stThemeSelect
content = content.replace(
  '<option value="projetbi_prestige" selected>🇸🇳 Vert Prestige Républicain (Identité Officielle ProjetBI)</option>\r\n                <option value="white_republican">⚪ Blanc Républicain Institutionnel (Contraste Élevé)</option>',
  '<option value="white_republican" selected>⚪ Blanc Républicain Institutionnel (Fond Clair Haute Lisibilité)</option>\r\n                <option value="projetbi_prestige">🇸🇳 Vert Prestige Républicain (Identité ProjetBI)</option>'
);

// 6. UPDATE DEFAULT STUDIO THEME VARIABLE IN JS
content = content.replace(
  "let studioTheme = 'projetbi_prestige';",
  "let studioTheme = 'white_republican';"
);

// 7. POLISH POSTERS IDÉOLOGIE PASTEF (page-ideologie) TO PURE ELEGANT LIGHT REPUBLICAN BACKGROUNDS
// Helper: update ideoBg calls from dark green/black to soft luminous republican white/ivory
// Template 1: Citation
content = content.replace(
  "ideoBg(ctx, '#031409', '#082D18');",
  "ideoBg(ctx, '#FFFFFF', '#F4F7F4');" // White to subtle soft-sage gradient
);
// In citation: change quote box background from dark to white card with crisp shadow
content = content.replace(
  "ideoRR(ctx, 70, 240, 940, 520, 20, 'rgba(8, 28, 17, 0.85)');\r\n    ctx.strokeStyle = 'rgba(229,184,66,0.40)'; ctx.lineWidth = 1.5;",
  "ideoRR(ctx, 70, 240, 940, 520, 20, '#FFFFFF');\r\n    ctx.strokeStyle = 'rgba(201,168,76,0.60)'; ctx.lineWidth = 2;"
);
// In citation: change text color from white to deep dark green
content = content.replace(
  "ctx.fillStyle = '#FFFFFF';\r\n    ctx.font = 'italic bold 42px \"Crimson Pro\", Georgia, serif';",
  "ctx.fillStyle = '#0D2818';\r\n    ctx.font = 'italic bold 42px \"Crimson Pro\", Georgia, serif';"
);

// Template 2: Pilier
content = content.replace(
  "ideoBg(ctx, '#031409', '#082D18');\r\n    ideoLogoHeader(ctx);",
  "ideoBg(ctx, '#FFFFFF', '#F4F7F4');\r\n    ideoLogoHeader(ctx);"
);
// In pilier: change title and sub text colors to dark green
content = content.replace(
  "ctx.fillStyle = '#FFFFFF';\r\n    ctx.font = 'bold 56px \"Crimson Pro\", Georgia, serif';\r\n    ctx.textAlign = 'center';\r\n    ideoWrapText(ctx, title, 540, 275, 900, 68);\r\n\r\n    // Sous-titre\r\n    ctx.fillStyle = 'rgba(215, 234, 223, 0.75)';",
  "ctx.fillStyle = '#0D2818';\r\n    ctx.font = 'bold 56px \"Crimson Pro\", Georgia, serif';\r\n    ctx.textAlign = 'center';\r\n    ideoWrapText(ctx, title, 540, 275, 900, 68);\r\n\r\n    // Sous-titre\r\n    ctx.fillStyle = '#354B3C';"
);
// In pilier: change action card background from dark green to white
content = content.replace(
  "ideoRR(ctx, 70, y, 940, 88, 14, 'rgba(8, 28, 17, 0.80)');\r\n      ideoRR(ctx, 70, y, 5, 88, 2.5, '#10B981');\r\n      ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1;\r\n      ideoRR(ctx, 70, y, 940, 88, 14); ctx.stroke();\r\n\r\n      ctx.fillStyle = '#10B981';\r\n      ctx.font = 'bold 26px \"Plus Jakarta Sans\", Inter, sans-serif';\r\n      ctx.textAlign = 'left';\r\n      ctx.fillText('✓', 105, y + 54);\r\n\r\n      ctx.fillStyle = '#FFFFFF';",
  "ideoRR(ctx, 70, y, 940, 88, 14, '#FFFFFF');\r\n      ideoRR(ctx, 70, y, 6, 88, 3, '#1E6E3E');\r\n      ctx.strokeStyle = 'rgba(201,168,76,0.35)'; ctx.lineWidth = 1.5;\r\n      ideoRR(ctx, 70, y, 940, 88, 14); ctx.stroke();\r\n\r\n      ctx.fillStyle = '#1E6E3E';\r\n      ctx.font = 'bold 26px \"Plus Jakarta Sans\", Inter, sans-serif';\r\n      ctx.textAlign = 'left';\r\n      ctx.fillText('✓', 105, y + 54);\r\n\r\n      ctx.fillStyle = '#111D14';"
);

// Template 3: Comparaison
content = content.replace(
  "ideoBg(ctx, '#07090D', '#121820');",
  "ideoBg(ctx, '#FFFFFF', '#F4F7F4');"
);

// Template 4: Jubanti
content = content.replace(
  "ideoBg(ctx, '#031409', '#082D18');\r\n    ideoLogoHeader(ctx);\r\n    const jWord",
  "ideoBg(ctx, '#FFFFFF', '#F4F7F4');\r\n    ideoLogoHeader(ctx);\r\n    const jWord"
);

// Template 5: Stat
content = content.replace(
  "ideoBg(ctx, '#031409', '#082D18');\r\n    ideoLogoHeader(ctx);\r\n    const bigNum",
  "ideoBg(ctx, '#FFFFFF', '#F4F7F4');\r\n    ideoLogoHeader(ctx);\r\n    const bigNum"
);

// Update ideoLogoHeader to render crisp on white background
content = content.replace(
  "ctx.fillStyle = '#FFFFFF';\r\n  ctx.font = '800 24px \"Syne\", sans-serif';\r\n  ctx.fillText('PROJETBI', 140, 85);\r\n  ctx.fillStyle = 'rgba(229,184,66,0.85)';",
  "ctx.fillStyle = '#0D2818';\r\n  ctx.font = '800 24px \"Syne\", sans-serif';\r\n  ctx.fillText('PROJETBI', 140, 85);\r\n  ctx.fillStyle = '#A67C19';"
);

// Update ideoFooter to render crisp on white background
content = content.replace(
  "ctx.fillStyle = 'rgba(215, 234, 223, 0.65)';\r\n  ctx.font = '600 18px \"Plus Jakarta Sans\", Inter, sans-serif';\r\n  ctx.fillText('projetbi.org', 80, 1020);",
  "ctx.fillStyle = '#354B3C';\r\n  ctx.font = '600 18px \"Plus Jakarta Sans\", Inter, sans-serif';\r\n  ctx.fillText('projetbi.org', 80, 1020);"
);

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html successfully transformed to light clear theme & light visuals!');
