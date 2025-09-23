const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User ID du compte Formation
const formationUserId = '9ce86c6b-f8f8-40ab-858e-cb2c548b10cf';

async function fixTasksStructure() {
  console.log('🔧 CORRECTION DE LA STRUCTURE DES TÂCHES\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Récupérer toutes les entrées avec problèmes de tâches
    console.log('📥 Récupération des entrées avec problèmes...');
    const { data: entries, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', formationUserId)
      .order('entry_date');
    
    if (fetchError || !entries) {
      throw new Error(`Erreur récupération: ${fetchError?.message}`);
    }
    
    console.log(`✅ ${entries.length} entrées récupérées`);
    
    // 2. Analyser et corriger chaque entrée
    console.log('\n🔍 Analyse des structures de données...');
    let fixedCount = 0;
    const updates = [];
    
    for (const entry of entries) {
      let needsUpdate = false;
      const fixedEntry = { ...entry };
      
      // Vérifier et corriger les tâches
      if (!Array.isArray(entry.tasks)) {
        console.log(`  📝 ${entry.entry_date}: tasks n'est pas un Array (type: ${typeof entry.tasks})`);
        
        if (entry.tasks === null || entry.tasks === undefined) {
          fixedEntry.tasks = [];
          needsUpdate = true;
        } else if (typeof entry.tasks === 'string') {
          // Tentative de parsing si c'est une chaîne JSON
          try {
            const parsed = JSON.parse(entry.tasks);
            if (Array.isArray(parsed)) {
              fixedEntry.tasks = parsed;
              needsUpdate = true;
            } else {
              fixedEntry.tasks = [];
              needsUpdate = true;
            }
          } catch {
            fixedEntry.tasks = [];
            needsUpdate = true;
          }
        } else if (typeof entry.tasks === 'object') {
          // Si c'est un objet, essayer de le convertir en array
          fixedEntry.tasks = Object.values(entry.tasks).filter(t => 
            t && typeof t === 'object' && t.name && t.duration !== undefined
          );
          needsUpdate = true;
        } else {
          fixedEntry.tasks = [];
          needsUpdate = true;
        }
      } else {
        // Vérifier que chaque tâche a la bonne structure
        const validTasks = entry.tasks.filter(task => 
          task && 
          typeof task === 'object' && 
          typeof task.name === 'string' && 
          typeof task.duration === 'number'
        );
        
        if (validTasks.length !== entry.tasks.length) {
          console.log(`  🔧 ${entry.entry_date}: ${entry.tasks.length - validTasks.length} tâches invalides supprimées`);
          fixedEntry.tasks = validTasks;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        updates.push({
          id: entry.id,
          tasks: fixedEntry.tasks,
          entry_date: entry.entry_date
        });
        fixedCount++;
      }
    }
    
    console.log(`\n📊 Résultats de l'analyse:`);
    console.log(`  - Entrées à corriger: ${fixedCount}/${entries.length}`);
    console.log(`  - Entrées déjà correctes: ${entries.length - fixedCount}/${entries.length}`);
    
    if (updates.length === 0) {
      console.log('\n✅ Toutes les données sont déjà dans le bon format !');
      return;
    }
    
    // 3. Appliquer les corrections
    console.log('\n💾 Application des corrections...');
    let successCount = 0;
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('daily_entries')
        .update({ tasks: update.tasks })
        .eq('id', update.id);
      
      if (updateError) {
        console.log(`  ❌ ${update.entry_date}: ${updateError.message}`);
      } else {
        console.log(`  ✅ ${update.entry_date}: ${update.tasks.length} tâches corrigées`);
        successCount++;
      }
    }
    
    // 4. Vérification finale
    console.log('\n🎯 Vérification finale...');
    const { data: verifiedEntries, error: verifyError } = await supabase
      .from('daily_entries')
      .select('entry_date, tasks')
      .eq('user_id', formationUserId)
      .order('entry_date');
    
    if (!verifyError && verifiedEntries) {
      let allValid = true;
      for (const entry of verifiedEntries) {
        if (!Array.isArray(entry.tasks)) {
          console.log(`  ❌ ${entry.entry_date}: tasks encore invalide`);
          allValid = false;
        }
      }
      
      if (allValid) {
        console.log(`  ✅ Toutes les entrées ont maintenant des tâches au format Array`);
      }
    }
    
    console.log('\n🎉 CORRECTION TERMINÉE !');
    console.log(`  - ${successCount}/${updates.length} entrées corrigées avec succès`);
    console.log('  - Vous pouvez maintenant recharger votre dashboard');
    console.log('  - Le filtrage par période devrait fonctionner');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
}

fixTasksStructure();