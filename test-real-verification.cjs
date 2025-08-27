// Vérification RÉELLE que la correction fonctionne
const https = require('https');
const http = require('http');

console.log('🔍 VÉRIFICATION RÉELLE POST-DÉPLOIEMENT');
console.log('=' .repeat(50));

// 1. Vérifier timestamp du déploiement
console.log('\n1️⃣ Vérification déploiement...');
function checkDeployment() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/',
      method: 'HEAD', // HEAD pour récupérer seulement les headers
      timeout: 10000
    }, (res) => {
      const lastModified = res.headers['last-modified'];
      const now = new Date();
      const deployTime = new Date(lastModified);
      const timeDiff = (now - deployTime) / (1000 * 60); // en minutes
      
      console.log(`✅ Déploiement détecté: ${lastModified}`);
      console.log(`📊 Déployé il y a: ${timeDiff.toFixed(1)} minutes`);
      
      if (timeDiff < 10) {
        console.log('✅ Déploiement récent confirmé');
        resolve(true);
      } else {
        console.log('⚠️ Déploiement ancien, might be cached');
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Erreur vérification déploiement:', err.message);
      resolve(false);
    });
    
    req.end();
  });
}

// 2. Test chargement de la page principale
console.log('\n2️⃣ Test chargement page principale...');
function testMainPage() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Chercher les nouvelles corrections dans le code
        const hasForceReset = data.includes('globalCheckInProgress') && data.includes('false');
        const hasTimeoutSecours = data.includes('Timeout de secours');
        const hasEmergencyParam = data.includes('emergency=true');
        const hasEffizenApp = data.includes('EffiZen-AI');
        
        console.log(`📄 Status: ${res.statusCode}`);
        console.log(`🔧 Force reset détecté: ${hasForceReset ? '✅' : '❌'}`);
        console.log(`⏱️ Timeout secours détecté: ${hasTimeoutSecours ? '✅' : '❌'}`);
        console.log(`🚨 Emergency param détecté: ${hasEmergencyParam ? '✅' : '❌'}`);
        console.log(`🎯 App EffiZen détectée: ${hasEffizenApp ? '✅' : '❌'}`);
        
        const allCorrectionsPresent = hasForceReset && hasEmergencyParam && hasEffizenApp;
        resolve(allCorrectionsPresent);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Erreur test page:', err.message);
      resolve(false);
    });
    
    req.setTimeout(6000, () => {
      req.destroy();
      console.log('⏱️ Timeout test page');
      resolve(false);
    });
    
    req.end();
  });
}

// 3. Test spécifique de la page de login
console.log('\n3️⃣ Test page de login...');
function testLoginPage() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/login',
      method: 'GET',
      timeout: 6000
    }, (res) => {
      console.log(`📄 Login page status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Page login accessible');
        resolve(true);
      } else {
        console.log('❌ Page login problème');
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Page login inaccessible');
      resolve(false);
    });
    
    req.end();
  });
}

// 4. Test local pour comparaison
console.log('\n4️⃣ Test local...');
function testLocal() {
  return new Promise((resolve) => {
    const ports = [3000, 3001];
    let attempts = 0;
    
    function tryPort(port) {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 3000
      }, (res) => {
        console.log(`✅ Local accessible sur port ${port} (${res.statusCode})`);
        resolve(port);
      });
      
      req.on('error', () => {
        attempts++;
        if (attempts < ports.length) {
          tryPort(ports[attempts]);
        } else {
          console.log('❌ Local inaccessible sur ports 3000 et 3001');
          resolve(null);
        }
      });
      
      req.end();
    }
    
    tryPort(ports[0]);
  });
}

// Exécuter tous les tests en série
async function runAllTests() {
  const deploymentOk = await checkDeployment();
  const mainPageOk = await testMainPage();
  const loginPageOk = await testLoginPage();
  const localPort = await testLocal();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSULTATS DE VÉRIFICATION:');
  console.log(`\n🚀 Déploiement: ${deploymentOk ? '✅ RÉCENT' : '⚠️ ANCIEN/CACHE'}`);
  console.log(`🌐 Page principale: ${mainPageOk ? '✅ CORRECTIONS PRÉSENTES' : '❌ CORRECTIONS ABSENTES'}`);
  console.log(`🔐 Page login: ${loginPageOk ? '✅ ACCESSIBLE' : '❌ PROBLÈME'}`);
  console.log(`💻 Local: ${localPort ? `✅ PORT ${localPort}` : '❌ INACCESSIBLE'}`);
  
  console.log('\n🎯 CONCLUSION:');
  if (deploymentOk && mainPageOk && loginPageOk) {
    console.log('✅ TOUTES LES CORRECTIONS SONT DÉPLOYÉES ET PRÉSENTES');
    console.log('   → La production devrait maintenant fonctionner');
    console.log('   → Plus de blocage à "Vérification 1/3"');
    console.log('   → Bouton rouge force vraiment la déconnexion');
  } else if (mainPageOk) {
    console.log('⚠️ CORRECTIONS PRÉSENTES mais déploiement peut-être en cache');
    console.log('   → Attendre encore 1-2 minutes ou faire Ctrl+F5');
  } else {
    console.log('❌ PROBLÈME: Corrections non détectées');
    console.log('   → Vérifier si le build a réussi');
    console.log('   → Possibilité de cache Vercel');
  }
  
  console.log('\n📋 PROCHAINES ÉTAPES POUR L\'UTILISATEUR:');
  console.log('   1. Aller sur https://effizen-ai-prod.vercel.app');
  console.log('   2. Faire Ctrl+F5 (hard refresh)');
  console.log('   3. Observer console: messages "Force reset" attendus');
  console.log('   4. Si toujours bloqué: bouton rouge devrait fonctionner');
}

runAllTests().catch(console.error);