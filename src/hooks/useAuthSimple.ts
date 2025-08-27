// Version SIMPLIFIÉE de useAuth pour tester
import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '../services/supabase';

export const useAuthSimple = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      console.log('🚀 useAuthSimple: Initialisation');
      
      try {
        // Vérifier session existante
        const { session } = await authService.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('✅ Session trouvée:', session.user.email);
          const mockUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.email === 'jbgerberon@gmail.com' ? 'admin' : 'employee'
          };
          setUser(mockUser);
        } else {
          console.log('❌ Pas de session');
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        // TOUJOURS passer loading à false
        if (mounted) {
          console.log('✅ Loading terminé');
          setLoading(false);
        }
      }
    };

    // Timeout de sécurité - FORCER loading=false après 3 secondes
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⏱️ Timeout - Forçage loading=false');
        setLoading(false);
      }
    }, 3000);

    init();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signInWithPassword(email, password);
      if (error) throw error;
      
      // Rafraîchir après connexion
      window.location.reload();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur connexion');
      setLoading(false);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    await authService.signOut();
    window.location.reload();
  };

  return {
    user,
    loading,
    error,
    signInWithPassword,
    signInWithMagicLink: signInWithPassword, // Alias temporaire
    signOut,
    clearError: () => setError(null),
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee'
  };
};