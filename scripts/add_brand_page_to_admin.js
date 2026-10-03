const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Update Sidebar Navigation
const targetNav = `<div class="nav-group-label">Réseaux Sociaux</div>
  <div class="nav-item" data-page="social"><i class="fas fa-share-nodes"></i><span>Pages Réseaux Sociaux</span></div>`;

const replacementNav = `<div class="nav-group-label">Marque & Réseaux Sociaux</div>
  <div class="nav-item" data-page="branding"><i class="fas fa-palette"></i><span>Logos & Kit de Marque</span><span class="nav-badge" style="background:var(--gold);font-size:.6rem">HD</span></div>
  <div class="nav-item" data-page="social"><i class="fas fa-share-nodes"></i><span>Pages Réseaux Sociaux</span></div>`;

if (content.includes(targetNav)) {
  content = content.replace(targetNav, replacementNav);
  console.log('Sidebar nav updated with "Logos & Kit de Marque"');
} else {
  console.warn('Target nav not found as exact match, checking alternatives...');
}

// 2. Update pageTitles
const targetTitles = `drafts: 'Brouillons automatiques', sources: 'Gestion des Sources',
  social: 'Pages Réseaux Sociaux',`;

const replacementTitles = `drafts: 'Brouillons automatiques', sources: 'Gestion des Sources',
  branding: 'Logos, Bannières & Kit de Marque Officiel',
  social: 'Pages Réseaux Sociaux',`;

if (content.includes(targetTitles)) {
  content = content.replace(targetTitles, replacementTitles);
  console.log('pageTitles updated with branding');
}

