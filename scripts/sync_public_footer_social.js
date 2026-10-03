const fs = require('fs');

const socialSnippet = `<div class="footer-social">
                    <a href="https://facebook.com/projetbi.org" target="_blank" rel="noopener noreferrer" class="social-btn" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://x.com/ProjetBI" target="_blank" rel="noopener noreferrer" class="social-btn" title="Twitter/X"><i class="fab fa-x-twitter"></i></a>
                    <a href="https://whatsapp.com/channel/0029Vb7vProjetBI" target="_blank" rel="noopener noreferrer" class="social-btn" title="Canal WhatsApp"><i class="fab fa-whatsapp"></i></a>
                    <a href="https://youtube.com/@ProjetBI" target="_blank" rel="noopener noreferrer" class="social-btn" title="YouTube"><i class="fab fa-youtube"></i></a>
                    <a href="https://t.me/projetbi_officiel" target="_blank" rel="noopener noreferrer" class="social-btn" title="Telegram"><i class="fab fa-telegram"></i></a>
                </div>`;

const oldSnippetRegex = /<div class="footer-social">[\s\S]*?<\/div>/;

['index.html', 'actualites.html', 'ideologie.html'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  if (oldSnippetRegex.test(c)) {
    c = c.replace(oldSnippetRegex, socialSnippet);
    fs.writeFileSync(file, c, 'utf8');
    console.log(`Updated footer social links in ${file}`);
  }
});
