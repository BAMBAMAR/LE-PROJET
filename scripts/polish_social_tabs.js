const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

// Replace tab labels to be concise and fit beautifully
admin = admin.replace(
  '<button class="social-tab-btn active" id="stb-profiles" onclick="switchSocialTab(\'profiles\')">\r\n          <i class="fas fa-id-card"></i> 1. Profils & Liens Officiels\r\n        </button>',
  '<button class="social-tab-btn active" id="stb-profiles" onclick="switchSocialTab(\'profiles\')"><i class="fas fa-id-card"></i> 1. Profils Officiels</button>'
);
admin = admin.replace(
  '<button class="social-tab-btn" id="stb-metadata" onclick="switchSocialTab(\'metadata\')">\r\n          <i class="fas fa-tags"></i> 2. Méta-données Open Graph & X Cards\r\n        </button>',
  '<button class="social-tab-btn" id="stb-metadata" onclick="switchSocialTab(\'metadata\')"><i class="fas fa-tags"></i> 2. Méta Open Graph & X</button>'
);
admin = admin.replace(
  '<button class="social-tab-btn" id="stb-simulator" onclick="switchSocialTab(\'simulator\')">\r\n          <i class="fas fa-eye"></i> 3. Simulateur en Direct (X, FB, WhatsApp)\r\n        </button>',
  '<button class="social-tab-btn" id="stb-simulator" onclick="switchSocialTab(\'simulator\')"><i class="fas fa-eye"></i> 3. Simulateur Live</button>'
);
admin = admin.replace(
  '<button class="social-tab-btn" id="stb-generator" onclick="switchSocialTab(\'generator\')">\r\n          <i class="fas fa-bullhorn"></i> 4. Générateur de Posts & Templates\r\n        </button>',
  '<button class="social-tab-btn" id="stb-generator" onclick="switchSocialTab(\'generator\')"><i class="fas fa-bullhorn"></i> 4. Générateur de Posts</button>'
);
admin = admin.replace(
  '<button class="social-tab-btn" id="stb-public" onclick="switchSocialTab(\'public\')">\r\n          <i class="fas fa-globe"></i> 5. Intégration sur le Site Public\r\n        </button>',
  '<button class="social-tab-btn" id="stb-public" onclick="switchSocialTab(\'public\')"><i class="fas fa-globe"></i> 5. Intégration Site Public</button>'
);

// Also refine CSS to make tabs flex-wrap nicely or fit on one line
admin = admin.replace(
  '.social-tabs {\r\n  display: flex;\r\n  gap: .5rem;\r\n  border-bottom: 1px solid var(--border);\r\n  padding-bottom: .75rem;\r\n  margin-bottom: 1.25rem;\r\n  overflow-x: auto;\r\n}',
  '.social-tabs {\r\n  display: flex;\r\n  gap: .5rem;\r\n  border-bottom: 1px solid var(--border);\r\n  padding-bottom: .75rem;\r\n  margin-bottom: 1.25rem;\r\n  flex-wrap: wrap;\r\n}'
);

fs.writeFileSync('admin.html', admin, 'utf8');
console.log('Tab labels and layout polished!');