// 3. Define the HTML for page-branding
const pageBrandingHtml = `
    <!-- ═══════════════════════════════════════════════════
         PAGE : LOGOS, BANNIÈRES & KIT DE MARQUE OFFICIEL
         ═══════════════════════════════════════════════════ -->
    <div class="page" id="page-branding">

      <!-- Top Banner with Quick Actions -->
      <div class="card" style="margin-bottom:1.25rem;background:var(--bg2);border-color:var(--border);box-shadow:var(--shadow)">
        <div class="card-head" style="flex-wrap:wrap;gap:.75rem">
          <div style="display:flex;align-items:center;gap:.6rem">
            <span class="card-title"><i class="fas fa-palette" style="color:var(--green)"></i> Kit de Marque & Logotypes Officiels PROJETBI</span>
            <span class="badge badge-green" style="font-size:.68rem">Fond Blanc Pur</span>
            <span class="badge" style="background:rgba(201,168,76,0.15);color:#8F7223;border:1px solid rgba(201,168,76,0.3);font-size:.68rem">Sans Étoile</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap">
            <a href="/assets/branding/brand_kit" target="_blank" class="btn btn-primary btn-sm">
              <i class="fas fa-external-link-alt"></i> Ouvrir la Page Publique du Brand Kit
            </a>
            <button class="btn btn-outline btn-sm" onclick="document.querySelector('.nav-item[data-page=\\'kit\\']').click()">
              <i class="fas fa-bullhorn"></i> Créer des Visuels dans le Studio
            </button>
            <button class="btn btn-outline btn-sm" onclick="document.querySelector('.nav-item[data-page=\\'social\\']').click()">
              <i class="fas fa-share-nodes"></i> Configurer Réseaux Sociaux
            </button>
          </div>
        </div>
        <div class="card-body" style="padding:.9rem 1.25rem">
          <p style="color:var(--text2);font-size:.85rem;margin:0 0 .85rem 0">
            Retrouvez ici tous les <strong>logos, bannières, avatars et icônes officiels</strong> de PROJETBI en téléchargement direct haute résolution (vectoriel SVG et images HD PNG).
            Conformes à la charte républicaine : <strong>symbole JJJ sans étoile</strong>, slogan officiel <em>« Pour un Sénégal Souverain, Juste et Prospère »</em> et fond blanc pur de référence.
          </p>

          <div class="kpi-row" style="margin-bottom:0">
            <div class="kpi-card" style="padding:.75rem 1rem">
              <div class="kpi-label">Logotypes Masters</div>
              <div class="kpi-value" style="font-size:1.4rem;color:var(--green)">6 Formats</div>
              <div class="kpi-sub">Horizontaux & Verticaux</div>
              <i class="fas fa-layer-group kpi-icon"></i>
            </div>
            <div class="kpi-card gold" style="padding:.75rem 1rem">
              <div class="kpi-label">Réseaux Sociaux</div>
              <div class="kpi-value" style="font-size:1.4rem;color:var(--gold)">2 Assets HD</div>
              <div class="kpi-sub">Couverture (1640x624) & Avatar</div>
              <i class="fas fa-share-nodes kpi-icon"></i>
            </div>
            <div class="kpi-card blue" style="padding:.75rem 1rem">
              <div class="kpi-label">Macarons & JJJ</div>
              <div class="kpi-value" style="font-size:1.4rem;color:var(--blue)">2 Symboles</div>
              <div class="kpi-sub">Squircle 512 & JJJ Seul 600</div>
              <i class="fas fa-certificate kpi-icon"></i>
            </div>
            <div class="kpi-card" style="padding:.75rem 1rem">
              <div class="kpi-label">Palette Officielle</div>
              <div class="kpi-value" style="font-size:1.4rem">6 Teintes</div>
              <div class="kpi-sub">Codes HEX Républicains</div>
              <i class="fas fa-swatchbook kpi-icon"></i>
            </div>
          </div>
        </div>
      </div>

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
                <img src="/assets/branding/logo_projetbi_horizontal_blanc.svg" alt="Horizontal Blanc" style="max-width:100%;max-height:80px;object-fit:contain">
              </div>
              <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                Idéal pour le site web, affiches sur fond clair, courriers républicains et publications.
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_horizontal_blanc.svg" download="logo_projetbi_horizontal_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                </a>
                <a href="/assets/branding/logo_projetbi_horizontal_blanc.png" download="logo_projetbi_horizontal_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_horizontal_transparent.svg" alt="Horizontal Transparent" style="max-width:100%;max-height:80px;object-fit:contain">
              </div>
              <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                Incrustation transparente sur photos, visuels de réseaux sociaux ou présentations PowerPoint.
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_horizontal_transparent.svg" download="logo_projetbi_horizontal_transparent.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                </a>
                <a href="/assets/branding/logo_projetbi_horizontal_transparent.png" download="logo_projetbi_horizontal_transparent.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_horizontal_vert_foret.svg" alt="Horizontal Vert Forêt" style="max-width:100%;max-height:80px;object-fit:contain">
              </div>
              <div style="font-size:.78rem;color:var(--text3);margin-bottom:1rem">
                Déclinaison contrastée sur fond sombre institutionnel avec lettrage blanc et or.
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_horizontal_vert_foret.svg" download="logo_projetbi_horizontal_vert_foret.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG Vectoriel
                </a>
                <a href="/assets/branding/logo_projetbi_horizontal_vert_foret.png" download="logo_projetbi_horizontal_vert_foret.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_vertical_blanc.svg" alt="Vertical Blanc" style="max-height:110px;object-fit:contain">
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_vertical_blanc.svg" download="logo_projetbi_vertical_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG
                </a>
                <a href="/assets/branding/logo_projetbi_vertical_blanc.png" download="logo_projetbi_vertical_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_vertical_transparent.svg" alt="Vertical Transparent" style="max-height:110px;object-fit:contain">
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_vertical_transparent.svg" download="logo_projetbi_vertical_transparent.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG
                </a>
                <a href="/assets/branding/logo_projetbi_vertical_transparent.png" download="logo_projetbi_vertical_transparent.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_vertical_vert_foret.svg" alt="Vertical Vert Forêt" style="max-height:110px;object-fit:contain">
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_vertical_vert_foret.svg" download="logo_projetbi_vertical_vert_foret.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG
                </a>
                <a href="/assets/branding/logo_projetbi_vertical_vert_foret.png" download="logo_projetbi_vertical_vert_foret.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/facebook_cover_clean.png" alt="Couverture Réseaux Sociaux" style="width:100%;height:auto;display:block">
              </div>
              <div style="display:flex;align-items:center;gap:.75rem;margin-top:auto">
                <a href="/assets/branding/facebook_cover_clean.png" download="facebook_cover_projetbi_officielle.png" class="btn btn-primary" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/projetbi_avatar_clean.png" alt="Avatar PROJETBI" style="width:160px;height:160px;border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,0.1)">
              </div>
              <div style="display:flex;align-items:center;gap:.75rem;margin-top:auto">
                <a href="/assets/branding/projetbi_avatar_clean.png" download="avatar_projetbi_officiel_1080.png" class="btn btn-primary" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/favicon_blanc_squircle.svg" alt="Squircle Favicon" style="width:110px;height:110px">
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/favicon_blanc_squircle.svg" download="favicon_blanc_squircle.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG
                </a>
                <a href="/assets/branding/favicon_blanc_squircle.png" download="favicon_blanc_squircle.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
                <img src="/assets/branding/logo_projetbi_symbole_seul_blanc.svg" alt="Symbole JJJ Seul" style="width:110px;height:110px">
              </div>
              <div style="display:flex;gap:.5rem;margin-top:auto">
                <a href="/assets/branding/logo_projetbi_symbole_seul_blanc.svg" download="logo_projetbi_symbole_seul_blanc.svg" class="btn btn-primary btn-sm" style="flex:1;justify-content:center">
                  <i class="fas fa-bezier-curve"></i> SVG
                </a>
                <a href="/assets/branding/logo_projetbi_symbole_seul_blanc.png" download="logo_projetbi_symbole_seul_blanc.png" class="btn btn-outline btn-sm" style="flex:1;justify-content:center">
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
`;

