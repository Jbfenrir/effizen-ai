const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User ID du compte Formation
const formationUserId = '9ce86c6b-f8f8-40ab-858e-cb2c548b10cf';

// Fonction de test du filtrage (copie de la logique client)
function isDateInRange(dateStr, range) {
  const dateObj = new Date(dateStr);
  const start = new Date(range.start);
  const end = new Date(range.end);
  
  console.log(`  Comparaison: ${dateStr} (${dateObj.toISOString()}) entre ${start.toISOString()} et ${end.toISOString()}`);
  
  return dateObj >= start && dateObj <= end;
}

function filterEntriesByDateRange(entries, range) {
  return entries.filter(entry => {
    if (!entry.entry_date) return false;
    return isDateInRange(entry.entry_date, range);
  });
}

async function debugDateFilter() {
  console.log('🐛 DEBUG DU FILTRAGE DE DATES\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Récupérer toutes les entrées du compte Formation
    console.log('📥 Récupération des données...');
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', formationUserId)
      .order('entry_date');
    
    if (error || !entries) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log(`✅ ${entries.length} entrées trouvées`);
    console.log('Dates disponibles:', entries.map(e => e.entry_date).join(', '));
    
    // 2. Tester le filtrage avec la période problématique
    console.log('\n🔍 TEST DU FILTRAGE');
    console.log('-'.repeat(30));
    
    // Période sélectionnée par l'utilisateur : 11/08/2025 - 11/09/2025
    const problemRange = {
      start: new Date('2025-08-11'),  // Date de début
      end: new Date('2025-09-11')     // Date de fin
    };
    
    console.log('Période testée:');
    console.log(`  Début: ${problemRange.start.toISOString()} (${problemRange.start.toLocaleDateString()})`);
    console.log(`  Fin: ${problemRange.end.toISOString()} (${problemRange.end.toLocaleDateString()})`);
    
    // Test avec quelques dates spécifiques
    const testDates = ['2025-08-11', '2025-08-15', '2025-09-01', '2025-09-11', '2025-09-12'];
    
    console.log('\n📝 Test de dates individuelles:');
    testDates.forEach(dateStr => {
      const inRange = isDateInRange(dateStr, problemRange);
      console.log(`  ${dateStr}: ${inRange ? '✅ DANS LA PLAGE' : '❌ HORS PLAGE'}`);
    });
    
    // Filtrage complet
    console.log('\n🔄 Filtrage complet...');
    const filtered = filterEntriesByDateRange(entries, problemRange);
    console.log(`Résultat: ${filtered.length} entrées filtrées sur ${entries.length} totales`);
    
    if (filtered.length > 0) {
      console.log('Dates filtrées:', filtered.map(e => e.entry_date).join(', '));
    } else {
      console.log('⚠️ AUCUNE ENTRÉE FILTRÉE - C\'EST LE PROBLÈME !');
    }
    
    // 3. Test avec différentes approches de dates
    console.log('\n🧪 TEST AVEC DIFFÉRENTES APPROCHES');
    console.log('-'.repeat(30));
    
    // Approche 1 : Dates avec heures explicites
    const range1 = {
      start: new Date('2025-08-11T00:00:00.000Z'),
      end: new Date('2025-09-11T23:59:59.999Z')
    };
    
    const filtered1 = filterEntriesByDateRange(entries, range1);
    console.log(`Approche 1 (avec heures): ${filtered1.length} entrées`);
    
    // Approche 2 : Comparaison de chaînes
    const filtered2 = entries.filter(entry => 
      entry.entry_date >= '2025-08-11' && entry.entry_date <= '2025-09-11'
    );
    console.log(`Approche 2 (chaînes): ${filtered2.length} entrées`);
    
    // 4. Diagnostique final
    console.log('\n🎯 DIAGNOSTIC');
    console.log('-'.repeat(30));
    
    if (filtered.length === 0 && entries.length > 0) {
      console.log('❌ PROBLÈME CONFIRMÉ: Le filtrage ne fonctionne pas');
      console.log('💡 SOLUTIONS POSSIBLES:');
      console.log('   1. Problème de fuseau horaire');
      console.log('   2. Comparaison de dates incorrecte');
      console.log('   3. Format de date incompatible');
      
      if (filtered2.length > 0) {
        console.log('✅ La comparaison de chaînes fonctionne - utiliser cette approche');
      }
    } else {
      console.log('✅ Le filtrage semble fonctionner correctement');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

debugDateFilter();