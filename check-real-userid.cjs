const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAdminUser() {
  console.log('🔍 Recherche du vrai User ID de l\'admin...\n');
  
  // 1. Chercher dans auth.users via la table profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'jbgerberon@gmail.com');
  
  if (profileError) {
    console.error('❌ Erreur recherche profiles:', profileError);
    return;
  }
  
  console.log('📊 Profils trouvés:');
  if (profiles && profiles.length > 0) {
    profiles.forEach(profile => {
      console.log(`   - ID: ${profile.id}`);
      console.log(`     Email: ${profile.email}`);
      console.log(`     Role: ${profile.role}`);
      console.log(`     Active: ${profile.is_active}`);
    });
    
    console.log('\n✅ User ID correct à utiliser:', profiles[0].id);
    
    // Vérifier si des entrées existent déjà pour cet utilisateur
    const { data: entries, error: entriesError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', profiles[0].id);
    
    if (!entriesError) {
      console.log(`\n📊 Entrées existantes pour cet utilisateur: ${entries?.length || 0}`);
    }
  } else {
    console.log('⚠️ Aucun profil trouvé pour jbgerberon@gmail.com');
    
    // Lister tous les profils
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('\n📋 Tous les profils dans la base:');
    if (allProfiles && allProfiles.length > 0) {
      allProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (ID: ${profile.id}, Role: ${profile.role})`);
      });
    } else {
      console.log('   Aucun profil trouvé');
    }
  }
}

findAdminUser();