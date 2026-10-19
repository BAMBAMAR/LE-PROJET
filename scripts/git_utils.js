/**
 * git_utils.js - Module utilitaire centralisé pour la synchronisation Git sécurisée
 * 
 * Évite les deadlocks de rebase, les dépassements de buffer (ENOBUFS sur news.json),
 * les conflits récurrents sur drafts.json, news.json, promises.json et press.json,
 * et garantit un état git toujours propre et cohérent avec origin/main.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Buffer élargi à 64 Mo pour manipuler sans crash les fichiers volumineux (news.json ~ 1.6+ Mo)
const MAX_BUFFER_64MB = 64 * 1024 * 1024;

/**
 * Exécute une commande git avec un buffer suffisant pour éviter les erreurs ENOBUFS
 */
function gitCmd(cmd, repoDir, options = {}) {
  return execSync(cmd, {
    cwd: repoDir,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER_64MB,
    stdio: 'pipe',
    ...options
  });
}

/**
 * Nettoie tout rebase ou merge en cours orphelin et s'assure d'être sur 'main'.
 */
function ensureCleanGitState(repoDir) {
  try {
    const rebaseMerge = path.join(repoDir, '.git', 'rebase-merge');
    const rebaseApply = path.join(repoDir, '.git', 'rebase-apply');
    const rebaseHead = path.join(repoDir, '.git', 'REBASE_HEAD');

    if (fs.existsSync(rebaseMerge) || fs.existsSync(rebaseApply) || fs.existsSync(rebaseHead)) {
      try {
        gitCmd('git rebase --abort', repoDir);
      } catch (_) {}
      if (fs.existsSync(rebaseHead)) {
        try { fs.rmSync(rebaseHead, { force: true }); } catch (_) {}
      }
    }

    const mergeHead = path.join(repoDir, '.git', 'MERGE_HEAD');
    if (fs.existsSync(mergeHead)) {
      try {
        gitCmd('git merge --abort', repoDir);
      } catch (_) {}
    }

    const branch = gitCmd('git branch --show-current', repoDir).trim();
    if (branch && branch !== 'main') {
      try {
        gitCmd('git checkout main', repoDir);
      } catch (_) {}
    }
  } catch (_) {}
}

/**
 * Résout automatiquement un conflit sur drafts.json en fusionnant intelligemment les brouillons.
 */
function resolveDraftsConflict(repoDir, logger = console.log) {
  const draftsPath = path.join(repoDir, 'drafts.json');
  try {
    let ours = null;
    let theirs = null;

    try {
      const oursRaw = gitCmd('git show :2:drafts.json', repoDir);
      ours = JSON.parse(oursRaw);
    } catch (e) {
      if (logger) logger(`   [git_utils] Lecture index stage 2 drafts.json : ${e.message}`);
    }

    try {
      const theirsRaw = gitCmd('git show :3:drafts.json', repoDir);
      theirs = JSON.parse(theirsRaw);
    } catch (e) {
      if (logger) logger(`   [git_utils] Lecture index stage 3 drafts.json : ${e.message}`);
    }

    // Si les versions indexées ne sont pas directement parsables, tenter de nettoyer le fichier sur disque
    if (!ours || !theirs) {
      if (!fs.existsSync(draftsPath)) return false;
      const content = fs.readFileSync(draftsPath, 'utf8');
      if (!content.includes('<<<<<<<')) return false;

      const cleaned = content.replace(/<<<<<<<[\s\S]*?=======[\s\S]*?>>>>>>>[^\r\n]*/g, () => {
        return `"last_updated": "${new Date().toISOString()}"`;
      });
      try {
        JSON.parse(cleaned);
        fs.writeFileSync(draftsPath, cleaned, 'utf8');
        gitCmd('git add drafts.json', repoDir);
        return true;
      } catch (_) {
        return false;
      }
    }

    // Fusionner ours et theirs sans doublon
    const draftsMap = new Map();
    const allDrafts = [...(theirs.drafts || []), ...(ours.drafts || [])];
    for (const d of allDrafts) {
      const key = d.id || d._dedup_key || d.source_url || d.title;
      if (!key) continue;
      if (!draftsMap.has(key)) {
        draftsMap.set(key, { ...d });
      } else {
        const existing = draftsMap.get(key);
        if (d.promise_id && !existing.promise_id) existing.promise_id = d.promise_id;
        if (d.status && d.status !== 'pending' && existing.status === 'pending') existing.status = d.status;
      }
    }

    const mergedList = Array.from(draftsMap.values()).slice(0, 200);
    const mergedData = {
      drafts: mergedList,
      last_updated: new Date().toISOString()
    };

    fs.writeFileSync(draftsPath, JSON.stringify(mergedData, null, 2), 'utf8');
    gitCmd('git add drafts.json', repoDir);
    return true;
  } catch (err) {
    if (logger) logger(`   [git_utils] Erreur résolution drafts.json : ${err.message}`);
    return false;
  }
}

