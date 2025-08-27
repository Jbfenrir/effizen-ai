const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testFixedQueries() {
  console.log('🧪 TEST - Requêtes corrigées\n');

  try {
    // Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jbgerberon@gmail.com',
      password: 'mtuw xsol vahe sgkn'
    });

    if (authError) {
      console.log('❌ Erreur auth:', authError.message);
      return;
    }

    // Test nouvelle requête getAllTeams
    console.log('1️⃣  Test nouvelle requête getAllTeams...');
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('name');

    console.log('   - Erreur:', teamsError?.message || 'Aucune');
    console.log('   - Nombre équipes:', teams?.length || 0);
    
    if (teams && teams.length > 0) {
      console.log('   - Équipes:');
      teams.slice(0, 3).forEach(team => {
        console.log(`     * ${team.name} (ID: ${team.id.substring(0, 8)}...)`);
      });
    }

    // Test nouvelle requête getAllUsers
    console.log('\n2️⃣  Test nouvelle requête getAllUsers...');
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('   - Erreur:', usersError?.message || 'Aucune');
    console.log('   - Nombre utilisateurs:', users?.length || 0);
    
    if (users && users.length > 0) {
      console.log('   - Utilisateurs:');
      users.slice(0, 3).forEach(user => {
        console.log(`     * ${user.email} (${user.role})`);
      });
    }

    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  console.log('\n🎯 Si aucune erreur ci-dessus → Les requêtes sont corrigées ✅');
  console.log('   Vous pouvez maintenant rafraîchir votre interface.');
}

testFixedQueries().catch(console.error);