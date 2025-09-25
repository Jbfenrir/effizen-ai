#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 VÉRIFICATION DES UTILISATEURS SUPABASE\n');

async function checkUsers() {
  try {
    // Récupérer tous les utilisateurs de auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`📊 Nombre total d'utilisateurs: ${users.users.length}\n`);

    // Afficher les détails de chaque utilisateur
    users.users.forEach((user, index) => {
      console.log(`👤 Utilisateur ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created at: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Last sign in: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}`);
      console.log('');
    });

    // Vérifier si l'email jbgerberon@gmail.com existe
    const targetEmail = 'jbgerberon@gmail.com';
    const targetUser = users.users.find(user => user.email === targetEmail);

    if (targetUser) {
      console.log(`✅ Utilisateur trouvé pour ${targetEmail}:`);
      console.log(`   User ID: ${targetUser.id}`);

      // Vérifier les entrées pour cet utilisateur
      const { data: entries, error: entriesError, count } = await supabase
        .from('daily_entries')
        .select('*', { count: 'exact' })
        .eq('user_id', targetUser.id);

      if (entriesError) {
        console.error('❌ Erreur lors de la vérification des entrées:', entriesError);
      } else {
        console.log(`   Entrées trouvées: ${count || 0}`);
        if (entries && entries.length > 0) {
          const dates = entries.map(e => e.entry_date).sort();
          console.log(`   Première entrée: ${dates[0]}`);
          console.log(`   Dernière entrée: ${dates[dates.length - 1]}`);
        }
      }
    } else {
      console.log(`❌ Aucun utilisateur trouvé pour ${targetEmail}`);
    }

    console.log('\n🔍 Vérification de l\'ID utilisé dans les données restaurées...');

    const dataUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4';
    const correspondingUser = users.users.find(user => user.id === dataUserId);

    if (correspondingUser) {
      console.log(`✅ User ID des données (${dataUserId}) correspond à:`);
      console.log(`   Email: ${correspondingUser.email}`);
    } else {
      console.log(`❌ User ID des données (${dataUserId}) ne correspond à aucun utilisateur auth !`);
      console.log('   Cela peut expliquer pourquoi les données ne sont pas visibles.');
    }

  } catch (error) {
    console.error('❌ ERREUR:', error);
  }
}

checkUsers();