/**
 * Normalise une clé d'article pour la déduplication
 */
function getArticleKey(a) {
  if (!a) return '';
  if (a.link && a.link.trim()) return a.link.trim().toLowerCase();
  return (a.title || '').trim().toLowerCase();
}

/**
 * Calcule un timestamp pour trier les articles du plus récent au plus ancien
 */
function getArticleTimestamp(a) {
  if (!a) return 0;
  if (a.created_at) {
    const t = new Date(a.created_at).getTime();
    if (!isNaN(t)) return t;
  }
  if (a.date) {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(a.date)) {
      const [d, m, y] = a.date.split('/');
      const t = new Date(`${y}-${m}-${d}T12:00:00Z`).getTime();
      if (!isNaN(t)) return t;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
      const t = new Date(`${a.date}T12:00:00Z`).getTime();
      if (!isNaN(t)) return t;
    }
  }
  return parseInt(a.id, 10) || 0;
}

/**
 * Résout automatiquement un conflit sur news.json en fusionnant intelligemment les articles.
 */
function resolveNewsConflict(repoDir, logger = console.log) {
  const newsPath = path.join(repoDir, 'news.json');
  try {
    let ours = null;
    let theirs = null;

    try {
      const oursRaw = gitCmd('git show :2:news.json', repoDir);
      ours = JSON.parse(oursRaw);
    } catch (e) {
      if (logger) logger(`   [git_utils] Lecture index stage 2 news.json : ${e.message}`);
    }

    try {
      const theirsRaw = gitCmd('git show :3:news.json', repoDir);
      theirs = JSON.parse(theirsRaw);
    } catch (e) {
      if (logger) logger(`   [git_utils] Lecture index stage 3 news.json : ${e.message}`);
    }

    if (!ours || !theirs) {
      // Si la lecture par git show échoue, tenter de récupérer la version locale
      if (fs.existsSync(newsPath)) {
        try {
          const raw = fs.readFileSync(newsPath, 'utf8');
          if (!raw.includes('<<<<<<<')) {
            ours = JSON.parse(raw);
          }
        } catch (_) {}
      }
      if (!ours && !theirs) return false;
      if (!ours) ours = theirs;
      if (!theirs) theirs = ours;
    }

    const keyMap = new Map();
    let maxId = 0;

    // 1. Ours en premier (préserve les IDs locaux et métadonnées locales)
    (ours.news || []).forEach(a => {
      const numId = parseInt(a.id, 10) || 0;
      if (numId > maxId) maxId = numId;
      const k = getArticleKey(a);
      if (k) keyMap.set(k, { ...a });
    });

    // 2. Fusion de theirs (articles distants manquants)
    (theirs.news || []).forEach(a => {
      const k = getArticleKey(a);
      if (!k) return;
      if (!keyMap.has(k)) {
        maxId++;
        keyMap.set(k, { ...a, id: String(maxId) });
      } else {
        const existing = keyMap.get(k);
        if (!existing.promise_id && a.promise_id) existing.promise_id = a.promise_id;
        if (!existing.category && a.category) existing.category = a.category;
        if (!existing.author && a.author) existing.author = a.author;
      }
    });

    // 3. Trier chronologiquement (nouveaux articles en tête)
    const mergedList = Array.from(keyMap.values());
    mergedList.sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));

    const mergedData = {
      last_updated: new Date().toISOString(),
      news: mergedList
    };

    fs.writeFileSync(newsPath, JSON.stringify(mergedData, null, 2), 'utf8');
    gitCmd('git add news.json', repoDir);
    return true;
  } catch (err) {
    if (logger) logger(`   [git_utils] Erreur résolution news.json : ${err.message}`);
    return false;
  }
}

/**
 * Résout automatiquement un conflit sur promises.json
 */
