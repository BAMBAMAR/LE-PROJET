const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function createStarPolygon(cx, cy, rOuter, rInner, fill) {
  let points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = (cx + r * Math.cos(angle)).toFixed(1);
    const y = (cy + r * Math.sin(angle)).toFixed(1);
    points.push(`${x},${y}`);
  }
  return `<polygon points="${points.join(' ')}" fill="${fill}" />`;
}

async function generateAllBranding() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const outDir = path.join(__dirname, '..', 'assets', 'branding');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ─────────────────────────────────────────────────────────────
  // 1. LOGO SVG VECTORIEL MAÎTRE (400x400)
  //    Axe de symétrie X = 200.0 absolu
  //    Tige du J jaune centrée pile sur X = 200.0
  //    Étoile verte officielle centrée pile sur X = 200.0
  // ─────────────────────────────────────────────────────────────
  // Local coords inside g (translate 68.5, 80):
  // cx = 131.5 => global X = 68.5 + 131.5 = 200.0
  // cy = 55.0  => global Y = 80 + 55 = 135.0
  const starLocalSvg = createStarPolygon(131.5, 55.0, 8.5, 3.6, '#00853F');

  const cleanSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="cleanBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0F3822" />
      <stop offset="100%" stop-color="#061A0F" />
    </radialGradient>
  </defs>

  <!-- Fond Circulaire Épuré -->
  <circle cx="200" cy="200" r="190" fill="url(#cleanBg)" />
  <circle cx="200" cy="200" r="184" fill="none" stroke="rgba(201, 168, 76, 0.45)" stroke-width="2" />

  <!-- Monogramme JJJ 100% calibré sur l'axe central X=200 -->
  <g transform="translate(68.5, 80)">
    <!-- J1 Vert Sénégal -->
    <text x="30" y="112" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="112" fill="#00853F" letter-spacing="-4">J</text>
    <!-- J2 Jaune Sénégal (Tige centrée exactement à X=200 global) -->
    <text x="78" y="112" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="112" fill="#FDEF42" letter-spacing="-4">J</text>
    <!-- ★ ÉTOILE VERTE CENTRÉE AU COEUR ABSOLU DE LA TIGE DU J JAUNE (X=200 GLOBAL) ★ -->
    ${starLocalSvg}
    <!-- J3 Rouge Sénégal -->
    <text x="126" y="112" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="112" fill="#E31B23" letter-spacing="-4">J</text>
  </g>

  <!-- Typographie PROJETBI -->
  <text x="200" y="278" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="9" text-anchor="middle">PROJETBI</text>

  <!-- Sous-titre JUB • JUBAL • JUBANTI -->
  <text x="200" y="312" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#C9A84C" letter-spacing="4" text-anchor="middle">JUB • JUBAL • JUBANTI 🇸🇳</text>
  <text x="200" y="338" font-family="'Inter', sans-serif" font-weight="500" font-size="11" fill="#8EAE9D" letter-spacing="2" text-anchor="middle">OBSERVATOIRE CITOYEN</text>
