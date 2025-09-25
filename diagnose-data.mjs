#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 DIAGNOSTIC DES DONNÉES SUPABASE\n');

// ID utilisateur à vérifier
const userId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4'; // Version originale
const userIdAlternate = '8ac44380-8445-49a8-b4a9-16f602d0e7d4'; // Version dans CLAUDE.md

async function diagnoseData() {
  try {
    console.log('🔎 1. Vérification du nombre total d\'entrées par user_id...\n');

    // Vérifier avec l'ID original
    const { data: data1, error: error1, count: count1 } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    console.log(`📊 USER ID: ${userId}`);
    console.log(`   Nombre d'entrées: ${count1}`);
    console.log(`   Erreur: ${error1 ? error1.message : 'Aucune'}\n`);

    // Vérifier avec l'ID alternatif
    const { data: data2, error: error2, count: count2 } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', userIdAlternate);

    console.log(`📊 USER ID: ${userIdAlternate}`);
    console.log(`   Nombre d'entrées: ${count2}`);
    console.log(`   Erreur: ${error2 ? error2.message : 'Aucune'}\n`);

    // Utiliser le bon user_id selon les résultats
    const validData = count1 > 0 ? data1 : data2;
    const validUserId = count1 > 0 ? userId : userIdAlternate;
    const validCount = count1 > 0 ? count1 : count2;

    if (!validData || validCount === 0) {
      console.log('❌ AUCUNE DONNÉE TROUVÉE pour les deux user_id !');
      return;
    }

    console.log(`✅ Utilisation du USER ID: ${validUserId} (${validCount} entrées)\n`);

    // Analyser les dates
    console.log('📅 2. Analyse des dates des entrées...\n');

    const datesSorted = validData
      .map(entry => entry.entry_date)
      .sort()
      .map(date => new Date(date).toLocaleDateString('fr-FR'));

    console.log(`📊 Plage de dates:`);
    console.log(`   Première entrée: ${datesSorted[0]}`);
    console.log(`   Dernière entrée: ${datesSorted[datesSorted.length - 1]}`);
    console.log(`   Total: ${datesSorted.length} entrées\n`);

    // Compter par mois
    const monthCounts = {};
    datesSorted.forEach(date => {
      const month = date.slice(3); // MM/YYYY
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    console.log('📊 Répartition par mois:');
    Object.entries(monthCounts).forEach(([month, count]) => {
      console.log(`   ${month}: ${count} entrées`);
    });
    console.log('');

    // Vérifier spécifiquement les dates de septembre
    console.log('🔍 3. Vérification des entrées de septembre 2025...\n');

    const septemberEntries = validData.filter(entry => {
      const date = new Date(entry.entry_date);
      return date.getMonth() === 8 && date.getFullYear() === 2025; // Septembre = mois 8
    });

    console.log(`📊 Entrées de septembre 2025: ${septemberEntries.length}`);

    if (septemberEntries.length > 0) {
      console.log('📅 Dates spécifiques en septembre:');
      septemberEntries
        .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
        .forEach(entry => {
          const date = new Date(entry.entry_date).toLocaleDateString('fr-FR');
          console.log(`   ${date} - ID: ${entry.id}`);
        });
    }

    console.log('\n🔍 4. Vérification de la structure des données...\n');

    if (validData.length > 0) {
      const sample = validData[0];
      console.log('📊 Structure d\'une entrée type:');
      console.log(`   ID: ${sample.id}`);
      console.log(`   User ID: ${sample.user_id}`);
      console.log(`   Date: ${sample.entry_date}`);
      console.log(`   Created at: ${sample.created_at}`);
      console.log(`   Updated at: ${sample.updated_at}`);
      console.log(`   Données (premiers caractères): ${JSON.stringify(sample.data).slice(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ ERREUR lors du diagnostic:', error);
  }
}

diagnoseData();