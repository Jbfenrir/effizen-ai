const puppeteer = require('puppeteer');
const http = require('http');

// Configuration
const APP_URL = 'http://localhost:3000';
const TEST_EMAIL = 'jbgerberon@gmail.com';
const TEST_PASSWORD = 'mtuw xsol vahe sgkn'; // Mot de passe depuis CLAUDE.md

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

// Vérifier que le serveur est accessible
function checkServerRunning(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Test principal
async function testAuthFix() {
  log('\n========================================', 'cyan');
  log('🧪 TEST COMPLET - CORRECTION AUTH FIX', 'cyan');
  log('========================================\n', 'cyan');

  // 1. Vérifier que le serveur est lancé
  log('1️⃣  Vérification du serveur de développement...', 'blue');
  const serverRunning = await checkServerRunning(APP_URL);
  
  if (!serverRunning) {
    log('❌ Le serveur n\'est pas accessible sur ' + APP_URL, 'red');
    log('   Assurez-vous que npm run dev est lancé', 'yellow');
    process.exit(1);
  }
  log('✅ Serveur accessible\n', 'green');

  // 2. Lancer le navigateur avec Puppeteer
  log('2️⃣  Lancement du navigateur automatisé...', 'blue');
  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour debug
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  // Capturer les logs de la console
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    // Afficher les logs importants
    if (text.includes('useAuth') || text.includes('AppRouter')) {
      log(`   Console: ${text}`, 'cyan');
    }
  });

  // Capturer les erreurs
  page.on('error', err => {
    log(`   ❌ Erreur: ${err.message}`, 'red');
  });

  try {
    // 3. Naviguer vers l'application
    log('\n3️⃣  Navigation vers l\'application...', 'blue');
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    log('✅ Page chargée\n', 'green');

    // 4. Vérifier l'état initial
    log('4️⃣  Analyse de l\'état initial...', 'blue');
    
    // Attendre un peu pour voir si on reste bloqué sur le chargement
    await page.waitForTimeout(3000);
    
    // Vérifier si on a le spinner de chargement
    const hasSpinner = await page.evaluate(() => {
      const spinner = document.querySelector('.animate-spin');
      return spinner !== null;
    });

    // Vérifier si on a le bouton "Forcer la connexion"
    const hasForceButton = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Forcer la connexion'));
      return button !== null;
    });

    // Vérifier si on est sur la page de login
    const hasLoginForm = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      return emailInput !== null;
    });

    log(`   Spinner de chargement: ${hasSpinner ? '✅ Présent' : '❌ Absent'}`, hasSpinner ? 'yellow' : 'green');
    log(`   Bouton forcer connexion: ${hasForceButton ? '⚠️  Présent' : '✅ Absent'}`, hasForceButton ? 'yellow' : 'green');
    log(`   Formulaire de login: ${hasLoginForm ? '✅ Présent' : '❌ Absent'}`, hasLoginForm ? 'green' : 'red');

    // 5. Analyser les logs pour détecter les problèmes
    log('\n5️⃣  Analyse des logs d\'authentification...', 'blue');
    
    const hasInitialSession = consoleLogs.some(log => log.includes('Initial session detected'));
    const hasAuthStateChange = consoleLogs.some(log => log.includes('Auth state change'));
    const hasInfiniteLoop = consoleLogs.filter(log => log.includes('Vérification de session')).length > 2;
    const hasTimeout = consoleLogs.some(log => log.includes('Timeout de secours'));
    
    log(`   Session initiale détectée: ${hasInitialSession ? '✅ Oui' : '❌ Non'}`, hasInitialSession ? 'green' : 'red');
    log(`   Changement d'état auth: ${hasAuthStateChange ? '✅ Oui' : '❌ Non'}`, hasAuthStateChange ? 'green' : 'red');
    log(`   Boucle infinie détectée: ${hasInfiniteLoop ? '❌ Oui' : '✅ Non'}`, hasInfiniteLoop ? 'red' : 'green');
    log(`   Timeout déclenché: ${hasTimeout ? '❌ Oui' : '✅ Non'}`, hasTimeout ? 'red' : 'green');

    // 6. Test de connexion si on est sur la page de login
    if (hasLoginForm && !hasSpinner) {
      log('\n6️⃣  Test de connexion avec le compte admin...', 'blue');
      
      // Remplir le formulaire
      await page.type('input[type="email"]', TEST_EMAIL);
      
      // Chercher le champ mot de passe (peut être dans un onglet)
      const hasPasswordTab = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button'));
        const passwordTab = tabs.find(btn => btn.textContent.includes('Mot de passe'));
        if (passwordTab) {
          passwordTab.click();
          return true;
        }
        return false;
      });

      if (hasPasswordTab) {
        await page.waitForTimeout(500);
        await page.type('input[type="password"]', TEST_PASSWORD);
      }

      // Cliquer sur le bouton de connexion
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Se connecter'));
        if (button) button.click();
      });

      // Attendre la redirection
      await page.waitForTimeout(5000);

      // Vérifier si on a accédé au dashboard
      const isDashboard = await page.evaluate(() => {
        return window.location.pathname.includes('dashboard');
      });

      log(`   Connexion réussie: ${isDashboard ? '✅ Oui - Dashboard atteint' : '❌ Non - Toujours sur login'}`, isDashboard ? 'green' : 'red');
    }

    // 7. Diagnostic final
    log('\n========================================', 'cyan');
    log('📊 DIAGNOSTIC FINAL', 'cyan');
    log('========================================\n', 'cyan');

    if (hasSpinner && hasForceButton && !hasLoginForm) {
      log('❌ PROBLÈME DÉTECTÉ: Boucle de chargement infinie', 'red');
      log('   La correction n\'a PAS résolu le problème', 'red');
      log('\n   Actions recommandées:', 'yellow');
      log('   1. Vérifier les politiques RLS dans Supabase', 'yellow');
      log('   2. Tester avec un mode bypass complet', 'yellow');
      log('   3. Vérifier la table profiles dans Supabase', 'yellow');
    } else if (hasLoginForm && !hasSpinner) {
      log('✅ SUCCÈS: Page de login accessible', 'green');
      log('   L\'application fonctionne correctement', 'green');
    } else {
      log('⚠️  ÉTAT INDÉTERMINÉ', 'yellow');
      log('   Nécessite une investigation manuelle', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Erreur pendant le test: ${error.message}`, 'red');
  } finally {
    // Garder le navigateur ouvert 5 secondes pour observation
    await page.waitForTimeout(5000);
    await browser.close();
    log('\n✅ Test terminé\n', 'green');
  }
}

// Lancer le test
testAuthFix().catch(error => {
  log(`Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});