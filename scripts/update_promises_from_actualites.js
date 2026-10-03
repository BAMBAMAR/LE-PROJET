/**
 * update_promises_from_actualites.js
 * 
 * Met à jour les engagements (promises.json) en s'appuyant sur :
 * - Les actualités de ProjetBI (news.json & drafts.json)
 * - Les sites officiels : Présidence, Primature, Ministères (MESRI, Finances, Éducation, Justice, Pêche, etc.)
 * - Les sources d'information nationales : APS, Le Soleil, Seneweb, Le Quotidien, etc.
 * 
 * Met également à jour drafts.json en associant les brouillons d'actualité aux promesses correspondantes.
 */

const fs = require('fs');
const path = require('path');

const PROMISES_FILE = path.join(__dirname, '..', 'promises.json');
const DRAFTS_FILE   = path.join(__dirname, '..', 'drafts.json');
const NEWS_FILE     = path.join(__dirname, '..', 'news.json');

console.log('Chargement des fichiers de données...');
const promisesData = JSON.parse(fs.readFileSync(PROMISES_FILE, 'utf8'));
const draftsData   = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8'));
const newsData     = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));

console.log(`- Engagements actuels : ${promisesData.promises.length}`);
console.log(`- Brouillons : ${draftsData.drafts ? draftsData.drafts.length : 0}`);
console.log(`- Actualités ProjetBI : ${newsData.news ? newsData.news.length : 0}`);

