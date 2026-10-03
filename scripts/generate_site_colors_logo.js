const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
const brandingDir = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\assets\\branding';

// EXACT BRAND TOKENS FROM design-system.css:
// Vert PASTEF: #2D5F3F (brand-500), #1A3D28 (brand-700 / ink)
// Or: #C9A84C (gold-500)
// Rouge: #B23A3A (accent-500)
// Muted: #4A5B52 (fg-2)

const variations = [
  {
    name: 'logo_projetbi_charte_tricolore',
    title: 'Option 1 : Les 3 J aux Couleurs Officielles PASTEF & Sénégal (Vert, Or, Rouge)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <g transform="translate(500, 360)">
          <!-- J 1 (Jub / Droiture) : Vert PASTEF Officiel #2D5F3F -->
          <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#2D5F3F"/>
          
          <!-- J 2 (Jubal / Équité) : Or Républicain #C9A84C -->
          <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#C9A84C"/>

          <!-- J 3 (Jubanti / Redressement) : Rouge PASTEF #B23A3A -->
          <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#B23A3A"/>
        </g>
        
        <!-- PROJETBI en Vert Forêt Titre du site #1A3D28 -->
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" fill="#1A3D28" letter-spacing="8">PROJETBI</text>
        
        <!-- JUB (Vert) • JUBAL (Or) • JUBANTI (Rouge) -->
        <g transform="translate(500, 745)">
          <text text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" letter-spacing="10">
            <tspan fill="#2D5F3F">JUB</tspan>
            <tspan fill="#64748B"> • </tspan>
            <tspan fill="#C9A84C">JUBAL</tspan>
            <tspan fill="#64748B"> • </tspan>
            <tspan fill="#B23A3A">JUBANTI</tspan>
          </text>
        </g>
        
        <!-- Slogan en gris ardoise atténué du site #4A5B52 -->
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="600" fill="#4A5B52" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
      </svg>
    `
  },
  {
    name: 'logo_projetbi_charte_vert_officiel',
    title: 'Option 2 : Tout en Vert PASTEF Officiel #2D5F3F & Accent Or',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <g transform="translate(500, 360)">
          <!-- Les 3 J en Vert PASTEF Dégradé / Hiérarchisé -->
          <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#2D5F3F"/>
          <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#224A31"/>
          <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#1A3D28"/>
        </g>
        
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" fill="#1A3D28" letter-spacing="8">PROJETBI</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#C9A84C" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="600" fill="#4A5B52" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
      </svg>
    `
  },
  {
    name: 'logo_projetbi_charte_vert_et_or',
    title: 'Option 3 : Symbole Bicolore Vert Émeraude & Or Citoyen',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <g transform="translate(500, 360)">
          <!-- J 1 (Vert) -->
          <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#2D5F3F"/>
          
          <!-- J 2 (Or) -->
          <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#C9A84C"/>

          <!-- J 3 (Vert Foncé) -->
          <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#1A3D28"/>
        </g>
        
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" fill="#1A3D28" letter-spacing="8">PROJETBI</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#2D5F3F" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', -apple-system, sans-serif" font-size="17" font-weight="600" fill="#4A5B52" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
      </svg>
    `
  }
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  
  for (const item of variations) {
    const pngPath = path.join(targetDir, `${item.name}.png`);
    const svgPath = path.join(targetDir, `${item.name}.svg`);
    
    fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${item.svg}</body></html>`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Rendered: ${pngPath}`);
  }
  
  await browser.close();
  console.log('Site colors rendered successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
