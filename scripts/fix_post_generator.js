const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Ensure switchSocialTab refreshes generator when tabId === 'generator'
const oldSwitchTab = `if (tabId === 'generator') buildGeneratedPost();`;
const newSwitchTab = `if (tabId === 'generator') { onPostSourceTypeChange(); }`;

if (content.includes(oldSwitchTab)) {
  content = content.replace(oldSwitchTab, newSwitchTab);
  console.log('switchSocialTab updated to call onPostSourceTypeChange() on tab open');
}

// 2. Replacement for onPostSourceTypeChange and buildGeneratedPost
const newGeneratorCode = `function onPostSourceTypeChange() {
  const type = (document.getElementById('postSourceType') || {}).value || 'promise';
  const sel = document.getElementById('postItemSelect');
  const group = document.getElementById('postItemSelectorGroup');
  const label = document.getElementById('postItemSelectorLabel');
  if (!sel || !group) return;

  if (type === 'general') {
    group.style.display = 'none';
    buildGeneratedPost();
    return;
  }

  group.style.display = 'block';
  let options = '';

  if (type === 'promise') {
    label.textContent = "Sélectionner l'engagement à relayer :";
    const list = (DB && DB.promises && DB.promises.length) ? DB.promises : [];
    if (!list.length) {
      options = '<option value="">(Aucun engagement chargé)</option>';
    } else {
      // Group promises by domain for crystal-clear navigation
      const byDomain = {};
      list.forEach(p => {
        const d = p.domaine || 'Général';
        if (!byDomain[d]) byDomain[d] = [];
        byDomain[d].push(p);
      });

      for (const [dom, plist] of Object.entries(byDomain)) {
        options += \`<optgroup label="📂 \${escapeHtml(dom)} (\${plist.length})">\`;
        plist.forEach(p => {
          const st = p.status === 'done' ? '✅' : (p.status === 'in_progress' ? '⏳' : (p.status === 'retard' ? '⚠️' : '⚪'));
          const num = p.id ? p.id.replace('promise_', '#') + ' ' : '';
          const text = p.engagement || p.title || p.nom || '';
          options += \`<option value="\${p.id}">\${st} \${num}\${escapeHtml(text.slice(0, 85))}\${text.length > 85 ? '…' : ''}</option>\`;
        });
        options += \`</optgroup>\`;
      }
    }
  } else if (type === 'news') {
    label.textContent = "Sélectionner l'actualité :";
    const list = (DB && DB.news && DB.news.length) ? DB.news : [];
    if (!list.length) {
      options = '<option value="">(Aucune actualité disponible)</option>';
    } else {
      list.slice(0, 50).forEach(n => {
        const title = n.title || n.titre || n.text || 'Actualité';
        const src = n.source ? \`[\${n.source}] \` : '';
        const dt = n.date ? \`(\${n.date}) \` : '';
        options += \`<option value="\${n.id}">\${src}\${dt}\${escapeHtml(title.slice(0, 80))}\${title.length > 80 ? '…' : ''}</option>\`;
      });
    }
  } else if (type === 'press') {
    label.textContent = "Sélectionner la revue de presse :";
    const list = (DB && DB.press && DB.press.length) ? DB.press : [];
    if (!list.length) {
      options = '<option value="">(Aucune revue de presse chargée)</option>';
    } else {
      list.slice(0, 40).forEach(r => {
        const title = r.title || r.titre || r.journal || 'Presse';
        const dt = r.date ? \`[\${r.date}] \` : '';
        options += \`<option value="\${r.id}">\${dt}📰 \${escapeHtml(title)}</option>\`;
      });
    }
  }

  sel.innerHTML = options;
  buildGeneratedPost();
}

function buildGeneratedPost() {
  const type = (document.getElementById('postSourceType') || {}).value || 'promise';
  const tone = (document.getElementById('postToneSelect') || {}).value || 'republican';
  const itemId = (document.getElementById('postItemSelect') || {}).value;
  const tagsStr = (typeof activeSocialHashtags !== 'undefined' && activeSocialHashtags.size)
    ? Array.from(activeSocialHashtags).join(' ')
    : '#ProjetBI #Senegal #JubJubalJubanti';

  let post = '';

  if (type === 'promise') {
    const list = (DB && DB.promises) ? DB.promises : [];
    const item = list.find(p => String(p.id) === String(itemId)) || list[0] || null;
    const title = item ? (item.engagement || item.title || 'Engagement citoyen') : 'Suivi des engagements républicains';
    const domain = item ? (item.domaine || 'Gouvernance') : 'Projet';
    const num = item && item.id ? item.id.replace('promise_', '#') : '';
    const statusMap = {
      'done': 'RÉALISÉ ✅',
      'in_progress': 'EN COURS ⏳',
      'retard': 'EN VIGILANCE / RETARD ⚠️',
      'non-lance': 'PLANIFIÉ / NON LANCÉ ⚪'
    };
    const stLabel = item ? (statusMap[item.status] || 'SUIVI CITOYEN') : 'SUIVI';
    const delai = item && item.delai ? \`\\n📅 Échéance prévue : \${item.delai}\` : '';
    const lastUpdate = (item && item.mises_a_jour && item.mises_a_jour.length)
      ? \`\\n\\n📌 Point d'étape officiel (\${item.mises_a_jour[item.mises_a_jour.length - 1].date}) : "\${item.mises_a_jour[item.mises_a_jour.length - 1].text.slice(0, 130)}..."\`
      : '';

    if (tone === 'victory') {
      post = \`🇸🇳 PROJETBI | AVANCÉE DU PROJET [\${domain.toUpperCase()}]\\n\\n✅ Engagement \${num} : "\${title}"\\n📊 Statut officiel : \${stLabel}\${delai}\${lastUpdate}\\n\\nRetrouvez tous les indicateurs et preuves factuelles de réalisation sur l'Observatoire Citoyen :\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    } else if (tone === 'alert') {
      post = \`⚠️ VIGILANCE CITOYENNE | [\${domain.toUpperCase()}]\\n\\n📌 Engagement sous suivi \${num} : "\${title}"\\n📊 Statut actuel : \${stLabel}\${delai}\${lastUpdate}\\n\\nLe respect strict des engagements présidentiels est au cœur du redressement républicain. Donnez votre avis :\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    } else if (tone === 'quote') {
      post = \`💬 DOCTRINE JUB · JUBAL · JUBANTI | [\${domain.toUpperCase()}]\\n\\n« \${title} »\\n\\nLa droiture dans l'intention, l'alignement dans la méthode, le redressement dans l'action.\\nStatut : \${stLabel}\${delai}\\n\\n🔗 Observatoire Citoyen : https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    } else {
      post = \`🇸🇳 SUIVI DU PROJET DE TRANSFORMATION NATIONALE | [\${domain.toUpperCase()}]\\n\\n🎯 Engagement \${num} : "\${title}"\\n📊 Statut officiel : \${stLabel}\${delai}\${lastUpdate}\\n\\nJub · Jubal · Jubanti : suivez en temps réel et en toute transparence l'avancement de la Vision 2050 :\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    }
  } else if (type === 'news') {
    const list = (DB && DB.news) ? DB.news : [];
    const item = list.find(n => String(n.id) === String(itemId)) || list[0] || null;
    const title = item ? (n_title_fallback(item)) : 'Actualité du Projet';
    const source = item && item.source ? \`\\n📌 Source : \${item.source}\` : '';
    const date = item && item.date ? \` | Date : \${item.date}\` : '';
    const link = item && item.link && !item.link.includes('news.google.com') ? item.link : 'https://projetbi.org/actualites.html';

    if (tone === 'alert') {
      post = \`⚡ ALERTE PROJETBI | ACTUALITÉ NATIONALE\\n\\n📰 "\${title}"\${source}\${date}\\n\\nSuivez l'analyse factuelle et les répercussions directes pour la Vision Sénégal 2050 :\\n🔗 \${link}\\n\\n\${tagsStr}\`;
    } else if (tone === 'victory') {
      post = \`🇸🇳 EN ACTION | NOUVELLE ÉTAPE DU PROJET\\n\\n📰 "\${title}"\${source}\${date}\\n\\nRetrouvez tous les détails de cette avancée sur notre observatoire citoyen indépendant :\\n🔗 \${link}\\n\\n\${tagsStr}\`;
    } else {
      post = \`⚡ FLASH PROJETBI | ACTUALITÉ\\n\\n📰 "\${title}"\${source}\${date}\\n\\nConsultez l'article complet et les retombées pour la Vision Sénégal 2050 sur notre observatoire :\\n🔗 \${link}\\n\\n\${tagsStr}\`;
    }
  } else if (type === 'press') {
    const list = (DB && DB.press) ? DB.press : [];
    const item = list.find(r => String(r.id) === String(itemId)) || list[0] || null;
    const title = item ? (item.title || item.titre || item.journal || 'Presse nationale') : 'Revue de presse';
    const date = item && item.date ? \` du \${item.date}\` : '';

    post = \`📰 REVUE DE PRESSE CITOYENNE\${date.toUpperCase()}\\n\\n🗞️ À la Une : « \${title} »\\n\\nRetrouvez les unes des principaux quotidiens sénégalais et l'analyse factuelle de l'actualité politique et économique sur ProjetBI :\\n🔗 https://projetbi.org/#revue-de-presse\\n\\n\${tagsStr}\`;
  } else {
    // General Announcement
    if (tone === 'quote') {
      post = \`« JUB · JUBAL · JUBANTI »\\n\\nLa droiture dans l'intention, l'alignement dans la méthode, le redressement dans l'action.\\n\\n🇸🇳 Pour un Sénégal Souverain, Juste et Prospère.\\n\\nSuivez l'avancement des 300 engagements de la Vision 2050 en toute indépendance et transparence :\\n🔗 https://projetbi.org\\n\\n\${tagsStr}\`;
    } else if (tone === 'alert') {
      post = \`📢 APPEL CITOYEN | OBSERVATOIRE PROJETBI\\n\\nLa souveraineté nationale exige la vigilance et l'implication active de chaque citoyen.\\n\\nConsultez en direct l'état d'avancement des 300 engagements présidentiels et faites entendre votre voix :\\n🔗 https://projetbi.org\\n\\n\${tagsStr}\`;
    } else {
      post = \`🇸🇳 PROJETBI — OBSERVATOIRE CITOYEN INDÉPENDANT\\n\\n« Pour un Sénégal Souverain, Juste et Prospère »\\n\\nJub · Jubal · Jubanti : suivez en temps réel et en toute transparence l'avancement des 300 engagements de la transformation systémique nationale.\\n\\n🔗 Plateforme citoyenne : https://projetbi.org\\n\\n\${tagsStr}\`;
    }
  }

  const txtEl = document.getElementById('postGeneratedText');
  if (txtEl) txtEl.value = post;
  updatePostCharCount();
}

function n_title_fallback(n) {
  if (!n) return 'Actualité';
  return n.title || n.titre || n.text || n.headline || 'Actualité du Projet';
}
`;

// Find where onPostSourceTypeChange starts and where buildGeneratedPost ends
const startMarker = 'function onPostSourceTypeChange() {';
const endMarker = 'function updatePostCharCount() {';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newGeneratorCode + '\n' + content.substring(endIdx);
  console.log('Successfully replaced onPostSourceTypeChange & buildGeneratedPost with robust version!');
} else {
  console.error('Could not find start or end markers for generator function replacement!');
}

// Also in loadData, ensure onPostSourceTypeChange is called once data loads
const oldLoadDataEnd = `filteredPromises = [...DB.promises];
  } catch(e) {`;

const newLoadDataEnd = `filteredPromises = [...DB.promises];
    if (typeof onPostSourceTypeChange === 'function') {
      try { onPostSourceTypeChange(); } catch(err) {}
    }
  } catch(e) {`;

if (content.includes(oldLoadDataEnd)) {
  content = content.replace(oldLoadDataEnd, newLoadDataEnd);
  console.log('loadData updated to refresh onPostSourceTypeChange once promises, news & press are loaded!');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html updated successfully with fixed post generator!');
