#!/usr/bin/env node

/**
 * Script de diagnostic complet pour localiser les données historiques perdues
 * Investigue localStorage, structure Supabase, et connexions
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC COMPLET: Localisation des données historiques');
console.log('=' .repeat(80));

// Fonction pour simuler le localStorage dans Node.js
function simulateLocalStorageCheck() {
  console.log('\n📱 Test 1: Vérification localStorage (simulation navigateur)');
  
  // Les données localStorage ne sont pas accessibles depuis Node.js
  // mais on peut vérifier si le code est conçu pour les utiliser
  console.log('   ⚠️  localStorage non accessible depuis Node.js');
  console.log('   ℹ️  Le dashboard utilise localStorage seulement en développement local');
  
  // Vérifier la logique dans le code
  const dataAnalyticsPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/src/utils/dataAnalytics.ts';
  if (fs.existsSync(dataAnalyticsPath)) {
    const content = fs.readFileSync(dataAnalyticsPath, 'utf8');
    
    if (content.includes('getAllEntriesFromSupabase')) {
      console.log('   ✅ Fonction getAllEntriesFromSupabase() présente dans le code');
    } else {
      console.log('   ❌ Fonction getAllEntriesFromSupabase() MANQUANTE');
    }
    
    if (content.includes('getAllEntries')) {
      console.log('   ✅ Fonction universelle getAllEntries() présente');
    } else {
      console.log('   ❌ Fonction universelle getAllEntries() MANQUANTE');  
    }
    
    if (content.includes('window.location.hostname')) {
      console.log('   ✅ Détection environnement localhost/production présente');
    } else {
      console.log('   ❌ Détection environnement MANQUANTE');
    }
  }
}

// Vérifier la configuration Supabase
function checkSupabaseConfig() {
  console.log('\n🗄️  Test 2: Configuration Supabase');
  
  const supabasePath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/src/services/supabase.ts';
  if (fs.existsSync(supabasePath)) {
    const content = fs.readFileSync(supabasePath, 'utf8');
    
    if (content.includes('createClient')) {
      console.log('   ✅ Client Supabase configuré');
    } else {
      console.log('   ❌ Client Supabase non configuré');
    }
    
    if (content.includes('VITE_SUPABASE_URL')) {
      console.log('   ✅ URL Supabase référencée');
    } else {
      console.log('   ❌ URL Supabase manquante');
    }
  } else {
    console.log('   ❌ Fichier supabase.ts non trouvé');
  }
  
  // Vérifier les variables d'environnement
  const envPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/.env';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('   ✅ Fichier .env présent');
    
    if (envContent.includes('VITE_SUPABASE_URL')) {
      console.log('   ✅ VITE_SUPABASE_URL configurée dans .env');
    } else {
      console.log('   ❌ VITE_SUPABASE_URL manquante dans .env');
    }
    
    if (envContent.includes('VITE_SUPABASE_ANON_KEY')) {
      console.log('   ✅ VITE_SUPABASE_ANON_KEY configurée dans .env');
    } else {
      console.log('   ❌ VITE_SUPABASE_ANON_KEY manquante dans .env');
    }
  } else {
    console.log('   ❌ Fichier .env non trouvé');
  }
}

// Analyser comment les données sont sauvegardées
function analyzeSaveLogic() {
  console.log('\n💾 Test 3: Analyse logique de sauvegarde des données');
  
  const entryFormPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/src/pages/EntryForm.tsx';
  if (fs.existsSync(entryFormPath)) {
    const content = fs.readFileSync(entryFormPath, 'utf8');
    
    console.log('   📝 Analyse EntryForm.tsx:');
    
    if (content.includes('localStorage.setItem')) {
      console.log('   ✅ Sauvegarde localStorage détectée');
    } else {
      console.log('   ❌ Pas de sauvegarde localStorage');
    }
    
    if (content.includes('supabase') && content.includes('insert')) {
      console.log('   ✅ Sauvegarde Supabase détectée');
    } else {
      console.log('   ❌ Pas de sauvegarde Supabase détectée');
    }
    
    if (content.includes('daily_entries')) {
      console.log('   ✅ Référence à la table daily_entries');
    } else {
      console.log('   ❌ Aucune référence à daily_entries');
    }
  } else {
    console.log('   ❌ EntryForm.tsx non trouvé');
  }
}

// Vérifier les types de données
function checkDataStructure() {
  console.log('\n📋 Test 4: Structure des données attendues');
  
  const typesPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/src/types/index.ts';
  if (fs.existsSync(typesPath)) {
    const content = fs.readFileSync(typesPath, 'utf8');
    
    if (content.includes('interface DailyEntry')) {
      console.log('   ✅ Interface DailyEntry définie');
      
      if (content.includes('sportLeisureHours')) {
        console.log('   ✅ Nouveau champ sportLeisureHours présent');
      } else {
        console.log('   ❌ Champ sportLeisureHours manquant (incompatibilité)');
      }
      
      if (content.includes('socialInteraction')) {
        console.log('   ✅ Nouveau champ socialInteraction présent');
      } else {
        console.log('   ❌ Champ socialInteraction manquant (incompatibilité)');
      }
      
      if (content.includes('meditationsPauses')) {
        console.log('   ✅ Structure meditationsPauses présente');
      } else {
        console.log('   ❌ Structure meditationsPauses manquante');
      }
    }
  }
}

// Créer recommandations
function generateRecommendations() {
  console.log('\n🎯 RECOMMANDATIONS POUR LOCALISER VOS DONNÉES:');
  console.log('');
  console.log('1. 🔍 VÉRIFIER SUPABASE DASHBOARD:');
  console.log('   → Aller sur https://supabase.com/dashboard');
  console.log('   → Se connecter avec jbgerberon@gmail.com');  
  console.log('   → Projet EffiZen-AI → Table Editor');
  console.log('   → Vérifier si table "daily_entries" existe et contient des données');
  console.log('   → Chercher entrées avec user_id correspondant à votre compte');
  
  console.log('\\n2. 🔍 VÉRIFIER CONSOLE NAVIGATEUR EN PRODUCTION:');
  console.log('   → Aller sur https://effizen-ai-prod.vercel.app');
  console.log('   → Se connecter avec jbgerberon@formation-ia-entreprises.ch');
  console.log('   → F12 → Console');
  console.log('   → Chercher logs: "📊 Chargé X entrées depuis..."');
  console.log('   → Chercher erreurs de connexion Supabase');
  
  console.log('\\n3. 🔍 TESTER REQUÊTE SUPABASE MANUELLE:');
  console.log('   → Console navigateur → Exécuter:');
  console.log('   → await supabase.from("daily_entries").select("*")');
  console.log('   → Vérifier si retour données ou erreur');
  
  console.log('\\n4. ❓ HYPOTHÈSES À VÉRIFIER:');
  console.log('   → Les données sont peut-être dans une autre table');
  console.log('   → Les données sont peut-être cryptées');
  console.log('   → Les données sont peut-être associées à un autre user_id');
  console.log('   → Les données sont peut-être dans un autre projet Supabase');
  
  console.log('\\n💡 PROCHAINE ÉTAPE:');
  console.log('   → Partager les résultats de ces vérifications');
  console.log('   → Je créerai alors un script de récupération adapté');
}

// Exécuter tous les tests
console.log('🚀 Exécution du diagnostic...');
simulateLocalStorageCheck();
checkSupabaseConfig();
analyzeSaveLogic();
checkDataStructure();
generateRecommendations();

console.log('\\n✅ Diagnostic terminé. En attente des vérifications manuelles.');