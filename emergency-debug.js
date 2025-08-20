// 🚨 DIAGNOSTIC D'URGENCE - Application qui ne démarre plus
// À exécuter dans la console (F12) sur localhost:3000

console.log('🚨 DIAGNOSTIC D\'URGENCE EFFIZEN-AI');
console.log('==================================');

// 1. Vérifier l'état de base
console.log('URL actuelle:', window.location.href);
console.log('Timestamp:', new Date().toISOString());

// 2. Vérifier que React est chargé
console.log('React chargé:', typeof React !== 'undefined' ? '✅ OUI' : '❌ NON');

// 3. Vérifier les variables d'environnement
console.log('\n📝 VARIABLES D\'ENVIRONNEMENT:');
console.log('VITE_SUPABASE_URL:', import.meta?.env?.VITE_SUPABASE_URL || 'NON DÉFINIE');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta?.env?.VITE_SUPABASE_ANON_KEY ? 'DÉFINIE' : 'NON DÉFINIE');

// 4. Vérifier Supabase
console.log('\n🔌 VÉRIFICATION SUPABASE:');
if (window.supabase) {
  console.log('✅ Client Supabase trouvé');
  
  // Test de connexion basique
  window.supabase.auth.getSession()
    .then(result => {
      console.log('📡 Test getSession:');
      console.log('  - Session:', result.data?.session ? 'PRÉSENTE' : 'ABSENTE');
      console.log('  - User:', result.data?.session?.user?.email || 'AUCUN');
      console.log('  - Error:', result.error || 'AUCUNE');
    })
    .catch(err => {
      console.log('❌ Erreur getSession:', err);
    });
    
  // Test de getCurrentUser bypass
  console.log('\n👤 TEST getCurrentUser (bypass):');
  window.supabase.auth.getUser()
    .then(result => {
      console.log('📡 Test getUser:');
      console.log('  - User:', result.data?.user?.email || 'AUCUN');
      console.log('  - Error:', result.error || 'AUCUNE');
      
      if (result.data?.user) {
        console.log('  - User ID:', result.data.user.id);
        console.log('  - User confirmed:', result.data.user.email_confirmed_at ? 'OUI' : 'NON');
      }
    })
    .catch(err => {
      console.log('❌ Erreur getUser:', err);
    });
} else {
  console.log('❌ Client Supabase NON TROUVÉ');
}

// 5. Vérifier les erreurs dans la console
console.log('\n🐛 RECHERCHE D\'ERREURS:');
const errors = [];
const originalError = console.error;
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

// 6. Vérifier le localStorage
console.log('\n💾 VÉRIFICATION STOCKAGE:');
try {
  const keys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('auth'));
  console.log('Clés auth trouvées:', keys);
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  - ${key}:`, value ? 'PRÉSENT' : 'ABSENT');
    
    if (value && key.includes('token')) {
      try {
        const parsed = JSON.parse(value);
        console.log(`    - Expires:`, new Date(parsed.expires_at * 1000));
        console.log(`    - Valid:`, new Date() < new Date(parsed.expires_at * 1000) ? 'OUI' : 'NON');
      } catch (e) {
        console.log(`    - Parse error:`, e.message);
      }
    }
  });
} catch (e) {
  console.log('❌ Erreur localStorage:', e);
}

// 7. Test de connectivité réseau vers Supabase
console.log('\n🌐 TEST CONNECTIVITÉ:');
fetch('https://qzvrkcmwzdaffpknuozl.supabase.co/rest/v1/', {
  method: 'HEAD'
})
.then(response => {
  console.log('✅ Supabase accessible, status:', response.status);
})
.catch(err => {
  console.log('❌ Supabase inaccessible:', err);
});

// 8. Surveiller les messages useAuth
console.log('\n🎯 SURVEILLANCE useAuth:');
const originalLog = console.log;
let authMessages = [];

console.log = function(...args) {
  const message = args.join(' ');
  
  if (message.includes('useAuth') || message.includes('getCurrentUser') || message.includes('getSession')) {
    authMessages.push({
      timestamp: new Date().toISOString(),
      message: message
    });
    
    originalLog(`[AUTH] ${message}`);
    
    if (authMessages.length > 5) {
      originalLog('📊 RÉSUMÉ des 5 derniers messages auth:');
      authMessages.slice(-5).forEach((msg, i) => {
        originalLog(`  ${i+1}. ${msg.timestamp}: ${msg.message}`);
      });
    }
    
    if (authMessages.length > 20) {
      originalLog('🚨 PLUS DE 20 MESSAGES AUTH - POSSIBLE BOUCLE INFINIE!');
      console.log = originalLog; // Arrêter l'interception
    }
  } else {
    originalLog(...args);
  }
};

console.log('\n✅ DIAGNOSTIC LANCÉ - Surveillez les messages ci-dessous...');
console.log('⏰ Attendez 30 secondes et copiez TOUS les logs pour analyse');

// Timer pour résumé final
setTimeout(() => {
  console.log('\n📋 RÉSUMÉ APRÈS 30 SECONDES:');
  console.log('- Messages auth capturés:', authMessages.length);
  console.log('- Erreurs détectées:', errors.length);
  
  if (authMessages.length > 10) {
    console.log('🚨 BOUCLE INFINIE CONFIRMÉE dans useAuth');
  }
  
  if (errors.length > 0) {
    console.log('🐛 ERREURS DÉTECTÉES:');
    errors.forEach((error, i) => console.log(`  ${i+1}. ${error}`));
  }
  
  console.log('\n👉 COPIEZ TOUS CES LOGS ET ENVOYEZ À CLAUDE');
}, 30000);