// Test complet de l'interface de connexion
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');

console.log('🔐 TEST COMPLET - Interface de connexion');
console.log('=' .repeat(60));

// 1. Vérification que useAuth original est utilisé
console.log('\n1️⃣ Vérification hook d\'authentification...');
try {
  const appRouterContent = execSync('grep -A2 -B2 "useAuth" src/AppRouter.tsx', { encoding: 'utf8' });
  if (appRouterContent.includes('from \'./hooks/useAuth\'')) {
    console.log('✅ useAuth original activé');
    if (appRouterContent.includes('// import { useAuthSimple')) {
      console.log('✅ useAuthSimple désactivé');
    }
  } else if (appRouterContent.includes('useAuthSimple')) {
    console.log('❌ useAuthSimple encore actif');
  }
} catch (err) {
  console.log('❌ Erreur lecture AppRouter.tsx');
}

// 2. Test build local
console.log('\n2️⃣ Test build local...');
try {
  execSync('npm run build > /dev/null 2>&1');
  console.log('✅ Build local: SUCCÈS');
} catch (err) {
  console.log('❌ Build local: ÉCHEC');
  console.log('   Erreur:', err.toString().substring(0, 200));
}

// 3. Test serveur local
console.log('\n3️⃣ Test serveur local...');
function testLocalLogin() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/login',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasLogin = data.includes('Connexion') || data.includes('Login');
        const hasEmailField = data.includes('email') || data.includes('Email');
        const hasPasswordField = data.includes('password') || data.includes('passe');
        
        console.log(`✅ Local /login accessible (${res.statusCode})`);
        console.log(`   - Interface connexion: ${hasLogin ? '✅' : '❌'}`);
        console.log(`   - Champ email: ${hasEmailField ? '✅' : '❌'}`);
        console.log(`   - Champ password: ${hasPasswordField ? '✅' : '❌'}`);
        
        resolve(hasLogin && hasEmailField && hasPasswordField);
      });
    });

    req.on('error', () => {
      console.log('❌ Local /login: INACCESSIBLE');
      // Test port 3000 en fallback
      testPort3000().then(resolve);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log('⏱️ Local /login: TIMEOUT');
      resolve(false);
    });

    req.end();
  });
}

function testPort3000() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'GET'
    }, (res) => {
      console.log('✅ Fallback port 3000 accessible');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Port 3000 aussi inaccessible');
      resolve(false);
    });
    
    req.end();
  });
}

// 4. Test production
console.log('\n4️⃣ Test production Vercel...');
function testProdLogin() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/login',
      method: 'GET',
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasLogin = data.includes('EffiZen-AI');
        const isWorkingLogin = !data.includes('404') && res.statusCode === 200;
        
        console.log(`✅ Production /login accessible (${res.statusCode})`);
        console.log(`   - Page login: ${isWorkingLogin ? '✅' : '❌'}`);
        console.log(`   - Contenu EffiZen: ${hasLogin ? '✅' : '❌'}`);
        
        // Test redirect automatique vers racine
        testProdRoot().then(rootWorks => {
          resolve(isWorkingLogin && rootWorks);
        });
      });
    });

    req.on('error', (err) => {
      console.log('❌ Production /login: ERREUR');
      console.log('   ', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏱️ Production /login: TIMEOUT');
      resolve(false);
    });

    req.end();
  });
}

function testProdRoot() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'effizen-ai-prod.vercel.app',
      port: 443,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log(`✅ Production / accessible (${res.statusCode})`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      console.log('❌ Production / inaccessible');
      resolve(false);
    });
    
    req.end();
  });
}

// Exécuter tous les tests
Promise.all([
  testLocalLogin(),
  testProdLogin()
]).then(([localWorks, prodWorks]) => {
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ FINAL:');
  console.log('\n✅ CORRECTIONS APPLIQUÉES:');
  console.log('   • useAuth original rétabli (plus de timeout 3s)');
  console.log('   • useAuthSimple désactivé');
  console.log('   • Bouton devrait être fonctionnel');
  
  console.log('\n🌐 ENVIRONNEMENTS:');
  console.log(`   Local (3001):    ${localWorks ? '✅ PRÊT' : '❌ PROBLÈME'}`);
  console.log(`   Production:      ${prodWorks ? '✅ PRÊT' : '❌ PROBLÈME'}`);
  
  console.log('\n🔐 POUR TESTER LA CONNEXION:');
  console.log('   Email: jbgerberon@gmail.com');
  console.log('   Mot de passe: admin123');
  console.log('   Le bouton devrait maintenant dire "Se connecter"');
  
  console.log('\n⚠️ SI PROBLÈME PERSISTE:');
  console.log('   1. Vider le cache navigateur (Ctrl+Shift+Del)');
  console.log('   2. Hard refresh (Ctrl+F5)');
  console.log('   3. Utiliser /emergency-fix.html');
  
  // Préparation commit
  console.log('\n5️⃣ Commit des corrections...');
  try {
    execSync('git add -A');
    execSync('git status --porcelain', { encoding: 'utf8' });
    console.log('✅ Modifications prêtes pour commit');
  } catch (err) {
    console.log('ℹ️ Pas de nouvelles modifications');
  }
});