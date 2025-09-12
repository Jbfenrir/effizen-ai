#!/usr/bin/env node

/**
 * Script de test pour vérifier les dernières corrections du système de conseils
 * Vérifie les seuils, couleurs et clarifications
 */

const fs = require('fs');

console.log('🧪 Vérification des corrections des patterns\n');

// 1. Vérifier les modifications dans adviceEngine.ts
console.log('📊 Vérification des seuils corrigés...');
const adviceEngine = fs.readFileSync('./src/services/adviceEngine.ts', 'utf8');

const corrections = [
  {
    name: 'Heures travaillées - zone 8-9h',
    check: adviceEngine.includes("if (average <= 9) return 'moyen'"),
    expected: 'Zone intermédiaire 8-9h'
  },
  {
    name: 'Sommeil - tranches sans chevauchement',
    check: adviceEngine.includes("if (average >= 6.5 && average < 7)") &&
           adviceEngine.includes("if (average > 9 && average <= 9.5)"),
    expected: 'Tranches distinctes pour sommeil'
  },
  {
    name: 'Pauses/Méditations - zone 1.5-2',
    check: adviceEngine.includes("if (average >= 1.5) return 'moyen'"),
    expected: 'Zone intermédiaire 1.5-2 pauses'
  },
  {
    name: 'Sport/Loisir - minimum 1h',
    check: adviceEngine.includes("≥1h/jour"),
    expected: '≥1h/jour (pas <1h)'
  },
  {
    name: 'Valeurs de référence - sommeil',
    check: adviceEngine.includes("'6.5h-7h ou 9h-9.5h'"),
    expected: 'Tranches clarifiées'
  }
];

corrections.forEach(test => {
  if (test.check) {
    console.log(`   ✅ ${test.name}: ${test.expected}`);
  } else {
    console.log(`   ❌ ${test.name}: Non trouvé`);
  }
});

// 2. Vérifier les modifications dans le composant
console.log('\n🎨 Vérification de l\'affichage...');
const testComponent = fs.readFileSync('./src/components/AdviceEngineTest.tsx', 'utf8');

const displayChecks = [
  {
    name: 'Clarification niveau de risque',
    check: testComponent.includes('Risque:') && 
           testComponent.includes('niveau de préoccupation/risque'),
    expected: 'Label "Risque:" au lieu du niveau seul'
  },
  {
    name: 'Moyenne interactions sociales',
    check: testComponent.includes('calculateBooleanAverage') &&
           testComponent.includes('% des jours'),
    expected: 'Affichage en pourcentage'
  },
  {
    name: 'Couleurs uniformes',
    check: testComponent.includes("// Toutes les métriques utilisent maintenant un niveau de préoccupation") &&
           testComponent.includes("'élevé' = toujours mauvais (rouge)"),
    expected: 'Rouge = préoccupation élevée pour toutes métriques'
  }
];

displayChecks.forEach(test => {
  if (test.check) {
    console.log(`   ✅ ${test.name}: ${test.expected}`);
  } else {
    console.log(`   ❌ ${test.name}: Non trouvé`);
  }
});

console.log('\n═══════════════════════════════════════');
console.log('📋 RÉSUMÉ DES CORRECTIONS');
console.log('═══════════════════════════════════════\n');

console.log('✅ Clarifications apportées:');
console.log('   • Indicateur = niveau de risque/préoccupation (pas la valeur)');
console.log('   • Label "Risque:" ajouté pour clarifier');
console.log('   • Message explicatif ajouté en haut des patterns\n');

console.log('✅ Moyennes corrigées:');
console.log('   • Interactions sociales: affichage en % des jours');
console.log('   • Toutes les métriques affichent leur moyenne\n');

console.log('✅ Seuils ajustés selon expertises:');
console.log('   • Heures travaillées: zone grise 8-9h');
console.log('   • Pauses: zone intermédiaire 1.5-2');
console.log('   • Sport/Loisir: optimal ≥1h (pas <1h)');
console.log('   • Sommeil: tranches sans chevauchement\n');

console.log('✅ Code couleur uniforme:');
console.log('   • Vert = aucune préoccupation');
console.log('   • Vert clair = préoccupation faible');
console.log('   • Jaune = préoccupation moyenne');
console.log('   • Rouge = préoccupation élevée\n');

console.log('🎯 Test recommandé:');
console.log('   Ouvrir http://localhost:3001/test-advice');
console.log('   Tester le scénario "Burnout" pour vérifier:');
console.log('   - Énergie moyenne 1.6 → Risque: élevé (rouge)');
console.log('   - Sommeil faible → Risque: élevé (rouge)');
console.log('   - Interactions sociales → affichage en %\n');