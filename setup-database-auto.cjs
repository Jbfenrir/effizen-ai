const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase depuis votre .env
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

// Pour exécuter du SQL, nous avons besoin de la clé service (plus de privilèges)
// Malheureusement, avec seulement la clé anon, nous sommes limités
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Configuration automatique de la base de données...\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣  Vérification de la connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.log('❌ Table "profiles" n\'existe pas');
      console.log('   Les tables doivent être créées manuellement dans Supabase\n');
      
      // Créons au moins les données de test via l'API REST
      console.log('2️⃣  Tentative de création via l\'API REST...');
      
      // Essayer de créer une équipe de test
      console.log('   Création d\'une équipe de test...');
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            name: 'Équipe Test Auto',
            description: 'Équipe créée automatiquement par le script',
            is_active: true
          }
        ])
        .select();
      
      if (teamError) {
        console.log('   ❌ Impossible de créer l\'équipe:', teamError.message);
      } else {
        console.log('   ✅ Équipe créée:', teamData);
      }
    } else if (testError) {
      console.log('❌ Erreur de connexion:', testError.message);
    } else {
      console.log('✅ Connexion réussie\n');
      
      // Test 2: Vérifier les tables existantes
      console.log('2️⃣  Vérification des tables existantes...');
      
      const tables = ['profiles', 'teams', 'daily_entries', 'team_stats'];
      const tableStatus = {};
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          tableStatus[table] = '❌ N\'existe pas';
        } else if (error) {
          tableStatus[table] = `⚠️  Erreur: ${error.message}`;
        } else {
          tableStatus[table] = '✅ Existe';
        }
        
        console.log(`   ${table}: ${tableStatus[table]}`);
      }
      
      // Test 3: Vérifier/Créer le profil admin
      console.log('\n3️⃣  Vérification du profil admin...');
      
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user) {
        console.log('   Utilisateur connecté:', user.email);
        
        // Vérifier si le profil existe
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code === 'PGRST116') {
          console.log('   Profil n\'existe pas, création...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                role: 'admin',
                is_active: true
              }
            ])
            .select();
          
          if (createError) {
            console.log('   ❌ Erreur création profil:', createError.message);
          } else {
            console.log('   ✅ Profil admin créé');
          }
        } else if (profileData) {
          console.log('   ✅ Profil existe déjà:', profileData.role);
        }
      } else {
        console.log('   ⚠️  Pas d\'utilisateur connecté');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n========================================');
  console.log('📋 RÉSUMÉ');
  console.log('========================================\n');
  
  console.log('⚠️  LIMITATION DÉTECTÉE:');
  console.log('   Avec la clé API publique (anon), nous ne pouvons pas créer les tables.');
  console.log('   Les tables doivent être créées manuellement dans Supabase.\n');
  
  console.log('🎯 ACTION REQUISE:');
  console.log('   1. Ouvrez: https://supabase.com/dashboard');
  console.log('   2. Allez dans SQL Editor');
  console.log('   3. Copiez le contenu de fix-database-tables.sql');
  console.log('   4. Exécutez le script\n');
  
  console.log('💡 ALTERNATIVE:');
  console.log('   Si vous me donnez la clé SERVICE de Supabase (trouvable dans');
  console.log('   Project Settings > API), je pourrai créer les tables automatiquement.');
  console.log('   ⚠️  ATTENTION: Ne partagez JAMAIS cette clé publiquement!\n');
}

// Exécuter le script
setupDatabase().catch(console.error);