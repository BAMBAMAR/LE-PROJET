/**
 * git_utils.js - Module utilitaire centralisé pour la synchronisation Git sécurisée
 * 
 * Évite les deadlocks de rebase, les conflits récurrents sur drafts.json (last_updated),
 * et garantit un état git toujours propre et cohérent.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
        execSync('git rebase --abort', { cwd: repoDir, stdio: 'pipe' });
      } catch (_) {}
      if (fs.existsSync(rebaseHead)) {
        try { fs.rmSync(rebaseHead, { force: true }); } catch (_) {}
      }
    }

    const mergeHead = path.join(repoDir, '.git', 'MERGE_HEAD');
    if (fs.existsSync(mergeHead)) {
      try {
        execSync('git merge --abort', { cwd: repoDir, stdio: 'pipe' });
      } catch (_) {}
    }

    const branch = execSync('git branch --show-current', { cwd: repoDir, encoding: 'utf8' }).trim();
    if (branch && branch !== 'main') {
      try {
        execSync('git checkout main', { cwd: repoDir, stdio: 'pipe' });
      } catch (_) {}
    }
  } catch (_) {}
}

/**
 * Résout automatiquement un conflit sur drafts.json en fusionnant intelligemment les brouillons.
 */
function resolveDraftsConflict(repoDir) {
  const draftsPath = path.join(repoDir, 'drafts.json');
  try {
    let ours = null;
    let theirs = null;

    try {
      const oursRaw = execSync('git show :2:drafts.json', { cwd: repoDir, encoding: 'utf8', stdio: 'pipe' });
      ours = JSON.parse(oursRaw);
    } catch (_) {}

    try {
      const theirsRaw = execSync('git show :3:drafts.json', { cwd: repoDir, encoding: 'utf8', stdio: 'pipe' });
      theirs = JSON.parse(theirsRaw);
    } catch (_) {}

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
        execSync('git add drafts.json', { cwd: repoDir, stdio: 'pipe' });
        return true;
      } catch (_) {
        return false;
      }
    }

    // Fusionner ours et theirs sans doublon
    const draftsMap = new Map();
    const allDrafts = [...(theirs.drafts || []), ...(ours.drafts || [])];
    for (const d of allDrafts) {
      const key = d.id || d._dedup_key || d.title;
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
    execSync('git add drafts.json', { cwd: repoDir, stdio: 'pipe' });
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Synchronisation complète et sécurisée avec GitHub (Commit + Pull merge + Push).
 */
function syncWithRemote(repoDir, { filesToStage = [], commitMessage = '', logger = console.log } = {}) {
  try {
    ensureCleanGitState(repoDir);

    // 1. Ajouter les fichiers demandés
    if (filesToStage.length > 0) {
      const filesArg = filesToStage.join(' ');
      execSync(`git add ${filesArg}`, { cwd: repoDir, stdio: 'inherit' });
    }

    // 2. Vérifier s'il y a des changements stagés à committer
    const stagedStatus = execSync('git diff --cached --name-only', { cwd: repoDir, encoding: 'utf8' }).trim();
    if (stagedStatus) {
      const msg = commitMessage || 'chore: synchronisation automatique';
      execSync(`git commit -m "${msg}"`, { cwd: repoDir, stdio: 'inherit' });
      logger(`   ✅ Commit local créé : "${msg}"`);
    } else {
      logger('   ℹ️ Aucun changement en attente de commit local.');
    }

    // 3. Pull depuis origin/main avec stratégie merge
    let pullOk = true;
    try {
      execSync('git pull --no-rebase origin main', { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });
      logger('   ✅ Dépôt distant synchronisé (git pull).');
    } catch (pullErr) {
      pullOk = false;
      try {
        const statusPorcelain = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf8' });
        const conflicts = statusPorcelain.split('\n').filter(l => l.startsWith('UU ') || l.startsWith('AA ') || l.startsWith('UD ') || l.startsWith('DU '));
        const onlyDraftsConflict = conflicts.length === 1 && conflicts[0].includes('drafts.json');

        if (onlyDraftsConflict && resolveDraftsConflict(repoDir)) {
          execSync('git commit -m "chore(sync): résolution automatique conflit drafts.json"', { cwd: repoDir, stdio: 'pipe' });
          logger('   ✅ Conflit sur drafts.json résolu et fusionné automatiquement.');
          pullOk = true;
        }
      } catch (_) {}

      if (!pullOk) {
        logger(`   ⚠️ Échec de la fusion distante : ${pullErr.message}`);
        try {
          execSync('git merge --abort', { cwd: repoDir, stdio: 'pipe' });
          logger('   ℹ️ Merge annulé pour protéger l\'espace de travail.');
        } catch (_) {}
      }
    }

    // 4. Push vers origin/main si le pull s'est bien passé
    if (pullOk) {
      execSync('git push origin main', { cwd: repoDir, stdio: 'inherit' });
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
  syncWithRemote
};
