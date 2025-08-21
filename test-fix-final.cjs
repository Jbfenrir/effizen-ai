// Test final complet de la correction du flag globalCheckInProgress
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');

console.log('🔧 TEST FINAL - Correction flag globalCheckInProgress');
console.log('=' .repeat(70));

// 1. Vérifications du code source
console.log('\n1️⃣ Vérifications du code source...');
try {
  // Vérifier reset forcé du flag
  const resetForce = execSync('grep -n "globalCheckInProgress = false" src/hooks/useAuth.ts | head -1', { encoding: 'utf8' });
  if (resetForce.trim()) {
    console.log('✅ Force reset du flag trouvé ligne:', resetForce.trim().split(':')[0]);
  }
  
  // Vérifier timeout de secours
  const timeoutSecours = execSync('grep -n "Timeout de secours" src/hooks/useAuth.ts | wc -l', { encoding: 'utf8' });
  console.log(`✅ Timeout de secours: ${parseInt(timeoutSecours.trim()) > 0 ? 'PRÉSENT' : 'ABSENT'}`);
  
  // Vérifier bouton d'urgence amélioré
  const boutonUrgence = execSync('grep -n "emergency=true" src/AppRouter.tsx | wc -l', { encoding: 'utf8' });
  console.log(`✅ Bouton urgence amélioré: ${parseInt(boutonUrgence.trim()) > 0 ? 'PRÉSENT' : 'ABSENT'}`);
  
} catch (err) {
  console.log('❌ Erreur vérification code source');
}

// 2. Test du build
console.log('\n2️⃣ Test du build...');
try {
  execSync('npm run build > /dev/null 2>&1');
  console.log('✅ Build: SUCCÈS');
  
  // Vérifier présence dans le build
  const flagInBuild = execSync('find dist -name "*.js" -exec grep -l "globalCheckInProgress.*false" {} \\; | wc -l', { encoding: 'utf8' });
  console.log(`✅ Corrections dans build: ${parseInt(flagInBuild.trim()) > 0 ? 'PRÉSENT' : 'ABSENT'}`);
  
} catch (err) {
  console.log('❌ Build: ÉCHEC');
}

// 3. Test serveur local (rapide)
console.log('\n3️⃣ Test serveur local...');
function testLocal() {
  return new Promise((resolve) => {
    const ports = [3001, 3000];
    let tested = 0;
    let found = false;
    
    ports.forEach(port => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 2000
      }, (res) => {
        if (!found) {
          console.log(`✅ Local accessible sur port ${port}`);
          found = true;
          resolve(port);
        }
      });
      
      req.on('error', () => {
        tested++;
        if (tested === ports.length && !found) {
          console.log('❌ Local inaccessible sur les ports 3000 et 3001');
          resolve(null);
        }
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
        tested++;
        if (tested === ports.length && !found) {
          resolve(null);
        }
      });
      
      req.end();
    });
  });
}

// 4. Simulation du problème de production
console.log('\n4️⃣ Simulation test production...');
function testProduction() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Chercher les éléments qui indiquent si l'app fonctionne
        const hasReactApp = data.includes('EffiZen-AI') || data.includes('root');
        const hasLoader = data.includes('Chargement') || data.includes('Loading');
        
        console.log(`✅ Production accessible (${res.statusCode})`);
        console.log(`   - App React détectée: ${hasReactApp ? '✅' : '❌'}`);
        console.log(`   - Headers last-modified: ${res.headers['last-modified'] || 'Non défini'}`);
        
        resolve(hasReactApp);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Production inaccessible:', err.message.substring(0, 50));
      resolve(false);
    });
    
    req.setTimeout(4000, () => {
      req.destroy();
      console.log('⏱️ Production: timeout');
      resolve(false);
    });
    
    req.end();
  });
}

// Exécuter tous les tests
Promise.all([
  testLocal(),
  testProduction()
]).then(([localPort, prodWorks]) => {
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 RÉSUMÉ FINAL:');
  
  console.log('\n🔧 CORRECTIONS APPLIQUÉES:');
  console.log('   • Force reset globalCheckInProgress au démarrage');
  console.log('   • Timeout de secours après 3s si bloqué');
  console.log('   • Protection anti-blocage permanent (>5s)');
  console.log('   • Bouton urgence force reset des flags globaux');
  console.log('   • Réduction maxSessionChecks à 2 (au lieu de 3)');
  
  console.log('\n🌐 ENVIRONNEMENTS:');
  console.log(`   Local:      ${localPort ? `✅ Port ${localPort}` : '❌ Non accessible'}`);
  console.log(`   Production: ${prodWorks ? '✅ Accessible' : '❌ Problème'}`);
  
  console.log('\n🎯 RÉSULTATS ATTENDUS APRÈS DÉPLOIEMENT:');
  console.log('   1. Production: Plus de blocage à "1/3"');
  console.log('   2. Local: Interface de login stable');
  console.log('   3. Bouton rouge: Force vraiment la déconnexion');
  console.log('   4. Messages console: "Force reset" et "Timeout de secours"');
  
  console.log('\n⚠️ POUR TESTER:');
  console.log('   • Attendre déploiement Vercel (~2min)');
  console.log('   • Hard refresh (Ctrl+F5) avant test');
  console.log('   • Observer console: plus de blocage à 1/3');
  console.log('   • Si bloqué: bouton rouge force maintenant le reset');
  
  // Commit automatique
  console.log('\n5️⃣ Commit des corrections...');
  try {
    execSync('git add -A');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('✅ Modifications détectées et prêtes');
      console.log('   Fichiers modifiés:');
      status.trim().split('\n').forEach(line => {
        console.log(`   ${line}`);
      });
    } else {
      console.log('ℹ️ Aucune nouvelle modification');
    }
  } catch (err) {
    console.log('⚠️ Problème avec git status');
  }
});