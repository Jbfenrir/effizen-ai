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
  cyan: '\x1b[36m',
};

async function checkLocalhost() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/', method: 'GET', timeout: 3000
    }, (res) => resolve(res.statusCode === 200 || res.statusCode === 304));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function verifyRedirectFix() {
  console.log(`\n${colors.yellow}Vérification des corrections de redirection${colors.reset}`);
  
  const checks = [
    {
      file: './src/hooks/useAuthNew.ts',
      name: 'Hook useAuthNew renforcé',
      patterns: [
        { desc: 'Force mise à jour état', pattern: /Force mise à jour état utilisateur/ },
        { desc: 'Gestion TOKEN_REFRESHED', pattern: /TOKEN_REFRESHED.*INITIAL_SESSION/ },
        { desc: 'Timeout post-connexion', pattern: /Vérification post-connexion/ },
        { desc: 'Logs de connexion détaillés', pattern: /Tentative de connexion pour/ }
      ]
    },
    {
      file: './src/AppRouter.tsx',
      name: 'AppRouter optimisé',
      patterns: [
        { desc: 'Délai réduit à 100ms', pattern: /100.*ms.*réactivité/ },
        { desc: 'Logs détaillés redirection', pattern: /REDIRECTION VERS DASHBOARD/ },
        { desc: 'Info utilisateur dans logs', pattern: /user\?\\.email.*unknown/ }
      ]
    }
  ];
  
  let allFixed = true;
  
  for (const check of checks) {
    console.log(`\n  ${colors.cyan}${check.name}${colors.reset}`);
    
    try {
      const content = fs.readFileSync(check.file, 'utf8');
      
      for (const pattern of check.patterns) {
        if (pattern.pattern.test(content)) {
          console.log(`    ${colors.green}✓ ${pattern.desc}${colors.reset}`);
        } else {
          console.log(`    ${colors.red}✗ ${pattern.desc}${colors.reset}`);
          allFixed = false;
        }
      }
    } catch (error) {
      console.log(`    ${colors.red}✗ Erreur lecture: ${error.message}${colors.reset}`);
      allFixed = false;
    }
  }
  
  return allFixed;
}

async function testBuild() {
  console.log(`\n${colors.yellow}Test build après corrections${colors.reset}`);
  
  try {
    await execPromise('npm run build', { timeout: 60000 });
    console.log(`  ${colors.green}✓ Build réussi${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur build: ${error.message}${colors.reset}`);
    return false;
  }
}

async function runRedirectTest() {
  console.log(`${colors.bright}${colors.blue}======================================`);
  console.log(`TEST: Correction Redirection Après Connexion`);
  console.log(`======================================\n${colors.reset}`);

  const results = {
    server: false,
    fixesApplied: false,
    build: false
  };

  // Test 1: Serveur
  console.log(`${colors.yellow}Test 1: Serveur${colors.reset}`);
  results.server = await checkLocalhost();
  
  if (results.server) {
    console.log(`${colors.green}✓ Serveur accessible${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Serveur inaccessible${colors.reset}`);
  }

  // Test 2: Vérification corrections
  results.fixesApplied = await verifyRedirectFix();

  // Test 3: Build
  if (results.fixesApplied) {
    results.build = await testBuild();
  }

  // Résumé
  console.log(`\n${colors.bright}${colors.cyan}======================================`);
  console.log(`RÉSUMÉ`);
  console.log(`======================================\n${colors.reset}`);

  const statusChar = (status) => status ? `${colors.green}✓` : `${colors.red}✗`;
  
  console.log(`Serveur:           ${statusChar(results.server)}${colors.reset}`);
  console.log(`Corrections:       ${statusChar(results.fixesApplied)}${colors.reset}`);
  console.log(`Build:             ${statusChar(results.build)}${colors.reset}`);

  if (results.fixesApplied && results.build) {
    console.log(`\n${colors.bright}${colors.green}✅ CORRECTIONS APPLIQUÉES !${colors.reset}`);
    console.log(`\n${colors.magenta}Test manuel requis:${colors.reset}`);
    console.log(`  1. ${colors.bright}Redémarrer serveur${colors.reset}: Ctrl+C puis npm run dev`);
    console.log(`  2. ${colors.bright}Vider cache${colors.reset}: Ctrl+Shift+R`);
    console.log(`  3. ${colors.bright}Test connexion${colors.reset}:`);
    console.log(`     • Ouvrir http://localhost:3000`);
    console.log(`     • Se connecter avec jbgerberon@gmail.com`);
    console.log(`     • Observer: Redirection automatique vers dashboard ?`);
    console.log(`  4. ${colors.bright}Console logs${colors.reset}: Vérifier les messages détaillés`);
    
    console.log(`\n${colors.cyan}Logs attendus après connexion:${colors.reset}`);
    console.log(`  🔔 useAuthNew: Auth event: SIGNED_IN`);
    console.log(`  ✅ useAuthNew: Connexion confirmée: jbgerberon@gmail.com`);
    console.log(`  🚀 AppRouter: REDIRECTION VERS DASHBOARD`);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ PROBLÈMES DÉTECTÉS${colors.reset}`);
  }
  
  return results.fixesApplied && results.build;
}

runRedirectTest()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Erreur:`, error);
    process.exit(1);
  });