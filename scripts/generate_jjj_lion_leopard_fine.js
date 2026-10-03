const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

const concepts = [
  {
    name: 'logo_jjj_criniere_lion_royale',
    title: 'Option A : La Crinière Royale du Lion (Mèches JJJ Couchées)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile Républicaine -->
        <g transform="translate(620, 220)">
          <polygon points="0,-30 9,-10 30,-10 13,4 19,24 0,12 -19,24 -13,4 -30,-10 -9,-10" fill="#0F172A"/>
        </g>
        
        <!-- Crinière Royale : 3 Mèches JJJ fluides et couchées vers l'arrière -->
        <g transform="translate(480, 400)">
          <!-- Mèche 1 (Jub / Droiture) : Mèche inférieure douce et noble -->
          <path d="M -160,95 C -195,95 -225,70 -220,35 C -215,0 -185,-20 -150,-20 C -105,-20 -40,15 50,22 C 120,28 200,50 240,65 C 170,50 90,40 10,40 C -70,40 -120,60 -150,85 C -155,89 -158,92 -160,95 Z" fill="#0F172A"/>
          
          <!-- Mèche 2 (Jubal / Équité) : Mèche centrale, élan et force tranquille -->
          <path d="M -180,20 C -220,20 -250,-5 -245,-42 C -240,-75 -210,-95 -170,-95 C -115,-95 -40,-55 70,-45 C 150,-35 240,-15 285,2 C 205,-15 120,-25 30,-25 C -60,-25 -130,-5 -165,15 C -172,18 -177,20 -180,20 Z" fill="#0F172A"/>

          <!-- Mèche 3 (Jubanti / Refondation) : Mèche supérieure, port altier du félin -->
          <path d="M -200,-55 C -245,-55 -275,-82 -270,-120 C -265,-155 -230,-175 -190,-175 C -125,-175 -40,-130 90,-115 C 180,-105 280,-80 325,-60 C 235,-80 140,-95 40,-95 C -50,-95 -140,-75 -185,-58 C -192,-56 -197,-55 -200,-55 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">FORCE TRANQUILLE • DIGNITÉ • SOUVERAINETÉ</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_leopard_profil_moderne',
    title: 'Option B : L\'Échine du Léopard PASTEF (Vigilance & Agilité)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile guide dans l'axe du regard du léopard -->
        <g transform="translate(680, 260)">
          <polygon points="0,-28 8,-9 28,-9 12,4 18,22 0,11 -18,22 -12,4 -28,-9 -8,-9" fill="#0F172A"/>
        </g>
        
        <!-- Tête / Encolure épurée de léopard formée par 3 arcs JJJ couchés et aérodynamiques -->
        <g transform="translate(480, 400)">
          <!-- Ligne de cou & gorge (Jub) -->
          <path d="M -150,110 C -190,110 -210,85 -205,55 C -195,15 -145,-10 -90,-10 C -20,-10 60,15 150,25 C 210,32 255,20 280,10 C 250,35 180,45 110,40 C 30,35 -50,18 -105,18 C -145,18 -170,35 -175,55 C -180,72 -165,85 -150,85 C -120,85 -70,55 0,35 L 5,60 C -60,85 -110,110 -150,110 Z" fill="#0F172A"/>
          
          <!-- Ligne faciale & regard félin (Jubal) -->
          <path d="M -180,25 C -220,25 -245,-3 -240,-35 C -230,-75 -175,-95 -115,-95 C -40,-95 45,-65 140,-55 C 205,-48 250,-60 275,-70 C 245,-45 170,-35 95,-40 C 15,-45 -60,-65 -115,-65 C -155,-65 -185,-50 -190,-30 C -195,-12 -185,2 -170,2 C -140,2 -85,-25 -10,-48 L -5,-22 C -70,5 -125,25 -180,25 Z" fill="#0F172A"/>

          <!-- Ligne de tête & oreille du léopard (Jubanti) -->
          <path d="M -210,-60 C -250,-60 -275,-88 -270,-125 C -260,-165 -205,-185 -145,-185 C -65,-185 25,-155 120,-145 C 160,-140 185,-165 205,-190 C 215,-165 210,-140 190,-125 C 150,-115 80,-120 0,-125 C -65,-130 -130,-150 -170,-150 C -205,-150 -225,-135 -230,-115 C -235,-98 -225,-82 -210,-82 C -175,-82 -115,-110 -35,-130 L -30,-105 C -95,-80 -155,-60 -210,-60 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">VIGILANCE • ÉTHIQUE • LE DON DE SOI</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_panthere_elan_horizon',
    title: 'Option C : L\'Élan Fendu à l\'Horizontale (Vitesse, Clarté & Avenir)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile de l'Aube Républicaine -->
        <g transform="translate(680, 230)">
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,13 -20,26 -14,4 -32,-10 -10,-10" fill="#0F172A"/>
        </g>
        
        <!-- 3 Rubans JJJ fuselés à l'horizontale : la panthère en pleine foulée silencieuse -->
        <g transform="translate(470, 400)">
          <!-- Ruban 1 (Jub) -->
          <path d="M -180,85 C -210,85 -230,65 -225,40 C -220,15 -195,-5 -165,-5 C -125,-5 -60,20 30,25 C 120,30 200,45 250,55 C 180,45 100,38 20,38 C -55,38 -125,50 -165,75 C -170,78 -175,82 -180,85 Z" fill="#0F172A"/>

          <!-- Ruban 2 (Jubal) -->
          <path d="M -180,10 C -210,10 -230,-10 -225,-35 C -220,-60 -195,-80 -165,-80 C -125,-80 -50,-55 45,-50 C 145,-45 235,-25 290,-15 C 210,-28 120,-35 30,-35 C -55,-35 -125,-25 -165,0 C -170,3 -175,7 -180,10 Z" fill="#0F172A"/>

          <!-- Ruban 3 (Jubanti) -->
          <path d="M -180,-65 C -210,-65 -230,-85 -225,-110 C -220,-135 -195,-155 -165,-155 C -125,-155 -40,-130 60,-125 C 170,-120 270,-95 330,-85 C 240,-100 140,-110 40,-110 C -55,-110 -125,-100 -165,-75 C -170,-72 -175,-68 -180,-65 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">LE PROJET SÉNÉGAL 2050 • LA MARCHE VERS LA PROSPÉRITÉ</text>
      </svg>
    `
  }
];

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  
  for (const item of concepts) {
    const svgPath = path.join(targetDir, `${item.name}.svg`);
    const pngPath = path.join(targetDir, `${item.name}.png`);
    
    fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
    
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${item.svg}</body></html>`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Rendered: ${pngPath}`);
  }
  
  await browser.close();
  console.log('Fine lion/leopard models rendered successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
