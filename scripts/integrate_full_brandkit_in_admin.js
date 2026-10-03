const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Update Topbar to have a dedicated "Brand Kit" button visible everywhere in admin
const oldTopbarRight = `<div class="topbar-right">
      <a href="/" target="_blank" rel="noopener noreferrer" class="topbar-btn"><i class="fas fa-external-link-alt"></i> Voir le site</a>
      <button class="topbar-btn danger" onclick="logout()"><i class="fas fa-right-from-bracket"></i> Déconnexion</button>
    </div>`;

const newTopbarRight = `<div class="topbar-right">
      <button class="topbar-btn" onclick="document.querySelector('.nav-item[data-page=\\'branding\\']').click()" style="background:rgba(45,95,63,0.08);color:var(--green);border-color:rgba(45,95,63,0.25);font-weight:700">
        <i class="fas fa-swatchbook"></i> Brand Kit
      </button>
      <a href="assets/branding/brand_kit" target="_blank" rel="noopener noreferrer" class="topbar-btn" title="Ouvrir le Brand Kit dans un nouvel onglet">
        <i class="fas fa-arrow-up-right-from-square"></i>
      </a>
      <a href="/" target="_blank" rel="noopener noreferrer" class="topbar-btn"><i class="fas fa-external-link-alt"></i> Voir le site</a>
      <button class="topbar-btn danger" onclick="logout()"><i class="fas fa-right-from-bracket"></i> Déconnexion</button>
    </div>`;

if (content.includes(oldTopbarRight)) {
  content = content.replace(oldTopbarRight, newTopbarRight);
  console.log('Topbar updated with direct Brand Kit button!');
} else {
  console.log('Topbar right pattern check...');
}

// 2. Update Sidebar nav label to clearly say "Brand Kit Officiel"
const oldSidebarNav = `<div class="nav-item" data-page="branding"><i class="fas fa-palette"></i><span>Logos & Kit de Marque</span><span class="nav-badge" style="background:var(--gold);font-size:.6rem">HD</span></div>`;
const newSidebarNav = `<div class="nav-item" data-page="branding"><i class="fas fa-swatchbook"></i><span>Brand Kit Officiel</span><span class="nav-badge" style="background:var(--green);font-size:.6rem">Live</span></div>`;

if (content.includes(oldSidebarNav)) {
  content = content.replace(oldSidebarNav, newSidebarNav);
  console.log('Sidebar nav updated to "Brand Kit Officiel"!');
}

// 3. Update pageTitles
content = content.replace(
  "branding: 'Logos, Bannières & Kit de Marque Officiel',",
  "branding: 'Brand Kit Officiel & Charte Graphique PROJETBI',"
);

// 4. Update #page-branding to include the interactive embedded Brand Kit iframe & tab switcher
const brandingPageStart = '<div class="page" id="page-branding">';
const brandingPageEnd = '<!-- SECTION 5 : NUANCIER CHROMATIQUE RÉPUBLICAIN -->';

// Find the index of page-branding
const pageBrandingIdx = content.indexOf(brandingPageStart);
if (pageBrandingIdx !== -1) {
  console.log('Found page-branding at index', pageBrandingIdx);
}

