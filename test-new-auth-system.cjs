#!/usr/bin/env node

const fs = require('fs');
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
  cyan: '\x1b[36m',
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkLocalhost(port = 3000) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Vérifier que le nouveau système est activé
async function verifyNewSystemActive() {
  console.log(`\n${colors.yellow}Vérification du système d'auth actif${colors.reset}`);
  
  try {
    const configContent = fs.readFileSync('./src/config/auth-switch.ts', 'utf8');
    const isNewSystemActive = /USE_AUTH_SYSTEM:\s*['"']NEW['"']/.test(configContent);
    
    if (isNewSystemActive) {
      console.log(`  ${colors.green}✓ Nouveau système d'auth activé${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ Ancien système d'auth actif${colors.reset}`);
      console.log(`  ${colors.yellow}Pour activer le nouveau système, modifiez src/config/auth-switch.ts${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur lecture config: ${error.message}${colors.reset}`);
    return false;
  }
}

// Vérifier les fichiers du nouveau système
async function verifyNewSystemFiles() {
  console.log(`\n${colors.yellow}Vérification des fichiers du nouveau système${colors.reset}`);
  
  const requiredFiles = [
    './src/hooks/useAuthNew.ts',
    './src/services/supabase-clean.ts',
    './src/config/auth-switch.ts',
    './SWITCH-AUTH-GUIDE.md',
    './RESTORE-AUTH-BACKUP.md'
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ${colors.green}✓ ${file}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${file} manquant${colors.reset}`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Vérifier que StrictMode est désactivé
async function verifyStrictModeDisabled() {
  console.log(`\n${colors.yellow}Vérification StrictMode${colors.reset}`);
  
  try {
    const mainContent = fs.readFileSync('./src/main.tsx', 'utf8');
    const strictModeDisabled = mainContent.includes('// <React.StrictMode>') && 
                              mainContent.includes('// </React.StrictMode>,');
    
    if (strictModeDisabled) {
      console.log(`  ${colors.green}✓ React.StrictMode désactivé${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ React.StrictMode encore actif${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur lecture main.tsx: ${error.message}${colors.reset}`);
    return false;
  }
}

// Vérifier le basculement dans AppRouter
async function verifyAppRouterSwitch() {
  console.log(`\n${colors.yellow}Vérification basculement AppRouter${colors.reset}`);
  
  try {
    const appRouterContent = fs.readFileSync('./src/AppRouter.tsx', 'utf8');
    
    const checks = [
      { name: 'Import useAuthNew', pattern: /import.*useAuthNew.*from/ },
      { name: 'Import auth-switch config', pattern: /import.*AUTH_CONFIG.*from.*auth-switch/ },
      { name: 'Hook sélectionné', pattern: /const useSelectedAuth = / },
      { name: 'Utilisation useSelectedAuth', pattern: /useSelectedAuth\(\)/ }
    ];
    
    let allPresent = true;
    
    for (const check of checks) {
      if (check.pattern.test(appRouterContent)) {
        console.log(`  ${colors.green}✓ ${check.name}${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ ${check.name}${colors.reset}`);
        allPresent = false;
      }
    }
    
    return allPresent;
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur lecture AppRouter.tsx: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test du build
async function testBuild() {
  console.log(`\n${colors.yellow}Test du build de production${colors.reset}`);
  
  try {
    console.log(`  ${colors.blue}Compilation...${colors.reset}`);
    await execPromise('npm run build', { timeout: 60000 });
    
    if (fs.existsSync('./dist/index.html')) {
      console.log(`  ${colors.green}✓ Build réussi${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ Fichiers dist manquants${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur build: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test de persistance simple
async function testBasicPersistence() {
  console.log(`\n${colors.yellow}Test de persistance basique${colors.reset}`);
  
  try {
    const response1 = await fetch('http://localhost:3000/');
    console.log(`  ${colors.blue}Première requête: ${response1.status}${colors.reset}`);
    
    await sleep(2000);
    
    const response2 = await fetch('http://localhost:3000/');
    console.log(`  ${colors.blue}Deuxième requête: ${response2.status}${colors.reset}`);
    
    if (response1.ok && response2.ok) {
      console.log(`  ${colors.green}✓ Application répond correctement${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur test: ${error.message}${colors.reset}`);
  }
  
  return false;
}

// Test principal
async function runNewAuthTest() {
  console.log(`${colors.bright}${colors.blue}========================================`);
  console.log(`TEST NOUVEAU SYSTÈME D'AUTHENTIFICATION`);
  console.log(`========================================\n${colors.reset}`);

  const results = {
    server: false,
    newSystemActive: false,
    filesPresent: false,
    strictModeDisabled: false,
    appRouterSwitch: false,
    build: false,
    persistence: false
  };

  // Test 1: Serveur
  console.log(`${colors.yellow}Test 1: Serveur de développement${colors.reset}`);
  results.server = await checkLocalhost();
  
  if (results.server) {
    console.log(`${colors.green}✓ Serveur accessible${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Serveur inaccessible${colors.reset}`);
    console.log(`${colors.yellow}  Lancez: npm run dev${colors.reset}`);
  }

  // Test 2: Système actif
  results.newSystemActive = await verifyNewSystemActive();

  // Test 3: Fichiers présents
  results.filesPresent = await verifyNewSystemFiles();

  // Test 4: StrictMode désactivé
  results.strictModeDisabled = await verifyStrictModeDisabled();

  // Test 5: Basculement AppRouter
  results.appRouterSwitch = await verifyAppRouterSwitch();

  // Test 6: Build (si les bases sont OK)
  if (results.newSystemActive && results.filesPresent) {
    results.build = await testBuild();
  }

  // Test 7: Persistance (si serveur OK)
  if (results.server) {
    results.persistence = await testBasicPersistence();
  }

  // Résumé
  console.log(`\n${colors.bright}${colors.cyan}========================================`);
  console.log(`RÉSUMÉ DES TESTS`);
  console.log(`========================================\n${colors.reset}`);

  const statusChar = (status) => status ? `${colors.green}✓` : `${colors.red}✗`;
  
  console.log(`Serveur:              ${statusChar(results.server)}${colors.reset}`);
  console.log(`Nouveau système:      ${statusChar(results.newSystemActive)}${colors.reset}`);
  console.log(`Fichiers présents:    ${statusChar(results.filesPresent)}${colors.reset}`);
  console.log(`StrictMode OFF:       ${statusChar(results.strictModeDisabled)}${colors.reset}`);
  console.log(`AppRouter modifié:    ${statusChar(results.appRouterSwitch)}${colors.reset}`);
  console.log(`Build:                ${statusChar(results.build)}${colors.reset}`);
  console.log(`Persistance:          ${statusChar(results.persistence)}${colors.reset}`);

  const criticalSuccess = results.newSystemActive && results.filesPresent && results.strictModeDisabled && results.appRouterSwitch;
  
  if (criticalSuccess && results.build) {
    console.log(`\n${colors.bright}${colors.green}🎉 NOUVEAU SYSTÈME PRÊT POUR TEST MANUEL !${colors.reset}`);
    console.log(`\n${colors.magenta}Étapes de test:${colors.reset}`);
    console.log(`  1. ${colors.bright}Redémarrer le serveur${colors.reset}: Ctrl+C puis npm run dev`);
    console.log(`  2. ${colors.bright}Vider le cache${colors.reset}: Ctrl+Shift+R`);
    console.log(`  3. ${colors.bright}Ouvrir${colors.reset}: http://localhost:3000`);
    console.log(`  4. ${colors.bright}Observer${colors.reset}: Y a-t-il encore une page de chargement infini ?`);
    console.log(`  5. ${colors.bright}Tester changement onglet${colors.reset}: Changer d'onglet et revenir`);
    console.log(`\n${colors.cyan}🔄 Basculement: Consultez SWITCH-AUTH-GUIDE.md${colors.reset}`);
    console.log(`${colors.cyan}🛡️ Restauration: Consultez RESTORE-AUTH-BACKUP.md${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ PROBLÈMES DÉTECTÉS${colors.reset}`);
    console.log(`${colors.yellow}Corrigez les erreurs ci-dessus avant de continuer.${colors.reset}`);
  }
  
  return criticalSuccess;
}

// Exécution
runNewAuthTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Erreur fatale:`, error);
    process.exit(1);
  });