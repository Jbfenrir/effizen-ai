import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyData() {
  console.log('🔍 Vérification des données en production pour jbgerberon@gmail.com...\n');

  const userId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4';

  // Récupérer TOUTES les entrées
  const { data: allEntries, error } = await supabase
    .from('daily_entries')
    .select('entry_date, sleep, tasks')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`✅ Total: ${allEntries.length} entrées trouvées\n`);

  // Analyser par mois
  const byMonth = {};
  allEntries.forEach(entry => {
    const month = entry.entry_date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  console.log('📅 Répartition par mois:');
  Object.keys(byMonth).sort().reverse().forEach(month => {
    console.log(`  ${month}: ${byMonth[month]} entrées`);
  });

  // Afficher les 10 dernières entrées
  console.log('\n📊 10 dernières entrées:');
  allEntries.slice(0, 10).forEach(entry => {
    const sleepHours = entry.sleep?.duration || 0;
    const tasksCount = entry.tasks?.length || 0;
    console.log(`  ${entry.entry_date}: ${sleepHours.toFixed(1)}h sommeil, ${tasksCount} tâches`);
  });

  // Vérifier spécifiquement les dates critiques
  console.log('\n🎯 Vérification dates critiques (13/09 au 23/09):');
  const criticalDates = [
    '2025-09-23', '2025-09-22', '2025-09-17', '2025-09-16',
    '2025-09-15', '2025-09-14', '2025-09-13'
  ];

  for (const date of criticalDates) {
    const found = allEntries.find(e => e.entry_date === date);
    if (found) {
      console.log(`  ✅ ${date}: PRÉSENT (${found.sleep?.duration || 0}h sommeil)`);
    } else {
      console.log(`  ❌ ${date}: MANQUANT`);
    }
  }

  // Résumé final
  console.log('\n📈 RÉSUMÉ FINAL:');
  console.log(`  • Entrées totales: ${allEntries.length}`);
  console.log(`  • Première entrée: ${allEntries[allEntries.length - 1]?.entry_date}`);
  console.log(`  • Dernière entrée: ${allEntries[0]?.entry_date}`);

  const september = allEntries.filter(e => e.entry_date.startsWith('2025-09')).length;
  console.log(`  • Entrées septembre 2025: ${september}`);

  if (allEntries[0]?.entry_date === '2025-09-23') {
    console.log('\n🎉 SUCCESS: Les données sont bien restaurées jusqu\'au 23/09/2025 !');
  } else {
    console.log('\n⚠️ ATTENTION: La dernière entrée n\'est pas le 23/09/2025');
  }
}

verifyData();