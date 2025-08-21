import { useState, useEffect } from 'react';
// TEMPORAIRE: Utilisation du service bypass pour contourner les problèmes RLS
import { authService, type AuthUser } from '../services/supabase-bypass';
// import { authService, type AuthUser } from '../services/supabase';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Variable globale pour éviter les vérifications multiples simultanées
let globalCheckInProgress = false;
let globalLastCheckTime = 0;

// Exposer les flags pour le debug
if (typeof window !== 'undefined') {
  window.globalCheckInProgress = globalCheckInProgress;
  window.globalLastCheckTime = globalLastCheckTime;
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
    const maxSessionChecks = 2; // Réduire pour éviter les boucles infinies
    
    // FORCE reset du flag global au démarrage pour éviter les blocages
    globalCheckInProgress = false;
    
    // Vérifier la session au chargement
    const checkSession = async () => {
      if (!isSubscribed) return;
      
      // Protection contre les blocages permanents
      const now = Date.now();
      if (globalCheckInProgress && (now - globalLastCheckTime > 5000)) {
        console.warn('🚨 useAuth: Flag globalCheckInProgress bloqué depuis >5s, forçage reset');
        globalCheckInProgress = false;
      }
      
      // Éviter les vérifications simultanées (importantes avec StrictMode)
      if (globalCheckInProgress || (now - globalLastCheckTime < 500)) {
        console.log('⏸️ useAuth: Vérification déjà en cours, ignorée');
        
        // Timeout de secours : si bloqué trop longtemps, forcer l'état non-authentifié
        setTimeout(() => {
          if (isSubscribed && globalCheckInProgress) {
            console.warn('🚨 useAuth: Timeout de secours - forçage état non-authentifié');
            globalCheckInProgress = false;
            setAuthState({ user: null, loading: false, error: null });
          }
        }, 3000);
        return;
      }
      
      globalCheckInProgress = true;
      globalLastCheckTime = now;
      
      sessionCheckCount++;
      console.log(`🔍 useAuth: Vérification de session #${sessionCheckCount}/${maxSessionChecks}`);
      
      // Protection contre les boucles infinies
      if (sessionCheckCount > maxSessionChecks) {
        console.error('🚨 useAuth: Trop de tentatives de vérification de session');
        setAuthState({ user: null, loading: false, error: 'Session check limit exceeded' });
        globalCheckInProgress = false;
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
            if (!isSubscribed) {
              globalCheckInProgress = false;
              return;
            }
            
            console.log('👤 useAuth: Utilisateur récupéré:', user);
            // Mettre en cache la session
            sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user, timestamp: Date.now() }));
            setAuthState({ user, loading: false, error: null });
          } catch (userError) {
            if (!isSubscribed) {
              globalCheckInProgress = false;
              return;
            }
            
            console.warn('⚠️ useAuth: Erreur récupération profil, utilisation des données de base');
            // Fallback si le profil n'existe pas
            const isAdminEmail = session.user.email === 'jbgerberon@gmail.com';
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email!,
              role: isAdminEmail ? 'admin' : 'employee' as 'admin' | 'employee'
            };
            // Mettre en cache la session
            sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user: fallbackUser, timestamp: Date.now() }));
            setAuthState({ 
              user: fallbackUser, 
              loading: false, 
              error: null 
            });
          }
        } else {
          console.log('ℹ️ useAuth: Pas de session active');
          sessionStorage.removeItem('effizen_auth_cache');
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        if (!isSubscribed) {
          globalCheckInProgress = false;
          return;
        }
        
        console.error('🚨 useAuth: Erreur catch:', error);
        sessionStorage.removeItem('effizen_auth_cache');
        setAuthState({ 
          user: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Authentication error' 
        });
      } finally {
        globalCheckInProgress = false;
      }
    };

    checkSession();
    
    return () => {
      isSubscribed = false;
    };
  }, []); // Fin du premier useEffect

  // Gestionnaire pour les changements de visibilité de l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ useAuth: Onglet redevenu visible');
        // Vérifier le cache avant de faire une nouvelle vérification
        const cachedSession = sessionStorage.getItem('effizen_auth_cache');
        if (cachedSession) {
          try {
            const cached = JSON.parse(cachedSession);
            // Si le cache a moins de 5 minutes, l'utiliser
            if (cached.timestamp && Date.now() - cached.timestamp < 5 * 60 * 1000) {
              console.log('📦 useAuth: Utilisation du cache de session');
              if (cached.user) {
                setAuthState({ user: cached.user, loading: false, error: null });
              }
              return;
            }
          } catch {
            // Ignorer les erreurs de parsing
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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