// Let's rewrite the interior of page-branding cleanly
const upgradedPageBranding = `<div class="page" id="page-branding">

      <!-- Top Controls & Tab Switcher -->
      <div class="card" style="margin-bottom:1rem;background:var(--bg2);border-color:var(--border);box-shadow:var(--shadow)">
        <div class="card-head" style="flex-wrap:wrap;gap:.75rem">
          <div style="display:flex;align-items:center;gap:.65rem">
            <span class="card-title"><i class="fas fa-swatchbook" style="color:var(--green)"></i> Brand Kit & Charte Graphique Officielle</span>
            <span class="badge badge-green" style="font-size:.68rem">Fond Blanc Pur</span>
            <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.68rem">Sans Étoile</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" id="btnTabBrandPortal" onclick="switchBrandTab('portal')">
              <i class="fas fa-desktop"></i> 1. Portail Brand Kit Complet (Intégré)
            </button>
            <button class="btn btn-outline btn-sm" id="btnTabBrandDownloads" onclick="switchBrandTab('downloads')">
              <i class="fas fa-layer-group"></i> 2. Galerie Téléchargements Rapides HD
            </button>
            <a href="assets/branding/brand_kit" target="_blank" class="btn btn-gold btn-sm">
              <i class="fas fa-arrow-up-right-from-square"></i> Plein Écran (Nouvel Onglet)
            </a>
            <button class="btn btn-outline btn-sm" onclick="reloadBrandKitIframe()" title="Actualiser le Brand Kit">
              <i class="fas fa-rotate"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: EMBEDDED BRAND KIT PORTAL IFRAME -->
      <div id="tabContentBrandPortal" style="display:block">
        <div style="background:#FFFFFF;border:1.5px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)">
          <iframe id="brandKitFrame" src="assets/branding/brand_kit.html" style="width:100%;height:calc(100vh - 190px);border:none;display:block;" title="Brand Kit Officiel PROJETBI"></iframe>
        </div>
      </div>

      <!-- TAB 2: DIRECT DOWNLOADS & CARDS -->
      <div id="tabContentBrandDownloads" style="display:none">
        
        <!-- SECTION 1 : LOGOTYPE HORIZONTAL MASTER (1500 × 450) -->
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-arrows-left-right" style="color:var(--green)"></i> 1. Logotype Horizontal Master (1500 × 450)</span>
            <span style="font-size:.78rem;color:var(--text3)">En-têtes de site, en-têtes de lettres, bannières et signatures</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.25rem">
              
              <!-- Horizontal Blanc -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Fond Blanc Pur (Référence)</span>
                  <span class="badge badge-green" style="font-size:.65rem">Officiel</span>
                </div>
                <div style="background:#FFFFFF;border:1px solid var(--border);border-radius:8px;padding:1.5rem 1rem;display:flex;align-items:center;justify-content:center;min-height:120px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_horizontal_blanc.svg" alt="Horizontal Blanc" style="max-width:100%;max-height:80px;object-fit:contain">
                </div>
                <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                  Idéal pour le site web, affiches sur fond clair, courriers républicains et publications.
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_horizontal_blanc.svg" download="logo_projetbi_horizontal_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                  </a>
                  <a href="assets/branding/logo_projetbi_horizontal_blanc.png" download="logo_projetbi_horizontal_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD (1500px)
                  </a>
                </div>
              </div>

              <!-- Horizontal Transparent -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Fond Transparent Détouré</span>
                  <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.65rem">Universel</span>
                </div>
                <div style="background:#FFFFFF;background-image:linear-gradient(45deg,#F0F2F0 25%,transparent 25%),linear-gradient(-45deg,#F0F2F0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#F0F2F0 75%),linear-gradient(-45deg,transparent 75%,#F0F2F0 75%);background-size:16px 16px;border:1px solid var(--border);border-radius:8px;padding:1.5rem 1rem;display:flex;align-items:center;justify-content:center;min-height:120px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_horizontal_transparent.svg" alt="Horizontal Transparent" style="max-width:100%;max-height:80px;object-fit:contain">
                </div>
                <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                  Incrustation transparente sur photos, visuels de réseaux sociaux ou présentations PowerPoint.
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_horizontal_transparent.svg" download="logo_projetbi_horizontal_transparent.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                  </a>
                  <a href="assets/branding/logo_projetbi_horizontal_transparent.png" download="logo_projetbi_horizontal_transparent.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD (1500px)
                  </a>
                </div>
              </div>

              <!-- Horizontal Vert Forêt -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Fond Vert Forêt Institutionnel</span>
                  <span class="badge" style="background:rgba(26,61,40,0.15);color:var(--green-d);border:1px solid rgba(26,61,40,0.3);font-size:.65rem">Solennel</span>
                </div>
                <div style="background:#1A3D28;border:1px solid var(--border);border-radius:8px;padding:1.5rem 1rem;display:flex;align-items:center;justify-content:center;min-height:120px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_horizontal_vert_foret.svg" alt="Horizontal Vert Forêt" style="max-width:100%;max-height:80px;object-fit:contain">
                </div>
                <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                  Déclinaison contrastée sur fond sombre institutionnel avec lettrage blanc et or.
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_horizontal_vert_foret.svg" download="logo_projetbi_horizontal_vert_foret.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                  </a>
                  <a href="assets/branding/logo_projetbi_horizontal_vert_foret.png" download="logo_projetbi_horizontal_vert_foret.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD (1500px)
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- SECTION 2 : LOGOTYPE VERTICAL / CARRÉ (1000 × 1000) -->
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-square" style="color:var(--gold)"></i> 2. Logotype Vertical & Format Carré (1000 × 1000)</span>
            <span style="font-size:.78rem;color:var(--text3)">Affiches, roll-ups, vignettes et visuels réseaux sociaux</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.25rem">
              
              <!-- Vertical Blanc -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Vertical — Fond Blanc</span>
                  <span class="badge badge-green" style="font-size:.65rem">Officiel</span>
                </div>
                <div style="background:#FFFFFF;border:1px solid var(--border);border-radius:8px;padding:1.2rem;display:flex;align-items:center;justify-content:center;min-height:140px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_vertical_blanc.svg" alt="Vertical Blanc" style="max-height:110px;object-fit:contain">
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_vertical_blanc.svg" download="logo_projetbi_vertical_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG
                  </a>
                  <a href="assets/branding/logo_projetbi_vertical_blanc.png" download="logo_projetbi_vertical_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD
                  </a>
                </div>
              </div>

              <!-- Vertical Transparent -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Vertical — Détouré</span>
                  <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.65rem">Détouré</span>
                </div>
                <div style="background:#FFFFFF;background-image:linear-gradient(45deg,#F0F2F0 25%,transparent 25%),linear-gradient(-45deg,#F0F2F0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#F0F2F0 75%),linear-gradient(-45deg,transparent 75%,#F0F2F0 75%);background-size:16px 16px;border:1px solid var(--border);border-radius:8px;padding:1.2rem;display:flex;align-items:center;justify-content:center;min-height:140px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_vertical_transparent.svg" alt="Vertical Transparent" style="max-height:110px;object-fit:contain">
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_vertical_transparent.svg" download="logo_projetbi_vertical_transparent.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG
                  </a>
                  <a href="assets/branding/logo_projetbi_vertical_transparent.png" download="logo_projetbi_vertical_transparent.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD
                  </a>
                </div>
              </div>

              <!-- Vertical Vert Forêt -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.2rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <span style="font-weight:700;font-size:.88rem;color:var(--text)">Vertical — Vert Forêt</span>
                  <span class="badge" style="background:rgba(26,61,40,0.15);color:var(--green-d);border:1px solid rgba(26,61,40,0.3);font-size:.65rem">Sombre</span>
                </div>
                <div style="background:#1A3D28;border:1px solid var(--border);border-radius:8px;padding:1.2rem;display:flex;align-items:center;justify-content:center;min-height:140px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_vertical_vert_foret.svg" alt="Vertical Vert Forêt" style="max-height:110px;object-fit:contain">
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_vertical_vert_foret.svg" download="logo_projetbi_vertical_vert_foret.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG
                  </a>
                  <a href="assets/branding/logo_projetbi_vertical_vert_foret.png" download="logo_projetbi_vertical_vert_foret.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- SECTION 3 : BANNIÈRE ET AVATAR RÉSEAUX SOCIAUX -->
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-share-nodes" style="color:var(--green)"></i> 3. Bannières & Avatars Réseaux Sociaux Déployables</span>
            <span style="font-size:.78rem;color:var(--text3)">Pour Facebook, LinkedIn, X, WhatsApp Business et Instagram</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:1.5rem">
              
              <!-- Bannière Réseaux Sociaux HD -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.25rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <div>
                    <div style="font-weight:700;font-size:.9rem;color:var(--text)">Couverture Réseaux Sociaux Officielle (1640 × 624)</div>
                    <div style="font-size:.75rem;color:var(--text3)">Format standard pour page Facebook, LinkedIn et X</div>
                  </div>
                  <span class="badge badge-green" style="font-size:.65rem">1640×624 HD</span>
                </div>
                <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:1rem;background:#FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.04)">
                  <img src="assets/branding/facebook_cover_clean.png" alt="Couverture Réseaux Sociaux" style="width:100%;height:auto;display:block">
                </div>
                <div style="display:flex;align-items:center;gap:.75rem;margin-top:auto">
                  <a href="assets/branding/facebook_cover_clean.png" download="facebook_cover_projetbi_officielle.png" class="btn btn-primary" style="flex:1;justify-content:center">
                    <i class="fas fa-download"></i> Télécharger la Couverture HD (PNG)
                  </a>
                </div>
              </div>

              <!-- Avatar Rond Universel HD -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.25rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <div>
                    <div style="font-weight:700;font-size:.9rem;color:var(--text)">Photo de Profil / Avatar (1080 × 1080)</div>
                    <div style="font-size:.75rem;color:var(--text3)">Cercle de cadrage pour Facebook, WhatsApp, Instagram</div>
                  </div>
                  <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.65rem">1080×1080</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;padding:1rem;margin-bottom:1rem">
                  <img src="assets/branding/projetbi_avatar_clean.png" alt="Avatar PROJETBI" style="width:160px;height:160px;border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,0.1)">
                </div>
                <div style="display:flex;align-items:center;gap:.75rem;margin-top:auto">
                  <a href="assets/branding/projetbi_avatar_clean.png" download="avatar_projetbi_officiel_1080.png" class="btn btn-primary" style="flex:1;justify-content:center">
                    <i class="fas fa-download"></i> Télécharger l'Avatar HD (PNG)
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- SECTION 4 : MACARONS SQUIRCLE & SYMBOLE JJJ SEUL -->
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-certificate" style="color:var(--blue)"></i> 4. Macarons d'Application & Symbole JJJ Seul</span>
            <span style="font-size:.78rem;color:var(--text3)">Favicons web, icônes mobiles, tampons et marquages</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
              
              <!-- Macaron Squircle 512x512 -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.25rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <div>
                    <div style="font-weight:700;font-size:.9rem;color:var(--text)">Macaron Squircle Fond Blanc (512 × 512)</div>
                    <div style="font-size:.75rem;color:var(--text3)">Déployé comme favicon et icône sur index.html et admin.html</div>
                  </div>
                  <span class="badge badge-green" style="font-size:.65rem">Favicon App</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;padding:1rem;background:#FFFFFF;border:1px solid var(--border);border-radius:8px;margin-bottom:1rem">
                  <img src="assets/branding/favicon_blanc_squircle.svg" alt="Squircle Favicon" style="width:110px;height:110px">
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/favicon_blanc_squircle.svg" download="favicon_blanc_squircle.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG
                  </a>
                  <a href="assets/branding/favicon_blanc_squircle.png" download="favicon_blanc_squircle.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD (512px)
                  </a>
                </div>
              </div>

              <!-- Symbole JJJ Seul 600x600 -->
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.25rem;display:flex;flex-direction:column">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                  <div>
                    <div style="font-weight:700;font-size:.9rem;color:var(--text)">Emblème JJJ Seul — Fond Blanc (600 × 600)</div>
                    <div style="font-size:.75rem;color:var(--text3)">Le symbole pur sans texte : 3 J aérodynamiques sans étoile</div>
                  </div>
                  <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.65rem">Symbole JJJ</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;padding:1rem;background:#FFFFFF;border:1px solid var(--border);border-radius:8px;margin-bottom:1rem">
                  <img src="assets/branding/logo_projetbi_symbole_seul_blanc.svg" alt="Symbole JJJ Seul" style="width:110px;height:110px">
                </div>
                <div style="display:flex;gap:.5rem;margin-top:auto">
                  <a href="assets/branding/logo_projetbi_symbole_seul_blanc.svg" download="logo_projetbi_symbole_seul_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-bezier-curve"></i> SVG
                  </a>
                  <a href="assets/branding/logo_projetbi_symbole_seul_blanc.png" download="logo_projetbi_symbole_seul_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
                    <i class="fas fa-image"></i> PNG HD (600px)
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- SECTION 5 : NUANCIER CHROMATIQUE RÉPUBLICAIN -->
        <div class="card" style="margin-bottom:1.5rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-swatchbook" style="color:var(--gold)"></i> 5. Nuancier Chromatique Républicain & Codes HEX</span>
            <span style="font-size:.78rem;color:var(--text3)">Cliquez sur une couleur pour copier instantanément son code</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">
              
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#2D5F3F');toast('Vert PASTEF #2D5F3F copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#2D5F3F"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Vert PASTEF</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Droiture</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#2D5F3F</code>
                </div>
              </div>

              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#1A3D28');toast('Vert Forêt #1A3D28 copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#1A3D28"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Vert Forêt</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Institutionnel</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#1A3D28</code>
                </div>
              </div>

              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#C9A84C');toast('Or Républicain #C9A84C copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#C9A84C"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Or Républicain</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Justice & Équité</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#C9A84C</code>
                </div>
              </div>

              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#B23A3A');toast('Rouge Patriotique #B23A3A copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#B23A3A"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Rouge Patriotique</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Jubanti</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#B23A3A</code>
                </div>
              </div>

              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#FFFFFF');toast('Blanc Pur #FFFFFF copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#FFFFFF;border-bottom:1px solid var(--border)"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Blanc Pur</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Fond Référence</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#FFFFFF</code>
                </div>
              </div>

              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s" onclick="navigator.clipboard.writeText('#4A5B52');toast('Ardoise Texte #4A5B52 copié !','success')" title="Cliquer pour copier">
                <div style="height:60px;background:#4A5B52"></div>
                <div style="padding:.6rem;text-align:center">
                  <div style="font-weight:700;font-size:.82rem;color:var(--text)">Ardoise Texte</div>
                  <div style="font-size:.7rem;color:var(--text3);margin-bottom:.3rem">Contraste & Typo</div>
                  <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;background:var(--bg2);padding:.2rem .4rem;border-radius:4px;border:1px solid var(--border)">#4A5B52</code>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>`;

