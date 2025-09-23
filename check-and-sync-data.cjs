const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Données du CSV converties
const csvData = [
  { date: '2025-08-11', sleep: 8, fatigue: 2, tasks: ['App (1h)', 'Recherche (2h)', 'Veille (3h)', 'Prep Rdv (2h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-12', sleep: 7, fatigue: 4, tasks: ['Recherche (3h)', 'Admin (2h)', 'Veille (3h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-08-13', sleep: 8, fatigue: 4, tasks: ['App (2h)', 'Veille (2h)', 'Prep Rdv (1h)', 'Recherche (3h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-14', sleep: 0, fatigue: 5, tasks: ['App (1h)', 'Recherche (5h)', 'Prep rdv (0.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-18', sleep: 8.5, fatigue: 3, tasks: ['Veille (3h)', 'Prep forma (1.5h)', 'Recherche (2.5h)', 'App (1.5h)'], pauses: 1, social: false, sport: 0.5 },
  { date: '2025-08-19', sleep: 8, fatigue: 3, tasks: ['Prep forma (3h)', 'Networking (6h)', 'Transport (1.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-20', sleep: 7.5, fatigue: 3, tasks: ['Rdv (1h)', 'Mails (1.5h)', 'Prep rdv (2h)', 'Transport (1.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-22', sleep: 7.5, fatigue: 4, tasks: ['Rdv (2.5h)', 'prep froma (6h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-25', sleep: 8.5, fatigue: 5, tasks: ['Recherche (2.5h)', 'Partenariat (0.5h)', 'mails (1h)', 'Admin (0.5h)', 'prep forma (3.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-26', sleep: 8, fatigue: 5, tasks: ['admin (1h)', 'forma (4.5h)', 'Transport (1.5h)'], pauses: 1, social: false, sport: 0.5 },
  { date: '2025-08-27', sleep: 7.25, fatigue: 4, tasks: ['prep forma (0.5h)', 'app (3h)', 'rdv (1.5h)', 'Admin (2h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-08-28', sleep: 7.5, fatigue: 4, tasks: ['rdv (0.5h)', 'partenariat (4h)', 'App (2h)', 'Networking (4h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-08-29', sleep: 8.5, fatigue: 3, tasks: ['Admin (3.5h)', 'rdv (1h)', 'prep forma (2h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-01', sleep: 6.5, fatigue: 3, tasks: ['partenariat (4.5h)', 'app (1h)', 'Mails (1h)', 'Admin (1h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-02', sleep: 8.5, fatigue: 3, tasks: ['Transport (2.5h)', 'rdv perso (1h)', 'Networking (4h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-03', sleep: 0, fatigue: 3, tasks: ['Rdv (2h)', 'prep forma (7h)', 'Networking (1h)', 'admin (1h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-04', sleep: 8, fatigue: 4, tasks: ['prep forma (6h)', 'rdv (2.5h)', 'mails (0.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-05', sleep: 0, fatigue: 5, tasks: ['Admin (1h)', 'prep forma (7h)', 'rdv (1h)', 'mails (0.5h)'], pauses: 0, social: true, sport: 0.5 },
  { date: '2025-09-08', sleep: 8, fatigue: 5, tasks: ['prep forma (11h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-09', sleep: 7, fatigue: 4, tasks: ['forma (7.5h)', 'Transport (2h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-10', sleep: 8, fatigue: 4, tasks: ['mails (2h)', 'rdv (0.5h)', 'prep forma (5h)', 'App (1.5h)'], pauses: 1, social: true, sport: 0.5 },
  { date: '2025-09-11', sleep: 6, fatigue: 4, tasks: ['Strategic (4.5h)', 'mails (2h)', 'App (1.5h)'], pauses: 0, social: false, sport: 0.5 },
  { date: '2025-09-12', sleep: 7.5, fatigue: 5, tasks: [], pauses: 1, social: false, sport: 0.5 }
];

// Fonction pour parser les tâches du format CSV
function parseTask(taskStr) {
  const match = taskStr.match(/^(.+?)\s*\((\d+(?:\.\d+)?h?)\)$/);
  if (match) {
    const name = match[1].trim();
    const duration = parseFloat(match[2]);
    
    // Déterminer si c'est une tâche à haute valeur ajoutée
    const highValueKeywords = ['app', 'recherche', 'prep forma', 'forma', 'strategic'];
    const isHighValue = highValueKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
    
    return { name, duration, isHighValue };
  }
  return null;
}

// Fonction pour calculer les heures de travail
function calculateWorkHours(tasks) {
  const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  // Répartition approximative matin/après-midi
  const morningHours = Math.min(totalHours * 0.6, 6);
  const afternoonHours = Math.min(totalHours - morningHours, 4.4);
  return { morningHours, afternoonHours, totalHours };
}

async function checkAndSyncData() {
  try {
    console.log('🔍 Vérification des données existantes dans Supabase...\n');
    
    // 1. Se connecter avec l'utilisateur admin
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jbgerberon@gmail.com',
      password: 'mtuw xsol vahe sgkn'
    });
    
    if (authError || !user) {
      console.error('❌ Erreur de connexion:', authError?.message);
      return;
    }
    
    console.log('✅ Connecté en tant que:', user.email);
    console.log('   User ID:', user.id, '\n');
    
    // 2. Récupérer toutes les entrées existantes
    const { data: existingEntries, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Erreur lecture:', fetchError.message);
      return;
    }
    
    console.log(`📊 Données actuellement dans Supabase: ${existingEntries?.length || 0} entrées\n`);
    
    if (existingEntries && existingEntries.length > 0) {
      console.log('📅 Dates existantes:');
      existingEntries.forEach(entry => {
        console.log(`   - ${entry.entry_date}`);
      });
      console.log('');
    }
    
    // 3. Identifier les dates manquantes
    const existingDates = new Set(existingEntries?.map(e => e.entry_date) || []);
    const missingData = csvData.filter(item => !existingDates.has(item.date));
    
    console.log(`🔄 Données à synchroniser: ${missingData.length} entrées manquantes\n`);
    
    if (missingData.length === 0) {
      console.log('✅ Toutes les données du CSV sont déjà dans Supabase!');
      return;
    }
    
    // 4. Préparer les données pour l'insertion
    console.log('📝 Préparation des données pour insertion...\n');
    
    const dataToInsert = missingData.map(item => {
      const tasks = item.tasks.map(taskStr => parseTask(taskStr)).filter(t => t !== null);
      const { morningHours, afternoonHours } = calculateWorkHours(tasks);
      
      // Déterminer les pauses (matin, midi, après-midi, soir)
      const pauseConfig = {
        morning: item.pauses >= 1,
        noon: item.pauses >= 2,
        afternoon: item.pauses >= 3,
        evening: item.pauses >= 4
      };
      
      return {
        user_id: user.id,
        entry_date: item.date,
        sleep: {
          bedTime: "22:00",
          wakeTime: "07:00",
          insomniaDuration: 0,
          duration: item.sleep
        },
        focus: {
          morningHours,
          afternoonHours,
          drivingHours: tasks.some(t => t.name.toLowerCase().includes('transport')) ? 
            tasks.find(t => t.name.toLowerCase().includes('transport')).duration : 0,
          fatigue: item.fatigue
        },
        tasks: tasks,
        wellbeing: {
          meditationsPauses: pauseConfig,
          sportLeisureHours: item.sport,
          socialInteraction: item.social,
          energy: 50 // Valeur par défaut car non présente dans le CSV
        }
      };
    });
    
    // 5. Insérer les données manquantes
    console.log('💾 Insertion des données dans Supabase...\n');
    
    const { data: insertedData, error: insertError } = await supabase
      .from('daily_entries')
      .insert(dataToInsert);
    
    if (insertError) {
      console.error('❌ Erreur insertion:', insertError.message);
      return;
    }
    
    console.log(`✅ SUCCÈS! ${missingData.length} entrées ajoutées à Supabase!\n`);
    console.log('📊 Résumé:');
    console.log(`   - Entrées existantes: ${existingEntries?.length || 0}`);
    console.log(`   - Nouvelles entrées: ${missingData.length}`);
    console.log(`   - Total maintenant: ${(existingEntries?.length || 0) + missingData.length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Lancer la vérification et synchronisation
checkAndSyncData();