</svg>
  `.trim();

  fs.writeFileSync(path.join(outDir, 'projetbi_logo_clean.svg'), cleanSvg);
  console.log('✅ SVG Maître mis à jour : assets/branding/projetbi_logo_clean.svg');

  // ─────────────────────────────────────────────────────────────
  // 2. AVATAR HD 1080x1080 (Rendu haute fidélité pour réseaux sociaux)
  // ─────────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1080px;
          background: #040e08;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        svg {
          width: 1020px;
          height: 1020px;
        }
      </style>
    </head>
    <body>
      ${cleanSvg}
    </body>
    </html>
  `);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'projetbi_avatar_clean.png'), type: 'png' });
  console.log('✅ Avatar HD 1080x1080 régénéré : assets/branding/projetbi_avatar_clean.png');

  // ─────────────────────────────────────────────────────────────
  // 3. ICON APP / BADGE 512x512
  // ─────────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 512px;
          height: 512px;
          background: #061A0F;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        svg { width: 500px; height: 500px; }
      </style>
    </head>
    <body>
      ${cleanSvg}
    </body>
    </html>
  `);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'projetbi_icon_clean.png'), type: 'png' });
  console.log('✅ Icône carrée 512x512 régénérée : assets/branding/projetbi_icon_clean.png');

  // ─────────────────────────────────────────────────────────────
  // 4. BANNIÈRE FACEBOOK (1640x624) avec le logo parfaitement aligné
  // ─────────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1640, height: 624 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1640px;
          height: 624px;
          background: #07170F;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #FFFFFF;
          display: flex;
          position: relative;
          overflow: hidden;
        }

        .top-flag {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          display: flex;
          z-index: 20;
        }
        .f-g { flex: 1; background: #00853F; }
        .f-y { flex: 1; background: #FDEF42; }
        .f-r { flex: 1; background: #E31B23; }

        .bg-pattern {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 15% 50%, rgba(45, 95, 63, 0.28) 0%, transparent 60%),
            radial-gradient(circle at 85% 50%, rgba(201, 168, 76, 0.12) 0%, transparent 55%),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
        }

        .container {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          padding: 50px 70px;
          display: grid;
          grid-template-columns: 1.18fr 0.82fr;
          gap: 50px;
          align-items: center;
        }

        .col-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .emblem-mini {
          width: 62px;
          height: 62px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
        }

        .brand-text-block .name {
          font-weight: 900;
          font-size: 1.6rem;
          letter-spacing: 4px;
          color: #FFFFFF;
          display: block;
          line-height: 1.1;
        }

        .brand-text-block .motto {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #C9A84C;
          text-transform: uppercase;
        }

        .tag-status {
          font-size: 0.82rem;
          font-weight: 700;
          color: #4ADE80;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-left: auto;
        }

        .main-headline {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 16px;
          color: #FFFFFF;
        }

        .main-headline span {
          color: #F5E2A8;
          font-style: italic;
        }

        .main-sub {
          font-size: 1.12rem;
          line-height: 1.55;
          color: #A8CDB5;
          margin-bottom: 24px;
          max-width: 620px;
        }

        .footer-pills {
          display: flex;
          align-items: center;
          gap: 18px;
          font-size: 0.95rem;
          color: #8EAE9D;
        }

        .footer-pills strong { color: #FFFFFF; font-weight: 700; }
        .url-box {
          background: #113620;
          border: 1px solid rgba(74, 222, 128, 0.4);
          padding: 6px 16px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          color: #4ADE80;
          font-weight: 700;
        }

        .col-right {
          background: rgba(13, 40, 26, 0.65);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
        }

        .stats-title {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #C9A84C;
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 16px;
        }

        .stat-num {
          font-size: 2.1rem;
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #8EAE9D;
          font-weight: 600;
        }

        .pillar-bar {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 12px 16px;
          border-left: 3px solid #C9A84C;
          font-size: 0.88rem;
          color: #D5E8DD;
          line-height: 1.4;
        }

        .pillar-bar strong {
          color: #FFFFFF;
          display: block;
          font-size: 0.92rem;
          margin-bottom: 2px;
        }
      </style>
    </head>
    <body>
      <div class="top-flag">
        <div class="f-g"></div>
        <div class="f-y"></div>
        <div class="f-r"></div>
      </div>
      <div class="bg-pattern"></div>

      <div class="container">
        <!-- Gauche -->
        <div class="col-left">
          <div class="brand-header">
            <div class="emblem-mini">
              ${cleanSvg}
            </div>
            <div class="brand-text-block">
              <span class="name">PROJETBI</span>
              <span class="motto">JUB • JUBAL • JUBANTI 🇸🇳</span>
            </div>
            <div class="tag-status">● Baromètre 2024–2029</div>
          </div>

          <h1 class="main-headline">
            Pour un Sénégal <span>Souverain,</span><br>
            Juste et Prospère.
          </h1>

          <p class="main-sub">
            Plateforme civique et indépendante de suivi factuel des engagements présidentiels et des réformes structurelles.
          </p>

          <div class="footer-pills">
            <span>Devise : <strong>Jub • Jubal • Jubanti</strong></span>
            <span>•</span>
            <div class="url-box">projetbi.org</div>
          </div>
        </div>

        <!-- Droite -->
        <div class="col-right">
          <div class="stats-title">
            <span>OBSERVATION CITOYENNE</span>
            <span>🇸🇳 SÉNÉGAL</span>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-num" style="color:#4ADE80;">300</div>
              <div class="stat-label">Engagements répertoriés</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="color:#F5E2A8;">15</div>
              <div class="stat-label">Piliers ministériels suivis</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="color:#38BDF8;">100%</div>
              <div class="stat-label">Données vérifiées & publiques</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="color:#FFFFFF;">24/7</div>
              <div class="stat-label">Actualités & Revues de presse</div>
            </div>
          </div>

          <div class="pillar-bar">
            <strong>Gardiens de la Transparence Républicaine</strong>
            Suivi méthodique des politiques publiques au service de l'intérêt général.
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'facebook_cover_clean.png'), type: 'png' });
  console.log('✅ Bannière Facebook régénérée : assets/branding/facebook_cover_clean.png');

  await browser.close();
  console.log('🎉 Tous les assets visuels sont parfaitement recalibrés et régénérés !');
}

generateAllBranding().catch(err => {
  console.error('Erreur :', err);
  process.exit(1);
});