// Replace from <div class="page" id="page-branding"> to next <div class="page" id="page-kit">
const kitPageIdx = content.indexOf('<div class="page" id="page-kit">');
if (pageBrandingIdx !== -1 && kitPageIdx !== -1) {
  content = content.substring(0, pageBrandingIdx) + upgradedPageBranding + '\n    ' + content.substring(kitPageIdx);
  console.log('Successfully replaced page-branding with interactive tabbed version!');
}

// 5. Add JavaScript helper functions for brand tabs
const jsBrandHelpers = `
// ══════════════════════
// BRAND KIT TAB SWITCHER & HELPER
// ══════════════════════
function switchBrandTab(tab) {
  const portalTab = document.getElementById('tabContentBrandPortal');
  const downTab = document.getElementById('tabContentBrandDownloads');
  const btnPortal = document.getElementById('btnTabBrandPortal');
  const btnDown = document.getElementById('btnTabBrandDownloads');
  
  if (tab === 'portal') {
    if (portalTab) portalTab.style.display = 'block';
    if (downTab) downTab.style.display = 'none';
    if (btnPortal) { btnPortal.className = 'btn btn-primary btn-sm'; }
    if (btnDown) { btnDown.className = 'btn btn-outline btn-sm'; }
  } else {
    if (portalTab) portalTab.style.display = 'none';
    if (downTab) downTab.style.display = 'block';
    if (btnPortal) { btnPortal.className = 'btn btn-outline btn-sm'; }
    if (btnDown) { btnDown.className = 'btn btn-primary btn-sm'; }
  }
}

function reloadBrandKitIframe() {
  const f = document.getElementById('brandKitFrame');
  if (f) {
    f.src = 'assets/branding/brand_kit.html?t=' + Date.now();
    toast('Brand Kit actualisé !', 'info');
  }
}
`;

if (!content.includes('function switchBrandTab')) {
  content = content.replace('// DASHBOARD', jsBrandHelpers + '\n// DASHBOARD');
  console.log('Added switchBrandTab & reloadBrandKitIframe JS functions!');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html successfully upgraded with embedded Brand Kit!');
