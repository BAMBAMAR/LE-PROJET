const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
const brandingDir = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\assets\\branding';

if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}

// Logo Officiel PROJETBI - Light Mode
const logoProjetbiSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <rect width="1000" height="1000" fill="#FFFFFF"/>
  
  <!-- Symbole Félin & Crinière JJJ Aérodynamique à 45° (Sans Étoile, Force Tranquille) -->
  <g transform="translate(500, 360)">
    <!-- J 1 (Jub / Droiture) -->
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#0F172A"/>
    
    <!-- J 2 (Jubal / Justice & Équité) -->
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#0F172A"/>

    <!-- J 3 (Jubanti / Redressement Institutionnel) -->
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#0F172A"/>
  </g>
  
  <!-- Titrage Officiel Demandé : PROJETBI -->
  <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" fill="#0F172A" letter-spacing="8">PROJETBI</text>
  
  <!-- Triptyque Doctrinal : JUB • JUBAL • JUBANTI -->
  <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
  
  <!-- Slogan Officiel Choisi : POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE -->
  <text x="500" y="795" text-anchor="middle" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="600" fill="#64748B" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
</svg>
`;

// Logo Officiel PROJETBI - Dark Mode
const logoProjetbiDarkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <rect width="1000" height="1000" fill="#0F172A"/>
  
  <g transform="translate(500, 360)">
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#F8FAFC"/>
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#F8FAFC"/>
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#F8FAFC"/>
  </g>
  
  <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="8">PROJETBI</text>
  <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#E2E8F0" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
  <text x="500" y="795" text-anchor="middle" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="600" fill="#94A3B8" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
</svg>
`;

// Favicon / App Icon (Seul le symbole JJJ optimisé pour 512x512)
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="110" fill="#0F172A"/>
  
  <g transform="translate(256, 256) scale(0.85)">
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#FFFFFF"/>
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#FFFFFF"/>
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#FFFFFF"/>
  </g>
</svg>
`;

async function render() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  
  // 1. Sauvegarder dans brain/artifacts
  const outBrainSvg = path.join(targetDir, 'logo_projetbi_officiel.svg');
  const outBrainPng = path.join(targetDir, 'logo_projetbi_officiel.png');
  fs.writeFileSync(outBrainSvg, logoProjetbiSvg.trim(), 'utf8');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${logoProjetbiSvg}</body></html>`);
  await page.screenshot({ path: outBrainPng, type: 'png' });
  console.log(`Saved Artifact: ${outBrainPng}`);

  // 2. Sauvegarder dans assets/branding
  fs.writeFileSync(path.join(brandingDir, 'logo_projetbi_officiel.svg'), logoProjetbiSvg.trim(), 'utf8');
  fs.writeFileSync(path.join(brandingDir, 'logo_projetbi_dark.svg'), logoProjetbiDarkSvg.trim(), 'utf8');
  fs.writeFileSync(path.join(brandingDir, 'favicon_mark.svg'), faviconSvg.trim(), 'utf8');
  
  await page.screenshot({ path: path.join(brandingDir, 'logo_projetbi_officiel.png'), type: 'png' });
  
  // Dark mode render
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0F172A;">${logoProjetbiDarkSvg}</body></html>`);
  await page.screenshot({ path: path.join(brandingDir, 'logo_projetbi_dark.png'), type: 'png' });

  // Favicon PNG (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${faviconSvg}</body></html>`);
  await page.screenshot({ path: path.join(brandingDir, 'favicon.png'), type: 'png' });
  
  // Écraser aussi le favicon à la racine pour prise en compte immédiate
  const rootFavicon = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\favicon.png';
  fs.copyFileSync(path.join(brandingDir, 'favicon.png'), rootFavicon);
  console.log(`Updated root favicon: ${rootFavicon}`);

  await browser.close();
  console.log('Master assets generated successfully!');
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});