function resolvePromisesConflict(repoDir, logger = console.log) {
  const promisesPath = path.join(repoDir, 'promises.json');
  try {
    let ours = null;
    let theirs = null;

    try {
      ours = JSON.parse(gitCmd('git show :2:promises.json', repoDir));
    } catch (_) {}
    try {
      theirs = JSON.parse(gitCmd('git show :3:promises.json', repoDir));
    } catch (_) {}

    if (!ours || !theirs) return false;

    const promiseMap = new Map();
    (ours.promises || []).forEach(p => {
      if (p.id) promiseMap.set(p.id, { ...p });
    });

    const statusHierarchy = { 'non-lance': 0, 'en-cours': 1, 'realise': 2 };

    (theirs.promises || []).forEach(remoteP => {
      if (!remoteP.id) return;
      if (!promiseMap.has(remoteP.id)) {
        promiseMap.set(remoteP.id, { ...remoteP });
      } else {
        const localP = promiseMap.get(remoteP.id);
        // Promouvoir le statut si distant est plus avancé
        const localRank = statusHierarchy[localP.status] ?? 0;
        const remoteRank = statusHierarchy[remoteP.status] ?? 0;
        if (remoteRank > localRank) {
          localP.status = remoteP.status;
        }
        // Fusionner les mises à jour factuelles (updates)
        if (Array.isArray(remoteP.updates) && remoteP.updates.length > 0) {
          const localUpdates = Array.isArray(localP.updates) ? localP.updates : [];
          const updateKeys = new Set(localUpdates.map(u => (u.date || '') + (u.text || u.titre || '')));
          for (const u of remoteP.updates) {
            const uKey = (u.date || '') + (u.text || u.titre || '');
            if (!updateKeys.has(uKey)) {
              localUpdates.push(u);
              updateKeys.add(uKey);
            }
          }
          localP.updates = localUpdates;
        }
      }
    });

    const mergedData = {
      start_date: ours.start_date || theirs.start_date,
      end_date: ours.end_date || theirs.end_date,
      last_updated: new Date().toISOString(),
      promises: Array.from(promiseMap.values())
    };

    fs.writeFileSync(promisesPath, JSON.stringify(mergedData, null, 2), 'utf8');
    gitCmd('git add promises.json', repoDir);
    return true;
  } catch (err) {
    if (logger) logger(`   [git_utils] Erreur résolution promises.json : ${err.message}`);
    return false;
  }
}

/**
 * Résout automatiquement un conflit sur press.json
 */
function resolvePressConflict(repoDir, logger = console.log) {
  const pressPath = path.join(repoDir, 'press.json');
  try {
    let ours = null;
    let theirs = null;

    try {
      ours = JSON.parse(gitCmd('git show :2:press.json', repoDir));
    } catch (_) {}
    try {
      theirs = JSON.parse(gitCmd('git show :3:press.json', repoDir));
    } catch (_) {}

    if (!ours || !theirs) return false;

    // Déduplication par image ou titre+date
    const pressMap = new Map();
    [...(ours.press || []), ...(theirs.press || [])].forEach(item => {
      const key = item.image || `${item.title}_${item.date}_${item.id}`;
      if (!pressMap.has(key)) {
        pressMap.set(key, item);
      }
    });

    const mergedData = {
      last_updated: new Date().toISOString(),
      press: Array.from(pressMap.values())
    };

    fs.writeFileSync(pressPath, JSON.stringify(mergedData, null, 2), 'utf8');
    gitCmd('git add press.json', repoDir);
    return true;
  } catch (err) {
    if (logger) logger(`   [git_utils] Erreur résolution press.json : ${err.message}`);
    return false;
  }
}

/**
 * Synchronisation complète et sécurisée avec GitHub (Commit + Pull merge + Push).
 */
