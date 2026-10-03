const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

// 4 Concept SVGs - Pure Peaceful, Constructive, Non-violent Branding
const logos = [
  {
    name: 'logo_jjj_piliers_refondation',
    title: 'Modèle A : Les 3 Piliers de la Refondation (Architecture & Droiture)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile Républicaine de Paix -->
        <g transform="translate(500, 190)">
          <polygon points="0,-38 11,-12 38,-12 16,5 24,31 0,15 -24,31 -16,5 -38,-12 -11,-12" fill="#0F172A"/>
        </g>
        
        <!-- Les 3 Colonnes JJJ (Jub, Jubal, Jubanti) : Solides, apaisées, architecturales -->
        <g transform="translate(500, 390)">
          <!-- 1er J : Jub (Droiture Morale) -->
          <path d="M -120,-80 L -80,-105 L -80,90 C -80,135 -115,165 -160,165 C -205,165 -230,135 -230,95 L -190,95 C -190,115 -180,128 -160,128 C -140,128 -120,112 -120,85 Z" fill="#0F172A"/>
          
          <!-- 2ème J : Jubal (Justice Sociale & Équité) -->
          <path d="M -20,-130 L 20,-155 L 20,95 C 20,155 -20,195 -70,195 C -115,195 -145,165 -145,120 L -105,120 C -105,142 -90,158 -70,158 C -45,158 -20,140 -20,95 Z" fill="#0F172A"/>
          
          <!-- 3ème J : Jubanti (Redressement Institutionnel) -->
          <path d="M 80,-180 L 120,-205 L 120,100 C 120,175 75,225 15,225 C -35,225 -65,190 -65,145 L -25,145 C -25,170 -5,188 15,188 C 45,188 80,165 80,100 Z" fill="#0F172A"/>
        </g>
        
        <!-- Typographie Premium d'État -->
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">SOUVERAINETÉ • JUSTICE • PROSPÉRITÉ</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_harmonie_union',
    title: 'Modèle B : Le Sceau d\'Harmonie Nationale (Unité & Concorde)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Cercle Tripartite d'Union Sacrée JJJ -->
        <g transform="translate(500, 380)">
          <!-- Anneau protecteur subtil -->
          <circle cx="0" cy="0" r="195" fill="none" stroke="#E2E8F0" stroke-width="4"/>
          
          <!-- Étoile Centrale de Paix -->
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,13 -20,26 -14,4 -32,-10 -10,-10" fill="#0F172A"/>
          
          <!-- 3 J en orbite solidaire (Fraternité & Concorde) -->
          <!-- J1 (Haut Droite) -->
          <path d="M 0,-160 C 70,-160 140,-100 150,-20 C 155,20 145,60 120,80 C 100,95 75,90 65,75 C 55,60 62,40 75,30 C 85,22 105,15 105,-20 C 100,-70 55,-115 0,-115 Z" fill="#0F172A"/>
          
          <!-- J2 (Bas) -->
          <g transform="rotate(120)">
            <path d="M 0,-160 C 70,-160 140,-100 150,-20 C 155,20 145,60 120,80 C 100,95 75,90 65,75 C 55,60 62,40 75,30 C 85,22 105,15 105,-20 C 100,-70 55,-115 0,-115 Z" fill="#0F172A"/>
          </g>
          
          <!-- J3 (Haut Gauche) -->
          <g transform="rotate(240)">
            <path d="M 0,-160 C 70,-160 140,-100 150,-20 C 155,20 145,60 120,80 C 100,95 75,90 65,75 C 55,60 62,40 75,30 C 85,22 105,15 105,-20 C 100,-70 55,-115 0,-115 Z" fill="#0F172A"/>
          </g>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">PAIX • COHÉSION • REFONDATION</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_essor_souverain',
    title: 'Modèle C : L\'Essor Pacifique (Les 3 Ailes de la Renaissance)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile au Zénith -->
        <g transform="translate(540, 180)">
          <polygon points="0,-34 10,-11 34,-11 15,4 21,27 0,14 -21,27 -15,4 -34,-11 -10,-11" fill="#0F172A"/>
        </g>
        
        <!-- 3 Rubans Aérodynamiques Pacifiques formant J J J -->
        <g transform="translate(460, 390)">
          <!-- Ruban J 1 : Courbure douce en colombe / aile -->
          <path d="M -160,110 C -190,110 -210,85 -205,55 C -200,25 -175,-5 -145,-35 C -125,-55 -85,-105 -50,-155 C -75,-105 -95,-60 -115,-30 C -135,0 -145,25 -145,45 C -145,65 -135,75 -120,75 C -95,75 -70,50 -45,15 L -20,40 C -55,85 -110,110 -160,110 Z" fill="#0F172A"/>
          
          <!-- Ruban J 2 : Central -->
          <path d="M -90,150 C -125,150 -150,120 -145,85 C -140,50 -110,15 -75,-25 C -50,-55 -5,-125 35,-195 C 10,-130 -15,-70 -35,-30 C -55,10 -65,45 -65,70 C -65,95 -50,110 -30,110 C 0,110 30,80 60,40 L 85,65 C 45,115 -20,150 -90,150 Z" fill="#0F172A"/>
          
          <!-- Ruban J 3 : Élévation vers la prospérité -->
          <path d="M -20,190 C -60,190 -85,155 -80,115 C -75,75 -40,30 5,-15 C 40,-55 90,-140 135,-220 C 105,-150 75,-85 50,-35 C 25,15 15,55 15,85 C 15,115 35,135 60,135 C 95,135 130,100 165,55 L 190,80 C 145,140 75,190 -20,190 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">VISION SÉNÉGAL 2050 • RENAISSANCE</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_monogramme_epure',
    title: 'Modèle D : Le Triptyque Géométrique Suisse (Rigueur & Droiture Pure)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile Minimaliste Tech -->
        <g transform="translate(500, 200)">
          <polygon points="0,-30 9,-10 30,-10 13,4 19,24 0,12 -19,24 -13,4 -30,-10 -9,-10" fill="#0F172A"/>
        </g>
        
        <!-- 3 J Ultra-purs, sans flamme, 100% vectoriel Bauhaus / Swiss Tech -->
        <g transform="translate(500, 410)">
          <!-- 1er J (Jub) -->
          <path d="M -160,-100 L -115,-100 L -115,70 C -115,115 -145,145 -190,145 C -230,145 -255,115 -255,75 L -210,75 C -210,95 -198,105 -190,105 C -178,105 -160,95 -160,70 Z" fill="#0F172A"/>
          
          <!-- 2ème J (Jubal) -->
          <path d="M -22,-140 L 22,-140 L 22,70 C 22,115 -8,145 -52,145 C -92,145 -118,115 -118,75 L -73,75 C -73,95 -62,105 -52,105 C -40,105 -22,95 -22,70 Z" fill="#0F172A"/>
          
          <!-- 3ème J (Jubanti) -->
          <path d="M 115,-180 L 160,-180 L 160,70 C 160,115 130,145 85,145 C 45,145 20,115 20,75 L 65,75 C 65,95 75,105 85,105 C 98,105 115,95 115,70 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">ÉTHIQUE • TRANSPARENCE • DÉVELOPPEMENT</text>
      </svg>
    `
  }
];

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  
  for (const item of logos) {
    const svgPath = path.join(targetDir, `${item.name}.svg`);
    const pngPath = path.join(targetDir, `${item.name}.png`);
    
    fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
    
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${item.svg}</body></html>`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Rendered: ${pngPath}`);
  }
  
  await browser.close();
  console.log('All 4 peaceful logos rendered successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
