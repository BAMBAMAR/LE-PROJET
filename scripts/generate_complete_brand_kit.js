const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const brandingDir = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\assets\\branding';
const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

if (!fs.existsSync(brandingDir)) fs.mkdirSync(brandingDir, { recursive: true });

// ── SYMBOLES DE BASE (PATHS SVG JJJ) ──
function getSymbolPaths(colorJub, colorJubal, colorJubanti) {
  return `
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="${colorJub}"/>
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="${colorJubal}"/>
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="${colorJubanti}"/>
  `;
}

// 1. VERTICAL - FOND BLANC PUR (TRICOLORE CHARTE)
const verticalWhiteSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <rect width="1000" height="1000" fill="#FFFFFF"/>
  <g transform="translate(500, 360)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
  <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="76" font-weight="900" fill="#1A3D28" letter-spacing="8">PROJETBI</text>
  <g transform="translate(500, 745)">
    <text text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="10">
      <tspan fill="#2D5F3F">JUB</tspan><tspan fill="#64748B"> • </tspan><tspan fill="#C9A84C">JUBAL</tspan><tspan fill="#64748B"> • </tspan><tspan fill="#B23A3A">JUBANTI</tspan>
    </text>
  </g>
  <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="17" font-weight="600" fill="#4A5B52" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
</svg>
`;

// 2. VERTICAL - FOND TRANSPARENT (TRICOLORE CHARTE)
const verticalTransparentSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g transform="translate(500, 360)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
  <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="76" font-weight="900" fill="#1A3D28" letter-spacing="8">PROJETBI</text>
  <g transform="translate(500, 745)">
    <text text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="10">
      <tspan fill="#2D5F3F">JUB</tspan><tspan fill="#64748B"> • </tspan><tspan fill="#C9A84C">JUBAL</tspan><tspan fill="#64748B"> • </tspan><tspan fill="#B23A3A">JUBANTI</tspan>
    </text>
  </g>
  <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="17" font-weight="600" fill="#4A5B52" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
</svg>
`;

// 3. HORIZONTAL - FOND BLANC PUR (Idéal Navbar / Bannières / En-têtes)
const horizontalWhiteSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 450" width="1500" height="450">
  <rect width="1500" height="450" fill="#FFFFFF"/>
  <g transform="translate(260, 225) scale(0.72)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
  <g transform="translate(520, 160)">
    <text x="0" y="55" font-family="'Outfit', 'Inter', sans-serif" font-size="88" font-weight="900" fill="#1A3D28" letter-spacing="6">PROJETBI</text>
    <text x="0" y="125" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="8">
      <tspan fill="#2D5F3F">JUB</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#C9A84C">JUBAL</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#B23A3A">JUBANTI</tspan>
    </text>
    <text x="0" y="180" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#4A5B52" letter-spacing="3">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
  </g>
</svg>
`;

// 4. HORIZONTAL - FOND TRANSPARENT
const horizontalTransparentSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 450" width="1500" height="450">
  <g transform="translate(260, 225) scale(0.72)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
  <g transform="translate(520, 160)">
    <text x="0" y="55" font-family="'Outfit', 'Inter', sans-serif" font-size="88" font-weight="900" fill="#1A3D28" letter-spacing="6">PROJETBI</text>
    <text x="0" y="125" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="8">
      <tspan fill="#2D5F3F">JUB</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#C9A84C">JUBAL</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#B23A3A">JUBANTI</tspan>
    </text>
    <text x="0" y="180" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#4A5B52" letter-spacing="3">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
  </g>
</svg>
`;

// 5. VERTICAL - FOND SOMBRE VERT FORÊT D'ÉTAT (#1A3D28)
const verticalDarkForestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <rect width="1000" height="1000" fill="#1A3D28"/>
  <g transform="translate(500, 360)">
    ${getSymbolPaths('#4ADE80', '#E8C96D', '#F87171')}
  </g>
  <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="8">PROJETBI</text>
  <g transform="translate(500, 745)">
    <text text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="10">
      <tspan fill="#4ADE80">JUB</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#E8C96D">JUBAL</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#F87171">JUBANTI</tspan>
    </text>
  </g>
  <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="17" font-weight="600" fill="#C5DBC0" letter-spacing="4">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
