const { execSync } = require('child_process');
const path = require('path');

console.log('=== DÉBUT DE LA COMPILATION SEO COMPLÈTE ===');

try {
  console.log('\n1. Génération des pages d\'engagements...');
  execSync('node scripts/generate_engagement_pages.js', { stdio: 'inherit' });

  console.log('\n2. Génération des pages d\'actualité...');
  execSync('node scripts/generate_news_pages.js', { stdio: 'inherit' });

  console.log('\n3. Génération du flux RSS...');
  execSync('node scripts/generate_rss_feed.js', { stdio: 'inherit' });

  console.log('\n✅ COMPILATION SEO TERMINÉE AVEC SUCCÈS !');
} catch (err) {
  console.error('Erreur lors de la compilation SEO:', err.message);
  process.exit(1);
}
