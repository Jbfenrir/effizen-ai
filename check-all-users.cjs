const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllUsers() {
  console.log('🔍 RECHERCHE DE TOUS LES UTILISATEURS\n');
  console.log('=' .repeat(50));
  
  // 1. Rechercher tous les profils
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');
  
  if (profileError) {
    console.error('❌ Erreur:', profileError);
    return;
  }
  
  console.log(`\n📊 Nombre total d'utilisateurs: ${profiles?.length || 0}\n`);
  
  if (profiles && profiles.length > 0) {
    for (const profile of profiles) {
      console.log(`👤 Utilisateur: ${profile.email}`);
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - Rôle: ${profile.role}`);
      console.log(`   - Actif: ${profile.is_active}`);
      console.log(`   - Créé le: ${profile.created_at}`);
      
      // Vérifier les entrées pour cet utilisateur
      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('entry_date')
        .eq('user_id', profile.id)
        .order('entry_date');
      
      if (!entriesError && entries) {
        console.log(`   - Entrées: ${entries.length}`);
        if (entries.length > 0) {
          const firstDate = entries[0].entry_date;
          const lastDate = entries[entries.length - 1].entry_date;
          console.log(`   - Période: du ${firstDate} au ${lastDate}`);
        }
      }
      console.log('');
    }
  }
  
  // Rechercher spécifiquement le compte formation-ia-entreprises
  console.log('🎯 RECHERCHE SPÉCIFIQUE: jbgerberon@formation-ia-entreprises.ch');
  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'jbgerberon@formation-ia-entreprises.ch')
    .single();
  
  if (targetProfile) {
    console.log('✅ COMPTE TROUVÉ !');
    console.log(`   - ID: ${targetProfile.id}`);
    console.log(`   - Rôle: ${targetProfile.role}`);
    console.log(`   - C'est ce compte qui devrait avoir les données CSV !`);
  } else {
    console.log('⚠️ Ce compte n\'existe pas dans la base de données');
    console.log('   Les données ont peut-être été saisies localement sans synchronisation');
  }
  
  console.log('\n' + '=' .repeat(50));
}

checkAllUsers();