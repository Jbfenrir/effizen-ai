#!/usr/bin/env node

/**
 * Script de test complet pour les corrections UX et traductions (23/09/2025)
 *
 * Tests effectués :
 * 1. Serveur local accessible
 * 2. Build production réussi
 * 3. Fichiers modifiés présents
 * 4. Traductions FR/EN ajoutées
 * 5. Logique sommeil 8h minimum
 * 6. UX mobile tâches (ajout au début)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 TEST COMPLET - Corrections UX et traductions (23/09/2025)\n');

let allTestsPassed = true;
const results = [];

// ============================================
// TEST 1: Serveur local accessible
// ============================================
function testServerAccessible() {
  return new Promise((resolve) => {
    console.log('📡 TEST 1: Vérification serveur local...');

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('  ✅ Serveur accessible sur http://localhost:3002\n');
        results.push({ test: 'Serveur local', status: 'PASS' });
        resolve(true);
      } else {
        console.log(`  ❌ Serveur retourne code ${res.statusCode}\n`);
        results.push({ test: 'Serveur local', status: 'FAIL' });
        allTestsPassed = false;
        resolve(false);
      }
    });

    req.on('error', (e) => {
      console.log(`  ❌ Erreur connexion: ${e.message}\n`);
      results.push({ test: 'Serveur local', status: 'FAIL' });
      allTestsPassed = false;
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('  ❌ Timeout connexion serveur\n');
      req.destroy();
      results.push({ test: 'Serveur local', status: 'FAIL' });
      allTestsPassed = false;
      resolve(false);
    });

    req.end();
  });
}

// ============================================
// TEST 2: Build production existe
// ============================================
function testBuildExists() {
  console.log('📦 TEST 2: Vérification build production...');

  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.html');

  if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
    console.log('  ✅ Build production existe (dist/index.html)\n');
    results.push({ test: 'Build production', status: 'PASS' });
    return true;
  } else {
    console.log('  ❌ Build production manquant\n');
    results.push({ test: 'Build production', status: 'FAIL' });
    allTestsPassed = false;
    return false;
  }
}

// ============================================
// TEST 3: Fichiers modifiés présents
// ============================================
function testModifiedFiles() {
  console.log('📄 TEST 3: Vérification fichiers modifiés...');

  const filesToCheck = [
    'src/pages/EntryForm.tsx',
    'src/components/SleepForm.tsx',
    'src/components/FocusForm.tsx',
    'src/components/WellbeingForm.tsx',
    'src/components/TasksForm.tsx',
    'src/i18n/fr.json',
    'src/i18n/en.json'
  ];

  let allExist = true;
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ Fichier manquant: ${file}`);
      allExist = false;
      allTestsPassed = false;
    }
  });

  if (allExist) {
    console.log(`  ✅ Tous les fichiers modifiés présents (${filesToCheck.length})\n`);
    results.push({ test: 'Fichiers modifiés', status: 'PASS' });
    return true;
  } else {
    console.log('\n');
    results.push({ test: 'Fichiers modifiés', status: 'FAIL' });
    return false;
  }
}

// ============================================
// TEST 4: Traductions FR/EN ajoutées
// ============================================
function testTranslations() {
  console.log('🌐 TEST 4: Vérification traductions ajoutées...');

  const frPath = path.join(__dirname, 'src/i18n/fr.json');
  const enPath = path.join(__dirname, 'src/i18n/en.json');

  const frContent = fs.readFileSync(frPath, 'utf-8');
  const enContent = fs.readFileSync(enPath, 'utf-8');

  const frJson = JSON.parse(frContent);
  const enJson = JSON.parse(enContent);

  const checks = [
    { key: 'entry.title', fr: 'Saisie quotidienne', en: 'Daily Entry' },
    { key: 'entry.wellbeingScore', fr: 'Score Bien-être', en: 'Well-being Score' },
    { key: 'focus.title', fr: 'Énergie', en: 'Energy' },
    { key: 'focus.veryTired', fr: 'Très fatigué', en: 'Very tired' },
    { key: 'wellbeing.title', fr: 'Équilibre', en: 'Balance' }
  ];

  let allTranslationsOk = true;
  checks.forEach(check => {
    const keys = check.key.split('.');
    const frValue = keys.reduce((obj, key) => obj?.[key], frJson);
    const enValue = keys.reduce((obj, key) => obj?.[key], enJson);

    if (frValue !== check.fr || enValue !== check.en) {
      console.log(`  ❌ Traduction manquante ou incorrecte: ${check.key}`);
      console.log(`     FR: attendu="${check.fr}", reçu="${frValue}"`);
      console.log(`     EN: attendu="${check.en}", reçu="${enValue}"`);
      allTranslationsOk = false;
      allTestsPassed = false;
    }
  });

  if (allTranslationsOk) {
    console.log(`  ✅ Toutes les traductions présentes (${checks.length} vérifiées)\n`);
    results.push({ test: 'Traductions FR/EN', status: 'PASS' });
    return true;
  } else {
    console.log('\n');
    results.push({ test: 'Traductions FR/EN', status: 'FAIL' });
    return false;
  }
}

// ============================================
// TEST 5: Logique sommeil 8h minimum
// ============================================
function testSleepLogic() {
  console.log('😴 TEST 5: Vérification logique sommeil (8h minimum)...');

  const sleepFormPath = path.join(__dirname, 'src/components/SleepForm.tsx');
  const content = fs.readFileSync(sleepFormPath, 'utf-8');

  // Vérifier que le seuil est bien >= 8 et non >= 7
  const has8hThreshold = content.includes('duration >= 8') && content.includes('duration < 8');
  const hasOld7hThreshold = content.includes('duration >= 7');

  if (has8hThreshold && !hasOld7hThreshold) {
    console.log('  ✅ Seuil sommeil correct: >= 8h pour "good"\n');
    results.push({ test: 'Logique sommeil 8h', status: 'PASS' });
    return true;
  } else {
    console.log('  ❌ Seuil sommeil incorrect (devrait être >= 8h)\n');
    results.push({ test: 'Logique sommeil 8h', status: 'FAIL' });
    allTestsPassed = false;
    return false;
  }
}

// ============================================
// TEST 6: UX mobile tâches (ajout au début)
// ============================================
function testTasksUX() {
  console.log('📱 TEST 6: Vérification UX mobile tâches...');

  const tasksFormPath = path.join(__dirname, 'src/components/TasksForm.tsx');
  const content = fs.readFileSync(tasksFormPath, 'utf-8');

  // Vérifier que la nouvelle tâche est ajoutée au début
  const hasTaskAtStart = content.includes('[newTask, ...prev]');
  const hasScrollLogic = content.includes('scrollIntoView');
  const hasDataAttribute = content.includes('data-tasks-list');

  if (hasTaskAtStart && hasScrollLogic && hasDataAttribute) {
    console.log('  ✅ UX mobile améliorée:');
    console.log('     - Tâche ajoutée au début: ✅');
    console.log('     - Scroll automatique: ✅');
    console.log('     - Attribut data-tasks-list: ✅\n');
    results.push({ test: 'UX mobile tâches', status: 'PASS' });
    return true;
  } else {
    console.log('  ❌ UX mobile incomplète:');
    console.log(`     - Tâche au début: ${hasTaskAtStart ? '✅' : '❌'}`);
    console.log(`     - Scroll auto: ${hasScrollLogic ? '✅' : '❌'}`);
    console.log(`     - Data attribute: ${hasDataAttribute ? '✅' : '❌'}\n`);
    results.push({ test: 'UX mobile tâches', status: 'FAIL' });
    allTestsPassed = false;
    return false;
  }
}

// ============================================
// TEST 7: Responsive EntryForm
// ============================================
function testResponsive() {
  console.log('📐 TEST 7: Vérification responsive EntryForm...');

  const entryFormPath = path.join(__dirname, 'src/pages/EntryForm.tsx');
  const content = fs.readFileSync(entryFormPath, 'utf-8');

  const hasFlexCol = content.includes('flex-col sm:flex-row');
  const hasFullWidth = content.includes('w-full sm:w-auto');

  if (hasFlexCol && hasFullWidth) {
    console.log('  ✅ Responsive mobile implémenté:');
    console.log('     - flex-col sm:flex-row: ✅');
    console.log('     - w-full sm:w-auto: ✅\n');
    results.push({ test: 'Responsive EntryForm', status: 'PASS' });
    return true;
  } else {
    console.log('  ❌ Responsive mobile incomplet\n');
    results.push({ test: 'Responsive EntryForm', status: 'FAIL' });
    allTestsPassed = false;
    return false;
  }
}

// ============================================
// EXÉCUTION DES TESTS
// ============================================
async function runAllTests() {
  await testServerAccessible();
  testBuildExists();
  testModifiedFiles();
  testTranslations();
  testSleepLogic();
  testTasksUX();
  testResponsive();

  // Résumé
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS\n');
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}: ${r.status}`);
  });
  console.log('='.repeat(60));

  if (allTestsPassed) {
    console.log('\n🎉 TOUS LES TESTS PASSÉS AVEC SUCCÈS !');
    console.log('\n✅ Les corrections sont prêtes pour le test utilisateur.\n');
    process.exit(0);
  } else {
    console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('\n⚠️  Veuillez corriger les erreurs avant de proposer à l\'utilisateur.\n');
    process.exit(1);
  }
}

// Lancer les tests
runAllTests().catch(err => {
  console.error('❌ Erreur lors des tests:', err);
  process.exit(1);
});