</svg>
`;

// 6. HORIZONTAL - FOND SOMBRE VERT FORÊT D'ÉTAT (#1A3D28)
const horizontalDarkForestSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 450" width="1500" height="450">
  <rect width="1500" height="450" fill="#1A3D28"/>
  <g transform="translate(260, 225) scale(0.72)">
    ${getSymbolPaths('#4ADE80', '#E8C96D', '#F87171')}
  </g>
  <g transform="translate(520, 160)">
    <text x="0" y="55" font-family="'Outfit', 'Inter', sans-serif" font-size="88" font-weight="900" fill="#FFFFFF" letter-spacing="6">PROJETBI</text>
    <text x="0" y="125" font-family="'Outfit', 'Inter', sans-serif" font-size="28" font-weight="700" letter-spacing="8">
      <tspan fill="#4ADE80">JUB</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#E8C96D">JUBAL</tspan><tspan fill="#94A3B8"> • </tspan><tspan fill="#F87171">JUBANTI</tspan>
    </text>
    <text x="0" y="180" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#C5DBC0" letter-spacing="3">POUR UN SÉNÉGAL SOUVERAIN, JUSTE ET PROSPÈRE</text>
  </g>
</svg>
`;

// 7. SYMBOLE SEUL (EMBLÈME JJJ SEUL SUR BLANC)
const markOnlyWhiteSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#FFFFFF"/>
  <g transform="translate(300, 300) scale(0.95)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
</svg>
`;

// 8. FAVICON HD (FOND BLANC SQUIRCLE BORDÉ DU VERT DU SITE)
const faviconWhiteSquircleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#FFFFFF"/>
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#2D5F3F" stroke-width="8" stroke-opacity="0.25"/>
  <g transform="translate(256, 256) scale(0.85)">
    ${getSymbolPaths('#2D5F3F', '#C9A84C', '#B23A3A')}
  </g>
</svg>
`;

async function buildAll() {
  const browser = await chromium.launch();
  
  const tasks = [
    { name: 'logo_projetbi_vertical_blanc', svg: verticalWhiteSvg, w: 1000, h: 1000, bg: '#fff' },
    { name: 'logo_projetbi_vertical_transparent', svg: verticalTransparentSvg, w: 1000, h: 1000, bg: 'transparent' },
    { name: 'logo_projetbi_horizontal_blanc', svg: horizontalWhiteSvg, w: 1500, h: 450, bg: '#fff' },
    { name: 'logo_projetbi_horizontal_transparent', svg: horizontalTransparentSvg, w: 1500, h: 450, bg: 'transparent' },
    { name: 'logo_projetbi_vertical_vert_foret', svg: verticalDarkForestSvg, w: 1000, h: 1000, bg: '#1A3D28' },
    { name: 'logo_projetbi_horizontal_vert_foret', svg: horizontalDarkForestSvg, w: 1500, h: 450, bg: '#1A3D28' },
    { name: 'logo_projetbi_symbole_seul_blanc', svg: markOnlyWhiteSvg, w: 600, h: 600, bg: '#fff' },
    { name: 'favicon_blanc_squircle', svg: faviconWhiteSquircleSvg, w: 512, h: 512, bg: 'transparent' }
  ];

  for (const t of tasks) {
    const page = await browser.newPage({ viewport: { width: t.w, height: t.h } });
    
    // Écriture SVG dans branding et brain
    const svgPathBranding = path.join(brandingDir, `${t.name}.svg`);
    const svgPathBrain = path.join(brainDir, `${t.name}.svg`);
    fs.writeFileSync(svgPathBranding, t.svg.trim(), 'utf8');
    fs.writeFileSync(svgPathBrain, t.svg.trim(), 'utf8');

    // Rendu PNG
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:${t.bg};">${t.svg}</body></html>`);
    const pngPathBranding = path.join(brandingDir, `${t.name}.png`);
    const pngPathBrain = path.join(brainDir, `${t.name}.png`);
    await page.screenshot({ path: pngPathBranding, type: 'png', omitBackground: t.bg === 'transparent' });
    await page.screenshot({ path: pngPathBrain, type: 'png', omitBackground: t.bg === 'transparent' });
    
    console.log(`Generated: ${t.name}.png (${t.w}x${t.h})`);
    await page.close();
  }

  // Mettre à jour favicon.png à la racine avec le nouveau favicon blanc bordé PASTEF
  const rootFavicon = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\favicon.png';
  fs.copyFileSync(path.join(brandingDir, 'favicon_blanc_squircle.png'), rootFavicon);
  console.log(`Updated root favicon.png!`);

  await browser.close();
  console.log('Complete Brand Kit generated successfully!');
}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});
