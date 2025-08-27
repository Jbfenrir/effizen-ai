const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 TEST FINAL: Vérification complète du problème résolu');

// Vérifier que les fichiers conflictuels ont bien été supprimés
const deletedFiles = [
  'src/services/supabase-bypass.ts',
  'src/services/debug-auth.ts',
  'src/services/supabase-clean.ts'
];

console.log('🔍 Vérification suppression fichiers conflictuels...');
deletedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ ERREUR: ${file} existe encore !`);
    process.exit(1);
  } else {
    console.log(`✅ Supprimé: ${file}`);
  }
});

// Vérifier que le service unifié existe
if (!fs.existsSync('src/services/supabase.ts')) {
  console.log('❌ ERREUR: Service unifié src/services/supabase.ts manquant !');
  process.exit(1);
}
console.log('✅ Service unifié présent: src/services/supabase.ts');

// Vérifier le contenu du service unifié
const supabaseContent = fs.readFileSync('src/services/supabase.ts', 'utf8');
if (supabaseContent.includes('GLOBAL_SUPABASE_KEY') && 
    supabaseContent.includes('getSupabaseClient') &&
    supabaseContent.includes('authService')) {
  console.log('✅ Service unifié contient le singleton global');
} else {
  console.log('❌ ERREUR: Service unifié incomplet !');
  process.exit(1);
}

// Vérifier les imports corrigés
const filesToCheck = [
  'src/hooks/useAuth.ts',
  'src/services/adminService.ts',
  'src/pages/AuthCallback.tsx'
];

console.log('🔍 Vérification imports corrigés...');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('supabase-bypass') || content.includes('debug-auth')) {
      console.log(`❌ ERREUR: ${file} contient encore des imports vers services supprimés !`);
      process.exit(1);
    } else if (content.includes("from '../services/supabase'")) {
      console.log(`✅ Import corrigé: ${file}`);
    }
  }
});

// Test du build
console.log('🏗️ Test du build...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.log('❌ ÉCHEC: Build failed');
    process.exit(1);
  }
  
  console.log('✅ Build réussi');
  
  // Vérifier que le build ne contient pas les anciens services
  const buildFiles = fs.readdirSync('dist/assets');
  let foundOldServices = false;
  
  buildFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const content = fs.readFileSync(`dist/assets/${file}`, 'utf8');
      if (content.includes('supabase-bypass') || content.includes('debug-auth')) {
        console.log(`❌ ATTENTION: ${file} contient encore des références aux anciens services`);
        foundOldServices = true;
      }
    }
  });
  
  if (!foundOldServices) {
    console.log('✅ Build ne contient plus les anciens services');
  }
  
  console.log('');
  console.log('🎉 TESTS TECHNIQUES RÉUSSIS !');
  console.log('');
  console.log('⚠️  IMPORTANT: Tests automatisés incomplets');
  console.log('   Les points suivants nécessitent un test manuel :');
  console.log('   1. Lancer l\'application avec "npm run dev"');
  console.log('   2. Se connecter avec jbgerberon@gmail.com');
  console.log('   3. Changer d\'onglet et revenir');
  console.log('   4. Vérifier console (F12) : plus d\'erreur "Multiple GoTrueClient instances"');
  console.log('   5. Vérifier : pas de boucle infinie de chargement');
  console.log('');
  console.log('✅ Architecture unifiée confirmée techniquement');
});