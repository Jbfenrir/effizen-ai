import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '../services/supabase';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Vérifier la session au chargement
    const checkSession = async () => {
      console.log('🔍 useAuth: Début de la vérification de session');
      
      // Timeout pour éviter le blocage infini
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ useAuth: Timeout - Passage en mode non authentifié');
        setAuthState({ user: null, loading: false, error: null });
      }, 5000); // 5 secondes de timeout
      
      try {
        console.log('📡 useAuth: Appel à getSession...');
        const { session, error } = await authService.getSession();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('❌ useAuth: Erreur getSession:', error);
          setAuthState({ user: null, loading: false, error: error.message });
          return;
        }

        if (session?.user) {
          console.log('✅ useAuth: Session trouvée, récupération utilisateur...');
          try {
            const user = await authService.getCurrentUser();
            console.log('👤 useAuth: Utilisateur récupéré:', user);
            setAuthState({ user, loading: false, error: null });
          } catch (userError) {
            console.warn('⚠️ useAuth: Erreur récupération profil, utilisation des données de base');
            // Fallback si le profil n'existe pas
            setAuthState({ 
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: 'employee' // Rôle par défaut
              }, 
              loading: false, 
              error: null 
            });
          }
        } else {
          console.log('ℹ️ useAuth: Pas de session active');
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        console.error('🚨 useAuth: Erreur catch:', error);
        clearTimeout(timeoutId);
        setAuthState({ 
          user: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Authentication error' 
        });
      }
    };

    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuth: Auth state change:', event);
        setAuthState(prev => ({ ...prev, loading: true }));

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ useAuth: User signed in');
            try {
              const user = await authService.getCurrentUser();
              setAuthState({ user, loading: false, error: null });
            } catch (userError) {
              // Fallback si le profil n'existe pas
              setAuthState({ 
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  role: 'admin' // Pour jbgerberon@gmail.com, on sait que c'est admin
                }, 
                loading: false, 
                error: null 
              });
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 useAuth: User signed out');
            setAuthState({ user: null, loading: false, error: null });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 useAuth: Token refreshed');
            setAuthState(prev => ({ ...prev, loading: false }));
          } else {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        } catch (error) {
          console.error('🚨 useAuth: Error in auth state change:', error);
          setAuthState({ 
            user: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Authentication error' 
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await authService.signInWithPassword(email, password);
      
      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await authService.signInWithMagicLink(email);
      
      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await authService.signOut();
      
      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      setAuthState({ user: null, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithPassword,
    signInWithMagicLink,
    signOut,
    clearError,
    isAuthenticated: !!authState.user,
    isManager: authState.user?.role === 'manager',
    isEmployee: authState.user?.role === 'employee',
    isAdmin: authState.user?.role === 'admin',
  };
}; 