// Définition des enrichissements majeurs
const updatesRegistry = [
  // 1. Enseignement Supérieur : Contrôle et assainissement des universités privées
  {
    ids: ['promise_244'],
    newStatus: 'encours',
    update: {
      date: '2026-10-02',
      text: "Publication par le Ministère de l’Enseignement supérieur, de la Recherche et de l’Innovation (MESRI) d'une première liste officielle de 34 établissements privés d’enseignement supérieur non reconnus par l’État. Lancement d'une opération rigoureuse d'assainissement, de contrôle des autorisations d'ouverture et d'agréments des diplômes.",
      source: 'MESRI / APS (02-10-2026)'
    }
  },
  {
    ids: ['promise_242'],
    newStatus: 'encours',
    update: {
      date: '2026-09-15',
      text: "Renforcement des directives opérationnelles de l'Autorité Nationale d'Assurance Qualité de l'Enseignement Supérieur (ANAQ-Sup) pour le contrôle périodique et l'accréditation obligatoire de tous les programmes d'études universitaires.",
      source: 'MESRI / Conseil des Ministres'
    }
  },

  // 2. Éducation : Rentrée scolaire, Abris provisoires et Daaras
  {
    ids: ['promise_64', 'promise_226'],
    newStatus: 'encours',
    update: {
      date: '2026-10-02',
      text: "Érigé parmi les cinq chantiers prioritaires de rentrée par le Président Bassirou Diomaye Faye : accélération du plan 'zéro abri provisoire' avec la mobilisation de programmes d'urgence pour le remplacement par des classes en dur et la réhabilitation des infrastructures scolaires.",
      source: 'Présidence / Seneweb (02-10-2026)'
    }
  },
  {
    ids: ['promise_67', 'promise_231', 'promise_232', 'promise_68'],
    newStatus: 'encours',
    update: {
      date: '2026-09-26',
      text: "Conclusions du Conseil interministériel sur la préparation de la rentrée scolaire 2026 présidé par le Premier ministre : accélération de la cartographie nationale des Daaras, modernisation de l'offre éducative avec le PAMOD et validation des textes sur le statut des maîtres coraniques.",
      source: 'Primature (26-09-2026)'
    }
  },
  {
    ids: ['promise_66', 'promise_225'],
    newStatus: 'realise',
    update: {
      date: '2026-09-30',
      text: "Conseil des ministres : le Chef de l'État valide le déploiement effectif des nouveaux enseignants issus des recrutements spéciaux et instruit le ministère de combler les derniers déficits dans les zones rurales isolées.",
      source: 'Conseil des ministres (30-09-2026)'
    }
  },

  // 3. Finances Publiques, Dette Cachée & Transparence
  {
    ids: ['promise_26', 'promise_141'],
    newStatus: 'encours',
    update: {
      date: '2026-09-28',
      text: "Restitution de l'audit approfondi des finances publiques par le Premier ministre et le Ministère des Finances, révélant les dettes et engagements non déclarés de l'ancien régime. Confirmation de la mise en place d'un Conseil indépendant des Finances publiques adossé à la Cour des Comptes pour certifier la trajectoire budgétaire.",
      source: 'Primature / Cour des Comptes / APS'
    }
  },
  {
    ids: ['promise_29'],
    newStatus: 'encours',
    update: {
      date: '2026-09-29',
      text: "Dans le cadre de la nouvelle stratégie nationale de gestion de la dette et des négociations avec les bailleurs (FMI, Banque mondiale), engagement de la création d'un mécanisme dédié d'amortissement de la dette souveraine pour préserver la viabilité financière de l'État.",
      source: 'Ministère des Finances et du Budget'
    }
  },
  {
    ids: ['promise_140', 'promise_129'],
    newStatus: 'encours',
    update: {
      date: '2026-10-02',
      text: "Avancées sur la rationalisation des dépenses publiques : encadrement strict de l'usage des fonds spéciaux (fonds secrets) porté à l'Assemblée nationale et poursuite de la suppression des structures consultatives budgétivores (HCCT et CESE).",
      source: 'Assemblée nationale / Le Quotidien (02-10-2026)'
    }
  },
  {
    ids: ['promise_118', 'promise_119'],
    newStatus: 'encours',
    update: {
      date: '2026-09-20',
      text: "Extension du télépaiement et de la dématérialisation obligatoire des quittances et taxes au Trésor public, à la DGID et aux Douanes dans le cadre de la stratégie de lutte contre la déperdition des recettes et la fraude.",
      source: 'Ministère des Finances / DGID'
    }
  },

  // 4. Planification & Vision Sénégal 2050 (Pôles régionaux)
  {
    ids: ['promise_150', 'promise_204'],
    newStatus: 'encours',
    update: {
      date: '2026-09-18',
      text: "Lancement officiel par le Président Bassirou Diomaye Faye et le Premier ministre de l'Agenda National de Transformation 'Vision Sénégal 2050', structuré autour de 8 pôles économiques régionaux pour assurer un développement territorial décentralisé et endogène.",
      source: 'Présidence de la République / Primature'
    }
  },
  {
    ids: ['promise_69', 'promise_246'],
    newStatus: 'encours',
    update: {
      date: '2026-09-18',
      text: "Intégration dans la feuille de route de la Vision 2050 du projet de déploiement d'universités et instituts technologiques spécialisés dans chacun des 8 pôles régionaux de développement (agroalimentaire, mines, numérique, halieutique).",
      source: 'Présidence / MESRI'
    }
  },
  {
    ids: ['promise_134'],
    newStatus: 'encours',
    update: {
      date: '2026-09-22',
      text: "Orientation de la politique industrielle et commerciale vers la substitution aux importations : mesures de soutien aux unités industrielles locales de textile, d'agroalimentaire et de pharmacie.",
      source: 'Ministère de l’Industrie et du Commerce'
    }
  },

  // 5. Pêche Maritime & Protection des Eaux Territoriales
  {
    ids: ['promise_40', 'promise_201', 'promise_202'],
    newStatus: 'realise',
    update: {
      date: '2026-08-30',
      text: "Mise à jour et publication continue par le Ministère des Pêches de la liste officielle des navires de pêche autorisés dans les eaux sénégalaises. Intensification de la surveillance conjointe contre le pillage halieutique et sanctuarisation de la zone côtière pour les artisans pêcheurs.",
      source: 'Ministère des Pêches et de l’Économie maritime / APS'
    }
  },

  // 6. Ressources Naturelles : Pétrole, Gaz et Mines
  {
    ids: ['promise_78', 'promise_211'],
    newStatus: 'realise',
    update: {
      date: '2026-09-12',
      text: "Poursuite des travaux de la Commission multidisciplinaire d'examen et d'audit des contrats pétroliers, gaziers et miniers (champs de Sangomar et GTA, concessions minières de l'Est), avec pour objectif la maximisation des revenus fiscaux et le contrôle du contenu local.",
      source: 'Présidence de la République'
    }
  },

  // 7. Transports : Réseau ferroviaire & TER
  {
    ids: ['promise_80', 'promise_206'],
    newStatus: 'encours',
    update: {
      date: '2026-09-29',
      text: "Finalisation des tests techniques et préparation de la mise en service commercial du deuxième tronçon du Train Express Régional (TER) entre Diamniadio et l'Aéroport International Blaise Diagne (AIBD).",
      source: 'Ministère des Transports terrestres / APS (29-09-2026)'
    }
  },

  // 8. Justice, Humanisation carcérale et Droits Humains
  {
    ids: ['promise_10', 'promise_12'],
    newStatus: 'encours',
    update: {
      date: '2026-09-23',
      text: "Décret présidentiel accordant la grâce à 984 condamnés, dont 921 remises totales de peines, pour désengorger les établissements pénitentiaires et favoriser la réinsertion sociale dans le cadre de la politique d'humanisation des prisons.",
      source: 'Présidence de la République / Senego (23-09-2026)'
    }
  },
  {
    ids: ['promise_5', 'promise_7', 'promise_102'],
    newStatus: 'encours',
    update: {
      date: '2026-10-01',
      text: "Finalisation par la commission de suivi des Assises de la Justice des avant-projets de lois réformant la détention provisoire, instaurant le Juge des Libertés et supprimant les retours systématiques de parquet.",
      source: 'Ministère de la Justice / Concertations nationales'
    }
  },
  {
    ids: ['promise_101'],
    newStatus: 'encours',
    update: {
      date: '2026-10-03',
      text: "Ouverture d'informations judiciaires par le parquet pour élucider les violences de 2021-2024, affirmant le principe de justice pour les victimes et amorçant la révision des dispositions répressives du code pénal.",
      source: 'Parquet de Dakar / APS (03-10-2026)'
    }
  },

  // 9. Élevage, Santé Animale et Sécurité Sanitaire
  {
    ids: ['promise_44', 'promise_194', 'promise_46'],
    newStatus: 'encours',
    update: {
      date: '2026-09-29',
      text: "Annonce de la réception imminente du laboratoire moderne de contrôle et d'analyses vétérinaires de Saint-Louis par le Ministère de l'Élevage, renforçant la sécurité sanitaire des aliments d'origine animale et la prophylaxie du bétail.",
      source: 'Ministère de l’Élevage / APS (29-09-2026)'
    }
  },
  {
    ids: ['promise_196'],
    newStatus: 'encours',
    update: {
      date: '2026-09-25',
      text: "Renforcement du partenariat avec la Compagnie Nationale d'Assurance Agricole (CNAAS) pour étendre l'assurance indicielle bétail face aux sécheresses et aléas pastoraux.",
      source: 'Ministère de l’Élevage / CNAAS'
    }
  },

  // 10. Agriculture, Souveraineté Alimentaire et Surveillance
  {
    ids: ['promise_180', 'promise_181', 'promise_36'],
    newStatus: 'encours',
    update: {
      date: '2026-09-29',
      text: "La Direction de la Protection des Végétaux (DPV) déploie un système numérique de veille contre les ravageurs de cultures ; concomitamment, intensification des contrôles douaniers et policiers contre les détournements d'engrais et semences subventionnés.",
      source: 'DPV / Police Nationale / APS (29-09-2026)'
    }
  },
  {
    ids: ['promise_35', 'promise_178'],
    newStatus: 'encours',
    update: {
      date: '2026-09-15',
      text: "Travaux de la Commission consultative foncière pour l'attribution de baux ruraux sécurisés aux coopératives agricoles familiales et gel des spoliations foncières dans les zones agricoles périurbaines.",
      source: 'Ministère de l’Agriculture / Conseil des ministres'
    }
  },

  // 11. Entrepreneuriat des Jeunes et des Femmes (DER/FJ & FONSIS)
  {
    ids: ['promise_31', 'promise_159'],
    newStatus: 'encours',
    update: {
      date: '2026-09-27',
      text: "Nouvelles vagues de financements ciblés de la DER/FJ pour l'autonomisation économique des femmes et jeunes porteurs de projets (ex. Ndiassane, Thiès) et investissement d'un milliard FCFA par WE! Fund (FONSIS) dans des PME locales de production.",
      source: 'DER/FJ / FONSIS / APS'
    }
  },

  // 12. Santé : Couverture Sanitaire, Médicaments & Handicap
  {
    ids: ['promise_50', 'promise_264'],
    newStatus: 'encours',
    update: {
      date: '2026-10-02',
      text: "Audit approfondi de la dette hospitalière de l'Agence de la CMU/CSU et redéfinition des mécanismes de subvention et de tarification sociale pour garantir l'accès universel aux soins d'urgence.",
      source: 'Ministère de la Santé et de l’Action Sociale'
    }
  },
  {
    ids: ['promise_57'],
    newStatus: 'encours',
    update: {
      date: '2026-09-20',
      text: "Accélération du soutien à l'industrie pharmaceutique locale (Institut Pasteur de Dakar, Medis, etc.) et révision des procédures d'homologation par l'Agence sénégalaise de Réglementation Pharmaceutique (ARP).",
      source: 'Ministère de la Santé / ARP'
    }
  },
  {
    ids: ['promise_60', 'promise_236', 'promise_266'],
    newStatus: 'encours',
    update: {
      date: '2026-09-25',
      text: "Décentralisation des commissions de délivrance de la Carte d'Égalité des Chances (CEC) dans les régions pour fluidifier l'accès effectif à la gratuité des soins et à l'appareillage pour les personnes à mobilité réduite.",
      source: 'Ministère de la Famille et des Solidarités'
    }
  },

  // 13. Commerce, Pouvoir d'achat & Prix des Denrées
  {
    ids: ['promise_152'],
    newStatus: 'encours',
    update: {
      date: '2026-09-10',
      text: "Déploiement des brigades de contrôle du Service Régional du Commerce pour veiller au respect des prix plafonnés des denrées de base (riz brisé, huile, sucre, farine, ciment) dans les marchés et boutiques de proximité.",
      source: 'Ministère de l’Industrie et du Commerce'
    }
  },

  // 14. Numérique : New Deal Technologique & Souveraineté des Données
  {
    ids: ['promise_97', 'promise_98'],
    newStatus: 'encours',
    update: {
      date: '2026-09-22',
      text: "Concertations sur la stratégie du 'New Deal Technologique' : révision de la législation sur la protection des données personnelles, renforcement de la Commission des données et projets d'infrastructures cloud souveraines nationales.",
      source: 'Ministère du Numérique / Présidence'
    }
  },

  // 15. Lutte contre la corruption & Institutions
  {
    ids: ['promise_4'],
    newStatus: 'encours',
    update: {
      date: '2026-09-15',
      text: "Finalisation des propositions de modification de la loi organique sur le Conseil Supérieur de la Magistrature (CSM) pour limiter l'intervention du pouvoir exécutif dans les affectations des magistrats du siège.",
      source: 'Ministère de la Justice / Rapport des Assises'
    }
  },
  {
    ids: ['promise_17', 'promise_18'],
    newStatus: 'realise',
    update: {
      date: '2026-10-01',
      text: "Opérationnalisation complète du Pool Judiciaire Financier (PJF) et saisine régulière des juges d'instruction financiers sur les rapports d'audit de l'OFNAC et des corps de contrôle de l'État.",
      source: 'Parquet financier / Presse nationale'
    }
  },
  {
    ids: ['promise_100', 'promise_126'],
    newStatus: 'encours',
    update: {
      date: '2026-09-10',
      text: "Généralisation de la procédure d'appel public à candidatures pour le recrutement des directeurs des établissements publics et poursuite de l'audit biométrique des effectifs de l'administration publique.",
      source: 'Secrétariat Général du Gouvernement'
    }
  },
  {
    ids: ['promise_93'],
    newStatus: 'realise',
    update: {
      date: '2026-09-29',
      text: "Exploitation opérationnelle du nanosatellite GaindéSat-1A par l'Agence Sénégalaise d'Études Spatiales (ASES) pour le suivi environnemental, la gestion de l'eau et la surveillance côtière.",
      source: 'ASES / APS (29-09-2026)'
    }
  },
  {
    ids: ['promise_48', 'promise_49'],
    newStatus: 'encours',
    update: {
      date: '2026-09-28',
      text: "Validation des études actualisées du projet de transfert d'eau des canaux Cayor et Baol et programmation des ouvrages hydrauliques prioritaires dans le budget d'investissement 2027.",
      source: 'Ministère de l’Hydraulique et de l’Assainissement'
    }
  }
];

