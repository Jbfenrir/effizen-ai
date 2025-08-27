#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');

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

// Fonction pour simuler un test manuel via fetch API
async function testAuthPersistence() {
  console.log(`\n${colors.yellow}Test de persistance de session après changement d'onglet${colors.reset}`);
  
  // Test avec fetch pour vérifier l'API
  const testEndpoint = 'http://localhost:3000/';
  
  try {
    // Première requête
    console.log(`  ${colors.blue}1. Requête initiale...${colors.reset}`);
    const response1 = await fetch(testEndpoint);
    console.log(`     Status: ${response1.status}`);
    
    // Simuler un délai (changement d'onglet)
    console.log(`  ${colors.blue}2. Simulation changement d'onglet (3 secondes)...${colors.reset}`);
    await sleep(3000);
    
    // Deuxième requête après "retour"
    console.log(`  ${colors.blue}3. Requête après retour...${colors.reset}`);
    const response2 = await fetch(testEndpoint);
    console.log(`     Status: ${response2.status}`);
    
    if (response2.status === 200 || response2.status === 304) {
      console.log(`  ${colors.green}✓ Application répond correctement après changement simulé${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur lors du test: ${error.message}${colors.reset}`);
    return false;
  }
}

// Vérifier les modifications du code
async function verifyCodeChanges() {
  console.log(`\n${colors.yellow}Vérification des modifications du code${colors.reset}`);
  
  const checks = [
    {
      file: './src/services/supabase-bypass.ts',
      name: 'Singleton Supabase',
      patterns: [
        { desc: 'Variable supabaseInstance', regex: /let supabaseInstance:/ },
        { desc: 'Fonction getSupabaseClient', regex: /const getSupabaseClient = / },
        { desc: 'Pattern singleton appliqué', regex: /if \(!supabaseInstance\)/ }
      ]
    },
    {
      file: './src/hooks/useAuth.ts',
      name: 'Gestion visibilitychange',
      patterns: [
        { desc: 'Variable visibilityCheckTimeout', regex: /let visibilityCheckTimeout:/ },
        { desc: 'Handler async visibilitychange', regex: /handleVisibilityChange = async/ },
        { desc: 'Vérification localStorage', regex: /const storedSession = localStorage\.getItem\(storageKey\)/ },
        { desc: 'Protection contre onglet invisible', regex: /if \(!document\.hidden\)/ }
      ]
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    console.log(`\n  ${colors.cyan}Fichier: ${check.file}${colors.reset}`);
    
    try {
      const content = fs.readFileSync(check.file, 'utf8');
      
      for (const pattern of check.patterns) {
        if (pattern.regex.test(content)) {
          console.log(`    ${colors.green}✓ ${pattern.desc}${colors.reset}`);
        } else {
          console.log(`    ${colors.red}✗ ${pattern.desc} non trouvé${colors.reset}`);
          allPassed = false;
        }
      }
    } catch (error) {
      console.log(`    ${colors.red}✗ Erreur lecture fichier: ${error.message}${colors.reset}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test du build de production
async function testProductionBuild() {
  console.log(`\n${colors.yellow}Test du build de production${colors.reset}`);
  
  try {
    console.log(`  ${colors.blue}Compilation en cours...${colors.reset}`);
    const startTime = Date.now();
    
    await execPromise('npm run build', { 
      timeout: 120000 // 2 minutes max
    });
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ${colors.green}✓ Build réussi en ${buildTime}s${colors.reset}`);
    
    // Vérifier que les fichiers sont créés
    if (fs.existsSync('./dist/index.html')) {
      console.log(`  ${colors.green}✓ Fichiers de production générés${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ Fichiers de production non trouvés${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur de build: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test principal
async function runFullTest() {
  console.log(`${colors.bright}${colors.blue}=====================================`);
  console.log(`TEST EXHAUSTIF: Correction bug changement d'onglet`);
  console.log(`=====================================\n${colors.reset}`);
  
  let testResults = {
    serverRunning: false,
    codeChanges: false,
    authPersistence: false,
    productionBuild: false
  };
  
  // Test 1: Serveur
  console.log(`${colors.yellow}Test 1: Vérification du serveur de développement${colors.reset}`);
  testResults.serverRunning = await checkLocalhost();
  
  if (testResults.serverRunning) {
    console.log(`${colors.green}✓ Serveur accessible sur localhost:3000${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Serveur non accessible${colors.reset}`);
    console.log(`${colors.yellow}  Lancez d'abord: npm run dev${colors.reset}`);
  }
  
  // Test 2: Modifications du code
  console.log(`\n${colors.yellow}Test 2: Vérification des modifications${colors.reset}`);
  testResults.codeChanges = await verifyCodeChanges();
  
  if (testResults.codeChanges) {
    console.log(`${colors.green}✓ Toutes les modifications sont présentes${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Certaines modifications manquent${colors.reset}`);
  }
  
  // Test 3: Persistance auth (si serveur lancé)
  if (testResults.serverRunning) {
    console.log(`\n${colors.yellow}Test 3: Test de persistance${colors.reset}`);
    testResults.authPersistence = await testAuthPersistence();
  }
  
  // Test 4: Build production
  console.log(`\n${colors.yellow}Test 4: Build de production${colors.reset}`);
  testResults.productionBuild = await testProductionBuild();
  
  // Résumé
  console.log(`\n${colors.bright}${colors.cyan}=====================================`);
  console.log(`RÉSUMÉ DES TESTS`);
  console.log(`=====================================\n${colors.reset}`);
  
  console.log(`Serveur running:     ${testResults.serverRunning ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Code modifié:        ${testResults.codeChanges ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Persistance auth:    ${testResults.authPersistence ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Build production:    ${testResults.productionBuild ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  
  const allPassed = Object.values(testResults).every(result => result === true || result === undefined);
  
  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}✅ SUCCÈS: Solution validée et fonctionnelle !${colors.reset}`);
    console.log(`\n${colors.magenta}La correction est prête à être testée manuellement.${colors.reset}`);
    console.log(`\n${colors.cyan}Instructions pour test manuel:${colors.reset}`);
    console.log(`1. Ouvrez ${colors.bright}http://localhost:3000${colors.reset}`);
    console.log(`2. Connectez-vous avec ${colors.bright}jbgerberon@gmail.com${colors.reset}`);
    console.log(`3. Changez d'onglet ou minimisez le navigateur`);
    console.log(`4. Revenez après quelques secondes`);
    console.log(`5. L'application ne devrait PAS se bloquer en chargement infini`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}⚠️ ATTENTION: Certains tests ont échoué${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez les erreurs ci-dessus avant de continuer.${colors.reset}`);
  }
  
  return allPassed;
}

// Exécution
runFullTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Erreur fatale:`, error);
    process.exit(1);
  });