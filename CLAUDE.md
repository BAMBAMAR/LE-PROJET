# CLAUDE.md - Instructions & Documentation de Développement

## 📌 Présentation du Projet
**LE PROJET SÉNÉGAL** est une plateforme web d'information, de suivi des engagements politiques et de revue de presse automatisée en République du Sénégal.

---

## 🛠️ Commandes Principales

### Scraping Automatisé de la Revue de Presse
- **Exécution quotidienne (Windows Batch)** :
  ```cmd
  run_daily_revue.bat
  ```
- **Lancement Node.js direct** :
  ```bash
  node scripts/download_revue.js
  ```
- **Connexion initiale à Facebook (Session)** :
  ```bash
  node scripts/download_revue.js --login
  ```
  *Ouvre Chromium en mode non-headless. Connectez-vous une fois à Facebook, puis fermez le navigateur pour persister les cookies dans `.fb_session`.*

---

## ⚙️ Architecture du Scraping de Presse (`scripts/download_revue.js`)

Le scraping de la revue de presse utilise **Playwright** avec un contexte persistant (`.fb_session`).

### Déroulement de l'Automatisme :
1. **Ciblage dynamique de la publication du jour** :
   - Parcourt le profil de *Mamadou Ly* (`https://www.facebook.com/mamadou.ly.1804`).
   - Identifie le lot de photos du post du jour via son identifiant `set=pcb.XXXXX`.
   - Filtre et ignore automatiquement les photos de profil/couverture (`set=a.37...`, `aria-label="couverture"`).
2. **Parcours de la visionneuse (Quarantaine complète)** :
   - Ouvre le lecteur de photos et simule le clic sur *« Photo suivante »* (`[aria-label="Photo suivante"]`).
   - Parcourt l'intégralité du lot (ex: 40 à 45 journaux).
3. **Filtres de Sécurité & Pertinence** :
   - **Déduplication par FBID (`seenFbids`) et URL (`seenSrcs`)** : Détecte l'instant exact où la visionneuse boucle et stoppe le scraping.
   - **Filtrage des sujets exclus (`EXCLUDE_KEYWORDS`)** : Rejette les fleurs, plantes, recettes de cuisine, gâteaux, événements personnels.
   - **Filtre de ratio (Format Une de journal)** : Rejette les bannières ou couvertures panoramiques (`largeur > 1.6 x hauteur`).
   - **Mots-clés journaux (`NEWSPAPER_KEYWORDS`)** : Détecte *Le Soleil, L'Observateur, Libération, Enquête, Record, Sud Quotidien, Rewmi, Les Échos, L'Évidence, L'Info, Tribune, POP, Yoor-Yoor, Solo Quotidien, Direct News, etc.*
4. **Export & Synchronisation Git** :
   - Enregistre les images dans `revuedepresse/revue_AAAA-MM-JJ_N.jpg`.
   - Met à jour `press.json` avec la liste actualisée.
   - Effectue un `git pull --rebase`, `git add`, `git commit` et `git push origin main`.

---

## 📁 Structure des Données

### `press.json`
Contient la date de dernière mise à jour et la liste des quotidiens du jour :
```json
{
  "last_updated": "2026-08-06T16:40:00.000Z",
  "press": [
    {
      "id": "1",
      "title": "Quotidien",
      "date": "06/08/2026",
      "image": "revuedepresse/revue_2026-08-06_1.jpg",
      "link": "#"
    }
  ]
}
```

---

## 🎨 Fichiers Front-end Principaux
- **Pages HTML** : `index.html`, `admin.html`, `actualites.html`, `ideologie.html`, `kit-communication.html`.
- **Scripts JS** : `app.js`, `app.perf.js`, `app.harden.js`, `app.vote-guard.js`, `app.kpi-filters.js`, `render.js`, `utils.js`.
- **Feuilles de style** : `style.css`, `design-system.css`, `tokens.css`, `corrections.css`.

- Refonte Globale Premium : Am�lioration de la typographie (letter-spacing), glassmorphism et animations d'entr�e sur les modales, soft shadows dynamiques sur les cartes produits/immo, et glow effects sur les boutons principaux.