function syncWithRemote(repoDir, { filesToStage = [], commitMessage = '', logger = console.log } = {}) {
  try {
    ensureCleanGitState(repoDir);

    // 1. Ajouter les fichiers demandés + auto-stager les fichiers de données clés modifiés
    const files = new Set(filesToStage);
    const keyDataFiles = ['news.json', 'drafts.json', 'promises.json', 'press.json'];
    for (const f of keyDataFiles) {
      if (fs.existsSync(path.join(repoDir, f))) {
        try {
          const status = gitCmd(`git status --porcelain "${f}"`, repoDir).trim();
          if (status) files.add(f);
        } catch (_) {}
      }
    }

    if (files.size > 0) {
      const filesArg = Array.from(files).map(f => `"${f}"`).join(' ');
      try {
        gitCmd(`git add ${filesArg}`, repoDir);
      } catch (addErr) {
        if (logger) logger(`   ⚠️ Avertissement git add : ${addErr.message}`);
      }
    }

    // 2. Vérifier s'il y a des changements stagés à committer
    const stagedStatus = gitCmd('git diff --cached --name-only', repoDir).trim();
    if (stagedStatus) {
      const msg = commitMessage || 'chore: synchronisation automatique';
      gitCmd(`git commit -m "${msg.replace(/"/g, '\\"')}"`, repoDir);
      logger(`   ✅ Commit local créé : "${msg}"`);
    } else {
      logger('   ℹ️ Aucun changement en attente de commit local.');
    }

    // 3. Pull depuis origin/main avec stratégie merge
    let pullOk = true;
    try {
      gitCmd('git pull --no-rebase origin main', repoDir);
      logger('   ✅ Dépôt distant synchronisé (git pull).');
    } catch (pullErr) {
      pullOk = false;
      try {
        const statusPorcelain = gitCmd('git status --porcelain', repoDir);
        const conflictLines = statusPorcelain.split('\n').filter(l => 
          l.startsWith('UU ') || l.startsWith('AA ') || l.startsWith('UD ') || l.startsWith('DU ')
        );

        let allResolved = conflictLines.length > 0;
        let resolvedFiles = [];
        let unresolvedFiles = [];

        for (const line of conflictLines) {
          const fileMatch = line.slice(3).trim();
          if (fileMatch.includes('drafts.json')) {
            if (resolveDraftsConflict(repoDir, logger)) {
              resolvedFiles.push('drafts.json');
            } else {
              allResolved = false;
              unresolvedFiles.push('drafts.json');
            }
          } else if (fileMatch.includes('news.json')) {
            if (resolveNewsConflict(repoDir, logger)) {
              resolvedFiles.push('news.json');
            } else {
              allResolved = false;
              unresolvedFiles.push('news.json');
            }
          } else if (fileMatch.includes('promises.json')) {
            if (resolvePromisesConflict(repoDir, logger)) {
              resolvedFiles.push('promises.json');
            } else {
              allResolved = false;
              unresolvedFiles.push('promises.json');
            }
          } else if (fileMatch.includes('press.json')) {
            if (resolvePressConflict(repoDir, logger)) {
              resolvedFiles.push('press.json');
            } else {
              allResolved = false;
              unresolvedFiles.push('press.json');
            }
          } else {
            allResolved = false;
            unresolvedFiles.push(fileMatch);
          }
        }

        if (allResolved && resolvedFiles.length > 0) {
          gitCmd(`git commit -m "chore(sync): résolution automatique conflits ${resolvedFiles.join('/')}"`, repoDir);
          logger(`   ✅ Conflit sur ${resolvedFiles.join(', ')} résolu et fusionné automatiquement.`);
          pullOk = true;
        } else if (unresolvedFiles.length > 0) {
          logger(`   ⚠️ Fichiers en conflit non résolus automatiquement : ${unresolvedFiles.join(', ')}`);
        }
      } catch (resolveErr) {
        if (logger) logger(`   ⚠️ Erreur durant la résolution de conflits : ${resolveErr.message}`);
      }

      if (!pullOk) {
        logger(`   ⚠️ Échec de la fusion distante : ${pullErr.message}`);
        try {
          gitCmd('git merge --abort', repoDir);
          logger('   ℹ️ Merge annulé pour protéger l\'espace de travail.');
        } catch (_) {}
      }
    }

    // 4. Push vers origin/main si le pull s'est bien passé
    if (pullOk) {
      gitCmd('git push origin main', repoDir);
      logger('   🚀 Synchronisation GitHub réussie sur origin/main !');
      return true;
    } else {
      logger('   ⚠️ Push différé car le pull distant n\'a pas pu être complété en toute sécurité.');
      return false;
    }
  } catch (err) {
    logger(`   ❌ Erreur synchronisation Git : ${err.message}`);
    return false;
  }
}

module.exports = {
  ensureCleanGitState,
  resolveDraftsConflict,
  resolveNewsConflict,
  resolvePromisesConflict,
  resolvePressConflict,
  syncWithRemote
};