// Insert page-branding before page-kit or after page-social
if (content.includes('<div class="page" id="page-kit">')) {
  content = content.replace('<div class="page" id="page-kit">', pageBrandingHtml + '\n    <div class="page" id="page-kit">');
  console.log('page-branding successfully injected before page-kit!');
} else {
  console.error('Could not find anchor <div class="page" id="page-kit">');
}

// 4. Update the quick link banner inside page-social to highlight the branding page
const socialBannerInsertPoint = '<div class="social-tabs">';
const socialQuickBrandingCallout = `<!-- Quick Brand Kit & Banners Shortcut Callout -->
      <div style="background:linear-gradient(135deg,rgba(45,95,63,0.06),rgba(201,168,76,0.08));border:1.5px solid var(--border2);border-radius:var(--radius);padding:.85rem 1.25rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:.75rem">
          <div style="width:38px;height:38px;border-radius:8px;background:#FFFFFF;border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;padding:2px;box-shadow:0 2px 6px rgba(0,0,0,0.05)">
            <img src="/assets/branding/favicon_blanc_squircle.svg" style="width:100%;height:100%">
          </div>
          <div>
            <div style="font-weight:700;font-size:.86rem;color:var(--text)">Logos, Bannières (1640×624) & Avatars (1080×1080) Officiels</div>
            <div style="font-size:.74rem;color:var(--text3)">Tous les fichiers HD sur fond blanc, transparent et vert forêt sont prêts à être téléchargés ou intégrés.</div>
          </div>
        </div>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn-primary btn-sm" onclick="document.querySelector('.nav-item[data-page=\\'branding\\']').click()">
            <i class="fas fa-palette"></i> Voir Tous les Logos & Bannières
          </button>
          <a href="/assets/branding/brand_kit" target="_blank" class="btn btn-outline btn-sm">
            <i class="fas fa-external-link-alt"></i> Brand Kit Public
          </a>
        </div>
      </div>
      
      `;

if (content.includes(socialBannerInsertPoint) && !content.includes('Quick Brand Kit & Banners Shortcut Callout')) {
  content = content.replace(socialBannerInsertPoint, socialQuickBrandingCallout + socialBannerInsertPoint);
  console.log('Added quick branding callout inside page-social!');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html updated successfully with dedicated Logos & Kit de Marque section!');
