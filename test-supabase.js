// Test de connexion Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qzvrkcmwzdaffpknuozl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔗 Test de connexion Supabase...')
    
    // Tester la connexion
    const { data, error } = await supabase.from('_health').select('*').limit(1)
    
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Erreur de connexion:', error.message)
      return
    }

    console.log('✅ Connexion Supabase réussie!')
    
    // Lister les tables existantes
    console.log('\n📋 Vérification des tables existantes...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('❌ Erreur listing tables:', tablesError.message)
    } else {
      console.log('📊 Tables trouvées:', tables?.map(t => t.table_name) || 'Aucune')
    }

    // Vérifier l'auth
    console.log('\n🔐 Test authentification...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Utilisateur connecté:', user ? user.email : 'Aucun')

  } catch (error) {
    console.error('💥 Erreur fatale:', error)
  }
}

testConnection()