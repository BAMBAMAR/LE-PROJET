# 🚀 Guide de migration — ProjetBI v2

**Date** : 25 avril 2026
**Statut** : prêt à déployer en préproduction

Ce dossier contient la **version refondue** du site ProjetBI, applicant l'audit complet livré précédemment. Les fichiers sont compatibles avec votre `app.js` existant — vous n'avez pas besoin de le réécrire entièrement (mais des patches ciblés sont fournis dans `app-patches.js`).

---

## 📂 Contenu

| Fichier | Statut | À faire |
|---|---|---|
| `index.html` | ✅ Nouveau | **Remplace** l'ancien `index.html` |
| `style.css` | ✅ Nouveau | **Remplace** `style.css` ET `corrections.css` |
| `tokens.css` | ✅ Nouveau | **Ajouter** à la racine du site |
| `sitemap.xml` | ✅ Mis à jour | **Remplace** l'ancien `sitemap.xml` |
| `robots.txt` | ✅ Nouveau | **Ajouter** à la racine |
| `manifest.json` | ✅ Mis à jour | **Remplace** l'ancien `manifest.json` |
| `_headers` | ✅ Nouveau | **Ajouter** à la racine (Netlify/Cloudflare) |
| `.htaccess-admin` | ✅ Nouveau | **Optionnel** — Basic Auth Apache |
| `app-patches.js` | 📖 Documentation | Lire et appliquer les 8 patches dans votre `app.js` |
| `design-system.md` | 📖 Documentation | Référence du système de design |
| `admin-auth-supabase.md` | 📖 Documentation | Guide d'auth admin sécurisée |
| `csp-migration.md` | 📖 Documentation | Guide pour CSP strict |

---

## ⚠️ Avant de déployer en production

**Toujours tester en préproduction d'abord.** Voici une procédure pas-à-pas.

### Étape 1 — Sauvegarde

```bash
# Sur votre serveur ou repo local
git add . && git commit -m "Sauvegarde avant migration v2"
git tag pre-migration-v2-$(date +%Y%m%d)
```

Si vous n'utilisez pas Git :

```bash
mkdir backup-$(date +%Y%m%d)
cp index.html style.css corrections.css manifest.json sitemap.xml backup-*/
```

### Étape 2 — Déposer les nouveaux fichiers

À la racine de votre site :

1. Renommer l'ancien `index.html` → `index.old.html` (au cas où)
2. Renommer `style.css` → `style.old.css`
3. Supprimer `corrections.css` (intégré dans le nouveau `style.css`)
4. Copier les nouveaux : `index.html`, `style.css`, `tokens.css`, `sitemap.xml`, `robots.txt`, `manifest.json`, `_headers`

### Étape 3 — Conserver `app.js` tel quel

Le nouveau `index.html` est **conçu pour fonctionner avec votre app.js existant**. Tous les IDs critiques ont été préservés :

- `progressIndicator`, `modernNav`, `modernHamburger`, `modernMenu`, `navLinks`
- `kpiCarousel`, `kpiPrev`, `kpiNext`, `kpiAutoPlayToggle`, `navKpiDesktop`, `menuKpiDisplay`
- `days`, `hours`, `minutes`, `seconds`, `current-date`
- `total`, `realise`, `encours`, `non-lance`, `retard`, `taux-realisation`, `delai-moyen`, `moyenne-notes`, `votes-total`, `avec-maj`, `domaine-principal`, `domaine-count`
- `total-percentage`, `realise-percentage`, `encours-percentage`, `non-lance-percentage`, `retard-percentage`, `avec-maj-percentage`
- `dailyPromise`
- `promisesCarouselGrid`, `carouselPrevBtn`, `carouselNextBtn`, `carouselAutoPlayToggle`, `carouselDots`
- `promisesGrid`, `filterToggleBtn`, `filtersSection`, `filter-search`, `filter-status`, `filter-domain`, `results-count`, `showMoreBtn`, `showLessBtn`, `resetFilters`
- `newsGrid`
- `pressCarousel`, `prevBtn`, `nextBtn`, `autoPlayToggle`, `carouselIndicators`, `newspapersGrid`
- `ratingForm`, `service-category`, `service`, `accessibility`, `welcome`, `efficiency`, `transparency`, `comment`
- `totalVotes`, `totalServices`, `avgRating`, `topServices`, `recentRatings`, `services-data`
- `topServicesList`, `scrollToTop`, `notification-container`
- `ratingsListModal`, `ratingsModalTitle`, `ratingsModalBody`
- `contactEmailLink`, `contactEmail`, `contactPhone`

