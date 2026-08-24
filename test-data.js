// DONNÉES DE TEST POUR ACTUALITÉS
// Ajouter ce script APRÈS app.js dans index.html

// Attendre que la page soit chargée
document.addEventListener('DOMContentLoaded', function() {
    console.log('📰 Chargement des données de test pour actualités...');
    
    // Vérifier si CONFIG existe
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CONFIG n\'existe pas');
        return;
    }
    
    // Ajouter des actualités de test si CONFIG.news est vide
    if (!CONFIG.news || CONFIG.news.length === 0) {
        console.log('📝 Ajout d\'actualités de test...');
        
        CONFIG.news = [
            {
                id: 'news1',
                title: 'Lancement du programme de gratuité scolaire',
                excerpt: 'Le gouvernement sénégalais a annoncé le lancement d\'un programme ambitieux visant à garantir la gratuité de l\'enseignement pour tous les élèves du primaire et du secondaire. Cette mesure phare s\'inscrit dans le cadre des engagements présidentiels et vise à assurer l\'accès à l\'éducation pour tous les enfants sans distinction. Les fournitures scolaires seront distribuées gratuitement dès la prochaine rentrée dans toutes les écoles publiques du pays. Le ministre de l\'Éducation nationale a précisé que ce programme concerne plus de 3 millions d\'élèves à travers tout le territoire national et représente un investissement de plusieurs milliards de francs CFA.',
                content: 'Le gouvernement sénégalais a annoncé le lancement d\'un programme ambitieux visant à garantir la gratuité de l\'enseignement pour tous les élèves du primaire et du secondaire. Cette mesure phare s\'inscrit dans le cadre des engagements présidentiels et vise à assurer l\'accès à l\'éducation pour tous les enfants sans distinction. Les fournitures scolaires seront distribuées gratuitement dès la prochaine rentrée dans toutes les écoles publiques du pays.\n\nLe ministre de l\'Éducation nationale a précisé que ce programme concerne plus de 3 millions d\'élèves à travers tout le territoire national. Des centres de distribution ont été mis en place dans chaque département pour faciliter l\'accès aux fournitures. Cette initiative représente un investissement majeur de plusieurs milliards de francs CFA et démontre la volonté du gouvernement de placer l\'éducation au cœur de ses priorités.\n\nLes syndicats d\'enseignants ont salué cette décision qu\'ils qualifient d\'historique pour le système éducatif sénégalais.',
                date: '05/02/2026',
                source: 'Ministère de l\'Éducation',
                image: 'school'
            },
            {
                id: 'news2',
                title: 'Augmentation du budget de la santé',
                excerpt: 'Le budget alloué à la santé publique connaît une augmentation significative de 39%, passant de 180 à 250 milliards de FCFA. Cette décision vise à améliorer la qualité des soins dans les hôpitaux et centres de santé à travers le pays. De nouveaux équipements médicaux modernes seront acquis et le personnel soignant bénéficiera de formations continues pour mieux servir les populations. Le gouvernement prévoit également le recrutement de 2000 nouveaux personnels de santé et la construction de 50 postes de santé dans les zones rurales les plus reculées du pays.',
                content: 'Le budget alloué à la santé publique connaît une augmentation significative de 39%, passant de 180 à 250 milliards de FCFA. Cette décision vise à améliorer la qualité des soins dans les hôpitaux et centres de santé à travers le pays.\n\nDe nouveaux équipements médicaux modernes seront acquis et le personnel soignant bénéficiera de formations continues pour mieux servir les populations. Le gouvernement prévoit également le recrutement de 2000 nouveaux personnels de santé et la construction de 50 postes de santé dans les zones rurales les plus reculées du pays.\n\nCette enveloppe permettra notamment d\'équiper 15 hôpitaux régionaux en matériel de pointe. La ministre de la Santé a souligné que cette mesure s\'inscrit dans la volonté du gouvernement de garantir l\'accès aux soins de santé de qualité pour tous les Sénégalais, conformément aux engagements du Projet pour un Sénégal Souverain, Juste et Prospère.',
                date: '04/02/2026',
                source: 'Ministère de la Santé',
                image: 'health'
            },
            {
                id: 'news3',
                title: 'Actualité courte',
                excerpt: 'Ceci est un exemple d\'actualité courte qui ne dépassera pas les 70 mots et n\'affichera donc pas de bouton "Lire la suite".',
                content: 'Ceci est un exemple d\'actualité courte qui ne dépassera pas les 70 mots et n\'affichera donc pas de bouton "Lire la suite".',
                date: '03/02/2026',
                source: 'Test',
                image: 'flag'
            }
        ];
        
        console.log('✅ ' + CONFIG.news.length + ' actualités ajoutées');
        
        // Re-rendre les actualités
        if (typeof renderNews === 'function') {
            renderNews(CONFIG.news);
            console.log('✅ Actualités affichées');
        } else {
            console.error('❌ La fonction renderNews n\'existe pas');
        }
    } else {
        console.log('✅ CONFIG.news contient déjà ' + CONFIG.news.length + ' actualités');
    }
    
    // Vérifier que les fonctions sont bien définies
    console.log('🔍 Vérification des fonctions:');
    console.log('  - openArticleModal:', typeof openArticleModal);
    console.log('  - closeArticleModal:', typeof closeArticleModal);
    console.log('  - showAllRatings:', typeof showAllRatings);
    console.log('  - closeRatingsModal:', typeof closeRatingsModal);
    console.log('  - shareToPlatform:', typeof shareToPlatform);
    console.log('  - renderNews:', typeof renderNews);
    
    // Vérifier que les modals existent
    console.log('🔍 Vérification des modals:');
    console.log('  - articleModal:', document.getElementById('articleModal') ? '✅ Présent' : '❌ Manquant');
    console.log('  - ratingsListModal:', document.getElementById('ratingsListModal') ? '✅ Présent' : '❌ Manquant');
    
    // Vérifier que les styles sont chargés
    console.log('🔍 Vérification des styles:');
    const testBtn = document.querySelector('.read-more-btn');
    if (testBtn) {
        const styles = window.getComputedStyle(testBtn);
        console.log('  - .read-more-btn background:', styles.background.includes('gradient') ? '✅ OK' : '❌ Manquant');
    }
    
    console.log('✅ Initialisation terminée');
});
