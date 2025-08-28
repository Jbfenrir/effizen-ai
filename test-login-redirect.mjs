#!/usr/bin/env node

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
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Vérifier que NewLoginPage utilise le bon hook
function testLoginPageAuthHook() {
  log('\n🔍 Test 1: Vérification du hook d\'authentification dans NewLoginPage', 'blue');
  
  const loginPagePath = path.join(__dirname, 'src/pages/NewLoginPage.tsx');
  
  if (!fs.existsSync(loginPagePath)) {
    log('❌ NewLoginPage.tsx non trouvé', 'red');
    return false;
  }
  
  const content = fs.readFileSync(loginPagePath, 'utf8');
  
  const checks = {
    hasAuthSwitch: content.includes('AUTH_CONFIG'),
    hasUseSelectedAuth: content.includes('useSelectedAuth'),
    hasRedirectionEffect: content.includes('useEffect') && content.includes('isAuthenticated'),
    hasNavigationCode: content.includes('window.history.pushState') && content.includes('/dashboard'),
    hasUserAndIsAuthenticated: content.includes('user,') && content.includes('isAuthenticated')
  };
  
  let allPassed = true;
  
  if (checks.hasAuthSwitch && checks.hasUseSelectedAuth) {
    log('✅ NewLoginPage utilise le système de basculement auth', 'green');
  } else {
    log('❌ NewLoginPage n\'utilise pas le système de basculement auth', 'red');
    allPassed = false;
  }
  
  if (checks.hasRedirectionEffect && checks.hasNavigationCode) {
    log('✅ NewLoginPage a la logique de redirection automatique', 'green');
  } else {
    log('❌ NewLoginPage manque la logique de redirection automatique', 'red');
    allPassed = false;
  }
  
  if (checks.hasUserAndIsAuthenticated) {
    log('✅ NewLoginPage surveille l\'état user et isAuthenticated', 'green');
  } else {
    log('❌ NewLoginPage ne surveille pas correctement l\'état auth', 'red');
    allPassed = false;
  }
  
  return allPassed;
}

// Test 2: Vérifier la cohérence avec AppRouter
function testConsistencyWithAppRouter() {
  log('\n🔄 Test 2: Cohérence entre NewLoginPage et AppRouter', 'blue');
  
  const loginPagePath = path.join(__dirname, 'src/pages/NewLoginPage.tsx');
  const appRouterPath = path.join(__dirname, 'src/AppRouter.tsx');
  
  if (!fs.existsSync(loginPagePath) || !fs.existsSync(appRouterPath)) {
    log('❌ Fichiers manquants pour le test de cohérence', 'red');
    return false;
  }
  
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  const routerContent = fs.readFileSync(appRouterPath, 'utf8');
  
  // Les deux doivent utiliser le même système auth
  const loginUsesAuthSwitch = loginContent.includes('useSelectedAuth');
  const routerUsesAuthSwitch = routerContent.includes('useSelectedAuth');
  
  if (loginUsesAuthSwitch && routerUsesAuthSwitch) {
    log('✅ NewLoginPage et AppRouter utilisent le même système auth', 'green');
    return true;
  } else {
    log('❌ Incohérence entre NewLoginPage et AppRouter', 'red');
    return false;
  }
}

// Test 3: Vérifier le code de redirection
function testRedirectionLogic() {
  log('\n🎯 Test 3: Logique de redirection', 'blue');
  
  const loginPagePath = path.join(__dirname, 'src/pages/NewLoginPage.tsx');
  const content = fs.readFileSync(loginPagePath, 'utf8');
  
  const patterns = {
    hasUseEffect: /useEffect\s*\(\s*\(\)\s*=>\s*{.*?}\s*,\s*\[.*?isAuthenticated.*?user.*?\]\s*\)/s,
    hasRedirection: /window\.history\.pushState.*?\/dashboard/,
    hasPopStateEvent: /window\.dispatchEvent.*?PopStateEvent/,
    hasConsoleLog: /console\.log.*?redirection/i
  };
  
  let score = 0;
  const total = Object.keys(patterns).length;
  
  for (const [test, pattern] of Object.entries(patterns)) {
    if (pattern.test(content)) {
      log(`✅ ${test}: trouvé`, 'green');
      score++;
    } else {
      log(`❌ ${test}: manquant`, 'red');
    }
  }
  
  if (score === total) {
    log(`✅ Logique de redirection complète (${score}/${total})`, 'green');
    return true;
  } else {
    log(`⚠️ Logique de redirection incomplète (${score}/${total})`, 'yellow');
    return false;
  }
}

// Analyse détaillée du problème résolu
function generateProblemAnalysis() {
  log('\n📊 ANALYSE DU PROBLÈME RÉSOLU', 'magenta');
  log('================================', 'magenta');
  
  log('\n🚨 PROBLÈME IDENTIFIÉ:', 'blue');
  log('   • NewLoginPage utilisait useAuth au lieu du système de basculement', 'yellow');
  log('   • Après connexion réussie, seul le message "Connexion réussie !" s\'affichait', 'yellow');
  log('   • Aucune redirection automatique vers le dashboard', 'yellow');
  log('   • L\'utilisateur devait rafraîchir manuellement (F5)', 'yellow');
  
  log('\n✅ SOLUTIONS APPLIQUÉES:', 'blue');
  log('   1. Utilisation du même système auth que AppRouter (useSelectedAuth)', 'green');
  log('   2. Ajout d\'un useEffect surveillant isAuthenticated et user', 'green');
  log('   3. Redirection automatique avec window.history.pushState + PopStateEvent', 'green');
  log('   4. Messages de feedback améliorés pour l\'utilisateur', 'green');
  
  log('\n🔧 FICHIERS MODIFIÉS:', 'blue');
  log('   • src/pages/NewLoginPage.tsx - Système auth unifié + redirection', 'reset');
  
  log('\n🎯 RÉSULTAT ATTENDU:', 'blue');
  log('   • Connexion → Message "Connexion réussie !" → Redirection automatique', 'green');
  log('   • Plus besoin de rafraîchir manuellement', 'green');
  log('   • Expérience utilisateur fluide', 'green');
}

// Exécuter tous les tests
async function main() {
  log('🚀 TEST DE LA CORRECTION DE REDIRECTION POST-CONNEXION', 'magenta');
  log('====================================================', 'magenta');
  
  const results = {
    authHook: testLoginPageAuthHook(),
    consistency: testConsistencyWithAppRouter(),
    redirection: testRedirectionLogic()
  };
  
  generateProblemAnalysis();
  
  log('\n🏁 RÉSULTAT DES TESTS', 'magenta');
  log('===================', 'magenta');
  
  let allPassed = true;
  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}: ${passed ? 'PASSÉ' : 'ÉCHOUÉ'}`, color);
    
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    log('\n🎉 CORRECTION VALIDÉE !', 'green');
    log('La redirection automatique après connexion devrait maintenant fonctionner.', 'green');
    log('\n📋 POUR TESTER:', 'blue');
    log('   1. Aller sur http://localhost:3001', 'reset');
    log('   2. Se connecter avec jbgerberon@gmail.com + mot de passe', 'reset');
    log('   3. Vérifier la redirection automatique vers le dashboard', 'reset');
  } else {
    log('\n⚠️ DES CORRECTIONS SUPPLÉMENTAIRES SONT NÉCESSAIRES', 'red');
  }
}

main().catch(error => {
  log(`❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});