const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Important pour les tests
  }
});

async function testFrontendData() {
  console.log('🧪 TEST - Simulation appels frontend\n');

  try {
    // Simuler l'authentification comme dans useAuth
    console.log('1️⃣  Authentification...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jbgerberon@gmail.com',
      password: 'mtuw xsol vahe sgkn'
    });

    if (authError) {
      console.log('❌ Erreur auth:', authError.message);
      return;
    }
    console.log('✅ Authentifié:', authData.user.email);

    // Test 2: Simuler l'appel getAllTeams() exactement comme dans adminService
    console.log('\n2️⃣  Test getAllTeams() (comme adminService)...');
    
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        manager_id,
        is_active,
        created_at,
        updated_at,
        profiles!teams_manager_id_fkey (
          email
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('   Réponse Supabase:');
    console.log('   - Erreur:', teamsError?.message || 'Aucune');
    console.log('   - Code erreur:', teamsError?.code || 'N/A');
    console.log('   - Nombre d\'équipes:', teamsData?.length || 0);
    
    if (teamsData && teamsData.length > 0) {
      console.log('   - Équipes trouvées:');
      teamsData.forEach((team, i) => {
        console.log(`     ${i + 1}. ${team.name} (${team.id})`);
      });
    }

    // Test 3: Simuler l'appel getAllUsers() exactement comme dans adminService
    console.log('\n3️⃣  Test getAllUsers() (comme adminService)...');
    
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select(`
        *,
        teams!profiles_team_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false });

    console.log('   Réponse Supabase:');
    console.log('   - Erreur:', usersError?.message || 'Aucune');
    console.log('   - Code erreur:', usersError?.code || 'N/A');
    console.log('   - Nombre d\'utilisateurs:', usersData?.length || 0);
    
    if (usersData && usersData.length > 0) {
      console.log('   - Utilisateurs trouvés:');
      usersData.forEach((user, i) => {
        console.log(`     ${i + 1}. ${user.email} (${user.role})`);
      });
    }

    // Test 4: Créer une équipe et vérifier qu'elle apparaît
    console.log('\n4️⃣  Test création équipe + vérification immédiate...');
    
    const testTeamName = `Interface-Test-${Date.now()}`;
    
    // Création
    const { data: newTeam, error: createError } = await supabase
      .from('teams')
      .insert({
        name: testTeamName,
        description: 'Test pour vérifier l\'interface',
        manager_id: authData.user.id,
        is_active: true
      })
      .select();

    if (createError) {
      console.log('❌ Erreur création:', createError.message);
    } else {
      console.log('✅ Équipe créée:', newTeam[0].name);
      
      // Vérification immédiate
      const { data: checkTeam, error: checkError } = await supabase
        .from('teams')
        .select('*')
        .eq('name', testTeamName)
        .single();
        
      if (checkError) {
        console.log('❌ Équipe non trouvée après création:', checkError.message);
      } else {
        console.log('✅ Équipe visible immédiatement après création');
      }
    }

    // Test 5: Lister toutes les équipes comme le ferait l'interface
    console.log('\n5️⃣  Liste finale des équipes (vue interface)...');
    const { data: finalTeams, error: finalError } = await supabase
      .from('teams')
      .select('id, name, description, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalError) {
      console.log('❌ Erreur:', finalError.message);
    } else {
      console.log(`✅ ${finalTeams.length} équipes actives:`);
      finalTeams.forEach((team, i) => {
        console.log(`   ${i + 1}. ${team.name} (créée le ${team.created_at.split('T')[0]})`);
      });
    }

    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n========================================');
  console.log('🎯 DIAGNOSTIC');
  console.log('========================================\n');
  
  console.log('Si les tests ci-dessus montrent des équipes:');
  console.log('→ Les données existent en base ✅');
  console.log('→ Le problème vient de l\'affichage frontend ❌\n');
  
  console.log('Causes possibles côté frontend:');
  console.log('1. Cache navigateur qui montre anciennes données');
  console.log('2. Erreur JavaScript qui bloque l\'affichage');
  console.log('3. Problème de state management React');
  console.log('4. Erreur dans les appels API frontend\n');
  
  console.log('Solutions à tester:');
  console.log('1. Vider le cache navigateur (Ctrl+Shift+R)');
  console.log('2. Vérifier console navigateur pour erreurs JS');
  console.log('3. Redémarrer le serveur dev (npm run dev)');
}

testFrontendData().catch(console.error);