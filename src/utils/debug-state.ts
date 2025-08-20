// Outil de diagnostic pour comprendre l'état exact de l'application
// À utiliser dans la console : window.debugState()

export const initDebugState = () => {
  (window as any).debugState = () => {
    const authState = localStorage.getItem('supabase.auth.token.local.3000') || 
                      localStorage.getItem('supabase.auth.token.local.3001');
    const cache = sessionStorage.getItem('effizen_auth_cache');
    const lastRedirect = sessionStorage.getItem('lastRedirect');
    
    console.log('=== ÉTAT ACTUEL DE L\'APPLICATION ===');
    console.log('1. Token auth présent:', !!authState);
    console.log('2. Cache session:', cache ? JSON.parse(cache) : 'VIDE');
    console.log('3. Dernière redirection:', lastRedirect);
    console.log('4. URL actuelle:', window.location.pathname);
    console.log('5. Flags globaux:', {
      globalCheckInProgress: (window as any).globalCheckInProgress,
      globalLastCheckTime: (window as any).globalLastCheckTime
    });
    
    // Forcer le déblocage
    console.log('\n=== TENTATIVE DE DÉBLOCAGE ===');
    (window as any).globalCheckInProgress = false;
    sessionStorage.setItem('effizen_auth_cache', JSON.stringify({
      user: null,
      timestamp: Date.now()
    }));
    console.log('✅ Flags réinitialisés');
    console.log('➡️ Rafraîchissez la page maintenant (F5)');
  };

  // Exposer aussi une fonction pour forcer la déconnexion complète
  (window as any).forceLogout = () => {
    console.log('🔄 Déconnexion forcée...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  console.log('🔧 Debug tools loaded. Use: debugState() or forceLogout()');
};