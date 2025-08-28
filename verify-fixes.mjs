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

// Vérifier dans le build de production
function checkProductionBuild() {
  log('\n🔍 Vérification du build de production', 'blue');
  
  const distDir = path.join(__dirname, 'dist/assets');
  
  if (!fs.existsSync(distDir)) {
    log('❌ Le dossier dist/assets n\'existe pas. Lancez npm run build d\'abord.', 'red');
    return false;
  }
  
  // Trouver le fichier JS principal
  const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js') && f.includes('index'));
  
  if (jsFiles.length === 0) {
    log('❌ Aucun fichier index.js trouvé dans dist/assets', 'red');
    return false;
  }
  
  let foundTranslations = false;
  let foundSignOutFix = false;
  
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(distDir, file), 'utf8');
    
    // Vérifier les traductions FR
    if (content.includes('Nouvel Utilisateur') && 
        content.includes('Tableau de Bord Administrateur') &&
        content.includes('Export Global')) {
      foundTranslations = true;
      log(`✅ Traductions FR trouvées dans ${file}`, 'green');
    }
    
    // Vérifier la correction signOut
    if (content.includes('scope:"local"') || content.includes("scope:'local'")) {
      foundSignOutFix = true;
      log(`✅ Correction signOut (scope:local) trouvée dans ${file}`, 'green');
    }
  }
  
  if (!foundTranslations) {
    log('⚠️ Traductions FR non trouvées dans le build', 'yellow');
  }
  
  if (!foundSignOutFix) {
    log('⚠️ Correction signOut non trouvée dans le build', 'yellow');
  }
  
  return foundTranslations && foundSignOutFix;
}

// Vérifier la structure des fichiers sources
function checkSourceFiles() {
  log('\n📂 Vérification des fichiers sources', 'blue');
  
  const checks = [
    {
      file: 'src/i18n/fr.json',
      test: (content) => {
        const data = JSON.parse(content);
        return data.dashboard?.admin?.newUser === 'Nouvel Utilisateur' &&
               data.dashboard?.admin?.title === 'Tableau de Bord Administrateur';
      },
      success: 'Traductions FR correctes dans fr.json',
      failure: 'Traductions FR incorrectes dans fr.json'
    },
    {
      file: 'src/services/supabase.ts',
      test: (content) => content.includes("scope: 'local'"),
      success: 'Correction signOut présente dans supabase.ts',
      failure: 'Correction signOut absente dans supabase.ts'
    },
    {
      file: 'src/hooks/useAuthNew.ts',
      test: (content) => content.includes("scope: 'local'"),
      success: 'Correction signOut présente dans useAuthNew.ts',
      failure: 'Correction signOut absente dans useAuthNew.ts'
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const filePath = path.join(__dirname, check.file);
    
    if (!fs.existsSync(filePath)) {
      log(`❌ Fichier non trouvé: ${check.file}`, 'red');
      allPassed = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (check.test(content)) {
      log(`✅ ${check.success}`, 'green');
    } else {
      log(`❌ ${check.failure}`, 'red');
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Rapport détaillé
function generateReport() {
  log('\n📊 RAPPORT DÉTAILLÉ DES CORRECTIONS', 'magenta');
  log('=====================================', 'magenta');
  
  // Problème 1: Traductions
  log('\n1️⃣ PROBLÈME: Libellés français incorrects', 'blue');
  log('   Symptôme: "dashboard.admin.newUser" au lieu de "Nouvel Utilisateur"', 'yellow');
  log('   ✅ SOLUTION: Ajout de toutes les traductions dans src/i18n/fr.json', 'green');
  
  // Problème 2: Déconnexion
  log('\n2️⃣ PROBLÈME: Erreur 403 lors de la déconnexion en production', 'blue');
  log('   Symptôme: Failed to load resource: 403 sur /auth/v1/logout?scope=global', 'yellow');
  log('   ✅ SOLUTION: Utilisation de scope:"local" dans signOut()', 'green');
  
  // Fichiers modifiés
  log('\n📝 FICHIERS MODIFIÉS:', 'blue');
  log('   • src/i18n/fr.json - Ajout section dashboard.admin complète', 'reset');
  log('   • src/services/supabase.ts - signOut avec scope:"local"', 'reset');
  log('   • src/hooks/useAuthNew.ts - signOut avec scope:"local"', 'reset');
}

// Exécuter toutes les vérifications
async function main() {
  log('🚀 VÉRIFICATION DES CORRECTIONS APPLIQUÉES', 'magenta');
  log('==========================================', 'magenta');
  
  const sourceCheck = checkSourceFiles();
  const buildCheck = checkProductionBuild();
  
  generateReport();
  
  log('\n🏁 RÉSULTAT FINAL', 'magenta');
  log('=================', 'magenta');
  
  if (sourceCheck && buildCheck) {
    log('✅ TOUTES LES CORRECTIONS SONT CORRECTEMENT APPLIQUÉES', 'green');
    log('✅ Prêt pour le déploiement en production', 'green');
    log('\n📤 Pour déployer:', 'blue');
    log('   git add .', 'reset');
    log('   git commit -m "Fix: Traductions FR + Déconnexion production"', 'reset');
    log('   git push', 'reset');
  } else if (sourceCheck) {
    log('✅ Corrections appliquées dans les sources', 'green');
    log('⚠️ Mais le build doit être regénéré: npm run build', 'yellow');
  } else {
    log('❌ Des corrections sont manquantes', 'red');
  }
}

main().catch(error => {
  log(`❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});