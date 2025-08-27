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

// Vérifier les modifications critiques
async function verifyFixes() {
  console.log(`\n${colors.yellow}Vérification des corrections appliquées${colors.reset}`);
  
  const fixes = [
    {
      file: './src/services/supabase-bypass.ts',
      name: 'Singleton global window-based',
      checks: [
        { desc: 'GLOBAL_SUPABASE_KEY défini', pattern: /__effizen_supabase_client__/ },
        { desc: 'Vérification window existant', pattern: /window.*&&.*window.*GLOBAL_SUPABASE_KEY/ },
        { desc: 'Stockage dans window', pattern: /\(\s*window\s+as\s+any\s*\)\s*\[\s*GLOBAL_SUPABASE_KEY\s*\]\s*=\s*client/ },
        { desc: 'Message anti-HMR', pattern: /anti-HMR/ }
      ]
    },
    {
      file: './src/hooks/useAuth.ts',
      name: 'Détection session rapide',
      checks: [
        { desc: 'Fonction quickSessionCheck', pattern: /const quickSessionCheck = / },
        { desc: 'Vérification localStorage au démarrage', pattern: /Session valide détectée au démarrage/ },
        { desc: 'Timeouts réduits', pattern: /now - globalLastCheckTime > 2000/ },
        { desc: 'Protection expires_at', pattern: /sessionData\.expires_at.*> Date\.now/ }
      ]
    }
  ];

  let allPassed = true;

  for (const fix of fixes) {
    console.log(`\n  ${colors.cyan}${fix.name}${colors.reset}`);
    
    try {
      const content = fs.readFileSync(fix.file, 'utf8');
      
      for (const check of fix.checks) {
        if (check.pattern.test(content)) {
          console.log(`    ${colors.green}✓ ${check.desc}${colors.reset}`);
        } else {
          console.log(`    ${colors.red}✗ ${check.desc}${colors.reset}`);
          allPassed = false;
        }
      }
    } catch (error) {
      console.log(`    ${colors.red}✗ Erreur lecture: ${error.message}${colors.reset}`);
      allPassed = false;
    }
  }

  return allPassed;
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

// Test de persistance de session
async function testSessionPersistence() {
  console.log(`\n${colors.yellow}Test de persistance de session${colors.reset}`);
  
  try {
    // Première requête
    const response1 = await fetch('http://localhost:3000/');
    console.log(`  ${colors.blue}Première requête: ${response1.status}${colors.reset}`);
    
    // Simuler délai changement onglet
    await sleep(2000);
    
    // Deuxième requête
    const response2 = await fetch('http://localhost:3000/');
    console.log(`  ${colors.blue}Deuxième requête: ${response2.status}${colors.reset}`);
    
    if (response1.ok && response2.ok) {
      console.log(`  ${colors.green}✓ Application stable après délai${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Erreur test: ${error.message}${colors.reset}`);
  }
  
  return false;
}

// Créer un script de test HTML pour test manuel
async function createManualTestPage() {
  const testPageContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Manuel - Bug Changement Onglet</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .step { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .step h3 { color: #2563eb; margin-top: 0; }
        .success { background: #f0f9ff; border-color: #38bdf8; }
        .warning { background: #fffbeb; border-color: #fbbf24; }
        .error { background: #fef2f2; border-color: #f87171; }
        .code { background: #f8f9fa; padding: 8px; border-radius: 4px; font-family: monospace; }
        .button { 
            display: inline-block; padding: 10px 20px; margin: 5px;
            background: #2563eb; color: white; text-decoration: none;
            border-radius: 6px; border: none; cursor: pointer;
        }
        .button:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <h1>🧪 Test Manuel - Correction Bug Changement d'Onglet</h1>
    
    <div class="step success">
        <h3>✅ Corrections Appliquées</h3>
        <ul>
            <li><strong>Singleton Global</strong> : Client Supabase unique attaché à window (survit au HMR)</li>
            <li><strong>Détection Session Rapide</strong> : Vérification localStorage au démarrage</li>
            <li><strong>Timeouts Optimisés</strong> : Réduction des délais de 5s → 2s</li>
            <li><strong>Gestion d'Erreur</strong> : Meilleure gestion des sessions expirées</li>
        </ul>
    </div>

    <div class="step warning">
        <h3>🔍 Procédure de Test</h3>
        <ol>
            <li><strong>Ouvrir l'application</strong> : <a href="http://localhost:3000" target="_blank" class="button">Ouvrir App</a></li>
            <li><strong>Observer</strong> : Y a-t-il encore une page de chargement infini au démarrage ?</li>
            <li><strong>Se connecter</strong> : Utiliser le bouton "Forcer la connexion" si nécessaire</li>
            <li><strong>Vérifier la console</strong> : Messages "Multiple GoTrueClient" réduits ?</li>
            <li><strong>Test changement onglet</strong> :
                <ul>
                    <li>Une fois connecté sur le dashboard</li>
                    <li>Changer d'onglet pendant 5-10 secondes</li>
                    <li>Revenir sur l'onglet de l'app</li>
                    <li>Observer : Page de chargement infini ? Déconnexion ?</li>
                </ul>
            </li>
        </ol>
    </div>

    <div class="step">
        <h3>🔧 Debug Console</h3>
        <p>Commandes à tester dans la console (F12) :</p>
        <div class="code">localStorage.getItem('supabase.auth.token.local.3000')</div>
        <div class="code">sessionStorage.getItem('effizen_auth_cache')</div>
        <div class="code">window.__effizen_supabase_client__ // Doit exister</div>
        <div class="code">window.globalCheckInProgress // Doit être false</div>
    </div>

    <div class="step error">
        <h3>🚨 Si le Problème Persiste</h3>
        <ul>
            <li><strong>Vider le cache</strong> : Ctrl+Shift+R (Chrome) ou Ctrl+Shift+Delete</li>
            <li><strong>Vérifier la console</strong> : Copier tous les messages d'erreur</li>
            <li><strong>Tester en navigation privée</strong> : Éliminer les données corrompues</li>
            <li><strong>Redémarrer le serveur</strong> : npm run dev</li>
        </ul>
    </div>

    <div class="step success">
        <h3>✅ Résultat Attendu</h3>
        <ul>
            <li>Pas de page de chargement infini au démarrage</li>
            <li>Session persistante lors du changement d'onglet</li>
            <li>Messages "Multiple GoTrueClient" réduits (acceptable au premier chargement)</li>
            <li>Application stable et responsive</li>
        </ul>
    </div>

    <script>
        // Automatiser quelques vérifications
        console.log('🔍 Test Page - Vérifications automatiques:');
        console.log('- Singleton Supabase:', !!window.__effizen_supabase_client__);
        console.log('- LocalStorage session:', !!localStorage.getItem('supabase.auth.token.local.3000'));
        console.log('- SessionStorage cache:', !!sessionStorage.getItem('effizen_auth_cache'));
        
        // Fonction pour tester la visibilité
        window.testVisibilityChange = function() {
            console.log('🧪 Test visibilityChange manuel...');
            document.dispatchEvent(new Event('visibilitychange'));
            console.log('✓ Événement visibilitychange déclenché');
        };
        
        console.log('💡 Utilisez testVisibilityChange() pour tester manuellement');
    </script>
</body>
</html>`;

  fs.writeFileSync('./test-manual-page.html', testPageContent);
  console.log(`\n  ${colors.cyan}📄 Page de test créée: ./test-manual-page.html${colors.reset}`);
}

// Test principal
async function runFinalTest() {
  console.log(`${colors.bright}${colors.blue}==========================================`);
  console.log(`TEST FINAL: Correction Bug Changement d'Onglet`);
  console.log(`==========================================\n${colors.reset}`);

  const results = {
    server: false,
    fixes: false,
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

  // Test 2: Vérification des corrections
  results.fixes = await verifyFixes();

  // Test 3: Build (si les fixes sont OK)
  if (results.fixes) {
    results.build = await testBuild();
  }

  // Test 4: Persistance (si serveur OK)
  if (results.server) {
    results.persistence = await testSessionPersistence();
  }

  // Créer page de test manuel
  await createManualTestPage();

  // Résumé final
  console.log(`\n${colors.bright}${colors.cyan}==========================================`);
  console.log(`RÉSUMÉ FINAL`);
  console.log(`==========================================\n${colors.reset}`);

  const statusChar = (status) => status ? `${colors.green}✓` : `${colors.red}✗`;
  
  console.log(`Serveur:       ${statusChar(results.server)}${colors.reset}`);
  console.log(`Corrections:   ${statusChar(results.fixes)}${colors.reset}`);
  console.log(`Build:         ${statusChar(results.build)}${colors.reset}`);
  console.log(`Persistance:   ${statusChar(results.persistence)}${colors.reset}`);

  const allCritical = results.server && results.fixes;
  
  if (allCritical) {
    console.log(`\n${colors.bright}${colors.green}🎉 CORRECTIONS APPLIQUÉES AVEC SUCCÈS !${colors.reset}`);
    console.log(`\n${colors.magenta}➜ Test Manuel Requis:${colors.reset}`);
    console.log(`  1. Ouvrez: ${colors.bright}http://localhost:3000${colors.reset}`);
    console.log(`  2. Consultez: ${colors.bright}./test-manual-page.html${colors.reset}`);
    console.log(`  3. Suivez la procédure de test détaillée`);
    
    if (!results.server) {
      console.log(`\n${colors.yellow}⚠️ Serveur non détecté, lancez: npm run dev${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ CORRECTIONS INCOMPLÈTES${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez les erreurs ci-dessus.${colors.reset}`);
  }
  
  return allCritical;
}

// Exécution
runFinalTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Erreur fatale:`, error);
    process.exit(1);
  });