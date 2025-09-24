#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
  if (passed) {
    console.log(`${colors.green}✅ ${testName}${colors.reset} ${details}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}❌ ${testName}${colors.reset} ${details}`);
    testsFailed++;
  }
}

console.log(`${colors.blue}🧪 Test complet des traductions et modifications${colors.reset}\n`);

// Test 1: Vérifier que les fichiers modifiés existent
console.log(`${colors.yellow}📁 Test 1: Vérification des fichiers modifiés${colors.reset}`);
const filesToCheck = [
  'src/components/WellbeingForm.tsx',
  'src/components/FocusForm.tsx',
  'src/pages/EntryForm.tsx',
  'src/i18n/en.json',
  'src/i18n/fr.json'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  logTest(`Fichier ${file}`, exists);
});

// Test 2: Vérifier les traductions EN
console.log(`\n${colors.yellow}🌍 Test 2: Vérification des clés de traduction EN${colors.reset}`);
const enPath = path.join(__dirname, 'src/i18n/en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const enKeysToCheck = [
  { path: 'focus.energyLevel', expected: 'Energy level' },
  { path: 'wellbeing.meditationsPauses', expected: 'Meditations / Breaks' },
  { path: 'wellbeing.sportLeisureHours', expected: 'Sport/leisure hours' },
  { path: 'wellbeing.socialInteraction', expected: 'Daily social interaction' },
  { path: 'wellbeing.socialInteractionText', expected: 'I had positive social interactions today' },
  { path: 'wellbeing.meditations.morning', expected: 'Morning' },
  { path: 'wellbeing.meditations.noon', expected: 'Noon' },
  { path: 'wellbeing.meditations.afternoon', expected: 'Afternoon' },
  { path: 'wellbeing.meditations.evening', expected: 'Evening' },
  { path: 'wellbeing.summary.meditationsPauses', expected: 'Meditations / Breaks' },
  { path: 'wellbeing.summary.sportLeisure', expected: 'Sport / Leisure' },
  { path: 'wellbeing.summary.social', expected: 'Social' }
];

enKeysToCheck.forEach(({ path: keyPath, expected }) => {
  const keys = keyPath.split('.');
  let value = enContent;
  for (const key of keys) {
    value = value?.[key];
  }
  const exists = value !== undefined;
  const correct = value === expected;
  logTest(
    `EN: ${keyPath}`,
    exists && correct,
    exists ? (correct ? `"${value}"` : `Trouvé "${value}" au lieu de "${expected}"`) : 'Non trouvé'
  );
});

