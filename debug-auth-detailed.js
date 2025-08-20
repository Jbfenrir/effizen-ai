// Script de diagnostic détaillé pour le problème de chargement infini
// À exécuter dans la console du navigateur (F12)

console.log('🔍 DIAGNOSTIC DÉTAILLÉ EFFIZEN-AI');
console.log('=================================');

// 1. Vérifier les tokens de stockage
function checkStorageTokens() {
  console.log('\n📦 VÉRIFICATION DU STOCKAGE');
  
  const localToken = localStorage.getItem('supabase.auth.token.local');
  const prodToken = localStorage.getItem('supabase.auth.token.prod');
  const defaultToken = localStorage.getItem('sb-qzvrkcmwzdaffpknuozl-auth-token');
  
  console.log('Local token:', localToken ? 'PRÉSENT' : 'ABSENT');
  console.log('Prod token:', prodToken ? 'PRÉSENT' : 'ABSENT');  
  console.log('Default token:', defaultToken ? 'PRÉSENT' : 'ABSENT');
  
  if (localToken) {
    try {
      const parsed = JSON.parse(localToken);
      console.log('Local token expires:', new Date(parsed.expires_at * 1000));
    } catch (e) {
      console.log('Local token parse error:', e.message);
    }
  }
  
  if (prodToken) {
    try {
      const parsed = JSON.parse(prodToken);
      console.log('Prod token expires:', new Date(parsed.expires_at * 1000));
    } catch (e) {
      console.log('Prod token parse error:', e.message);
    }
  }
}

// 2. Monitor les appels useAuth
let authCallCount = 0;
const originalConsoleLog = console.log;

function interceptAuthLogs() {
  console.log('\n🎯 INTERCEPTION DES LOGS AUTH');
  
  console.log = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('useAuth')) {
      authCallCount++;
      originalConsoleLog(`[${authCallCount}] ${message}`);
      
      if (authCallCount > 10) {
        originalConsoleLog('🚨 ALERTE: Plus de 10 appels useAuth détectés!');
        originalConsoleLog('🛑 Arrêt de l\'interception pour éviter le spam');
        console.log = originalConsoleLog;
      }
    } else {
      originalConsoleLog(...args);
    }
  };
}

// 3. Vérifier l'état du window
function checkWindowState() {
  console.log('\n🪟 ÉTAT DE LA FENÊTRE');
  
  console.log('URL actuelle:', window.location.href);
  console.log('Document ready state:', document.readyState);
  console.log('Window focused:', document.hasFocus());
  console.log('Page visibility:', document.visibilityState);
  
  // Vérifier les event listeners
  const events = ['focus', 'blur', 'visibilitychange', 'beforeunload'];
  events.forEach(event => {
    const listeners = getEventListeners ? getEventListeners(window)[event] : 'non disponible';
    console.log(`Event listeners ${event}:`, listeners?.length || 'inconnu');
  });
}

// 4. Test de la fonction getCurrentUser
function testGetCurrentUser() {
  console.log('\n👤 TEST getCurrentUser');
  
  if (window.supabase) {
    console.log('Supabase client trouvé');
    
    // Test simple
    window.supabase.auth.getUser()
      .then(result => {
        console.log('✅ getUser() success:', result.data?.user?.email || 'pas d\'utilisateur');
        console.log('❌ getUser() error:', result.error);
      })
      .catch(err => {
        console.log('🚨 getUser() exception:', err);
      });
      
    // Test session
    window.supabase.auth.getSession()
      .then(result => {
        console.log('✅ getSession() success:', result.data?.session?.user?.email || 'pas de session');
        console.log('❌ getSession() error:', result.error);
      })
      .catch(err => {
        console.log('🚨 getSession() exception:', err);
      });
  } else {
    console.log('❌ Supabase client non trouvé dans window');
  }
}

// 5. Monitor les requêtes réseau
function monitorNetworkRequests() {
  console.log('\n🌐 MONITORING RÉSEAU');
  
  const originalFetch = window.fetch;
  let requestCount = 0;
  const supabaseRequests = [];
  
  window.fetch = function(...args) {
    requestCount++;
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('supabase.co')) {
      supabaseRequests.push({
        id: requestCount,
        url,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[REQ ${requestCount}] Supabase:`, url);
      
      if (supabaseRequests.length > 20) {
        console.log('🚨 ALERTE: Plus de 20 requêtes Supabase!');
        console.log('Dernières requêtes:', supabaseRequests.slice(-5));
      }
    }
    
    return originalFetch.apply(this, args);
  };
}

// Exécuter tous les tests
checkStorageTokens();
checkWindowState();
testGetCurrentUser();
interceptAuthLogs();
monitorNetworkRequests();

console.log('\n✅ DIAGNOSTIC LANCÉ');
console.log('Changez d\'onglet maintenant et observez les logs...');