**Aucune modification de `app.js` n'est strictement nécessaire** pour que le site fonctionne. Les patches dans `app-patches.js` sont des **améliorations recommandées** mais pas bloquantes.

### Étape 4 — Tests en préproduction

Liste de vérification (24 points) :

#### Visuel
- [ ] La hero affiche le titre, le sous-titre, les 2 CTA et le countdown
- [ ] Le KPI carousel se charge (peut être vide au premier chargement)
- [ ] Les 3 KPI principaux du dashboard s'affichent
- [ ] Le bouton "Voir le détail par statut" déplie les 7 KPI secondaires
- [ ] L'engagement du jour se charge
- [ ] Le carrousel d'engagements en lumière fonctionne
- [ ] La grille des 300 engagements se charge
- [ ] Le bouton "Filtres" ouvre/ferme les filtres
- [ ] Les filtres recherche / statut / domaine fonctionnent
- [ ] La grille d'actualités se charge
- [ ] La revue de presse se charge
- [ ] Le formulaire d'évaluation est accessible (catégorie → service)
- [ ] Les étoiles de notation cliquables changent visuellement
- [ ] Le formulaire se soumet sans erreur
- [ ] Les boutons "Voir le classement" / "Voir tous les témoignages" fonctionnent

#### Navigation
- [ ] La navbar reste fixée en haut au scroll
- [ ] Le menu hamburger s'ouvre/se ferme sur mobile
- [ ] Les liens du menu mobile ferment le menu après clic
- [ ] Le clic en dehors du menu mobile le ferme
- [ ] La touche Échap ferme le menu mobile
- [ ] Le bouton "retour en haut" apparaît après 600px de scroll

#### SEO & PWA
- [ ] `https://votre-site/sitemap.xml` retourne le nouveau sitemap
- [ ] `https://votre-site/robots.txt` retourne le nouveau robots
- [ ] Le manifest PWA est valide (Chrome DevTools → Application → Manifest)
- [ ] L'app peut être installée comme PWA

### Étape 5 — Tester sur mobile

Faites un test réel sur :
- iPhone (Safari)
- Android (Chrome)
- Tablette (au moins une)

Points cruciaux :
- Le hamburger fonctionne
- Le formulaire d'évaluation est utilisable au pouce
- Les cartes d'engagement sont lisibles
- Pas de scroll horizontal indésirable
- Les boutons font au moins 44×44 px

### Étape 6 — Déployer en production

Si tout passe en préproduction :

```bash
# Pousser vers production
git push origin main

# Vérifier avec un curl
curl -I https://projetbi.org/
# Doit retourner 200 OK et inclure les nouveaux headers de sécurité
```

### Étape 7 — Surveiller

Pendant les premiers jours :

1. **Google Search Console** → soumettre le nouveau sitemap
2. **Mozilla Observatory** → vérifier le score de sécurité (cible : A ou B)
3. **PageSpeed Insights** → mesurer les Core Web Vitals
4. **Logs serveur** → repérer les 404 (anciennes URL/anciens fichiers manquants)

---

## 🔄 Rollback en cas de problème

Si un bug critique apparaît en production :

```bash
# Si vous utilisez Git
git checkout pre-migration-v2-YYYYMMDD -- index.html style.css corrections.css

# Sinon, restaurer depuis backup
cp backup-YYYYMMDD/* .
```

---

## 📊 Comparaison avant/après