// Test 3: Vérifier les traductions FR
console.log(`\n${colors.yellow}🇫🇷 Test 3: Vérification des clés de traduction FR${colors.reset}`);
const frPath = path.join(__dirname, 'src/i18n/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

const frKeysToCheck = [
  { path: 'focus.energyLevel', expected: "Niveau d'énergie" },
  { path: 'wellbeing.meditationsPauses', expected: 'Méditations / Pauses' },
  { path: 'wellbeing.sportLeisureHours', expected: 'Heures de sport/loisir' },
  { path: 'wellbeing.socialInteraction', expected: 'Interaction sociale quotidienne' },
  { path: 'wellbeing.socialInteractionText', expected: "J'ai eu des interactions sociales positives aujourd'hui" },
  { path: 'wellbeing.meditations.morning', expected: 'Matin' },
  { path: 'wellbeing.meditations.noon', expected: 'Midi' },
  { path: 'wellbeing.meditations.afternoon', expected: 'Après-midi' },
  { path: 'wellbeing.meditations.evening', expected: 'Soir' },
  { path: 'wellbeing.summary.meditationsPauses', expected: 'Méditations / Pauses' },
  { path: 'wellbeing.summary.sportLeisure', expected: 'Sport / Loisir' },
  { path: 'wellbeing.summary.social', expected: 'Social' }
];

frKeysToCheck.forEach(({ path: keyPath, expected }) => {
  const keys = keyPath.split('.');
  let value = frContent;
  for (const key of keys) {
    value = value?.[key];
  }
  const exists = value !== undefined;
  const correct = value === expected;
  logTest(
    `FR: ${keyPath}`,
    exists && correct,
    exists ? (correct ? `"${value}"` : `Trouvé "${value}" au lieu de "${expected}"`) : 'Non trouvé'
  );
});

// Test 4: Vérifier que WellbeingForm utilise les traductions
console.log(`\n${colors.yellow}🔍 Test 4: Vérification du code WellbeingForm${colors.reset}`);
const wellbeingPath = path.join(__dirname, 'src/components/WellbeingForm.tsx');
const wellbeingContent = fs.readFileSync(wellbeingPath, 'utf8');

const wellbeingChecks = [
  { code: "{t('wellbeing.meditations.morning')}", description: 'Traduction Morning' },
  { code: "{t('wellbeing.meditations.noon')}", description: 'Traduction Noon' },
  { code: "{t('wellbeing.meditations.afternoon')}", description: 'Traduction Afternoon' },
  { code: "{t('wellbeing.meditations.evening')}", description: 'Traduction Evening' },
  { code: "{t('wellbeing.meditationsPauses')}", description: 'Traduction Méditations/Pauses' },
  { code: "{t('wellbeing.sportLeisureHours')}", description: 'Traduction Sport/Loisir' },
  { code: "{t('wellbeing.socialInteraction')}", description: 'Traduction Interaction sociale' },
  { code: "{t('wellbeing.socialInteractionText')}", description: 'Traduction texte social' },
  { code: "{t('wellbeing.summary.meditationsPauses')}", description: 'Traduction résumé Méditations' },
  { code: "{t('wellbeing.summary.sportLeisure')}", description: 'Traduction résumé Sport' },
  { code: "{t('wellbeing.summary.social')}", description: 'Traduction résumé Social' }
];

wellbeingChecks.forEach(({ code, description }) => {
  const found = wellbeingContent.includes(code);
  logTest(`WellbeingForm: ${description}`, found, found ? 'Trouvé' : `Code "${code}" non trouvé`);
});

// Test 5: Vérifier FocusForm
console.log(`\n${colors.yellow}🔍 Test 5: Vérification du code FocusForm${colors.reset}`);
const focusPath = path.join(__dirname, 'src/components/FocusForm.tsx');
const focusContent = fs.readFileSync(focusPath, 'utf8');

const focusChecks = [
  { code: "{t('focus.energyLevel')}", description: 'Traduction Niveau énergie' }
];

focusChecks.forEach(({ code, description }) => {
  const found = focusContent.includes(code);
  logTest(`FocusForm: ${description}`, found, found ? 'Trouvé' : `Code "${code}" non trouvé`);
});

// Test 6: Vérifier le header EntryForm
console.log(`\n${colors.yellow}🔍 Test 6: Vérification du header EntryForm${colors.reset}`);
const entryPath = path.join(__dirname, 'src/pages/EntryForm.tsx');
const entryContent = fs.readFileSync(entryPath, 'utf8');

// Vérifier la structure du header (conteneur blanc englobant)
const headerInContainer = entryContent.includes('<div className="bg-white border-b border-light-gray">');
logTest('EntryForm: Header dans conteneur blanc', headerInContainer);

// Vérifier structure 2 lignes
const hasFirstLine = entryContent.includes('{/* Première ligne : Titre + Dashboard */}');
const hasSecondLine = entryContent.includes('{/* Deuxième ligne : Date + Score + Bouton Save */}');
logTest('EntryForm: Structure 2 lignes', hasFirstLine && hasSecondLine);

// Test 7: Test HTTP localhost
console.log(`\n${colors.yellow}🌐 Test 7: Vérification serveur localhost:3001${colors.reset}`);
const http = require('http');

const checkServer = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
};

checkServer().then(serverUp => {
  logTest('Serveur actif sur localhost:3001', serverUp);

  // Résumé final
  console.log(`\n${colors.blue}📊 RÉSUMÉ DES TESTS${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${testsPassed}${colors.reset}`);
  if (testsFailed > 0) {
    console.log(`${colors.red}❌ Tests échoués: ${testsFailed}${colors.reset}`);
  }

  const allPassed = testsFailed === 0;
  if (allPassed) {
    console.log(`\n${colors.green}🎉 TOUS LES TESTS SONT PASSÉS !${colors.reset}`);
    console.log(`${colors.green}Les modifications sont prêtes à être testées.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️ CERTAINS TESTS ONT ÉCHOUÉ${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez les erreurs ci-dessus avant de continuer.${colors.reset}`);
  }

  process.exit(testsFailed > 0 ? 1 : 0);
});