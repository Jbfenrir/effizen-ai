#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 Conversion CSV simple...');

// Lire le CSV
const csvContent = fs.readFileSync('/mnt/c/Users/FIAE/Downloads/effizen-data-complet(temp).csv', 'utf8');
const lines = csvContent.trim().split('\n');
const dataLines = lines.slice(1); // Ignorer headers

console.log(`📊 ${dataLines.length} entrées trouvées`);

// Conversion simple
const entries = [];
dataLines.forEach((line, index) => {
  if (!line.trim()) return;
  
  const columns = line.split(';');
  const [date, sommeil, fatigue, energie, pauses, bienEtre, scoreOptim, taches] = columns;
  
  console.log(`🔍 Ligne ${index}: date=${date}, tâches="${taches}"`);
  
  // Parser les tâches
  const tasks = [];
  if (taches && taches.trim()) {
    const taskParts = taches.split(' | ');
    taskParts.forEach(part => {
      const match = part.match(/^(.+?) *\(([0-9.]+)h?\)$/);
      if (match) {
        const [, name, duration] = match;
        tasks.push({
          id: `task_${index}_${Math.random().toString(36).substring(2, 5)}`,
          name: name.trim(),
          duration: parseFloat(duration),
          isHighValue: ['App', 'Strategic', 'Recherche', 'forma', 'prep forma'].some(keyword => 
            name.toLowerCase().includes(keyword.toLowerCase())
          )
        });
      }
    });
  }
  
  // Calculer les heures de travail
  const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
  
  const entry = {
    id: `entry_${date.replace(/-/g, '_')}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: "TO_REPLACE_WITH_REAL_USER_ID",
    entry_date: date,
    sleep: {
      bedTime: "22:00",
      wakeTime: "07:00", 
      insomniaDuration: 0,
      duration: parseFloat(sommeil) || 0
    },
    focus: {
      morningHours: Math.min(totalHours * 0.6, 6),
      afternoonHours: Math.min(totalHours * 0.4, 6), 
      drivingHours: tasks.find(t => t.name.toLowerCase().includes('transport'))?.duration || 0,
      fatigue: parseInt(fatigue) || 3
    },
    tasks: tasks,
    wellbeing: {
      meditationsPauses: {
        morning: parseInt(pauses) > 0,
        noon: parseInt(pauses) > 1,
        afternoon: parseInt(pauses) > 2,
        evening: parseInt(pauses) > 3
      },
      sportLeisureHours: 0.5,
      socialInteraction: tasks.some(t => 
        ['networking', 'rdv', 'partenariat', 'meeting'].some(keyword =>
          t.name.toLowerCase().includes(keyword.toLowerCase())
        )
      ),
      energy: parseInt(energie) || 50
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  entries.push(entry);
  console.log(`✅ ${date}: ${tasks.length} tâches, ${totalHours}h total`);
});

// Sauvegarder
fs.writeFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/donnees-converties.json', 
  JSON.stringify(entries, null, 2));

console.log(`\n💾 ${entries.length} entrées converties et sauvegardées`);
console.log('📂 Fichier: donnees-converties.json');

// Générer script d'injection simple
const injectionScript = `// SCRIPT D'INJECTION SUPABASE - À exécuter dans la console de production

console.log('🚀 Démarrage injection données historiques...');

// 1. Récupérer user_id
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  console.error('❌ Utilisateur non connecté:', userError);
  throw new Error('Connectez-vous d\'abord');
}
console.log('✅ Utilisateur:', user.email, 'ID:', user.id);

// 2. Données à injecter  
const rawEntries = ${JSON.stringify(entries, null, 2)};

// 3. Remplacer user_id
const entries = rawEntries.map(entry => ({ ...entry, user_id: user.id }));

// 4. Vérifier doublons
const { data: existing } = await supabase.from('daily_entries').select('entry_date').eq('user_id', user.id);
const existingDates = new Set((existing || []).map(e => e.entry_date));
const newEntries = entries.filter(e => !existingDates.has(e.entry_date));

console.log('📊 Entrées à injecter:', newEntries.length, '/ Total:', entries.length);

if (newEntries.length === 0) {
  console.log('✅ Toutes les données déjà présentes');
} else {
  // 5. Injection
  let injected = 0;
  for (let i = 0; i < newEntries.length; i += 3) {
    const batch = newEntries.slice(i, i + 3);
    console.log('🔄 Lot', Math.floor(i/3) + 1, ':', batch.length, 'entrées');
    
    const { error } = await supabase.from('daily_entries').insert(batch);
    if (error) {
      console.error('❌ Erreur:', error);
    } else {
      injected += batch.length;
      console.log('✅ Lot injecté');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('🎉 TERMINÉ:', injected, 'entrées injectées !');
  console.log('🔄 Rechargez la page pour voir vos données');
}`;

fs.writeFileSync('/mnt/c/Users/FIAE/Desktop/effizen-ai/script-injection-final.js', injectionScript);
console.log('📜 Script d\'injection: script-injection-final.js');
console.log('\n🎯 PROCHAINES ÉTAPES:');
console.log('1. Aller sur https://effizen-ai-prod.vercel.app');
console.log('2. Se connecter avec jbgerberon@formation-ia-entreprises.ch'); 
console.log('3. F12 → Console');
console.log('4. Copier le contenu de script-injection-final.js');
console.log('5. Coller et appuyer sur Entrée');
console.log('\n✅ Prêt !');