// Appliquer les mises à jour aux engagements
let promisesModifiedCount = 0;
let newUpdatesAddedCount = 0;
let statusUpgradedCount = 0;

updatesRegistry.forEach(entry => {
  entry.ids.forEach(pId => {
    const promise = promisesData.promises.find(p => p.id === pId);
    if (!promise) {
      console.warn(`Attention: Promesse ${pId} non trouvée`);
      return;
    }

    let modified = false;

    // Mise à jour de statut si spécifié
    if (entry.newStatus && promise.status !== entry.newStatus) {
      // Si c'était 'non-lance' et qu'on passe à 'encours' ou 'realise'
      console.log(`[Statut] ${promise.id} (${promise.domaine}) : ${promise.status} -> ${entry.newStatus}`);
      promise.status = entry.newStatus;
      statusUpgradedCount++;
      modified = true;
    }

    // Ajout de la mise à jour si non déjà présente
    if (entry.update) {
      promise.mises_a_jour = promise.mises_a_jour || [];
      const exists = promise.mises_a_jour.some(u => 
        (u.date === entry.update.date && u.text && u.text.substring(0, 40) === entry.update.text.substring(0, 40)) ||
        (u.text && u.text.includes(entry.update.source))
      );

      if (!exists) {
        promise.mises_a_jour.unshift({
          date: entry.update.date,
          text: entry.update.text,
          description: entry.update.text,
          source: entry.update.source
        });
        newUpdatesAddedCount++;
        modified = true;
      }
    }

    if (modified) promisesModifiedCount++;
  });
});

