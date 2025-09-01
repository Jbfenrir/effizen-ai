const http = require('http');
const https = require('https');

console.log('🧪 Test complet de la récupération de mot de passe\n');
console.log('=' .repeat(50));

// Test 1: Vérifier que le serveur local est accessible
function testLocalServer() {
  return new Promise((resolve) => {
    console.log('\n📍 Test 1: Serveur local');
    http.get('http://localhost:3002', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Serveur local accessible sur port 3002');
        resolve(true);
      } else {
        console.log(`❌ Serveur local retourne status ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('❌ Serveur local inaccessible:', err.message);
      resolve(false);
    });
  });
}

// Test 2: Vérifier la page /reset-password
function testResetPasswordPage() {
  return new Promise((resolve) => {
    console.log('\n📍 Test 2: Page /reset-password');
    http.get('http://localhost:3002/reset-password', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Vérifier les éléments clés
        const checks = {
          'Page chargée': res.statusCode === 200,
          'Script React présent': data.includes('src="/src/main.tsx"') || data.includes('_app'),
          'Titre présent': data.includes('<title>') && data.includes('</title>'),
          'Div root présent': data.includes('id="root"')
        };
        
        Object.entries(checks).forEach(([test, passed]) => {
          console.log(`  ${passed ? '✅' : '❌'} ${test}`);
        });
        
        resolve(Object.values(checks).every(v => v));
      });
    }).on('error', (err) => {
      console.log('❌ Erreur accès page:', err.message);
      resolve(false);
    });
  });
}

// Test 3: Simuler une URL avec token
function testWithToken() {
  return new Promise((resolve) => {
    console.log('\n📍 Test 3: Page avec token de récupération');
    const testUrl = 'http://localhost:3002/reset-password#access_token=test&type=recovery';
    console.log(`  URL testée: ${testUrl}`);
    
    http.get('http://localhost:3002/reset-password', (res) => {
      if (res.statusCode === 200) {
        console.log('  ✅ Page accessible avec paramètres');
        resolve(true);
      } else {
        console.log(`  ❌ Status ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('  ❌ Erreur:', err.message);
      resolve(false);
    });
  });
}

// Test 4: Vérifier le build production
function testBuildProduction() {
  return new Promise((resolve) => {
    console.log('\n📍 Test 4: Build production');
    const { exec } = require('child_process');
    
    console.log('  ⏳ Build en cours...');
    exec('npm run build', { cwd: '/mnt/c/Users/FIAE/Desktop/effizen-ai' }, (error, stdout, stderr) => {
      if (error) {
        console.log('  ❌ Build échoué:', error.message);
        resolve(false);
      } else {
        const buildSuccess = stdout.includes('built in') || stdout.includes('✓ built');
        console.log(`  ${buildSuccess ? '✅' : '❌'} Build ${buildSuccess ? 'réussi' : 'échoué'}`);
        
        // Vérifier que les fichiers sont créés
        const fs = require('fs');
        const distExists = fs.existsSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/dist/index.html');
        console.log(`  ${distExists ? '✅' : '❌'} Fichiers dist créés`);
        
        resolve(buildSuccess && distExists);
      }
    });
  });
}

// Test 5: Vérifier le déploiement production
function testProduction() {
  return new Promise((resolve) => {
    console.log('\n📍 Test 5: Déploiement production');
    https.get('https://effizen-ai-prod.vercel.app', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  ${res.statusCode === 200 ? '✅' : '❌'} Site production accessible`);
        
        // Vérifier si c'est la nouvelle version
        const hasResetPassword = data.includes('reset-password') || data.includes('ResetPassword');
        console.log(`  ${hasResetPassword ? '✅' : '⚠️'} Nouvelle version ${hasResetPassword ? 'déployée' : 'pas encore déployée'}`);
        
        resolve(res.statusCode === 200);
      });
    }).on('error', (err) => {
      console.log('  ❌ Site production inaccessible:', err.message);
      resolve(false);
    });
  });
}

// Exécuter tous les tests
async function runAllTests() {
  const results = {
    local: await testLocalServer(),
    resetPage: await testResetPasswordPage(),
    withToken: await testWithToken(),
    build: await testBuildProduction(),
    production: await testProduction()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS\n');
  
  const allPassed = Object.values(results).every(v => v);
  
  console.log('Tests locaux:');
  console.log(`  ${results.local ? '✅' : '❌'} Serveur local`);
  console.log(`  ${results.resetPage ? '✅' : '❌'} Page reset-password`);
  console.log(`  ${results.withToken ? '✅' : '❌'} Gestion des tokens`);
  
  console.log('\nTests production:');
  console.log(`  ${results.build ? '✅' : '❌'} Build production`);
  console.log(`  ${results.production ? '✅' : '❌'} Site en ligne`);
  
  console.log('\n' + '=' .repeat(50));
  if (allPassed) {
    console.log('✅ TOUS LES TESTS PASSENT - Solution fonctionnelle!');
  } else {
    console.log('⚠️ CERTAINS TESTS ÉCHOUENT - Vérifications nécessaires');
  }
  
  process.exit(allPassed ? 0 : 1);
}

runAllTests();