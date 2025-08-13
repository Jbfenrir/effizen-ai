// Debug temporaire pour résoudre le problème de chargement infini
import { authService } from './supabase';

export const debugAuth = async () => {
  console.log('🔍 Debug Auth - Début');
  
  try {
    console.log('📡 Tentative de récupération de la session...');
    const { session, error } = await authService.getSession();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération de session:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Session trouvée:', session.user.email);
    } else {
      console.log('ℹ️ Aucune session active');
    }
    
    return true;
  } catch (error) {
    console.error('🚨 Erreur critique:', error);
    return false;
  } finally {
    console.log('🔍 Debug Auth - Fin');
  }
};

// Auto-exécution pour debug
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  console.log('💡 Pour debugger, tapez: debugAuth() dans la console');
}