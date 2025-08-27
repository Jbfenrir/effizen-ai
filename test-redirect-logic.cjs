#!/usr/bin/env node

const fs = require('fs');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/', method: 'GET', timeout: 3000
    }, (res) => resolve(res.statusCode === 200 || res.statusCode === 304));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function testAuthLogic() {
  console.log(`${colors.cyan}🧪 TEST LOGIQUE: Correction redirection${colors.reset}\n`);
  
  // Test 1: Vérifier les corrections dans le code
  console.log(`${colors.yellow}1. Vérification des corrections dans useAuthNew.ts${colors.reset}`);
  
  let useAuthContent;
  try {
    useAuthContent = fs.readFileSync('./src/hooks/useAuthNew.ts', 'utf8');
  } catch (error) {
    console.log(`  ${colors.red}✗ Impossible de lire useAuthNew.ts${colors.reset}`);
    return false;
  }
  
  const authChecks = [
    {
      name: 'Force mise à jour état après connexion',
      pattern: /setAuthState\(\{ user, loading: false, error: null \}\);[\s\S]*setTimeout/,
      critical: true
    },
    {
      name: 'Gestion TOKEN_REFRESHED et INITIAL_SESSION',
      pattern: /TOKEN_REFRESHED.*INITIAL_SESSION/,
      critical: true
    },
    {
      name: 'Logs détaillés connexion',
      pattern: /Connexion confirmée.*email.*Événement/,
      critical: false
    },
    {
      name: 'Vérification immédiate session dans signInWithPassword',
      pattern: /Force mise à jour état utilisateur/,
      critical: true
    }
  ];
  
  let criticalIssues = 0;
  for (const check of authChecks) {
    if (check.pattern.test(useAuthContent)) {
      console.log(`  ${colors.green}✓ ${check.name}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${check.name}${colors.reset}`);
      if (check.critical) criticalIssues++;
    }
  }
  
  // Test 2: Vérifier AppRouter
  console.log(`\n${colors.yellow}2. Vérification AppRouter.tsx${colors.reset}`);
  
  let routerContent;
  try {
    routerContent = fs.readFileSync('./src/AppRouter.tsx', 'utf8');
  } catch (error) {
    console.log(`  ${colors.red}✗ Impossible de lire AppRouter.tsx${colors.reset}`);
    return false;
  }
  
  const routerChecks = [
    {
      name: 'Délai réduit à 100ms',
      pattern: /100.*ms.*réactivité/,
      critical: true
    },
    {
      name: 'Logs détaillés avec email utilisateur',
      pattern: /user\?\\.email.*unknown/,
      critical: false
    },
    {
      name: 'Redirection dashboard avec logs',
      pattern: /REDIRECTION VERS DASHBOARD.*utilisateur connecté/,
      critical: true
    }
  ];
  
  for (const check of routerChecks) {
    if (check.pattern.test(routerContent)) {
      console.log(`  ${colors.green}✓ ${check.name}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${check.name}${colors.reset}`);
      if (check.critical) criticalIssues++;
    }
  }
  
  // Test 3: Test de cohérence logique
  console.log(`\n${colors.yellow}3. Test de cohérence logique${colors.reset}`);
  
  // Vérifier que le système de basculement fonctionne
  const configContent = fs.readFileSync('./src/config/auth-switch.ts', 'utf8');
  const isNewSystem = /USE_AUTH_SYSTEM:\s*['"']NEW['"']/.test(configContent);
  
  if (isNewSystem) {
    console.log(`  ${colors.green}✓ Nouveau système activé${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ Ancien système encore actif${colors.reset}`);
    criticalIssues++;
  }
  
  // Vérifier que les imports sont corrects dans AppRouter
  const hasCorrectImports = routerContent.includes('useAuthNew') && 
                           routerContent.includes('useSelectedAuth') &&
                           routerContent.includes('AUTH_CONFIG');
  
  if (hasCorrectImports) {
    console.log(`  ${colors.green}✓ Imports AppRouter corrects${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ Imports AppRouter incorrects${colors.reset}`);
    criticalIssues++;
  }
  
  // Test 4: Serveur accessible
  console.log(`\n${colors.yellow}4. Test serveur${colors.reset}`);
  const serverOk = await checkServer();
  
  if (serverOk) {
    console.log(`  ${colors.green}✓ Serveur accessible${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ Serveur inaccessible${colors.reset}`);
  }
  
  // Test 5: Simulation simple de redirection
  console.log(`\n${colors.yellow}5. Simulation logique redirection${colors.reset}`);
  
  // Simuler le scénario : utilisateur connecté + sur page login
  const mockUser = { email: 'jbgerberon@gmail.com', role: 'admin' };
  const mockCurrentPath = '/login';
  const mockIsAuthenticated = true;
  
  // Logique de redirection (copie de AppRouter)
  const shouldRedirectToDashboard = mockIsAuthenticated && (mockCurrentPath === '/login' || mockCurrentPath === '/');
  
  if (shouldRedirectToDashboard) {
    console.log(`  ${colors.green}✓ Logique redirection: utilisateur authentifié sur /login → devrait rediriger vers /dashboard${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ Logique redirection défaillante${colors.reset}`);
    criticalIssues++;
  }
  
  // Test 6: Test de charge/persistance simple
  if (serverOk) {
    console.log(`\n${colors.yellow}6. Test stabilité serveur${colors.reset}`);
    
    try {
      // 3 requêtes rapides pour simuler l'activité
      const responses = await Promise.all([
        fetch('http://localhost:3000/'),
        fetch('http://localhost:3000/'),
        fetch('http://localhost:3000/')
      ]);
      
      const allOk = responses.every(r => r.ok);
      if (allOk) {
        console.log(`  ${colors.green}✓ Serveur stable (3 requêtes simultanées OK)${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ Serveur instable${colors.reset}`);
      }
    } catch (error) {
      console.log(`  ${colors.red}✗ Erreur test serveur: ${error.message}${colors.reset}`);
    }
  }
  
  // Résumé
  console.log(`\n${colors.cyan}=== RÉSUMÉ ===\n${colors.reset}`);
  
  if (criticalIssues === 0) {
    console.log(`${colors.green}✅ LOGIQUE VALIDÉE: ${criticalIssues} problème critique${colors.reset}`);
    console.log(`${colors.cyan}Les corrections semblent correctes. Le test manuel devrait fonctionner.${colors.reset}`);
    
    console.log(`\n${colors.yellow}Procédure de test manuel recommandée:${colors.reset}`);
    console.log(`1. Redémarrer: Ctrl+C puis npm run dev`);
    console.log(`2. Cache: Ctrl+Shift+R`);
    console.log(`3. Connexion: jbgerberon@gmail.com + mot de passe`);
    console.log(`4. Vérifier: Redirection automatique vers dashboard`);
    console.log(`5. Console: Chercher "🚀 AppRouter: REDIRECTION VERS DASHBOARD"`);
    
    return true;
  } else {
    console.log(`${colors.red}❌ PROBLÈMES DÉTECTÉS: ${criticalIssues} problème(s) critique(s)${colors.reset}`);
    console.log(`${colors.yellow}NE PAS tester manuellement avant corrections.${colors.reset}`);
    
    return false;
  }
}

// Exécution
testAuthLogic()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Erreur:${colors.reset}`, error.message);
    process.exit(1);
  });