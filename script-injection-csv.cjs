#!/usr/bin/env node

/**
 * Script d'injection des données CSV vers Supabase
 * Convertit les données CSV de l'utilisateur au format DailyEntry et les injecte
 */

const fs = require('fs');

// Fonction pour analyser les tâches depuis la colonne CSV
function parseTasks(tasksString) {
  if (!tasksString || tasksString.trim() === '') return [];
  
  // Format: "App (1h) | Recherche (2h) | Veille (3h)"
  const tasks = [];
  const taskParts = tasksString.split(' | ');
  
  taskParts.forEach(part => {
    const match = part.match(/^(.+?)\s*\(([0-9.]+)h?\)$/);
    if (match) {
      const [, name, durationStr] = match;
      tasks.push({
        id: Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        duration: parseFloat(durationStr),
        isHighValue: ['App', 'Strategic', 'Recherche', 'forma', 'prep forma'].some(keyword => 
          name.toLowerCase().includes(keyword.toLowerCase())
        )
      });
    }
  });
  
  return tasks;
}

// Fonction pour convertir une ligne CSV en DailyEntry
function csvRowToEntry(csvRow, userIdSupabase) {
  const [date, sommeil, fatigue, energie, pauses, bienEtre, scoreOptim, taches] = csvRow;
  
  // Calculer le nombre de pauses (0-4)
  const pausesCount = parseInt(pauses) || 0;
  const meditationsPauses = {
    morning: pausesCount > 0,
    noon: pausesCount > 1, 
    afternoon: pausesCount > 2,
    evening: pausesCount > 3
  };
  
  // Estimer les heures de travail depuis les tâches
  const tasks = parseTasks(taches);
  const totalTaskHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    user_id: userIdSupabase,
    entry_date: date,
    
    sleep: {
      bedTime: "22:00", // Estimation
      wakeTime: "07:00", // Estimation  
      insomniaDuration: 0,
      duration: parseFloat(sommeil) || 0
    },
    
    focus: {
      morningHours: Math.min(totalTaskHours * 0.6, 6), // 60% le matin
      afternoonHours: Math.min(totalTaskHours * 0.4, 6), // 40% l'après-midi
      drivingHours: tasks.find(t => t.name.toLowerCase().includes('transport'))?.duration || 0,
      fatigue: parseInt(fatigue) || 3
    },
    
    tasks: tasks,
    
    wellbeing: {
      meditationsPauses: meditationsPauses,
      sportLeisureHours: 0.5, // Estimation par défaut
      socialInteraction: tasks.some(t => 
        ['networking', 'rdv', 'partenariat', 'meeting'].some(keyword =>
          t.name.toLowerCase().includes(keyword.toLowerCase())
        )
      ),
      energy: parseInt(energie) || 50
    },
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Lire et convertir le fichier CSV
function convertCsvToSupabaseFormat() {
  console.log('🔄 Conversion du fichier CSV au format Supabase...');
  
  // Lire le fichier CSV
  const csvPath = '/mnt/c/Users/FIAE/Downloads/effizen-data-complet(temp).csv';
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Fichier CSV non trouvé:', csvPath);
    return null;
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  
  // Ignorer la première ligne (headers)
  const dataLines = lines.slice(1);
  
  console.log(`📊 ${dataLines.length} entrées trouvées dans le CSV`);
  
  // ID utilisateur Supabase pour jbgerberon@formation-ia-entreprises.ch
  // Cet ID doit être récupéré depuis Supabase ou fourni
  const userIdSupabase = "USER_ID_A_REMPLACER"; // À remplacer par le vrai ID
  
  // Convertir chaque ligne
  const entries = [];
  dataLines.forEach((line, index) => {
    if (!line.trim()) return;
    
    const csvRow = line.split(';');
    if (csvRow.length >= 8) {
      try {
        const entry = csvRowToEntry(csvRow, userIdSupabase);
        entries.push(entry);
        console.log(`✅ Ligne ${index + 2} convertie: ${entry.entry_date}`);
      } catch (error) {
        console.error(`❌ Erreur ligne ${index + 2}:`, error.message);
      }
    }
  });
  
  console.log(`🎯 ${entries.length} entrées converties avec succès`);
  
  // Sauvegarder en JSON pour inspection
  const jsonPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/donnees-converties.json';
  fs.writeFileSync(jsonPath, JSON.stringify(entries, null, 2));
  console.log(`💾 Données sauvegardées dans: ${jsonPath}`);
  
  return entries;
}

// Générer le script d'injection Supabase
function generateSupabaseScript(entries) {
  console.log('🔄 Génération du script d'injection Supabase...');
  
  const script = `
/*
 * Script d'injection des données historiques dans Supabase
 * À exécuter dans la console de https://effizen-ai-prod.vercel.app
 * après connexion avec jbgerberon@formation-ia-entreprises.ch
 */

// 1. D'abord récupérer votre user_id
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  console.error('❌ Erreur utilisateur:', userError);
  throw new Error('Utilisateur non connecté');
}

console.log('✅ Utilisateur connecté:', user.email);
console.log('🔑 User ID:', user.id);

// 2. Données converties depuis votre CSV
const entries = ${JSON.stringify(entries, null, 2)};

// 3. Mettre à jour les user_id avec votre ID réel
const entriesWithUserId = entries.map(entry => ({
  ...entry,
  user_id: user.id
}));

console.log('📊 ' + entriesWithUserId.length + ' entrées à injecter');

// 4. Vérifier les données existantes pour éviter les doublons
const { data: existingEntries, error: fetchError } = await supabase
  .from('daily_entries')
  .select('entry_date')
  .eq('user_id', user.id);

if (fetchError) {
  console.error('❌ Erreur lecture données existantes:', fetchError);
  throw fetchError;
}

const existingDates = new Set((existingEntries || []).map(e => e.entry_date));
console.log('📊 ' + existingDates.size + ' entrées déjà présentes');

// 5. Filtrer les nouvelles entrées
const newEntries = entriesWithUserId.filter(entry => !existingDates.has(entry.entry_date));
console.log('📊 ' + newEntries.length + ' nouvelles entrées à injecter');

if (newEntries.length === 0) {
  console.log('✅ Toutes les données sont déjà présentes dans Supabase');
} else {
  // 6. Injection par lots
  const batchSize = 5;
  let injected = 0;
  
  for (let i = 0; i < newEntries.length; i += batchSize) {
    const batch = newEntries.slice(i, i + batchSize);
    console.log('🔄 Injection lot ' + (Math.floor(i/batchSize) + 1) + '/' + Math.ceil(newEntries.length/batchSize) + ': ' + batch.length + ' entrées');
    
    const { data, error } = await supabase
      .from('daily_entries')
      .insert(batch);
    
    if (error) {
      console.error('❌ Erreur lot ' + (Math.floor(i/batchSize) + 1) + ':', error);
    } else {
      injected += batch.length;
      console.log('✅ Lot ' + (Math.floor(i/batchSize) + 1) + ' injecté');
    }
    
    // Pause entre lots
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 INJECTION TERMINÉE: ' + injected + ' entrées ajoutées à Supabase');
  console.log('🔄 Rechargez la page pour voir vos données historiques !');
}
`;

  const scriptPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/script-injection-supabase.js';
  fs.writeFileSync(scriptPath, script);
  console.log(`💾 Script d'injection généré: ${scriptPath}`);
  
  return scriptPath;
}

// Exécution principale
console.log('🚀 DÉMARRAGE: Conversion CSV → Supabase');
console.log('=' .repeat(60));

const entries = convertCsvToSupabaseFormat();
if (entries && entries.length > 0) {
  const scriptPath = generateSupabaseScript(entries);
  
  console.log('\\n🎯 PROCHAINE ÉTAPE:');
  console.log('1. Aller sur https://effizen-ai-prod.vercel.app');
  console.log('2. Se connecter avec jbgerberon@formation-ia-entreprises.ch');
  console.log('3. Ouvrir la console (F12)');
  console.log('4. Copier-coller le contenu de script-injection-supabase.js');
  console.log('5. Appuyer sur Entrée et attendre la fin');
  console.log('6. Recharger la page → Toutes vos données apparaîtront !');
  
  console.log('\\n✅ Prêt pour l\\'injection !');
} else {
  console.log('❌ Échec de la conversion');
}