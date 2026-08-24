# 🇸🇳 LE PROJET SÉNÉGAL - Installation et Configuration

## 📦 Contenu du Package

Vous avez reçu 4 fichiers optimisés :

1. **index.html** - Structure HTML moderne et sémantique
2. **style.css** - Styles CSS optimisés avec design moderne
3. **app.js** - JavaScript avec intégration Supabase
4. **OPTIMISATIONS.md** - Documentation complète des améliorations

## 🚀 Installation Rapide

### Étape 1 : Préparation des fichiers

1. Créez un nouveau dossier pour votre projet :
```bash
mkdir projet-senegal
cd projet-senegal
```

2. Copiez les 3 fichiers principaux dans ce dossier :
   - index.html
   - style.css
   - app.js

### Étape 2 : Créer le fichier promises.json

Créez un fichier `promises.json` à la racine avec vos données :

```json
{
  "start_date": "2024-04-02",
  "promises": [
    {
      "id": "1",
      "engagement": "Construction de 500 écoles numériques",
      "domain": "Éducation",
      "status": "En cours",
      "delai": 730,
      "progress": 35,
      "updates": [
        {
          "date": "2025-01-15",
          "description": "50 écoles déjà construites, 150 en construction"
        }
      ]
    },
    {
      "id": "2",
      "engagement": "Création de 100 000 emplois jeunes",
      "domain": "Économie",
      "status": "En cours",
      "delai": 1095,
      "progress": 28,
      "updates": []
    }
  ]
}
```

### Étape 3 : Configuration Supabase (optionnel)

Si vous utilisez Supabase pour stocker les votes et notations :

