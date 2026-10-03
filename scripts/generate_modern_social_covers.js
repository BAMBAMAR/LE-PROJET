const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const brandingDir = path.resolve('assets/branding');

  // 1. Generate Modern Facebook Cover (1640x624) - Luminous Light Theme
  const coverHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1640px;
      height: 624px;
      background: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 80px;
    }
    /* Subtle geometric republican background */
    .bg-mesh {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 100% 0%, rgba(201, 168, 76, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 0% 100%, rgba(45, 95, 63, 0.06) 0%, transparent 45%),
        linear-gradient(135deg, #FFFFFF 0%, #F9FAF8 100%);
      z-index: 0;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(45, 95, 63, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(45, 95, 63, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
    }
    .top-bar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge-republic {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(45, 95, 63, 0.08);
      border: 1.5px solid rgba(45, 95, 63, 0.2);
      border-radius: 30px;
      padding: 10px 22px;
      font-size: 16px;
      font-weight: 800;
      color: #2D5F3F;
      letter-spacing: 0.06em;
    }
    .center-block {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 60px;
      margin: auto 0;
    }
    .logo-badge {
      width: 180px;
      height: 180px;
      background: #FFFFFF;
      border-radius: 40px;
      border: 3px solid rgba(201, 168, 76, 0.6);
      box-shadow: 0 16px 40px rgba(18, 35, 22, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;
    }
    .title-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .brand-title {
      font-family: 'Syne', sans-serif;
      font-size: 80px;
      font-weight: 900;
      color: #1A3D28;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .brand-sub {
      font-size: 26px;
      font-weight: 800;
      color: #C9A84C;
      letter-spacing: 0.15em;
    }
    .brand-slogan {
      font-family: 'Crimson Pro', serif;
      font-size: 32px;
      font-style: italic;
      font-weight: 700;
      color: #4A5B52;
      margin-top: 4px;
    }
    .footer-bar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid rgba(201, 168, 76, 0.3);
      padding-top: 20px;
    }
    .kpi-pills {
      display: flex;
      gap: 25px;
    }
    .kpi-pill {
      font-size: 16px;
      font-weight: 700;
      color: #1A3D28;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .kpi-pill strong {
      color: #2D5F3F;
      font-size: 20px;
    }
    .domain-tag {
      font-size: 20px;
      font-weight: 800;
      color: #2D5F3F;
      letter-spacing: 0.05em;
    }
    /* SVG JJJ Symbol */
    .jjj-svg { width: 140px; height: 140px; }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>
  <div class="grid-lines"></div>

  <div class="top-bar">
    <div class="badge-republic">
      <span>🇸🇳</span>
      <span>GARDIENS DU PROJET PASTEF • OBSERVATOIRE CITOYEN</span>
    </div>
    <div style="font-size: 18px; font-weight: 800; color: #C9A84C; letter-spacing: 0.1em;">
      VISION SÉNÉGAL 2050
    </div>
  </div>

  <div class="center-block">
    <div class="logo-badge">
      <svg class="jjj-svg" viewBox="0 0 512 512" fill="none">
        <path d="M 120 405 C 100 405 85 390 85 370 C 85 350 100 335 120 335 L 210 335 C 235 335 255 350 255 370 C 255 390 235 405 210 405 Z" fill="#2D5F3F" transform="rotate(-30 200 360)"/>
        <path d="M 180 300 C 160 300 145 285 145 265 C 145 245 160 230 180 230 L 270 230 C 295 230 315 245 315 265 C 315 285 295 300 270 300 Z" fill="#C9A84C" transform="rotate(-30 260 260)"/>
        <path d="M 240 195 C 220 195 205 180 205 160 C 205 140 220 125 240 125 L 330 125 C 355 125 375 140 375 160 C 375 180 355 195 330 195 Z" fill="#B23A3A" transform="rotate(-30 320 160)"/>
        <!-- Fine aerodynamic sweep lines -->
        <path d="M 230 350 Q 340 380 440 420" stroke="#2D5F3F" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 290 250 Q 400 280 480 320" stroke="#C9A84C" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 350 150 Q 440 175 510 210" stroke="#B23A3A" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
      </svg>
    </div>
    <div class="title-group">
      <div class="brand-title">PROJETBI</div>
      <div class="brand-sub">JUB • JUBAL • JUBANTI</div>
      <div class="brand-slogan">Pour un Sénégal Souverain, Juste et Prospère</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="kpi-pills">
      <div class="kpi-pill"><strong>300</strong> Engagements Suivis</div>
      <div class="kpi-pill">•</div>
      <div class="kpi-pill"><strong>15</strong> Domaines Stratégiques</div>
      <div class="kpi-pill">•</div>
      <div class="kpi-pill"><strong>100%</strong> Indépendant & Factuel</div>
    </div>
    <div class="domain-tag">www.projetbi.org</div>
  </div>
</body>
</html>`;

  await page.setViewportSize({ width: 1640, height: 624 });
  await page.setContent(coverHtml);
  await page.screenshot({ path: path.join(brandingDir, 'facebook_cover_clean.png'), type: 'png' });
  console.log('Updated facebook_cover_clean.png (1640x624)');

  // 2. Sync projetbi_avatar_clean.png with 1080x1080 white squircle
  const faviconBase64 = fs.readFileSync(path.join(brandingDir, 'favicon_blanc_squircle.png')).toString('base64');
  const avatarHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1080px;
      height: 1080px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .ring {
      position: absolute;
      width: 1000px;
      height: 1000px;
      border-radius: 50%;
      border: 12px solid rgba(201, 168, 76, 0.4);
    }
  </style>
</head>
<body>
  <div class="ring"></div>
  <img src="data:image/png;base64,${faviconBase64}" style="width: 820px; height: 820px; border-radius: 180px;">
</body>
</html>`;
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(avatarHtml);
  await page.screenshot({ path: path.join(brandingDir, 'projetbi_avatar_clean.png'), type: 'png' });
  console.log('Updated projetbi_avatar_clean.png (1080x1080)');

  await browser.close();
  console.log('Modern social covers generated successfully!');
})();
