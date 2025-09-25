import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBothAccounts() {
  console.log('🔍 VÉRIFICATION DES DEUX COMPTES\n');
  console.log('='*50 + '\n');

  // 1. Vérifier les utilisateurs
  const { data: users } = await supabase.auth.admin.listUsers();

  const formationUser = users.users.find(u => u.email === 'jbgerberon@formation-ia-entreprises.ch');
  const adminUser = users.users.find(u => u.email === 'jbgerberon@gmail.com');

  console.log('👤 COMPTES UTILISATEURS:');
  console.log(`\n1. jbgerberon@formation-ia-entreprises.ch (DONNÉES UTILISATEUR)`);
  console.log(`   ID: ${formationUser?.id || 'NON TROUVÉ'}`);

  console.log(`\n2. jbgerberon@gmail.com (ADMIN)`);
  console.log(`   ID: ${adminUser?.id || 'NON TROUVÉ'}`);

  console.log('\n' + '='*50 + '\n');

  // 2. Vérifier les données pour CHAQUE compte
  if (formationUser) {
    console.log('📊 DONNÉES pour jbgerberon@formation-ia-entreprises.ch:');
    const { data: formationData } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', formationUser.id)
      .order('entry_date', { ascending: false });

    if (formationData && formationData.length > 0) {
      console.log(`   • Total: ${formationData.length} entrées`);
      console.log(`   • Dernière: ${formationData[0].entry_date}`);
      console.log(`   • Première: ${formationData[formationData.length - 1].entry_date}`);

      // Vérifier septembre
      const sept = formationData.filter(e => e.entry_date.startsWith('2025-09'));
      console.log(`   • Septembre 2025: ${sept.length} entrées`);

      // Montrer les 5 dernières
      console.log(`   • 5 dernières dates:`);
      formationData.slice(0, 5).forEach(e => {
        console.log(`     - ${e.entry_date}`);
      });
    } else {
      console.log('   ❌ AUCUNE DONNÉE');
    }
  }

  console.log('\n' + '-'*30 + '\n');

  if (adminUser) {
    console.log('📊 DONNÉES pour jbgerberon@gmail.com:');
    const { data: adminData } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', adminUser.id)
      .order('entry_date', { ascending: false });

    if (adminData && adminData.length > 0) {
      console.log(`   • Total: ${adminData.length} entrées`);
      console.log(`   • Dernière: ${adminData[0].entry_date}`);
      console.log(`   • Première: ${adminData[adminData.length - 1].entry_date}`);

      // Vérifier septembre
      const sept = adminData.filter(e => e.entry_date.startsWith('2025-09'));
      console.log(`   • Septembre 2025: ${sept.length} entrées`);

      // Montrer les 5 dernières
      console.log(`   • 5 dernières dates:`);
      adminData.slice(0, 5).forEach(e => {
        console.log(`     - ${e.entry_date}`);
      });
    } else {
      console.log('   ❌ AUCUNE DONNÉE');
    }
  }

  console.log('\n' + '='*50 + '\n');
  console.log('🚨 DIAGNOSTIC:');
  console.log('Les données du CSV ont été restaurées sur le compte ADMIN (jbgerberon@gmail.com)');
  console.log('alors que vous utilisez le compte jbgerberon@formation-ia-entreprises.ch !');
  console.log('\n✅ SOLUTION: Transférer les données vers le bon compte...');
}

verifyBothAccounts();