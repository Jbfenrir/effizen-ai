// Script pour vérifier les données dans Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('🔍 Vérification des données dans Supabase\n');
  console.log('=====================================\n');

  try {
    // 1. Se connecter en tant qu'admin
    console.log('1. Connexion en tant qu\'admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jbgerberon@gmail.com',
      password: 'mtuw xsol vahe sgkn'
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connecté avec succès\n');

    // 2. Vérifier les profils
    console.log('2. Vérification des profils...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Erreur récupération profils:', profilesError);
    } else {
      console.log(`✅ ${profiles.length} profil(s) trouvé(s):`);
      profiles.forEach(p => {
        console.log(`   - ${p.email} (${p.role}) - ID: ${p.id}`);
      });
    }
    console.log('\n');

    // 3. Vérifier les équipes
    console.log('3. Vérification des équipes...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      console.error('❌ Erreur récupération équipes:', teamsError);
    } else {
      console.log(`✅ ${teams.length} équipe(s) trouvée(s):`);
      teams.forEach(t => {
        console.log(`   - ${t.name} - ID: ${t.id}`);
      });
    }
    console.log('\n');

    // 4. Vérifier les entrées quotidiennes
    console.log('4. Vérification des entrées quotidiennes...');
    const { data: entries, error: entriesError } = await supabase
      .from('daily_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (entriesError) {
      console.error('❌ Erreur récupération entrées:', entriesError);
    } else {
      console.log(`✅ ${entries.length} entrée(s) trouvée(s)`);
      
      if (entries.length > 0) {
        console.log('\nDernières entrées:');
        entries.slice(0, 5).forEach(e => {
          console.log(`   - ${e.entry_date} - User: ${e.user_id}`);
        });
        
        // Vérifier spécifiquement juillet 2025
        const julyEntries = entries.filter(e => 
          e.entry_date && e.entry_date.startsWith('2025-07')
        );
        
        console.log(`\n📅 Entrées de juillet 2025: ${julyEntries.length}`);
        if (julyEntries.length > 0) {
          console.log('Dates de juillet:');
          julyEntries.forEach(e => {
            console.log(`   - ${e.entry_date}`);
          });
        }
      }
    }
    console.log('\n');

    // 5. Vérifier les statistiques d'équipe
    console.log('5. Vérification des statistiques d\'équipe...');
    const { data: teamStats, error: teamStatsError } = await supabase
      .from('team_stats')
      .select('*');

    if (teamStatsError) {
      console.error('❌ Erreur récupération stats:', teamStatsError);
    } else {
      console.log(`✅ ${teamStats?.length || 0} statistique(s) trouvée(s)`);
    }

    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n✅ Déconnexion réussie');

  } catch (error) {
    console.error('🚨 Erreur inattendue:', error);
  }

  console.log('\n=====================================');
  console.log('Vérification terminée');
}

// Exécuter la vérification
checkData().then(() => {
  console.log('\n✨ Script terminé');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});