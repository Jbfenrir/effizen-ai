import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const userId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4'; // ID de jbgerberon@gmail.com (correct)

if (!supabaseServiceKey) {
  console.error('❌ Clé service Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Convertit format date DD/MM/YYYY vers YYYY-MM-DD
 */
function convertDateFormat(dateStr) {
  try {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.error('Erreur conversion date:', dateStr);
    return null;
  }
}

/**
 * Parse les tâches depuis le format CSV
 */
function parseTasks(tasksString) {
  if (!tasksString.trim()) return [];

  try {
    return tasksString.split('|').map(taskStr => {
      const trimmed = taskStr.trim();
      const match = trimmed.match(/(.+?)\s*\((.+?)\)/);

      if (match) {
        const [, name, durationStr] = match;
        const duration = parseFloat(durationStr.replace('h', '').replace(',', '.')) || 0;

        return {
          id: crypto.randomUUID(),
          name: name.trim(),
          duration,
          completed: true,
          isHighValue: false,
        };
      } else {
        return {
          id: crypto.randomUUID(),
          name: trimmed,
          duration: 0,
          completed: true,
          isHighValue: false,
        };
      }
    }).filter(task => task.name.length > 0);
  } catch (error) {
    console.error('Erreur parsing tâches:', tasksString);
    return [];
  }
}

/**
 * Parse une ligne CSV vers format DailyEntry
 */
function parseCSVRow(row) {
  try {
    const entryDate = convertDateFormat(row.Date);
    if (!entryDate) return null;

    // Sleep
    const sleepHours = parseFloat(row['Sommeil (h)']) || 0;
    const sleep = {
      bedTime: '22:00',
      wakeTime: '07:00',
      duration: sleepHours,
      insomniaDuration: 0,
    };

    // Focus (fatigue)
    const fatigueValue = parseInt(row.Fatigue) || 3;
    const fatigue = Math.min(Math.max(fatigueValue, 1), 5);
    const focus = {
      morningHours: 0,
      afternoonHours: 0,
      drivingHours: 0,
      fatigue: fatigue,
    };

    // Tasks
    const tasks = parseTasks(row.Tâches || '');

    // Wellbeing
    const wellbeing = {
      meditationsPauses: {
        morning: false,
        noon: false,
        afternoon: false,
        evening: false
      },
      sportLeisureHours: 0,
      socialInteraction: false,
      energy: row['Bien-être'] ? parseInt(row['Bien-être']) * 20 : 50,
    };

    return {
      user_id: userId,
      entry_date: entryDate,
      sleep,
      focus,
      tasks,
      wellbeing,
    };
  } catch (error) {
    console.error('Erreur parsing ligne CSV:', error, row);
    return null;
  }
}

/**
 * Restauration principale
 */
async function restoreData() {
  console.log('🔄 Début restauration des données CSV...');

  try {
    // Lire le fichier CSV
    const csvPath = '/mnt/c/Users/FIAE/Desktop/effizen-ai/effizen-data(2).csv';
    console.log('📖 Lecture du fichier:', csvPath);

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV vide ou invalide');
    }

    const headers = lines[0].split(';');
    console.log('📋 Headers:', headers);

    let restored = 0;
    const errors = [];

    // Traiter chaque ligne
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      if (values.length !== headers.length) {
        console.warn(`⚠️ Ligne ${i + 1}: colonnes incorrectes`);
        continue;
      }

      // Créer l'objet
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Parser
      const entry = parseCSVRow(rowData);
      if (!entry) {
        errors.push(`Ligne ${i + 1}: impossible de parser`);
        continue;
      }

      console.log(`📊 Traitement: ${entry.entry_date}`);

      // Vérifier si existe
      const { data: existing } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('entry_date', entry.entry_date)
        .single();

      if (existing) {
        console.log(`⏭️ Existe déjà: ${entry.entry_date}`);
        continue;
      }

      // Insérer
      const { error } = await supabase
        .from('daily_entries')
        .insert(entry);

      if (error) {
        console.error(`❌ Erreur ${entry.entry_date}:`, error.message);
        errors.push(`${entry.entry_date}: ${error.message}`);
      } else {
        restored++;
        console.log(`✅ Restauré: ${entry.entry_date} (${entry.tasks.length} tâches, ${entry.sleep.duration}h sommeil)`);
      }

      // Pause pour éviter rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 RÉSULTATS:');
    console.log(`✅ Entrées restaurées: ${restored}`);
    console.log(`❌ Erreurs: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n🚨 ERREURS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Restauration terminée !');

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Lancer la restauration
restoreData();