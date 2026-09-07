const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateBranding() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const outDir = path.join(__dirname, '..', 'assets', 'branding');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ─────────────────────────────────────────────────────────────
  // 1. AVATAR PROFILE MASTER (1080x1080) - Minimaliste & Institutionnel
  // ─────────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700;800;900&family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1080px;
          background: #081C12;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Texture géométrique sobre en arrière-plan */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(45, 95, 63, 0.25) 0%, transparent 70%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 100% 100%, 60px 60px, 60px 60px;
        }

        /* Cercle de délimitation sécurisé pour le recadrage social media */
        .circle-safe {
          width: 960px;
          height: 960px;
          border-radius: 50%;
          border: 1.5px solid rgba(201, 168, 76, 0.35);
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inner-ring {
          width: 900px;
          height: 900px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 255, 255, 0.08);
          position: absolute;
        }

        /* Liseré tricolore minimaliste en arc de cercle */
        .flag-strip {
          position: absolute;
          top: 72px;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .flag-dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-g { background: #00853F; }
        .dot-y { background: #FDEF42; }
        .dot-r { background: #E31B23; }

        /* Contenu Central */
        .center-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Monogramme JJJ Contemporain et Épuré */
        .monogram-container {
          width: 280px;
          height: 280px;
          background: #0D281A;
          border: 2px solid rgba(201, 168, 76, 0.45);
          border-radius: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 2.5rem;
          position: relative;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .monogram-container::before {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 28px;
        }

        .star-top {
          color: #C9A84C;
          font-size: 2.2rem;
          margin-bottom: 0.2rem;
        }

        .jjj-letters {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 6.2rem;
          line-height: 1;
          letter-spacing: -4px;
          display: flex;
          align-items: center;
        }
        .j1 { color: #00853F; }
        .j2 { color: #FDEF42; margin: 0 2px; }
        .j3 { color: #E31B23; }

        .brand-name {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 4.6rem;
          font-weight: 900;
          letter-spacing: 12px;
          color: #FFFFFF;
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .brand-sub {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 2.2rem;
          font-style: italic;
          font-weight: 600;
          color: #C9A84C;
          letter-spacing: 2px;
          margin-bottom: 1.8rem;
        }

        .tag-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 30px;
          padding: 10px 28px;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 3px;
          color: #D5E8DD;
          text-transform: uppercase;
        }

        .footer-motto {
          position: absolute;
          bottom: 74px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 4px;
          color: rgba(201, 168, 76, 0.8);
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="circle-safe">
        <div class="inner-ring"></div>
        <div class="flag-strip">
          <div class="flag-dot dot-g"></div>
          <div class="flag-dot dot-y"></div>
          <div class="flag-dot dot-r"></div>
        </div>
        <div class="footer-motto">JUB • JUBAL • JUBANTI 🇸🇳</div>
      </div>

      <div class="center-content">
        <div class="monogram-container">
          <div class="star-top">★</div>
          <div class="jjj-letters">
            <span class="j1">J</span>
            <span class="j2">J</span>
            <span class="j3">J</span>
          </div>
        </div>
        <div class="brand-name">PROJETBI</div>
        <div class="brand-sub">L'Observatoire Citoyen du Sénégal</div>
        <div class="tag-pill">Gardiens de la Transparence</div>
      </div>
    </body>
    </html>
  `);

  await page.screenshot({ path: path.join(outDir, 'projetbi_avatar_clean.png'), type: 'png' });
  console.log('✅ Avatar clean généré : assets/branding/projetbi_avatar_clean.png');

  // ─────────────────────────────────────────────────────────────
  // 2. COUVERTURE FACEBOOK DATA-DRIVEN (1640x624) - Style Éditorial Sobre
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

        /* Liseré tricolore en bordure haute */
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

        /* Arrière plan et grille subtile */
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
          padding: 60px 80px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 60px;
          align-items: center;
        }

        /* Colonne Gauche : Identité & Mission */
        .col-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .brand-badge {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(201, 168, 76, 0.4);
          padding: 8px 18px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-badge .star { color: #C9A84C; font-size: 1.2rem; }
        .brand-badge .name { font-weight: 900; font-size: 1.3rem; letter-spacing: 3px; color: #FFFFFF; }

        .tag-status {
          font-size: 0.85rem;
          font-weight: 700;
          color: #4ADE80;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          padding: 7px 16px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .main-headline {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 3.3rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 18px;
          color: #FFFFFF;
        }

        .main-headline span {
          color: #F5E2A8;
          font-style: italic;
        }

        .main-sub {
          font-size: 1.15rem;
          line-height: 1.6;
          color: #A8CDB5;
          margin-bottom: 28px;
          max-width: 640px;
        }

        .footer-pills {
          display: flex;
          align-items: center;
          gap: 20px;
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

        /* Colonne Droite : Données Factuelles Épurées */
        .col-right {
          background: rgba(13, 40, 26, 0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
        }

        .stats-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #C9A84C;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 16px;
        }

        .stat-num {
          font-size: 2.2rem;
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 0.82rem;
          color: #8EAE9D;
          font-weight: 600;
        }

        .pillar-bar {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 14px 18px;
          border-left: 3px solid #C9A84C;
          font-size: 0.9rem;
          color: #D5E8DD;
          line-height: 1.4;
        }

        .pillar-bar strong {
          color: #FFFFFF;
          display: block;
          font-size: 0.95rem;
          margin-bottom: 3px;
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
            <div class="brand-badge">
              <span class="star">★</span>
              <span class="name">PROJETBI</span>
            </div>
            <div class="tag-status">● Baromètre Citoyen 2024–2029</div>
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

        <!-- Droite : Métriques & Transparence -->
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
              <div class="stat-label">Piliers & ministères suivis</div>
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

  await page.screenshot({ path: path.join(outDir, 'facebook_cover_clean.png'), type: 'png' });
  console.log('✅ Bannière Facebook clean générée : assets/branding/facebook_cover_clean.png');

  // ─────────────────────────────────────────────────────────────
  // 3. LOGO MINIMALISTE VECTORIEL SVG (Pour site, favicons et prints)
  // ─────────────────────────────────────────────────────────────
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
  <circle cx="200" cy="200" r="184" fill="none" stroke="rgba(201, 168, 76, 0.4)" stroke-width="2" />

  <!-- Étoile d'Or Minimaliste -->
  <polygon points="200,80 206,96 223,96 209,106 214,122 200,113 186,122 191,106 177,96 194,96" fill="#C9A84C" />

  <!-- Monogramme JJJ Géométrique Plat (Vert, Jaune, Rouge) -->
  <g transform="translate(115, 140)">
    <!-- Premier J (Vert) -->
    <path d="M 15,0 L 40,0 L 40,75 C 40,95 24,106 0,103 C 4,92 15,90 15,75 L 15,0 Z" fill="#00853F" />
    <!-- Deuxième J (Jaune) -->
    <path d="M 72,0 L 97,0 L 97,85 C 97,105 81,116 57,113 C 61,102 72,100 72,85 L 72,0 Z" fill="#FDEF42" />
    <!-- Troisième J (Rouge) -->
    <path d="M 130,0 L 155,0 L 155,75 C 155,95 139,106 115,103 C 119,92 130,90 130,75 L 130,0 Z" fill="#E31B23" />
  </g>

  <!-- Typographie PROJETBI -->
  <text x="200" y="300" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="8" text-anchor="middle">PROJETBI</text>

  <!-- Sous-titre JUB JUBAL JUBANTI -->
  <text x="200" y="332" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="#C9A84C" letter-spacing="3" text-anchor="middle">JUB • JUBAL • JUBANTI</text>
</svg>
  `.trim();

  fs.writeFileSync(path.join(outDir, 'projetbi_logo_clean.svg'), cleanSvg);
  console.log('✅ Logo SVG clean généré : assets/branding/projetbi_logo_clean.svg');

  await browser.close();
}

generateBranding().catch(err => {
  console.error('Erreur :', err);
  process.exit(1);
});
