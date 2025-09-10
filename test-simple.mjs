#!/usr/bin/env node

import fetch from 'node-fetch';

async function testSolutions() {
  console.log('🧪 Tests de validation des solutions de reset password\n');
  
  let allGood = true;
  
  try {
    // Test 1: Route /reset-password accessible
    console.log('1️⃣ Test de la route /reset-password...');
    const resetResponse = await fetch('http://localhost:3001/reset-password');
    if (resetResponse.ok) {
      console.log('✅ Route /reset-password accessible (Solution 2)');
    } else {
      console.log('❌ Route /reset-password inaccessible');
      allGood = false;
    }

    // Test 2: Dashboard accessible (pour modal admin)
    console.log('\n2️⃣ Test de la route /dashboard...');
    const dashboardResponse = await fetch('http://localhost:3001/dashboard');
    if (dashboardResponse.ok) {
      console.log('✅ Route /dashboard accessible (Solution 3)');
    } else {
      console.log('❌ Route /dashboard inaccessible');
      allGood = false;
    }

    // Test 3: Vérifier que le build passe
    console.log('\n3️⃣ Test du build de production...');
    const { execSync } = await import('child_process');
    try {
      execSync('npm run build', { cwd: '/mnt/c/Users/FIAE/Desktop/effizen-ai', stdio: 'pipe' });
      console.log('✅ Build de production réussi');
    } catch (error) {
      console.log('❌ Build de production échoué:', error.message.split('\n')[0]);
      allGood = false;
    }

    // Test 4: Vérifier les fichiers de traduction
    console.log('\n4️⃣ Test des traductions...');
    const fs = await import('fs');
    const frTranslations = fs.readFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/src/i18n/fr.json', 'utf8');
    const enTranslations = fs.readFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/src/i18n/en.json', 'utf8');
    
    const hasFrPasswordReset = frTranslations.includes('passwordReset');
    const hasEnPasswordReset = enTranslations.includes('passwordReset');
    
    if (hasFrPasswordReset && hasEnPasswordReset) {
      console.log('✅ Traductions FR/EN présentes');
    } else {
      console.log('❌ Traductions manquantes');
      allGood = false;
    }

  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
    allGood = false;
  }

  console.log('\n📊 RÉSUMÉ:');
  console.log('==========');
  
  if (allGood) {
    console.log('✅ TOUS LES TESTS PASSENT');
    console.log('');
    console.log('🎯 Solutions prêtes à tester:');
    console.log('  Solution 2: http://localhost:3001/reset-password');
    console.log('  Solution 3: Dashboard admin avec bouton clé violette');
    console.log('');
    console.log('⚠️  IMPORTANT: Tests manuels nécessaires:');
    console.log('  - Connexion au dashboard admin');
    console.log('  - Clic sur bouton reset password (icône clé)');
    console.log('  - Test du modal de génération de mot de passe');
    console.log('  - Test avec un lien de récupération réel de Supabase');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🚨 Corrections nécessaires avant test utilisateur');
  }

  return allGood;
}

// Exécution
testSolutions()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Erreur fatale:', err);
    process.exit(1);
  });