const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDataPersistence() {
  console.log('🔍 DIAGNOSTIC - Problème de persistance des données\n');

  try {
    // Test 1: Vérifier l'authentification
    console.log('1️⃣  Test d\'authentification...');
    
    // Se connecter avec le compte admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jbgerberon@gmail.com',
      password: 'mtuw xsol vahe sgkn'
    });

    if (authError) {
      console.log('❌ Erreur d\'authentification:', authError.message);
      return;
    }

    console.log('✅ Authentification réussie');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // Test 2: Vérifier le profil admin
    console.log('\n2️⃣  Vérification du profil admin...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ Erreur lecture profil:', profileError.message);
      console.log('   Code erreur:', profileError.code);
      
      // Essayer de créer le profil
      console.log('   Tentative de création du profil...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin',
            is_active: true
          }
        ])
        .select();

      if (createError) {
        console.log('   ❌ Impossible de créer le profil:', createError.message);
      } else {
        console.log('   ✅ Profil admin créé avec succès');
      }
    } else {
      console.log('✅ Profil trouvé');
      console.log('   Rôle:', profileData.role);
      console.log('   Actif:', profileData.is_active);
    }

    // Test 3: Test de création d'équipe
    console.log('\n3️⃣  Test de création d\'équipe...');
    const testTeamName = `Test-${Date.now()}`;
    
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name: testTeamName,
          description: 'Équipe de test automatique',
          manager_id: authData.user.id,
          is_active: true
        }
      ])
      .select();

    if (teamError) {
      console.log('❌ Erreur création équipe:', teamError.message);
      console.log('   Code erreur:', teamError.code);
      console.log('   Détails:', teamError.details);
      console.log('   Hint:', teamError.hint);
    } else {
      console.log('✅ Équipe créée avec succès');
      console.log('   ID:', teamData[0].id);
      console.log('   Nom:', teamData[0].name);

      // Test 3bis: Vérifier que l'équipe persiste
      console.log('\n3bis️⃣  Vérification de la persistance...');
      const { data: verifyTeam, error: verifyError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamData[0].id)
        .single();

      if (verifyError) {
        console.log('❌ Équipe non trouvée après création:', verifyError.message);
      } else {
        console.log('✅ Équipe persiste correctement');
      }
    }

    // Test 4: Lister toutes les équipes
    console.log('\n4️⃣  Lecture de toutes les équipes...');
    const { data: allTeams, error: listError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (listError) {
      console.log('❌ Erreur lecture équipes:', listError.message);
    } else {
      console.log(`✅ ${allTeams.length} équipe(s) trouvée(s)`);
      allTeams.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.name} (${team.created_at})`);
      });
    }

    // Test 5: Test de création d'utilisateur
    console.log('\n5️⃣  Test de création d\'utilisateur (profil seulement)...');
    const testUserId = 'test-' + Date.now();
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id, // On utilise le même ID pour le test
          email: `test-${Date.now()}@example.com`,
          first_name: 'Test',
          last_name: 'User',
          role: 'employee',
          is_active: true
        }
      ])
      .select();

    if (userError) {
      console.log('❌ Erreur création utilisateur:', userError.message);
      console.log('   Note: Normal si l\'utilisateur existe déjà');
    } else {
      console.log('✅ Profil utilisateur créé');
    }

    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n✅ Déconnexion effectuée');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n========================================');
  console.log('📋 ANALYSE');
  console.log('========================================\n');
  
  console.log('💡 Si les tests ci-dessus montrent des erreurs RLS:');
  console.log('   → Le problème vient des politiques de sécurité');
  console.log('   → Solution: Exécuter le script SQL dans Supabase\n');
  
  console.log('💡 Si les tests passent mais l\'interface ne marche pas:');
  console.log('   → Le problème vient du code frontend');
  console.log('   → Solution: Vérifier les appels dans adminService.ts\n');
  
  console.log('🎯 PROCHAINES ÉTAPES:');
  console.log('   1. Analyser les résultats ci-dessus');
  console.log('   2. Corriger selon le diagnostic');
  console.log('   3. Tester à nouveau dans l\'interface');
}

// Exécuter le test
testDataPersistence().catch(console.error);