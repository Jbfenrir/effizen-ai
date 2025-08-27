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
let visibilityCheckTimeout: NodeJS.Timeout | null = null;

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
      
      // Protection contre les blocages permanents - réduite à 2 secondes
      const now = Date.now();
      if (globalCheckInProgress && (now - globalLastCheckTime > 2000)) {
        console.warn('🚨 useAuth: Flag globalCheckInProgress bloqué depuis >2s, forçage reset');
        globalCheckInProgress = false;
      }
      
      // Éviter les vérifications simultanées avec délai réduit
      if (globalCheckInProgress || (now - globalLastCheckTime < 300)) {
        console.log('⏸️ useAuth: Vérification déjà en cours, ignorée');
        
        // Timeout de secours réduit
        setTimeout(() => {
          if (isSubscribed && globalCheckInProgress) {
            console.warn('🚨 useAuth: Timeout de secours - forçage état non-authentifié');
            globalCheckInProgress = false;
            setAuthState({ user: null, loading: false, error: null });
          }
        }, 1500);
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
          setAuthState({ user: null, loading: false, error: typeof error === 'string' ? error : 'Session error' });
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
            
            if (user) {
              console.log('👤 useAuth: Utilisateur récupéré:', user.email, '- Rôle:', user.role);
              // Mettre en cache la session
              sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user, timestamp: Date.now() }));
              setAuthState({ user, loading: false, error: null });
            } else {
              console.warn('⚠️ useAuth: getCurrentUser a retourné null');
              setAuthState({ user: null, loading: false, error: 'Failed to load user data' });
            }
          } catch (userError) {
            if (!isSubscribed) {
              globalCheckInProgress = false;
              return;
            }
            
            console.warn('⚠️ useAuth: Erreur récupération utilisateur:', userError);
            // Fallback avec les données de session directement
            const isAdminEmail = session.user.email === 'jbgerberon@gmail.com';
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email!,
              role: isAdminEmail ? 'admin' : 'employee' as 'admin' | 'employee'
            };
            
            console.log('🚫 useAuth: Utilisation du fallback user:', fallbackUser);
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

    // NOUVEAU: Vérifier d'abord le localStorage pour une session existante
    const quickSessionCheck = () => {
      if (!isSubscribed) return;
      
      const hostname = window.location.hostname;
      const port = window.location.port;
      const storageKey = (hostname === 'localhost' || hostname === '127.0.0.1')
        ? `supabase.auth.token.local.${port || '3000'}`
        : `supabase.auth.token.${hostname.replace(/\./g, '_')}`;
      
      const storedSession = localStorage.getItem(storageKey);
      
      if (storedSession && storedSession !== 'null' && storedSession !== 'undefined') {
        try {
          const sessionData = JSON.parse(storedSession);
          
          // Vérifier si le token n'est pas expiré
          if (sessionData.expires_at && sessionData.expires_at * 1000 > Date.now()) {
            console.log('⚡ useAuth: Session valide détectée au démarrage, chargement utilisateur...');
            
            // Démarrer la récupération utilisateur en arrière-plan
            checkSession();
            return;
          } else {
            console.log('⏰ useAuth: Session expirée détectée au démarrage');
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem('effizen_auth_cache');
          }
        } catch (error) {
          console.warn('⚠️ useAuth: Erreur parsing session au démarrage:', error);
          localStorage.removeItem(storageKey);
        }
      }
      
      // Si pas de session valide, procéder normalement
      console.log('ℹ️ useAuth: Pas de session existante, vérification classique...');
      if (!document.hidden) {
        checkSession();
      } else {
        console.log('😴 useAuth: Onglet invisible au démarrage, état non-authentifié');
        setAuthState({ user: null, loading: false, error: null });
      }
    };
    
    quickSessionCheck();
    
    return () => {
      isSubscribed = false;
    };
  }, []); // Fin du premier useEffect

  // Gestionnaire pour les changements de visibilité de l'onglet
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Nettoyer tout timeout existant
      if (visibilityCheckTimeout) {
        clearTimeout(visibilityCheckTimeout);
        visibilityCheckTimeout = null;
      }
      
      if (!document.hidden) {
        console.log('👁️ useAuth: Onglet redevenu visible');
        
        // Forcer le reset du flag si bloqué
        if (globalCheckInProgress) {
          console.log('✨ useAuth: Reset du flag globalCheckInProgress au retour d\'onglet');
          globalCheckInProgress = false;
        }
        
        // Vérifier d'abord le localStorage pour la session existante
        const storageKey = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? `supabase.auth.token.local.${window.location.port || '3000'}`
          : `supabase.auth.token.${window.location.hostname.replace(/\./g, '_')}`;
        
        const storedSession = localStorage.getItem(storageKey);
        
        if (storedSession && storedSession !== 'null' && storedSession !== 'undefined') {
          try {
            const sessionData = JSON.parse(storedSession);
            
            // Vérifier si le token n'est pas expiré
            if (sessionData.expires_at && sessionData.expires_at * 1000 > Date.now()) {
              console.log('✅ useAuth: Session valide trouvée dans localStorage au retour d\'onglet');
              
              // Vérifier le cache pour les données utilisateur
              const cachedUser = sessionStorage.getItem('effizen_auth_cache');
              if (cachedUser) {
                try {
                  const cached = JSON.parse(cachedUser);
                  if (cached.user && cached.timestamp && Date.now() - cached.timestamp < 10 * 60 * 1000) {
                    console.log('📦 useAuth: Réutilisation du cache utilisateur');
                    setAuthState({ user: cached.user, loading: false, error: null });
                    return;
                  }
                } catch {
                  console.warn('⚠️ useAuth: Cache utilisateur invalide');
                }
              }
              
              // Si pas de cache valide, récupérer l'utilisateur
              // Mais avec un délai pour éviter les appels simultanés
              visibilityCheckTimeout = setTimeout(async () => {
                if (!globalCheckInProgress) {
                  try {
                    globalCheckInProgress = true;
                    const user = await authService.getCurrentUser();
                    if (user) {
                      console.log('👤 useAuth: Utilisateur récupéré au retour d\'onglet');
                      sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user, timestamp: Date.now() }));
                      setAuthState({ user, loading: false, error: null });
                    }
                  } catch (error) {
                    console.error('🚨 useAuth: Erreur récupération utilisateur:', error);
                  } finally {
                    globalCheckInProgress = false;
                  }
                }
              }, 100); // Délai de 100ms pour stabiliser
            } else {
              console.log('⏰ useAuth: Session expirée, besoin de réauthentification');
              setAuthState({ user: null, loading: false, error: null });
            }
          } catch (error) {
            console.error('🚨 useAuth: Erreur parsing session localStorage:', error);
            setAuthState({ user: null, loading: false, error: null });
          }
        } else {
          console.log('ℹ️ useAuth: Pas de session dans localStorage au retour d\'onglet');
          setAuthState({ user: null, loading: false, error: null });
        }
      } else {
        console.log('😴 useAuth: Onglet devenu invisible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityCheckTimeout) {
        clearTimeout(visibilityCheckTimeout);
      }
    };
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
            // Gérer explicitement la session initiale
            if (session?.user) {
              try {
                const user = await authService.getCurrentUser();
                if (isSubscribed) {
                  console.log('✅ useAuth: Initial session user loaded:', user);
                  sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user, timestamp: Date.now() }));
                  setAuthState({ user, loading: false, error: null });
                }
              } catch (userError) {
                if (!isSubscribed) return;
                console.warn('⚠️ useAuth: Initial session - using fallback for profile');
                // Fallback si le profil n'existe pas
                const isAdminEmail = session.user.email === 'jbgerberon@gmail.com';
                const fallbackUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  role: isAdminEmail ? 'admin' : 'employee' as 'admin' | 'employee'
                };
                sessionStorage.setItem('effizen_auth_cache', JSON.stringify({ user: fallbackUser, timestamp: Date.now() }));
                setAuthState({ 
                  user: fallbackUser, 
                  loading: false, 
                  error: null 
                });
              }
            } else {
              // Pas de session initiale
              if (isSubscribed) {
                console.log('ℹ️ useAuth: No initial session');
                setAuthState({ user: null, loading: false, error: null });
              }
            }
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