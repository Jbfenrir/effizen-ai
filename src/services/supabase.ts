import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes, utilisation des valeurs par défaut');
}

// UNIQUE clé de stockage sécurisée
const getStorageKey = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `supabase.auth.token.local.${port || '3000'}`;
  }
  return `supabase.auth.token.${hostname.replace(/\./g, '_')}`;
};

// SINGLETON GLOBAL - Une seule instance pour toute l'app
const GLOBAL_SUPABASE_KEY = '__effizen_supabase_client_unified__';
const GLOBAL_ADMIN_KEY = '__effizen_supabase_admin_unified__';

const getSupabaseClient = () => {
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_SUPABASE_KEY]) {
    return (window as any)[GLOBAL_SUPABASE_KEY];
  }
  
  console.log('🔧 Création client Supabase UNIQUE');
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: getStorageKey(),
      flowType: 'pkce',
      storage: {
        getItem: (key: string) => {
          const item = localStorage.getItem(key);
          if (item && item !== 'undefined' && item !== 'null') {
            try {
              JSON.parse(item);
              return item;
            } catch {
              console.warn(`⚠️ Données corrompues ${key}, nettoyage...`);
              localStorage.removeItem(key);
              return null;
            }
          }
          return null;
        },
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key),
      },
    },
  });
  
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_SUPABASE_KEY] = client;
  }
  
  return client;
};

const getSupabaseAdminClient = () => {
  if (!supabaseServiceKey) return null;
  
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_ADMIN_KEY]) {
    return (window as any)[GLOBAL_ADMIN_KEY];
  }
  
  console.log('🔧 Création client Supabase Admin UNIQUE');
  const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_ADMIN_KEY] = adminClient;
  }
  
  return adminClient;
};

// CLIENTS UNIFIÉS - Une seule source de vérité
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

// Types
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
}

// Service auth unifié
export const authService = {
  async signInWithPassword(email: string, password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  async signInWithMagicLink(email: string): Promise<{ error: any }> {
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
    return { error };
  },

  async resetPasswordForEmail(email: string): Promise<{ error: any }> {
    // Déterminer l'URL de redirection selon l'environnement
    const redirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `${window.location.origin}/auth/callback?type=recovery`
      : 'https://effizen-ai-prod.vercel.app/auth/callback?type=recovery';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  },

  async signUpWithPassword(email: string, password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  async signOut(): Promise<{ error: any }> {
    // Utiliser scope: 'local' pour éviter l'erreur 403 en production
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { error };
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('⚠️ authService.getSession:', error.message);
        return { session: null, error };
      }
      return { session, error: null };
    } catch (error) {
      console.error('🚨 authService.getSession catch:', error);
      return { 
        session: null, 
        error: { message: 'Failed to get session', originalError: error }
      };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('🚀 SERVICE UNIFIÉ: getCurrentUser');
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('❌ SERVICE UNIFIÉ: Erreur session', sessionError);
        return null;
      }
      
      if (!session?.user) {
        console.log('❌ SERVICE UNIFIÉ: Pas de session');
        return null;
      }
      
      console.log('✅ SERVICE UNIFIÉ: Session trouvée:', session.user.email);
      
      let role: 'employee' | 'manager' | 'admin' = 'employee';
      const adminEmails = ['jbgerberon@gmail.com'];
      const managerEmails: string[] = [];
      
      if (adminEmails.includes(session.user.email || '')) {
        role = 'admin';
      } else if (managerEmails.includes(session.user.email || '')) {
        role = 'manager';
      }

      console.log('✅ SERVICE UNIFIÉ: Rôle déterminé:', role);

      return {
        id: session.user.id,
        email: session.user.email!,
        role: role,
        team: undefined,
      };
    } catch (error) {
      console.error('🚨 SERVICE UNIFIÉ: Erreur getCurrentUser:', error);
      return null;
    }
  },
};

export default supabase;