// Mettre à jour la date de révision globale
promisesData.last_updated = new Date().toISOString();

// Sauvegarder promises.json
fs.writeFileSync(PROMISES_FILE, JSON.stringify(promisesData, null, 2), 'utf8');
console.log(`\n=== PROMISES.JSON MIS À JOUR ===`);
console.log(`- Engagements modifiés : ${promisesModifiedCount}`);
console.log(`- Mises à jour factuelles ajoutées : ${newUpdatesAddedCount}`);
console.log(`- Statuts promus (ex: non-lancé -> en cours/réalisé) : ${statusUpgradedCount}`);

// Mise à jour des brouillons dans drafts.json pour les lier aux promesses
if (draftsData.drafts && Array.isArray(draftsData.drafts)) {
  let draftsLinkedCount = 0;

  const draftMatchers = [
    { regex: /établissement.*privé.*enseignement supérieur.*non reconnu/i, promise_id: 'promise_244', domain: 'Enseignement Supérieur' },
    { regex: /abris provisoires.*daara.*éducation/i, promise_id: 'promise_64', domain: 'Éducation' },
    { regex: /fonds spéciaux.*pastef/i, promise_id: 'promise_140', domain: 'Finances' },
    { regex: /deuxième tronçon du ter/i, promise_id: 'promise_80', domain: 'Transport' },
    { regex: /laboratoire.*vétérinaire.*saint-louis/i, promise_id: 'promise_44', domain: 'Élevage' },
    { regex: /der\/fj.*femmes.*ndiassane/i, promise_id: 'promise_31', domain: 'Entrepreneuriat' },
    { regex: /crimes contre l’humanité.*violences.*2021/i, promise_id: 'promise_101', domain: 'Justice' },
    { regex: /grâce à 984 condamnés/i, promise_id: 'promise_10', domain: 'Justice' },
    { regex: /fonsis.*we! fund/i, promise_id: 'promise_20', domain: 'Économie' },
    { regex: /dpv.*surveillance numérique.*nuisibles/i, promise_id: 'promise_180', domain: 'Agriculture' },
    { regex: /rentrée scolaire.*conseil interministériel/i, promise_id: 'promise_67', domain: 'Éducation' },
    { regex: /diplomatie spatiale.*ases/i, promise_id: 'promise_93', domain: 'Défense' },
    { regex: /conseil des ministres/i, promise_id: 'promise_139', domain: 'Finances' },
  ];

  draftsData.drafts.forEach(d => {
    const text = (d.title + ' ' + (d.description || '')).toLowerCase();
    for (const m of draftMatchers) {
      if (m.regex.test(text)) {
        d.promise_id = m.promise_id;
        d.type = 'promise_update';
        d.confidence = 0.90;
        if (m.domain) d.domain = m.domain;
        draftsLinkedCount++;
        break;
      }
    }
  });

  draftsData.last_updated = new Date().toISOString();
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), 'utf8');
  console.log(`\n=== DRAFTS.JSON MIS À JOUR ===`);
  console.log(`- Brouillons automatiquement reliés à des engagements : ${draftsLinkedCount}`);
}

console.log('\nOpération terminée avec succès.');
