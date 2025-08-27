const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkLocalhost() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}====================================`);
  console.log(`TEST: Correction du bug de changement d'onglet`);
  console.log(`====================================\n${colors.reset}`);

  // Test 1: Vérifier que localhost:3000 est accessible
  console.log(`${colors.yellow}Test 1: Vérification du serveur local...${colors.reset}`);
  const isServerRunning = await checkLocalhost();
  
  if (!isServerRunning) {
    console.log(`${colors.red}✗ Le serveur n'est pas accessible sur localhost:3000${colors.reset}`);
    console.log(`${colors.yellow}  → Veuillez lancer: npm run dev${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓ Serveur accessible${colors.reset}`);

  // Test 2: Vérifier les modifications dans supabase-bypass.ts
  console.log(`\n${colors.yellow}Test 2: Vérification du singleton Supabase...${colors.reset}`);
  const fs = require('fs');
  const supabaseBypassPath = './src/services/supabase-bypass.ts';
  
  try {
    const content = fs.readFileSync(supabaseBypassPath, 'utf8');
    
    const checks = [
      {
        name: 'Singleton pattern implémenté',
        pattern: /let supabaseInstance:/,
        found: false
      },
      {
        name: 'Fonction getSupabaseClient',
        pattern: /const getSupabaseClient = \(\) =>/,
        found: false
      },
      {
        name: 'Réutilisation du client existant',
        pattern: /Réutilisation du client Supabase existant/,
        found: false
      }
    ];

    checks.forEach(check => {
      check.found = check.pattern.test(content);
      if (check.found) {
        console.log(`  ${colors.green}✓ ${check.name}${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ ${check.name} non trouvé${colors.reset}`);
      }
    });

    const allChecksPassed = checks.every(check => check.found);
    if (!allChecksPassed) {
      console.log(`${colors.red}Les modifications du singleton ne sont pas complètes${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur lors de la lecture du fichier: ${error.message}${colors.reset}`);
    process.exit(1);
  }

  // Test 3: Vérifier les modifications dans useAuth.ts
  console.log(`\n${colors.yellow}Test 3: Vérification de la gestion visibilitychange...${colors.reset}`);
  const useAuthPath = './src/hooks/useAuth.ts';
  
  try {
    const content = fs.readFileSync(useAuthPath, 'utf8');
    
    const checks = [
      {
        name: 'Variable visibilityCheckTimeout',
        pattern: /let visibilityCheckTimeout:/,
        found: false
      },
      {
        name: 'Gestionnaire visibilitychange amélioré',
        pattern: /handleVisibilityChange = async \(\) =>/,
        found: false
      },
      {
        name: 'Reset du flag au retour d\'onglet',
        pattern: /Reset du flag globalCheckInProgress/,
        found: false
      },
      {
        name: 'Vérification localStorage pour session',
        pattern: /const storedSession = localStorage\.getItem\(storageKey\)/,
        found: false
      }
    ];

    checks.forEach(check => {
      check.found = check.pattern.test(content);
      if (check.found) {
        console.log(`  ${colors.green}✓ ${check.name}${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ ${check.name} non trouvé${colors.reset}`);
      }
    });

    const allChecksPassed = checks.every(check => check.found);
    if (!allChecksPassed) {
      console.log(`${colors.red}Les modifications de useAuth ne sont pas complètes${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erreur lors de la lecture du fichier: ${error.message}${colors.reset}`);
    process.exit(1);
  }

  // Test 4: Vérifier que le build passe
  console.log(`\n${colors.yellow}Test 4: Test du build de production...${colors.reset}`);
  console.log(`  ${colors.blue}Compilation en cours...${colors.reset}`);
  
  try {
    await execPromise('npm run build');
    console.log(`  ${colors.green}✓ Build réussi${colors.reset}`);
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur de build${colors.reset}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
    process.exit(1);
  }

  // Résumé
  console.log(`\n${colors.bright}${colors.green}====================================`);
  console.log(`SUCCÈS: Tous les tests sont passés !`);
  console.log(`====================================\n${colors.reset}`);
  
  console.log(`${colors.magenta}Instructions pour tester manuellement:${colors.reset}`);
  console.log(`1. Ouvrez l'application sur ${colors.bright}http://localhost:3000${colors.reset}`);
  console.log(`2. Connectez-vous avec ${colors.bright}jbgerberon@gmail.com${colors.reset}`);
  console.log(`3. Une fois connecté, changez d'onglet pendant quelques secondes`);
  console.log(`4. Revenez sur l'onglet de l'application`);
  console.log(`5. ${colors.green}✓${colors.reset} L'application ne devrait PAS afficher de page de chargement infini`);
  console.log(`6. ${colors.green}✓${colors.reset} Vous devriez rester connecté sans avoir à vous réauthentifier`);
  console.log(`\n${colors.yellow}Note: Si le problème persiste, videz le cache du navigateur (Ctrl+Shift+R)${colors.reset}`);
}

runTests().catch(error => {
  console.error(`${colors.red}Erreur inattendue:`, error);
  process.exit(1);
});