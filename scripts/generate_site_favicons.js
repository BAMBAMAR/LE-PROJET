const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
const brandingDir = 'c:\\Users\\HP\\.gemini\\antigravity-ide\\scratch\\LE-PROJET\\assets\\branding';

// Favicon Blanc avec 3 J Tricolores (Vert PASTEF, Or, Rouge)
const faviconWhiteSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="110" fill="#FFFFFF"/>
  <rect x="6" y="6" width="500" height="500" rx="104" fill="none" stroke="#E2E8F0" stroke-width="4"/>
  
  <g transform="translate(256, 256) scale(0.88)">
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#2D5F3F"/>
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#C9A84C"/>
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#B23A3A"/>
  </g>
</svg>
`;

// Favicon Vert Forêt Profond (#1A3D28 - Fond Hero du site)
const faviconDarkGreenSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="110" fill="#1A3D28"/>
  
  <g transform="translate(256, 256) scale(0.88)">
    <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#4ADE80"/>
    <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#E8C96D"/>
    <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#F87171"/>
  </g>
</svg>
`;

async function renderFavicons() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  
  // Favicon White
  const outWhite = path.join(targetDir, 'favicon_charte_white.png');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${faviconWhiteSvg}</body></html>`);
  await page.screenshot({ path: outWhite, type: 'png' });
  
  // Favicon Dark Green
  const outDark = path.join(targetDir, 'favicon_charte_dark_green.png');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${faviconDarkGreenSvg}</body></html>`);
  await page.screenshot({ path: outDark, type: 'png' });

  await browser.close();
  console.log('Favicons rendered successfully!');
}

renderFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
