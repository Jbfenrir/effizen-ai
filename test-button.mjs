// Test pour vérifier si le bouton est dans le code JavaScript compilé
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chercher dans les fichiers source
const srcFiles = [
  'src/AppRouter.tsx',
  'src/hooks/useAuthSimple.ts',
  'src/utils/debug-state.ts'
];

console.log('🔍 Recherche du bouton "Forcer la connexion" dans les sources...\n');

srcFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasButton = content.includes('Forcer la connexion');
    const hasEmergency = content.includes('urgence');
    const hasBlocked = content.includes('Bloqué sur cette page');
    
    console.log(`📄 ${file}:`);
    console.log(`  - "Forcer la connexion": ${hasButton ? '✅' : '❌'}`);
    console.log(`  - "urgence": ${hasEmergency ? '✅' : '❌'}`);
    console.log(`  - "Bloqué sur cette page": ${hasBlocked ? '✅' : '❌'}`);
    
    if (hasButton) {
      // Trouver et afficher le contexte
      const lines = content.split('\n');
      const buttonLine = lines.findIndex(line => line.includes('Forcer la connexion'));
      if (buttonLine !== -1) {
        console.log(`  📍 Ligne ${buttonLine + 1}`);
        console.log(`  Contexte:`);
        for (let i = Math.max(0, buttonLine - 2); i <= Math.min(lines.length - 1, buttonLine + 2); i++) {
          console.log(`    ${i + 1}: ${lines[i].substring(0, 80)}`);
        }
      }
    }
    console.log('');
  } catch (err) {
    console.log(`  ❌ Erreur: ${err.message}\n`);
  }
});

// Vérifier si le build existe
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('📦 Dossier dist/ trouvé. Recherche dans les fichiers compilés...\n');
  const distFiles = fs.readdirSync(path.join(distPath, 'assets')).filter(f => f.endsWith('.js'));
  
  distFiles.forEach(file => {
    const content = fs.readFileSync(path.join(distPath, 'assets', file), 'utf8');
    if (content.includes('Forcer la connexion')) {
      console.log(`  ✅ Trouvé dans dist/assets/${file}`);
    }
  });
} else {
  console.log('⚠️ Dossier dist/ non trouvé. Exécutez "npm run build" pour créer la version de production.\n');
}

console.log('\n📊 Résumé: Le bouton d\'urgence est-il présent dans le code ?');
const appRouterPath = path.join(__dirname, 'src/AppRouter.tsx');
const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
if (appRouterContent.includes('Forcer la connexion')) {
  console.log('✅ OUI - Le bouton est dans AppRouter.tsx et devrait apparaître en cas de chargement infini');
} else {
  console.log('❌ NON - Le bouton n\'est pas dans le code');
}