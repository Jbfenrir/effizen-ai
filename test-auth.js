// Script de test pour vérifier l'authentification Supabase
// Exécuter avec: node test-auth.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🚀 Test d\'authentification Supabase\n');
  console.log('================================\n');

  // Test 1: Connexion avec mot de passe
  console.log('Test 1: Connexion avec email/mot de passe');
  console.log('-----------------------------------------');
  
  const email = 'jbgerberon@gmail.com';
  const password = 'mtuw xsol vahe sgkn'; // Clé d'application Gmail
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('\n');

    // Test 2: Récupération du profil
    console.log('Test 2: Récupération du profil utilisateur');
    console.log('------------------------------------------');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError);
      
      if (profileError.code === 'PGRST116') {
        console.log('⚠️ Le profil n\'existe pas dans la base de données');
        console.log('💡 Tentative de création du profil...\n');
        
        // Créer le profil
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin',
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Impossible de créer le profil:', createError);
          console.log('\n💡 Solution: Exécutez le script SQL fix-rls-policies.sql dans Supabase');
        } else {
          console.log('✅ Profil créé avec succès:', newProfile);
        }
      }
    } else {
      console.log('✅ Profil trouvé:');
      console.log('  - ID:', profile.id);
      console.log('  - Email:', profile.email);
      console.log('  - Rôle:', profile.role);
      console.log('  - Équipe:', profile.team || 'Aucune');
      console.log('  - Actif:', profile.is_active);
    }

    // Test 3: Test des permissions RLS
    console.log('\nTest 3: Test des permissions RLS');
    console.log('---------------------------------');
    
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('email, role');

    if (allProfilesError) {
      console.log('⚠️ Impossible de lire tous les profils (normal si pas admin):', allProfilesError.message);
    } else {
      console.log('✅ Nombre de profils visibles:', allProfiles.length);
      allProfiles.forEach(p => {
        console.log(`  - ${p.email} (${p.role})`);
      });
    }

    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('🚨 Erreur inattendue:', error);
  }

  console.log('\n================================');
  console.log('Test terminé');
}

// Exécuter le test
testAuth().then(() => {
  console.log('\n✨ Script terminé');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});