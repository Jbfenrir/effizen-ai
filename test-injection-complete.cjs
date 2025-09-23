const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User ID de l'admin (CORRIGÉ - le bon ID)
const adminUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4';

// Fonction pour parser les tâches
function parseTask(taskStr) {
  const match = taskStr.match(/^(.+?)\s*\((\d+(?:\.\d+)?h?)\)$/);
  if (match) {
    const name = match[1].trim();
    const duration = parseFloat(match[2]);
    
    const highValueKeywords = ['app', 'recherche', 'prep forma', 'forma', 'strategic'];
    const isHighValue = highValueKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
    
    return { name, duration, isHighValue };
  }
  return null;
}

// Fonction pour calculer les heures
function calculateWorkHours(tasks) {
  const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  const morningHours = Math.min(totalHours * 0.6, 6);
  const afternoonHours = Math.min(totalHours - morningHours, 4.4);
  return { morningHours, afternoonHours };
}

// Données CSV
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

async function testInjection() {
  console.log('🧪 TEST COMPLET D\'INJECTION DES DONNÉES\n');
  console.log('=' .repeat(50));
  
  try {
    // ÉTAPE 1 : Vérifier l'état initial
    console.log('\n📊 ÉTAPE 1: Vérification de l\'état initial...');
    const { data: initialData, error: initialError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', adminUserId)
      .order('entry_date');
    
    if (initialError) {
      console.error('❌ Erreur lecture initiale:', initialError.message);
      return false;
    }
    
    console.log(`   Entrées existantes: ${initialData?.length || 0}`);
    if (initialData && initialData.length > 0) {
      console.log('   Dates existantes:', initialData.map(d => d.entry_date).join(', '));
    }
    
    // ÉTAPE 2 : Préparer les données
    console.log('\n📝 ÉTAPE 2: Préparation des données...');
    const existingDates = new Set(initialData?.map(e => e.entry_date) || []);
    
    const dataToInject = csvData
      .filter(item => !existingDates.has(item.date))
      .map(item => {
        const tasks = item.tasks.map(taskStr => parseTask(taskStr)).filter(t => t !== null);
        const { morningHours, afternoonHours } = calculateWorkHours(tasks);
        
        const drivingHours = tasks.some(t => t.name.toLowerCase().includes('transport')) ? 
          tasks.find(t => t.name.toLowerCase().includes('transport'))?.duration || 0 : 0;
        
        const pauseConfig = {
          morning: item.pauses >= 1,
          noon: item.pauses >= 2,
          afternoon: item.pauses >= 3,
          evening: item.pauses >= 4
        };
        
        return {
          user_id: adminUserId,
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
            drivingHours,
            fatigue: item.fatigue
          },
          tasks: tasks,
          wellbeing: {
            meditationsPauses: pauseConfig,
            sportLeisureHours: item.sport,
            socialInteraction: item.social,
            energy: 50
          }
        };
      });
    
    console.log(`   Données à injecter: ${dataToInject.length} entrées`);
    
    if (dataToInject.length === 0) {
      console.log('✅ Toutes les données sont déjà dans Supabase!');
      return true;
    }
    
    // Vérifier la structure d'une entrée
    console.log('\n🔍 Vérification de la structure des données:');
    const sampleEntry = dataToInject[0];
    console.log('   - user_id:', sampleEntry.user_id ? '✅' : '❌');
    console.log('   - entry_date:', sampleEntry.entry_date ? '✅' : '❌');
    console.log('   - sleep:', sampleEntry.sleep ? '✅' : '❌');
    console.log('   - focus:', sampleEntry.focus ? '✅' : '❌');
    console.log('   - tasks:', Array.isArray(sampleEntry.tasks) ? '✅' : '❌');
    console.log('   - wellbeing:', sampleEntry.wellbeing ? '✅' : '❌');
    console.log('   - Pas d\'ID personnalisé:', !sampleEntry.id ? '✅' : '❌');
    
    // ÉTAPE 3 : Injection
    console.log('\n💉 ÉTAPE 3: Injection des données...');
    let totalInjected = 0;
    const batchSize = 5;
    
    for (let i = 0; i < dataToInject.length; i += batchSize) {
      const batch = dataToInject.slice(i, i + batchSize);
      const batchNum = Math.floor(i/batchSize) + 1;
      
      console.log(`   Lot ${batchNum}: ${batch.length} entrées...`);
      
      const { error } = await supabase
        .from('daily_entries')
        .insert(batch);
      
      if (error) {
        console.error(`   ❌ Erreur lot ${batchNum}:`, error.message);
        console.error('   Détails:', error);
        return false;
      }
      
      totalInjected += batch.length;
      console.log(`   ✅ Lot ${batchNum} injecté avec succès`);
      
      // Pause entre les lots
      if (i + batchSize < dataToInject.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // ÉTAPE 4 : Vérification finale
    console.log('\n✅ ÉTAPE 4: Vérification finale...');
    const { data: finalData, error: finalError } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', adminUserId)
      .order('entry_date');
    
    if (finalError) {
      console.error('❌ Erreur vérification finale:', finalError.message);
      return false;
    }
    
    console.log(`   Total dans Supabase: ${finalData?.length || 0} entrées`);
    console.log(`   Nouvelles entrées ajoutées: ${totalInjected}`);
    
    // Vérifier que toutes les dates du CSV sont présentes
    const finalDates = new Set(finalData?.map(e => e.entry_date) || []);
    const missingDates = csvData.filter(item => !finalDates.has(item.date));
    
    if (missingDates.length === 0) {
      console.log('\n🎉 SUCCÈS TOTAL! Toutes les données CSV sont maintenant dans Supabase!');
      console.log('   Les données sont accessibles depuis n\'importe quel navigateur/machine');
      return true;
    } else {
      console.log(`\n⚠️ Dates manquantes: ${missingDates.map(d => d.date).join(', ')}`);
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    return false;
  }
}

// Lancer le test
testInjection().then(success => {
  console.log('\n' + '=' .repeat(50));
  if (success) {
    console.log('✅ TEST RÉUSSI - Solution validée');
  } else {
    console.log('❌ TEST ÉCHOUÉ - Correction nécessaire');
  }
  process.exit(success ? 0 : 1);
});