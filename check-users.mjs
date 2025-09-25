import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIxMzc5OCwiZXhwIjoyMDY3Nzg5Nzk4fQ.6_EaGl6aDkp9iXKhzWUayGILbu0tGsYoSeGTvICec1Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('🔍 Vérification des utilisateurs...');

  // Vérifier auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Erreur auth.users:', authError);
  } else {
    console.log('👥 Utilisateurs auth:');
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
  }

  // Vérifier daily_entries existantes
  const { data: entries, error: entriesError } = await supabase
    .from('daily_entries')
    .select('user_id, entry_date')
    .order('entry_date', { ascending: false })
    .limit(10);

  if (entriesError) {
    console.error('❌ Erreur daily_entries:', entriesError);
  } else {
    console.log('\n📊 Entrées existantes:');
    entries.forEach(entry => {
      console.log(`  - ${entry.entry_date} (User: ${entry.user_id})`);
    });
  }
}

checkUsers();