| Métrique | Avant | Après | Évolution |
|---|---|---|---|
| Taille `style.css` | 152 KB | ~38 KB | -75% |
| Taille `corrections.css` | 6 KB | 0 KB (supprimé) | -100% |
| Total CSS | 158 KB | 38 KB + 16 KB tokens = **54 KB** | **-66%** |
| Nombre de `!important` | 370 | 4 (utilitaires .hidden, .sr-only, etc.) | **-99%** |
| Inline styles dans HTML | ~90 lignes | 0 | -100% |
| Polices chargées | 3 familles (Crimson, Inter, Manrope-orphelin) | 2 familles (Crimson, Inter) | -33% |
| Variables CSS | 3 systèmes concurrents | 1 fichier `tokens.css` unifié | ✓ |
| Emojis dans la nav | 8 | 0 (Font Awesome) | ✓ |
| Liens `aria-label` | partiels | tous | ✓ |
| Skip-link | non | oui | ✓ |
| `loading="lazy"` sur images | 0 | tous (à appliquer dans app.js sur les images générées) | ⚠️ partiel |
| `prefers-reduced-motion` | non | oui | ✓ |
| CSP | `unsafe-inline` requis | toujours `unsafe-inline` (le retirer = patches 3-4 de app.js) | ⚠️ partiel |

---

## 🎯 Étapes suivantes (P1)

Une fois la migration v2 stable en production, voici les actions à planifier :

1. **Appliquer les patches `app.js`** — surtout PATCH 1 (silenc console) et PATCH 5 (timeout Supabase)
2. **Migrer l'auth admin vers Supabase** — voir `admin-auth-supabase.md` (P0 sécurité)
3. **Vérifier les RLS Supabase** — voir `AUDIT-COMPLET.md` §P0-SEC-02
4. **Migrer les onclick → délégation** — voir PATCH 3 de `app-patches.js` + `csp-migration.md`
5. **Refondre `actualites.html`** sur les mêmes principes — je peux livrer une version v2 si vous le demandez
6. **Refondre `admin.html`** avec auth Supabase + thème sombre dérivé des tokens

---

## ❓ FAQ

**Q : Le site va-t-il avoir exactement le même visuel ?**
R : Non, et c'est voulu. Le hero est plus sobre, le dashboard moins surchargé, les cartes plus aérées. Le brand stays the same (vert PASTEF, or, rouge), mais la mise en page est rationalisée.

**Q : Mes utilisateurs vont-ils être perdus ?**
R : Très peu probable. Les sections sont les mêmes, les fonctions identiques. Le changement est qualitatif (mieux organisé, plus accessible) mais pas structurel.

**Q : Vais-je perdre mon référencement Google ?**
R : Non. Les URLs n'ont pas changé. Le contenu est identique. Vous gagnerez plutôt en référencement grâce au nouveau sitemap, robots.txt, canonical, et meilleurs Core Web Vitals.

**Q : Puis-je adapter les couleurs ?**
R : Oui, c'est le point principal de `tokens.css`. Modifiez les variables `--brand-green-*`, `--brand-red-*`, `--brand-gold-*` une seule fois et tout le site s'adapte. Plus jamais besoin de chercher 200 occurrences d'un hex code.

**Q : `app.js` va-t-il vraiment fonctionner sans modification ?**
R : Oui, à condition que les IDs soient préservés (et ils le sont — voir liste plus haut). Les fonctions `renderPromises`, `renderNews`, `renderStats`, etc., trouveront leurs cibles. Les boutons sociaux fonctionneront (les classes `social-btn fb`, `social-btn tw`, `social-btn wa` sont stylées).

**Q : Combien de temps faut-il pour faire la migration ?**
R : Environ 1 heure pour copier les fichiers + tester sommairement. Une demi-journée pour tester en profondeur. Une journée si vous appliquez aussi les patches `app.js`.

---

## 🆘 Aide

Si quelque chose ne fonctionne pas :

1. **Inspectez la console** (F12) — tout problème de chargement y apparaîtra
2. **Vérifiez les chemins** — les fichiers `tokens.css`, `style.css`, `manifest.json` doivent être à la racine
3. **Vérifiez que `app.js` est inchangé** par rapport à votre version actuelle
4. **Comparez les IDs** — un grep dans votre `app.js` doit retourner les mêmes résultats avant et après

En cas de difficulté persistante, je peux fournir le diff précis sur un point particulier.
