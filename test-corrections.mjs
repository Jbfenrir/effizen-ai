#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Vérifier les traductions françaises
function testFrenchTranslations() {
  log('\n📝 Test 1: Vérification des traductions françaises', 'blue');
  
  const frJsonPath = path.join(__dirname, 'src/i18n/fr.json');
  const enJsonPath = path.join(__dirname, 'src/i18n/en.json');
  
  try {
    const frContent = JSON.parse(fs.readFileSync(frJsonPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
    
    // Vérifier que dashboard.admin existe dans fr.json
    if (!frContent.dashboard?.admin) {
      log('❌ Section dashboard.admin manquante dans fr.json', 'red');
      return false;
    }
    
    // Vérifier les clés importantes
    const keysToCheck = [
      'title', 'subtitle', 'newUser', 'globalExport', 
      'totalUsers', 'activeUsers', 'systemHealth'
    ];
    
    let allKeysPresent = true;
    for (const key of keysToCheck) {
      if (!frContent.dashboard.admin[key]) {
        log(`❌ Clé manquante: dashboard.admin.${key}`, 'red');
        allKeysPresent = false;
      } else if (frContent.dashboard.admin[key].includes('dashboard.admin')) {
        log(`❌ Traduction non corrigée: ${key} = "${frContent.dashboard.admin[key]}"`, 'red');
        allKeysPresent = false;
      }
    }
    
    if (allKeysPresent) {
      log('✅ Toutes les traductions FR sont correctes:', 'green');
      log(`   - title: "${frContent.dashboard.admin.title}"`, 'green');
      log(`   - newUser: "${frContent.dashboard.admin.newUser}"`, 'green');
      log(`   - globalExport: "${frContent.dashboard.admin.globalExport}"`, 'green');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Erreur lors de la lecture des fichiers: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Vérifier la correction du signOut
function testSignOutFix() {
  log('\n🔒 Test 2: Vérification de la correction signOut', 'blue');
  
  const supabasePath = path.join(__dirname, 'src/services/supabase.ts');
  const useAuthNewPath = path.join(__dirname, 'src/hooks/useAuthNew.ts');
  
  try {
    const supabaseContent = fs.readFileSync(supabasePath, 'utf8');
    const useAuthNewContent = fs.readFileSync(useAuthNewPath, 'utf8');
    
    // Vérifier que scope: 'local' est présent
    const supabaseHasLocalScope = supabaseContent.includes("scope: 'local'");
    const useAuthNewHasLocalScope = useAuthNewContent.includes("scope: 'local'");
    
    if (!supabaseHasLocalScope) {
      log('❌ scope: "local" manquant dans src/services/supabase.ts', 'red');
      return false;
    }
    
    if (!useAuthNewHasLocalScope) {
      log('❌ scope: "local" manquant dans src/hooks/useAuthNew.ts', 'red');
      return false;
    }
    
    log('✅ Correction signOut appliquée dans les deux fichiers', 'green');
    log('   - src/services/supabase.ts: scope: "local" présent', 'green');
    log('   - src/hooks/useAuthNew.ts: scope: "local" présent', 'green');
    return true;
  } catch (error) {
    log(`❌ Erreur lors de la lecture des fichiers: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Vérifier que le build passe
async function testBuild() {
  log('\n🏗️ Test 3: Vérification du build', 'blue');
  
  return new Promise((resolve) => {
    const buildProcess = spawn('npm', ['run', 'build'], { 
      shell: true,
      cwd: __dirname
    });
    
    let buildOutput = '';
    let errorOutput = '';
    
    buildProcess.stdout.on('data', (data) => {
      buildOutput += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Build réussi', 'green');
        
        // Vérifier que les fichiers dist existent
        const distPath = path.join(__dirname, 'dist');
        if (fs.existsSync(distPath)) {
          log('✅ Dossier dist créé', 'green');
          resolve(true);
        } else {
          log('❌ Dossier dist non créé', 'red');
          resolve(false);
        }
      } else {
        log(`❌ Build échoué avec le code: ${code}`, 'red');
        if (errorOutput) {
          log(`Erreurs: ${errorOutput}`, 'red');
        }
        resolve(false);
      }
    });
  });
}

// Test 4: Démarrer le serveur et tester
async function testLocalServer() {
  log('\n🌐 Test 4: Test du serveur local', 'blue');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('npm', ['run', 'dev'], { 
      shell: true,
      cwd: __dirname,
      detached: false
    });
    
    let serverStarted = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Détecter quand le serveur est prêt
      if (output.includes('Local:') && !serverStarted) {
        serverStarted = true;
        log('✅ Serveur démarré', 'green');
        
        // Attendre 3 secondes puis faire des tests
        setTimeout(async () => {
          // Test avec fetch
          try {
            const response = await fetch('http://localhost:3000');
            if (response.ok) {
              log('✅ Page d\'accueil accessible', 'green');
              
              // Vérifier le contenu
              const html = await response.text();
              if (html.includes('EffiZen-AI')) {
                log('✅ Application chargée correctement', 'green');
              }
            } else {
              log(`❌ Erreur HTTP: ${response.status}`, 'red');
            }
          } catch (error) {
            log(`❌ Impossible d'accéder au serveur: ${error.message}`, 'red');
          }
          
          // Arrêter le serveur
          serverProcess.kill();
          resolve(true);
        }, 3000);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warning') && !error.includes('info')) {
        log(`⚠️ Erreur serveur: ${error}`, 'yellow');
      }
    });
    
    // Timeout de sécurité
    setTimeout(() => {
      if (!serverStarted) {
        log('❌ Le serveur n\'a pas démarré après 15 secondes', 'red');
        serverProcess.kill();
        resolve(false);
      }
    }, 15000);
  });
}

// Lancer tous les tests
async function runAllTests() {
  log('🚀 DÉMARRAGE DES TESTS DE CORRECTION', 'blue');
  log('=====================================', 'blue');
  
  const results = {
    translations: false,
    signOut: false,
    build: false,
    server: false
  };
  
  // Test 1: Traductions
  results.translations = testFrenchTranslations();
  
  // Test 2: SignOut
  results.signOut = testSignOutFix();
  
  // Test 3: Build
  results.build = await testBuild();
  
  // Test 4: Serveur (optionnel car plus long)
  // results.server = await testLocalServer();
  
  // Résumé
  log('\n📊 RÉSUMÉ DES TESTS', 'blue');
  log('===================', 'blue');
  
  let allPassed = true;
  for (const [test, passed] of Object.entries(results)) {
    if (test === 'server' && !passed) continue; // Server test est optionnel
    
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}: ${passed ? 'PASSÉ' : 'ÉCHOUÉ'}`, color);
    
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
    log('Les corrections sont prêtes pour le déploiement.', 'green');
  } else {
    log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ', 'red');
    log('Veuillez vérifier les corrections avant le déploiement.', 'red');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Lancer les tests
runAllTests().catch(error => {
  log(`❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});