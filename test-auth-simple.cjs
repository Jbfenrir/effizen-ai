const http = require('http');

// Configuration
const APP_URL = 'http://localhost:3000';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Faire une requête HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

// Test principal
async function testAuth() {
  log('\n========================================', 'cyan');
  log('🧪 TEST SIMPLE - VÉRIFICATION AUTH', 'cyan');
  log('========================================\n', 'cyan');

  try {
    // 1. Vérifier que le serveur répond
    log('1️⃣  Test de connexion au serveur...', 'blue');
    const response = await makeRequest(APP_URL);
    
    if (response.statusCode === 200 || response.statusCode === 304) {
      log('✅ Serveur accessible (code: ' + response.statusCode + ')', 'green');
    } else {
      log('❌ Serveur inaccessible (code: ' + response.statusCode + ')', 'red');
      return;
    }

    // 2. Analyser le HTML retourné
    log('\n2️⃣  Analyse de la réponse HTML...', 'blue');
    
    const hasLoadingSpinner = response.body.includes('Chargement...');
    const hasForceButton = response.body.includes('Forcer la connexion');
    const hasLoginForm = response.body.includes('type="email"') || response.body.includes('Se connecter');
    const hasReactRoot = response.body.includes('id="root"');
    const hasViteScript = response.body.includes('/@vite/client');
    
    log(`   React root présent: ${hasReactRoot ? '✅ Oui' : '❌ Non'}`, hasReactRoot ? 'green' : 'red');
    log(`   Scripts Vite chargés: ${hasViteScript ? '✅ Oui' : '❌ Non'}`, hasViteScript ? 'green' : 'red');
    log(`   Texte "Chargement...": ${hasLoadingSpinner ? '⚠️  Présent' : '✅ Absent'}`, hasLoadingSpinner ? 'yellow' : 'green');
    log(`   Bouton forcer connexion: ${hasForceButton ? '⚠️  Présent' : '✅ Absent'}`, hasForceButton ? 'yellow' : 'green');
    log(`   Formulaire login: ${hasLoginForm ? '✅ Présent' : '❓ Non détecté'}`, hasLoginForm ? 'green' : 'yellow');

    // 3. Vérifier les fichiers JS principaux
    log('\n3️⃣  Vérification des modules JS...', 'blue');
    
    // Extraire l'URL du module principal
    const moduleMatch = response.body.match(/src="(\/src\/main\.tsx[^"]*)"/);
    if (moduleMatch) {
      const moduleUrl = `${APP_URL}${moduleMatch[1]}`;
      log(`   Module principal trouvé: ${moduleMatch[1]}`, 'green');
      
      // Vérifier que le module se charge
      const moduleResponse = await makeRequest(moduleUrl);
      if (moduleResponse.statusCode === 200) {
        log('   ✅ Module principal accessible', 'green');
        
        // Vérifier si useAuth est présent dans le code
        const hasUseAuth = moduleResponse.body.includes('useAuth');
        const hasSupabase = moduleResponse.body.includes('supabase');
        
        log(`   Hook useAuth présent: ${hasUseAuth ? '✅ Oui' : '❌ Non'}`, hasUseAuth ? 'green' : 'red');
        log(`   Supabase configuré: ${hasSupabase ? '✅ Oui' : '❌ Non'}`, hasSupabase ? 'green' : 'red');
      }
    }

    // 4. Diagnostic
    log('\n========================================', 'cyan');
    log('📊 DIAGNOSTIC', 'cyan');
    log('========================================\n', 'cyan');

    if (!hasReactRoot || !hasViteScript) {
      log('❌ PROBLÈME: Application React non chargée', 'red');
      log('   Vérifier la configuration Vite', 'yellow');
    } else if (hasLoadingSpinner && hasForceButton) {
      log('⚠️  PROBLÈME POTENTIEL: Écran de chargement détecté', 'yellow');
      log('   Le problème de boucle infinie pourrait persister', 'yellow');
      log('   Note: Ce test ne peut pas exécuter JavaScript', 'yellow');
      log('   Un test manuel dans le navigateur est nécessaire', 'yellow');
    } else {
      log('✅ Application semble fonctionnelle', 'green');
      log('   Test manuel recommandé pour confirmer', 'yellow');
    }

    // 5. Instructions pour test manuel
    log('\n📝 INSTRUCTIONS POUR TEST MANUEL:', 'cyan');
    log('1. Ouvrez votre navigateur', 'yellow');
    log('2. Allez sur ' + APP_URL, 'yellow');
    log('3. Ouvrez la console (F12)', 'yellow');
    log('4. Rafraîchissez la page (F5)', 'yellow');
    log('5. Observez les logs "useAuth" dans la console', 'yellow');
    log('6. Si vous voyez "Initial session user loaded", la correction fonctionne ✅', 'yellow');
    log('7. Si vous restez bloqué sur "Chargement...", la correction a échoué ❌', 'yellow');

  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log('   Le serveur n\'est pas lancé sur ' + APP_URL, 'yellow');
      log('   Exécutez: npm run dev', 'yellow');
    }
  }
}

// Lancer le test
testAuth().catch(error => {
  log(`Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});