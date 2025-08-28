import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Interface simple et claire
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// NOUVELLE APPROCHE: Authentification simplifiée et robuste
export const useAuthNew = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true, // Commence en loading
    error: null,
  });

  // Fonction pour déterminer le rôle basé sur l'email
  const determineRole = (email: string): 'employee' | 'manager' | 'admin' => {
    const adminEmails = ['jbgerberon@gmail.com'];
    const managerEmails: string[] = [];

    if (adminEmails.includes(email)) return 'admin';
    if (managerEmails.includes(email)) return 'manager';
    return 'employee';
  };

  // Fonction pour créer un utilisateur à partir d'une session Supabase
  const createUserFromSession = (session: any): AuthUser | null => {
    if (!session?.user?.email) return null;
    
    return {
      id: session.user.id,
      email: session.user.email,
      role: determineRole(session.user.email),
      team: undefined // En mode bypass, pas d'équipe
    };
  };

  // Vérification initiale de session - SIMPLE ET DIRECTE
  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      console.log('🔍 useAuthNew: Vérification session initiale');
      
      try {
        // Méthode directe: getSession immédiatement
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('❌ useAuthNew: Erreur getSession:', error.message);
          setAuthState({ user: null, loading: false, error: error.message });
          return;
        }

        if (session?.user) {
          const user = createUserFromSession(session);
          if (user) {
            console.log('✅ useAuthNew: Utilisateur connecté:', user.email, user.role);
            setAuthState({ user, loading: false, error: null });
          } else {
            console.warn('⚠️ useAuthNew: Impossible de créer l\'utilisateur');
            setAuthState({ user: null, loading: false, error: 'Failed to create user' });
          }
        } else {
          console.log('ℹ️ useAuthNew: Pas de session active');
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('🚨 useAuthNew: Erreur catch:', error);
        setAuthState({ 
          user: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Authentication error'
        });
      }
    };

    checkInitialSession();

    return () => {
      isMounted = false;
    };
  }, []); // Exécution unique au montage

  // Écoute des changements d'auth - RENFORCÉ POUR REDIRECTION
  useEffect(() => {
    console.log('👂 useAuthNew: Mise en place de l\'écoute auth');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuthNew: Auth event:', event, 'Session:', !!session);
        
        // Gérer tous les événements de connexion
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          const user = createUserFromSession(session);
          if (user) {
            console.log('✅ useAuthNew: Connexion confirmée:', user.email, '- Événement:', event);
            setAuthState({ user, loading: false, error: null });
            
            // NOUVEAU: Force une vérification après un délai pour s'assurer que l'état est propagé
            setTimeout(() => {
              console.log('🔄 useAuthNew: Vérification post-connexion');
              setAuthState(prev => ({ ...prev, user, loading: false }));
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 useAuthNew: Déconnexion détectée');
          setAuthState({ user: null, loading: false, error: null });
        } else {
          console.log('ℹ️ useAuthNew: Événement ignoré:', event);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Gestion du changement de visibilité - SIMPLE
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Si l'onglet redevient visible et qu'on n'a pas d'utilisateur, 
      // on ne fait rien - on laisse l'état actuel
      if (!document.hidden) {
        console.log('👁️ useAuthNew: Onglet redevenu visible');
        // Pas de re-vérification automatique pour éviter les boucles
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fonctions d'authentification - DIRECTES
  const signInWithPassword = async (email: string, password: string) => {
    console.log('🔑 useAuthNew: Tentative de connexion pour:', email);
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('❌ useAuthNew: Erreur connexion:', error.message);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      console.log('✅ useAuthNew: Connexion Supabase réussie');
      
      // NOUVEAU: Vérification immédiate de la session pour forcer l'état
      if (data.session?.user) {
        const user = createUserFromSession(data.session);
        if (user) {
          console.log('🚀 useAuthNew: Force mise à jour état utilisateur:', user.email);
          setAuthState({ user, loading: false, error: null });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('🚨 useAuthNew: Erreur catch signInWithPassword:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Déterminer l'URL de redirection selon l'environnement
      const redirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.origin}/auth/callback`
        : 'https://effizen-ai-prod.vercel.app/auth/callback';
        
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    console.log('🔑 useAuthNew: Demande de réinitialisation pour:', email);
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Déterminer l'URL de redirection selon l'environnement
      const redirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.origin}/reset-password`
        : 'https://effizen-ai-prod.vercel.app/reset-password';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('❌ useAuthNew: Erreur réinitialisation:', error.message);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      console.log('✅ useAuthNew: Email de réinitialisation envoyé');
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      console.error('🚨 useAuthNew: Erreur catch resetPassword:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Utiliser scope: 'local' pour éviter l'erreur 403 en production
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      // L'état sera mis à jour par onAuthStateChange
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
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
    resetPasswordForEmail,
    signOut,
    clearError,
    // Propriétés dérivées
    isAuthenticated: !!authState.user,
    isManager: authState.user?.role === 'manager',
    isEmployee: authState.user?.role === 'employee',
    isAdmin: authState.user?.role === 'admin',
  };
};

export default useAuthNew;