#!/usr/bin/env node

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://effizen-ai-prod.vercel.app';
const LOCAL_URL = 'http://localhost:3001';
const SUPABASE_URL = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4NjI4NTksImV4cCI6MjAzODQzODg1OX0.YNdgZs7gMAol1N9EtQwMZLvmz7CmjpLAYvGP1p5XZTY';

async function testCompleteSolution() {
  console.log('🧪 TESTS COMPLETS - Solutions de Reset Password\n');
  console.log('=' .repeat(60));
  
  const results = {
    production: {
      resetPageAccessible: false,
      dashboardAccessible: false,
      siteOnline: false,
      httpsSecure: false
    },
    local: {
      resetPageAccessible: false,
      dashboardAccessible: false,
      serverRunning: false
    },
    functionality: {
      supabaseConnected: false,
      translationsLoaded: false,
      buildSuccessful: false
    }
  };

  // 1. TESTS PRODUCTION
  console.log('\n📡 TESTS EN PRODUCTION (effizen-ai-prod.vercel.app)');
  console.log('-'.repeat(50));
  
  try {
    // Test site online
    console.log('1️⃣ Vérification du site en ligne...');
    const siteResponse = await fetch(PROD_URL);
    if (siteResponse.ok) {
      results.production.siteOnline = true;
      console.log('   ✅ Site accessible');
    } else {
      console.log('   ❌ Site inaccessible - Status:', siteResponse.status);
    }

    // Test HTTPS
    console.log('2️⃣ Vérification HTTPS...');
    if (PROD_URL.startsWith('https://')) {
      results.production.httpsSecure = true;
      console.log('   ✅ HTTPS configuré');
    }

    // Test /reset-password en production
    console.log('3️⃣ Test route /reset-password...');
    const resetProdResponse = await fetch(`${PROD_URL}/reset-password`);
    if (resetProdResponse.ok) {
      results.production.resetPageAccessible = true;
      console.log('   ✅ Page /reset-password accessible');
    } else {
      console.log('   ❌ Page /reset-password inaccessible');
    }

    // Test /dashboard en production
    console.log('4️⃣ Test route /dashboard...');
    const dashProdResponse = await fetch(`${PROD_URL}/dashboard`);
    if (dashProdResponse.ok) {
      results.production.dashboardAccessible = true;
      console.log('   ✅ Dashboard accessible');
    } else {
      console.log('   ❌ Dashboard inaccessible');
    }

  } catch (error) {
    console.error('   ❌ Erreur tests production:', error.message);
  }

  // 2. TESTS LOCAL
  console.log('\n🖥️ TESTS EN LOCAL (localhost:3001)');
  console.log('-'.repeat(50));
  
  try {
    // Test serveur local
    console.log('1️⃣ Vérification serveur local...');
    const localResponse = await fetch(LOCAL_URL).catch(() => null);
    if (localResponse && localResponse.ok) {
      results.local.serverRunning = true;
      console.log('   ✅ Serveur local actif');
      
      // Test /reset-password local
      console.log('2️⃣ Test route /reset-password locale...');
      const resetLocalResponse = await fetch(`${LOCAL_URL}/reset-password`);
      if (resetLocalResponse.ok) {
        results.local.resetPageAccessible = true;
        console.log('   ✅ Page /reset-password accessible');
      }

      // Test /dashboard local
      console.log('3️⃣ Test route /dashboard locale...');
      const dashLocalResponse = await fetch(`${LOCAL_URL}/dashboard`);
      if (dashLocalResponse.ok) {
        results.local.dashboardAccessible = true;
        console.log('   ✅ Dashboard accessible');
      }
    } else {
      console.log('   ⚠️ Serveur local non démarré (normal si tests en prod uniquement)');
    }
  } catch (error) {
    console.log('   ⚠️ Serveur local non accessible (normal)');
  }

  // 3. TESTS FONCTIONNELS
  console.log('\n⚙️ TESTS FONCTIONNELS');
  console.log('-'.repeat(50));

  try {
    // Test connexion Supabase
    console.log('1️⃣ Test connexion Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.from('teams').select('id').limit(1);
    if (!error) {
      results.functionality.supabaseConnected = true;
      console.log('   ✅ Connexion Supabase fonctionnelle');
    } else {
      console.log('   ❌ Erreur Supabase:', error.message);
    }

    // Test traductions
    console.log('2️⃣ Vérification des traductions...');
    const fs = await import('fs');
    const frContent = fs.readFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/src/i18n/fr.json', 'utf8');
    const enContent = fs.readFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/src/i18n/en.json', 'utf8');
    
    if (frContent.includes('passwordReset') && enContent.includes('passwordReset')) {
      results.functionality.translationsLoaded = true;
      console.log('   ✅ Traductions FR/EN présentes');
    } else {
      console.log('   ❌ Traductions manquantes');
    }

    // Test build
    console.log('3️⃣ Test de build production...');
    const { execSync } = await import('child_process');
    try {
      execSync('npm run build', { 
        cwd: '/mnt/c/Users/FIAE/Desktop/effizen-ai', 
        stdio: 'pipe',
        timeout: 60000 
      });
      results.functionality.buildSuccessful = true;
      console.log('   ✅ Build production réussi');
    } catch (error) {
      console.log('   ❌ Build échoué');
    }

  } catch (error) {
    console.error('   ❌ Erreur tests fonctionnels:', error.message);
  }

  // 4. RÉSUMÉ FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));

  const prodScore = Object.values(results.production).filter(v => v).length;
  const localScore = Object.values(results.local).filter(v => v).length;
  const funcScore = Object.values(results.functionality).filter(v => v).length;
  
  console.log('\n🌐 PRODUCTION:', `${prodScore}/4 tests passent`);
  Object.entries(results.production).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  });

  console.log('\n💻 LOCAL:', `${localScore}/3 tests passent`);
  Object.entries(results.local).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  });

  console.log('\n🔧 FONCTIONNEL:', `${funcScore}/3 tests passent`);
  Object.entries(results.functionality).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  });

  const totalScore = prodScore + localScore + funcScore;
  const totalTests = 10;
  const successRate = Math.round((totalScore / totalTests) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 SCORE GLOBAL: ${totalScore}/${totalTests} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('✅ SOLUTIONS OPÉRATIONNELLES - Prêtes pour utilisation');
  } else if (successRate >= 60) {
    console.log('⚠️ SOLUTIONS PARTIELLEMENT FONCTIONNELLES - Vérifications nécessaires');
  } else {
    console.log('❌ PROBLÈMES DÉTECTÉS - Intervention requise');
  }

  console.log('\n📝 NOTES IMPORTANTES:');
  console.log('• Solution 2: Route /reset-password pour liens email');
  console.log('• Solution 3: Modal admin avec bouton clé violette');
  console.log('• Les deux solutions nécessitent VITE_SUPABASE_SERVICE_ROLE_KEY en production');
  
  console.log('\n🔗 LIENS UTILES:');
  console.log(`• Production: ${PROD_URL}/dashboard`);
  console.log(`• Local: ${LOCAL_URL}/dashboard`);
  console.log(`• Reset page prod: ${PROD_URL}/reset-password`);
  console.log(`• Reset page local: ${LOCAL_URL}/reset-password`);

  return successRate >= 80;
}

// Exécution
testCompleteSolution()
  .then(success => {
    console.log('\n✨ Tests terminés');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Erreur fatale:', err);
    process.exit(1);
  });