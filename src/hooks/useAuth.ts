import { useState, useEffect } from 'react';
// TEMPORAIRE: Utilisation du service bypass pour contourner les problèmes RLS
import { authService, type AuthUser } from '../services/supabase-bypass';
// import { authService, type AuthUser } from '../services/supabase';

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
    let isSubscribed = true;
    let sessionCheckCount = 0;
    const maxSessionChecks = 3; // Limite pour éviter les boucles infinies
    
    // Vérifier la session au chargement
    const checkSession = async () => {
      if (!isSubscribed) return;
      
      sessionCheckCount++;
      console.log(`🔍 useAuth: Vérification de session #${sessionCheckCount}/${maxSessionChecks}`);
      
      // Protection contre les boucles infinies
      if (sessionCheckCount > maxSessionChecks) {
        console.error('🚨 useAuth: Trop de tentatives de vérification de session');
        setAuthState({ user: null, loading: false, error: 'Session check limit exceeded' });
        return;
      }
      
      try {
        console.log('📡 useAuth: Appel à getSession...');
        const { session, error } = await authService.getSession();
        
        if (!isSubscribed) return;
        
        if (error) {
          console.error('❌ useAuth: Erreur getSession:', error);
          setAuthState({ user: null, loading: false, error: error.message });
          return;
        }

        if (session?.user) {
          console.log('✅ useAuth: Session trouvée, récupération utilisateur...');
          try {
            const user = await authService.getCurrentUser();
            if (!isSubscribed) return;
            
            console.log('👤 useAuth: Utilisateur récupéré:', user);
            setAuthState({ user, loading: false, error: null });
          } catch (userError) {
            if (!isSubscribed) return;
            
            console.warn('⚠️ useAuth: Erreur récupération profil, utilisation des données de base');
            // Fallback si le profil n'existe pas
            const isAdminEmail = session.user.email === 'jbgerberon@gmail.com';
            setAuthState({ 
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: isAdminEmail ? 'admin' : 'employee'
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
        if (!isSubscribed) return;
        
        console.error('🚨 useAuth: Erreur catch:', error);
        setAuthState({ 
          user: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Authentication error' 
        });
      }
    };

    checkSession();
    
    return () => {
      isSubscribed = false;
    };
  }, []); // Fin du premier useEffect

  // Second useEffect pour écouter les changements d'authentification
  useEffect(() => {
    let isSubscribed = true;
    let lastEventTime = 0;
    const eventDebounceTime = 1000; // 1 seconde entre événements identiques
    
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;
        
        // Debounce pour éviter les événements répétés
        const now = Date.now();
        if (now - lastEventTime < eventDebounceTime && event !== 'SIGNED_OUT') {
          console.log('🔕 useAuth: Événement ignoré (trop rapide):', event);
          return;
        }
        lastEventTime = now;
        
        console.log('🔔 useAuth: Auth state change:', event);
        
        // Ne pas mettre loading à true pour TOKEN_REFRESHED
        if (event !== 'TOKEN_REFRESHED') {
          setAuthState(prev => ({ ...prev, loading: true }));
        }

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ useAuth: User signed in');
            // Ne pas forcer de redirection ici, laisser AppRouter gérer
            try {
              const user = await authService.getCurrentUser();
              if (isSubscribed) {
                setAuthState({ user, loading: false, error: null });
              }
            } catch (userError) {
              if (!isSubscribed) return;
              
              // Fallback si le profil n'existe pas
              const isAdminEmail = session.user.email === 'jbgerberon@gmail.com';
              setAuthState({ 
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  role: isAdminEmail ? 'admin' : 'employee'
                }, 
                loading: false, 
                error: null 
              });
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 useAuth: User signed out');
            if (isSubscribed) {
              setAuthState({ user: null, loading: false, error: null });
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 useAuth: Token refreshed');
            // Ne rien faire, garder l'état actuel
          } else if (event === 'INITIAL_SESSION') {
            console.log('🎯 useAuth: Initial session detected');
            // Session initiale déjà gérée par checkSession
          } else {
            if (isSubscribed) {
              setAuthState(prev => ({ ...prev, loading: false }));
            }
          }
        } catch (error) {
          if (!isSubscribed) return;
          
          console.error('🚨 useAuth: Error in auth state change:', error);
          setAuthState({ 
            user: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Authentication error' 
          });
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
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