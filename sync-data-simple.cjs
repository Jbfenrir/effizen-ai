const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase directe
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

// Utiliser la clé service pour contourner le RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  try {
    console.log('🔍 Vérification des données dans Supabase...\n');
    
    // User ID de l'admin (depuis CLAUDE.md)
    const adminUserId = '8ac44380-8445-49a8-b4a9-16f602d0e7d4';
    
    // Récupérer toutes les entrées de l'utilisateur admin
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', adminUserId)
      .order('entry_date', { ascending: true });
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    
    console.log(`📊 Nombre d'entrées trouvées: ${entries?.length || 0}\n`);
    
    if (entries && entries.length > 0) {
      console.log('📅 Dates existantes dans Supabase:');
      entries.forEach(entry => {
        const tasks = entry.tasks || [];
        console.log(`   - ${entry.entry_date}: ${tasks.length} tâches`);
      });
      
      console.log('\n📈 Période couverte:');
      console.log(`   Du ${entries[0].entry_date} au ${entries[entries.length - 1].entry_date}`);
    } else {
      console.log('⚠️ Aucune donnée trouvée dans Supabase pour cet utilisateur.');
      console.log('   Les données du CSV ne sont pas encore synchronisées.');
    }
    
    console.log('\n📋 Données attendues du CSV (23 entrées):');
    console.log('   - Du 2025-08-11 au 2025-09-12');
    
    // Vérifier les dates manquantes
    const expectedDates = [
      '2025-08-11', '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-18',
      '2025-08-19', '2025-08-20', '2025-08-22', '2025-08-25', '2025-08-26',
      '2025-08-27', '2025-08-28', '2025-08-29', '2025-09-01', '2025-09-02',
      '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-08', '2025-09-09',
      '2025-09-10', '2025-09-11', '2025-09-12'
    ];
    
    const existingDates = new Set(entries?.map(e => e.entry_date) || []);
    const missingDates = expectedDates.filter(date => !existingDates.has(date));
    
    if (missingDates.length > 0) {
      console.log(`\n⚠️ Dates manquantes (${missingDates.length}):`, missingDates.join(', '));
    } else if (entries && entries.length > 0) {
      console.log('\n✅ Toutes les données du CSV sont dans Supabase!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer la vérification
checkData();