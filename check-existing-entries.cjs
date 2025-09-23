const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Le VRAI user ID (corrigé)
const adminUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4';

async function checkExistingData() {
  console.log('📊 ANALYSE DES DONNÉES EXISTANTES DANS SUPABASE\n');
  console.log('=' .repeat(50));
  
  // Récupérer toutes les entrées
  const { data: entries, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', adminUserId)
    .order('entry_date');
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  console.log(`\n✅ Nombre d'entrées trouvées: ${entries?.length || 0}\n`);
  
  if (entries && entries.length > 0) {
    console.log('📅 DATES EXISTANTES:');
    entries.forEach((entry, index) => {
      const tasks = entry.tasks || [];
      const taskCount = Array.isArray(tasks) ? tasks.length : 0;
      console.log(`   ${index + 1}. ${entry.entry_date} - ${taskCount} tâches`);
      
      // Afficher quelques détails
      if (tasks.length > 0) {
        const taskNames = tasks.slice(0, 3).map(t => t.name || 'Sans nom').join(', ');
        console.log(`      Tâches: ${taskNames}${tasks.length > 3 ? '...' : ''}`);
      }
    });
    
    // Comparer avec les dates du CSV
    const csvDates = [
      '2025-08-11', '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-18',
      '2025-08-19', '2025-08-20', '2025-08-22', '2025-08-25', '2025-08-26',
      '2025-08-27', '2025-08-28', '2025-08-29', '2025-09-01', '2025-09-02',
      '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-08', '2025-09-09',
      '2025-09-10', '2025-09-11', '2025-09-12'
    ];
    
    const existingDates = new Set(entries.map(e => e.entry_date));
    const missingDates = csvDates.filter(date => !existingDates.has(date));
    const extraDates = [...existingDates].filter(date => !csvDates.includes(date));
    
    console.log('\n📊 ANALYSE DE CORRESPONDANCE:');
    console.log(`   - Dates du CSV présentes: ${csvDates.filter(d => existingDates.has(d)).length}/23`);
    console.log(`   - Dates manquantes: ${missingDates.length}`);
    if (missingDates.length > 0) {
      console.log(`     ${missingDates.join(', ')}`);
    }
    
    if (extraDates.length > 0) {
      console.log(`   - Dates supplémentaires (hors CSV): ${extraDates.length}`);
      console.log(`     ${extraDates.join(', ')}`);
    }
    
    // Période couverte
    const sortedDates = [...existingDates].sort();
    console.log(`\n📈 PÉRIODE COUVERTE:`);
    console.log(`   Du ${sortedDates[0]} au ${sortedDates[sortedDates.length - 1]}`);
  } else {
    console.log('⚠️ Aucune donnée trouvée pour cet utilisateur');
  }
  
  console.log('\n' + '=' .repeat(50));
}

checkExistingData();