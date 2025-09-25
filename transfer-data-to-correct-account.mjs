import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function transferData() {
  console.log('🔄 TRANSFERT DES DONNÉES VERS LE BON COMPTE\n');

  const sourceUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4'; // jbgerberon@gmail.com
  const targetUserId = '9ce86c6b-f8f8-40ab-858e-cb2c548b10cf'; // jbgerberon@formation-ia-entreprises.ch

  console.log('📋 Configuration:');
  console.log(`  Source: jbgerberon@gmail.com`);
  console.log(`  Destination: jbgerberon@formation-ia-entreprises.ch\n`);

  // 1. Récupérer les données à transférer (après le 12/09)
  const { data: sourceData, error: fetchError } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', sourceUserId)
    .gt('entry_date', '2025-09-12')
    .order('entry_date', { ascending: true });

  if (fetchError) {
    console.error('❌ Erreur récupération:', fetchError);
    return;
  }

  console.log(`📊 ${sourceData.length} entrées à transférer (après le 12/09):\n`);

  let transferred = 0;
  let skipped = 0;

  for (const entry of sourceData) {
    console.log(`  Traitement ${entry.entry_date}...`);

    // Vérifier si existe déjà pour éviter doublons
    const { data: existing } = await supabase
      .from('daily_entries')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('entry_date', entry.entry_date)
      .single();

    if (existing) {
      console.log(`    ⏭️ Existe déjà, ignoré`);
      skipped++;
      continue;
    }

    // Créer une copie avec le bon user_id
    const newEntry = {
      user_id: targetUserId,
      entry_date: entry.entry_date,
      sleep: entry.sleep,
      focus: entry.focus,
      tasks: entry.tasks,
      wellbeing: entry.wellbeing
    };

    // Insérer
    const { error: insertError } = await supabase
      .from('daily_entries')
      .insert(newEntry);

    if (insertError) {
      console.log(`    ❌ Erreur: ${insertError.message}`);
    } else {
      console.log(`    ✅ Transféré avec succès`);
      transferred++;
    }
  }

  console.log('\n' + '='*50);
  console.log('📈 RÉSULTAT DU TRANSFERT:');
  console.log(`  ✅ Transférées: ${transferred} entrées`);
  console.log(`  ⏭️ Ignorées (doublons): ${skipped} entrées`);

  // Vérifier le résultat final
  console.log('\n🔍 VÉRIFICATION FINALE:');
  const { data: finalData } = await supabase
    .from('daily_entries')
    .select('entry_date')
    .eq('user_id', targetUserId)
    .order('entry_date', { ascending: false })
    .limit(5);

  console.log('  5 dernières entrées pour jbgerberon@formation-ia-entreprises.ch:');
  finalData?.forEach(e => {
    console.log(`    - ${e.entry_date}`);
  });

  if (finalData && finalData[0]?.entry_date === '2025-09-23') {
    console.log('\n🎉 SUCCÈS: Les données sont maintenant sur le BON compte !');
    console.log('   Vous devriez voir vos données jusqu\'au 23/09 en production.');
  }
}

transferData();