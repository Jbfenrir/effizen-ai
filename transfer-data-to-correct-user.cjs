const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs des utilisateurs
const gmailUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4'; // jbgerberon@gmail.com
const formationUserId = '9ce86c6b-f8f8-40ab-858e-cb2c548b10cf'; // jbgerberon@formation-ia-entreprises.ch

// Dates du CSV (les données à transférer)
const csvDates = [
  '2025-08-11', '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-18',
  '2025-08-19', '2025-08-20', '2025-08-22', '2025-08-25', '2025-08-26',
  '2025-08-27', '2025-08-28', '2025-08-29', '2025-09-01', '2025-09-02',
  '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-08', '2025-09-09',
  '2025-09-10', '2025-09-11', '2025-09-12'
];

async function transferData() {
  console.log('🔄 TRANSFERT DES DONNÉES VERS LE BON COMPTE\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Récupérer les entrées du CSV depuis le compte Gmail
    console.log('📥 Étape 1: Récupération des données du CSV depuis Gmail...');
    
    const { data: csvEntries, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', gmailUserId)
      .in('entry_date', csvDates)
      .order('entry_date');
    
    if (fetchError) {
      throw new Error(`Erreur lecture: ${fetchError.message}`);
    }
    
    console.log(`   ✅ Trouvé ${csvEntries?.length || 0} entrées CSV dans le compte Gmail`);
    
    if (!csvEntries || csvEntries.length === 0) {
      console.log('⚠️ Aucune donnée CSV trouvée à transférer');
      return;
    }
    
    // 2. Préparer les données pour le nouveau compte
    console.log('\n📝 Étape 2: Préparation des données pour le compte Formation...');
    
    const dataForTransfer = csvEntries.map(entry => ({
      // Nouveau user_id
      user_id: formationUserId,
      entry_date: entry.entry_date,
      sleep: entry.sleep,
      focus: entry.focus,
      tasks: entry.tasks,
      wellbeing: entry.wellbeing,
      // Pas besoin de copier les timestamps ni l'id (nouveaux seront générés)
    }));
    
    console.log(`   ✅ ${dataForTransfer.length} entrées préparées pour le transfert`);
    
    // 3. Vérifier qu'il n'y a pas de doublons dans le compte de destination
    console.log('\n🔍 Étape 3: Vérification des doublons...');
    
    const { data: existingInFormation, error: existingError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', formationUserId);
    
    if (existingError) {
      throw new Error(`Erreur vérification: ${existingError.message}`);
    }
    
    const existingDates = new Set((existingInFormation || []).map(e => e.entry_date));
    const uniqueData = dataForTransfer.filter(entry => !existingDates.has(entry.entry_date));
    
    console.log(`   ✅ ${uniqueData.length} entrées uniques à transférer (${dataForTransfer.length - uniqueData.length} doublons évités)`);
    
    if (uniqueData.length === 0) {
      console.log('✅ Toutes les données sont déjà dans le bon compte !');
      return;
    }
    
    // 4. Insérer dans le compte Formation
    console.log('\n💾 Étape 4: Insertion dans le compte Formation...');
    
    const { error: insertError } = await supabase
      .from('daily_entries')
      .insert(uniqueData);
    
    if (insertError) {
      throw new Error(`Erreur insertion: ${insertError.message}`);
    }
    
    console.log(`   ✅ ${uniqueData.length} entrées transférées avec succès !`);
    
    // 5. Optionnel : Supprimer les données du mauvais compte (Gmail)
    console.log('\n🗑️ Étape 5: Suppression des données mal placées...');
    console.log('   (Les données CSV dans le compte Gmail)');
    
    // Demander confirmation via une variable (pour la sécurité)
    const CONFIRM_DELETE = true; // Mettre à true pour confirmer la suppression
    
    if (CONFIRM_DELETE) {
      const csvEntryIds = csvEntries.map(entry => entry.id);
      
      const { error: deleteError } = await supabase
        .from('daily_entries')
        .delete()
        .in('id', csvEntryIds);
      
      if (deleteError) {
        console.log(`   ⚠️ Erreur suppression: ${deleteError.message}`);
        console.log('   Les données ont été copiées mais pas supprimées du compte Gmail');
      } else {
        console.log(`   ✅ ${csvEntryIds.length} entrées supprimées du compte Gmail`);
      }
    } else {
      console.log('   ⚠️ Suppression désactivée - les données restent en double');
    }
    
    // 6. Vérification finale
    console.log('\n✅ Étape 6: Vérification finale...');
    
    const { data: finalGmail, error: finalGmailError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', gmailUserId)
      .order('entry_date');
    
    const { data: finalFormation, error: finalFormationError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', formationUserId)
      .order('entry_date');
    
    if (!finalGmailError && !finalFormationError) {
      console.log(`   Gmail (${gmailUserId.slice(0,8)}...): ${finalGmail?.length || 0} entrées`);
      console.log(`   Formation (${formationUserId.slice(0,8)}...): ${finalFormation?.length || 0} entrées`);
      
      if (finalFormation && finalFormation.length > 0) {
        const formationDates = finalFormation.map(e => e.entry_date);
        const csvDatesInFormation = csvDates.filter(date => formationDates.includes(date));
        console.log(`   📊 Données CSV dans Formation: ${csvDatesInFormation.length}/${csvDates.length}`);
      }
    }
    
    console.log('\n🎉 TRANSFERT TERMINÉ AVEC SUCCÈS !');
    console.log('   Vos données CSV sont maintenant dans le bon compte Formation');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
}

transferData();