1. Créez un compte sur [Supabase](https://supabase.com)

2. Créez un nouveau projet

3. Créez les tables suivantes :

**Table : public_votes**
```sql
CREATE TABLE public_votes (
  id BIGSERIAL PRIMARY KEY,
  promise_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table : service_ratings**
```sql
CREATE TABLE service_ratings (
  id BIGSERIAL PRIMARY KEY,
  service TEXT NOT NULL,
  accessibility INTEGER CHECK (accessibility >= 1 AND accessibility <= 5),
  welcome INTEGER CHECK (welcome >= 1 AND welcome <= 5),
  efficiency INTEGER CHECK (efficiency >= 1 AND efficiency <= 5),
  transparency INTEGER CHECK (transparency >= 1 AND transparency <= 5),
  comment TEXT,
  date TIMESTAMP DEFAULT NOW()
);
```

4. Mettez à jour les identifiants dans `app.js` (lignes 5-6) :
```javascript
const SUPABASE_URL = 'VOTRE_URL_SUPABASE';
const SUPABASE_KEY = 'VOTRE_CLE_PUBLIQUE';
```

### Étape 4 : Tester localement

#### Option A : Serveur local simple

Utilisez Python pour démarrer un serveur local :

```bash
# Python 3
python -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000
```

Puis ouvrez : http://localhost:8000

#### Option B : Extension VS Code

Installez "Live Server" dans VS Code et cliquez sur "Go Live"

#### Option C : Node.js http-server

```bash
npm install -g http-server
http-server
```

## 📁 Structure du Projet

```
projet-senegal/
├── index.html           # Page principale
├── style.css            # Styles
├── app.js              # JavaScript
├── promises.json       # Données des engagements
└── README.md           # Ce fichier
```

## 🔑 Fonctionnalités Principales

### ✅ Déjà fonctionnelles (sans backend)

- ✅ Affichage des statistiques
- ✅ Filtrage des engagements
- ✅ Navigation fluide
- ✅ Design responsive
- ✅ Promesse du jour
- ✅ Animations et transitions
- ✅ Export local des données

### 🔄 Nécessitent Supabase

- Vote public sur les engagements
- Notation des services publics
- Synchronisation en temps réel

## 🎨 Personnalisation

### Changer les couleurs

Modifiez les variables CSS dans `style.css` (lignes 3-25) :

```css
:root {
    --primary: #00695f;        /* Couleur principale */
    --primary-light: #3e9e90;  /* Couleur claire */
    --accent: #ff6f3c;         /* Couleur accent */
    /* ... */
}
```

### Modifier le contenu

1. **Engagements** : Éditez `promises.json`
2. **Actualités** : Modifiez le tableau `CONFIG.news` dans `app.js` (ligne 166)
3. **Journaux** : Modifiez le tableau `CONFIG.press` dans `app.js` (ligne 24)
4. **Personnes du jour** : Modifiez `DAILY_PEOPLE` dans `app.js` (ligne 71)

## 🌐 Déploiement en Production

### Option 1 : GitHub Pages (Gratuit)

1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans Settings
4. Votre site sera accessible à : `https://username.github.io/repo-name`

### Option 2 : Netlify (Gratuit)

1. Créez un compte sur [Netlify](https://netlify.com)
2. Glissez-déposez votre dossier
3. Site déployé instantanément !

### Option 3 : Vercel (Gratuit)

1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez votre projet
3. Déploiement automatique

### Option 4 : Serveur traditionnel

Uploadez tous les fichiers via FTP vers votre hébergeur web.

## 🔧 Dépannage

### Problème : "Failed to load resource: promises.json"

**Solution** : Assurez-vous que le fichier `promises.json` existe à la racine du projet.

### Problème : "Supabase SDK non disponible"

**Solution** : 
1. Vérifiez votre connexion Internet
2. Le SDK Supabase est chargé via CDN dans `index.html`
3. Si le problème persiste, les fonctionnalités locales fonctionnent quand même

### Problème : Statistiques ne s'affichent pas

**Solution** : Vérifiez le format de votre fichier `promises.json` et assurez-vous qu'il est valide (utilisez [JSONLint](https://jsonlint.com))

### Problème : Styles cassés

**Solution** : Vérifiez que `style.css` est dans le même dossier que `index.html`

## 📊 Exemple de données complètes

Voici un exemple de `promises.json` complet :

```json
{
  "start_date": "2024-04-02",
  "promises": [
    {
      "id": "1",
      "engagement": "Construction de 500 écoles numériques sur l'ensemble du territoire",
      "domain": "Éducation",
      "status": "En cours",
      "delai": 730,
      "progress": 35,
      "updates": [
        {
          "date": "2025-01-15",
          "description": "50 écoles livrées, 150 en construction active"
        },
        {
          "date": "2024-12-01",
          "description": "Lancement des travaux dans 5 régions"
        }
      ]
    },
    {
      "id": "2",
      "engagement": "Création de 100 000 emplois pour les jeunes",
      "domain": "Économie",
      "status": "En cours",
      "delai": 1095,
      "progress": 28,
      "updates": [
        {
          "date": "2025-01-10",
          "description": "28 000 jeunes déjà employés via le programme"
        }
      ]
    },
    {
      "id": "3",
      "engagement": "Réhabilitation de 1000 km de routes nationales",
      "domain": "Infrastructure",
      "status": "En cours",
      "delai": 1460,
      "progress": 22,
      "updates": []
    },
    {
      "id": "4",
      "engagement": "Construction de 50 centres de santé modernes",
      "domain": "Santé",
      "status": "Non lancé",
      "delai": 1095,
      "progress": 0,
      "updates": []
    },
    {
      "id": "5",
      "engagement": "Électrification de 500 villages ruraux",
      "domain": "Énergie",
      "status": "Réalisé",
      "delai": 365,
      "progress": 100,
      "updates": [
        {
          "date": "2024-12-25",
          "description": "Objectif atteint ! 500 villages électrifiés"
        }
      ]
    }
  ]
}
```

## 🆘 Support

Pour toute question ou assistance :

- 📧 Email : contact@projetbi.org
- 📱 Téléphone : +221 76 945 52 53
- 📍 Adresse : Dakar, Sénégal

## 📄 Licence

Ce projet est développé pour promouvoir la transparence démocratique au Sénégal.

---

**🎉 Félicitations ! Votre plateforme de suivi des engagements est prête !**

*Dernière mise à jour : 29 janvier 2026*
