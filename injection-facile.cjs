#!/usr/bin/env node

/**
 * Solution alternative pour l'injection des données historiques
 * Divise les données en petits blocs faciles à exécuter dans la console
 */

const fs = require('fs');

console.log('🚀 Génération injection simplifiée...');

// Lire les données converties
const donnees = JSON.parse(fs.readFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/donnees-converties.json', 'utf8'));

console.log(`📊 ${donnees.length} entrées à traiter`);

// Diviser en lots de 5 entrées
const tailleLot = 5;
const lots = [];

for (let i = 0; i < donnees.length; i += tailleLot) {
  lots.push(donnees.slice(i, i + tailleLot));
}

console.log(`📦 ${lots.length} lots créés`);

// Générer les scripts par lots
let scriptComplet = `// INJECTION DONNÉES HISTORIQUES - SCRIPTS SÉPARÉS
// À exécuter dans la console de https://effizen-ai-prod.vercel.app
// Après connexion avec jbgerberon@formation-ia-entreprises.ch

console.log('🚀 Démarrage injection données historiques par lots...');

// 1. D'abord récupérer votre user_id
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  console.error('❌ Utilisateur non connecté:', userError);
  throw new Error('Connectez-vous d\\'abord');
}
console.log('✅ Utilisateur:', user.email, 'ID:', user.id);

// 2. Vérifier les données existantes
const { data: existing } = await supabase.from('daily_entries').select('entry_date').eq('user_id', user.id);
const existingDates = new Set((existing || []).map(e => e.entry_date));
console.log('📊 ' + existingDates.size + ' entrées déjà présentes');

// Variable globale pour compter les injections réussies
let totalInjected = 0;

`;

lots.forEach((lot, index) => {
  const lotData = lot.map(entry => ({ ...entry, user_id: 'user.id' }));
  
  scriptComplet += `
// =================== LOT ${index + 1}/${lots.length} ===================
console.log('🔄 Traitement lot ${index + 1}/${lots.length}...');

const lot${index + 1} = ${JSON.stringify(lotData, null, 2).replace('"user.id"', 'user.id')};

// Filtrer les nouvelles entrées de ce lot
const newEntriesLot${index + 1} = lot${index + 1}.filter(entry => !existingDates.has(entry.entry_date));

if (newEntriesLot${index + 1}.length === 0) {
  console.log('⭐ Lot ${index + 1} : Toutes les données déjà présentes');
} else {
  console.log('📥 Lot ${index + 1} : ' + newEntriesLot${index + 1}.length + ' nouvelles entrées à injecter');
  
  const { data, error } = await supabase.from('daily_entries').insert(newEntriesLot${index + 1});
  
  if (error) {
    console.error('❌ Erreur lot ${index + 1}:', error);
  } else {
    totalInjected += newEntriesLot${index + 1}.length;
    console.log('✅ Lot ${index + 1} injecté avec succès !');
    
    // Ajouter les dates au set pour éviter les doublons dans les lots suivants
    newEntriesLot${index + 1}.forEach(entry => existingDates.add(entry.entry_date));
  }
}

`;
});

scriptComplet += `
// =================== RÉSULTAT FINAL ===================
console.log('🎉 INJECTION TERMINÉE !');
console.log('📊 Total entrées injectées : ' + totalInjected + ' / ${donnees.length}');
console.log('🔄 Rechargez la page pour voir vos données historiques !');
`;

// Sauvegarder le script complet
fs.writeFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/injection-par-lots.js', scriptComplet);

// Générer aussi des scripts individuels pour plus de facilité
let scriptSimple = `// SCRIPTS INDIVIDUELS - À exécuter UN PAR UN dans la console

// ÉTAPE 1 : Initialisation (à exécuter en premier)
const initInjection = async () => {
  console.log('🚀 Initialisation injection...');
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Utilisateur non connecté:', userError);
    return null;
  }
  console.log('✅ Utilisateur:', user.email, 'ID:', user.id);
  
  const { data: existing } = await supabase.from('daily_entries').select('entry_date').eq('user_id', user.id);
  const existingDates = new Set((existing || []).map(e => e.entry_date));
  console.log('📊 ' + existingDates.size + ' entrées déjà présentes');
  
  // Stocker dans window pour usage global
  window.userData = { user, existingDates, totalInjected: 0 };
  
  console.log('🎯 Prêt ! Exécutez maintenant injectLot1(), puis injectLot2(), etc.');
  return window.userData;
};

// Exécuter cette ligne en premier :
initInjection();

`;

lots.forEach((lot, index) => {
  scriptSimple += `
// ÉTAPE ${index + 2} : Lot ${index + 1}
const injectLot${index + 1} = async () => {
  if (!window.userData) {
    console.error('❌ Exécutez d\\'abord initInjection()');
    return;
  }
  
  console.log('🔄 Injection lot ${index + 1}/${lots.length}...');
  
  const lot = ${JSON.stringify(lot.map(entry => ({ ...entry, user_id: 'USER_ID' })), null, 2).replace('"USER_ID"', 'window.userData.user.id')};
  
  const newEntries = lot.filter(entry => !window.userData.existingDates.has(entry.entry_date));
  
  if (newEntries.length === 0) {
    console.log('⭐ Lot ${index + 1} : Toutes les données déjà présentes');
    return;
  }
  
  console.log('📥 Lot ${index + 1} : ' + newEntries.length + ' nouvelles entrées');
  
  const { data, error } = await supabase.from('daily_entries').insert(newEntries);
  
  if (error) {
    console.error('❌ Erreur lot ${index + 1}:', error);
  } else {
    window.userData.totalInjected += newEntries.length;
    newEntries.forEach(entry => window.userData.existingDates.add(entry.entry_date));
    console.log('✅ Lot ${index + 1} injecté ! Total : ' + window.userData.totalInjected + '/${donnees.length}');
    
    if (${index + 1} === ${lots.length}) {
      console.log('🎉 INJECTION TERMINÉE ! Rechargez la page.');
    } else {
      console.log('➡️  Exécutez maintenant : injectLot${index + 2}()');
    }
  }
};

`;
});

fs.writeFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/injection-simple.js', scriptSimple);

console.log('✅ Scripts générés :');
console.log('   📁 injection-par-lots.js - Script complet automatique');
console.log('   📁 injection-simple.js - Scripts individuels à exécuter un par un');
console.log('');
console.log('🎯 SOLUTION RECOMMANDÉE : injection-simple.js');
console.log('   1. Copier/coller initInjection() puis Entrée');
console.log('   2. Copier/coller injectLot1() puis Entrée');
console.log('   3. Répéter pour injectLot2(), injectLot3(), etc.');
console.log('');
console.log('✅ Plus fiable que les gros scripts !');