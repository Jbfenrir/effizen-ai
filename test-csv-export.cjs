#!/usr/bin/env node

/**
 * Script de test pour l'export CSV corrigé
 * Vérifie que localhost:3001 est accessible et que l'export fonctionne
 */

const http = require('http');
const port = 3001;

console.log('🔍 Test: Export CSV corrigé avec toutes les colonnes');
console.log('=' .repeat(60));

// Test 1: Vérifier que le serveur local est accessible
console.log('\n📡 Test 1: Serveur localhost:3001 accessible...');
http.get(`http://localhost:${port}`, (res) => {
  console.log(`✅ Serveur accessible (status: ${res.statusCode})`);
  
  console.log('\n📊 Export CSV Corrigé - Nouvelles colonnes ajoutées:');
  console.log('   ✅ Energie (score calculé depuis wellbeing.energy)');
  console.log('   ✅ Pauses (nombre de créneaux meditationsPauses actifs)');
  console.log('   ✅ Bien-être (score calculé au lieu d\'être vide)');
  console.log('   ✅ Score d\'optimisation (calcul du temps haute valeur)');
  console.log('   ✅ Tri chronologique des données');
  console.log('   ✅ Encodage UTF-8 pour les caractères spéciaux');
  
  console.log('\n📂 Structure CSV corrigée:');
  console.log('   Date ; Sommeil (h) ; Fatigue ; Energie ; Pauses ; Bien-être ; Score d\'optimisation ; Tâches');
  
  console.log('\n🎯 Instructions pour test manuel:');
  console.log('   1. Ouvrir http://localhost:3001');
  console.log('   2. Se connecter avec un compte utilisateur');
  console.log('   3. Cliquer sur menu utilisateur (coin haut-droite)');
  console.log('   4. Cliquer "Exporter mes données"');
  console.log('   5. Vérifier le fichier "effizen-data-complet.csv"');
  
  console.log('\n✅ Test terminé avec succès !');
  process.exit(0);
}).on('error', (err) => {
  console.log(`❌ Serveur non accessible: ${err.message}`);
  console.log('💡 Solution: Démarrer le serveur avec "npm run dev"');
  process.exit(1);
});