import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes, utilisation des valeurs par défaut');
}

// Créer une clé de stockage unique basée sur le hostname ET le port
// Cela évite les conflits entre différentes instances
const getStorageKey = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Pour localhost, inclure le port dans la clé
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `supabase.auth.token.local.${port || '3000'}`;
  }
  
  // Pour production, utiliser le hostname complet
  return `supabase.auth.token.${hostname.replace(/\./g, '_')}`;
};

const storageKey = getStorageKey();

// Nettoyer les anciennes clés de stockage qui pourraient causer des conflits
const cleanupOldStorageKeys = () => {
  const keysToClean = [
    'supabase.auth.token',
    'sb-qzvrkqmwzdaffpknuozl-auth-token', // Ancienne clé par défaut Supabase
  ];
  
  keysToClean.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🧹 Nettoyage ancienne clé: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

// Nettoyer au démarrage
cleanupOldStorageKeys();

console.log(`🔑 Storage key utilisée: ${storageKey}`);

// VRAI SINGLETON GLOBAL attaché à window pour éviter les instances multiples avec HMR
const GLOBAL_SUPABASE_KEY = '__effizen_supabase_client__';
const GLOBAL_ADMIN_KEY = '__effizen_supabase_admin__';

// Fonction pour obtenir ou créer l'instance GLOBALE du client Supabase
const getSupabaseClient = () => {
  // Vérifier si une instance existe déjà dans window (survit au HMR)
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_SUPABASE_KEY]) {
    console.log('♻️ Réutilisation du client Supabase global existant (anti-HMR)');
    return (window as any)[GLOBAL_SUPABASE_KEY];
  }
  
  console.log('🔧 Création du client Supabase GLOBAL (singleton)');
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: storageKey, // Clé de stockage unique par environnement
      storage: {
        getItem: (key: string) => {
          const item = localStorage.getItem(key);
          // Protection contre les données corrompues
          if (item && item !== 'undefined' && item !== 'null') {
            try {
              JSON.parse(item);
              return item;
            } catch {
              console.warn(`⚠️ Données corrompues pour ${key}, nettoyage...`);
              localStorage.removeItem(key);
              return null;
            }
          }
          return null;
        },
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key);
        },
      },
      // Optimisations pour réduire les conflits
      flowType: 'pkce',
    },
  });
  
  // Stocker dans window pour survivre au HMR de Vite
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_SUPABASE_KEY] = client;
  }
  
  return client;
};

// Fonction pour obtenir ou créer l'instance admin GLOBALE
const getSupabaseAdminClient = () => {
  if (!supabaseServiceKey) return null;
  
  // Vérifier si une instance admin existe déjà dans window
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_ADMIN_KEY]) {
    return (window as any)[GLOBAL_ADMIN_KEY];
  }
  
  console.log('🔧 Création du client Supabase Admin GLOBAL (singleton)');
  const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Stocker dans window
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_ADMIN_KEY] = adminClient;
  }
  
  return adminClient;
};

// Client normal pour auth utilisateur (anon key) - Utilise le singleton GLOBAL
export const supabase = getSupabaseClient();

// Client admin pour opérations administratives (service key) - Utilise le singleton GLOBAL
export const supabaseAdmin = getSupabaseAdminClient();

// Types pour l'authentification
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
}

// Service d'authentification avec BYPASS de la table profiles
export const authService = {
  // Connexion avec email/mot de passe
  async signInWithPassword(email: string, password: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  // Connexion avec magic link (gardé pour compatibilité)
  async signInWithMagicLink(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  // Inscription avec email/mot de passe
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

  // Déconnexion
  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obtenir la session actuelle avec gestion d'erreur améliorée
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('⚠️ authService.getSession: Erreur Supabase:', error.message);
        return { session: null, error };
      }
      
      return { session, error: null };
    } catch (error) {
      console.error('🚨 authService.getSession: Erreur catch:', error);
      return { 
        session: null, 
        error: { message: 'Failed to get session', originalError: error }
      };
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // VERSION BYPASS - Obtenir l'utilisateur actuel SANS accéder à la table profiles
  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('🚀 BYPASS MODE: getCurrentUser sans table profiles');
    
    try {
      // D'abord vérifier si on a une session existante
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('❌ BYPASS: Erreur récupération session', sessionError);
        return null;
      }
      
      if (!session?.user) {
        console.log('❌ BYPASS: Pas de session active');
        return null;
      }
      
      console.log('✅ BYPASS: Session trouvée, utilisateur:', session.user.email);
      
      // BYPASS: Déterminer le rôle basé sur l'email uniquement
      let role: 'employee' | 'manager' | 'admin' = 'employee';
      
      // Liste des emails admin
      const adminEmails = ['jbgerberon@gmail.com'];
      const managerEmails: string[] = [];
      
      if (adminEmails.includes(session.user.email || '')) {
        role = 'admin';
      } else if (managerEmails.includes(session.user.email || '')) {
        role = 'manager';
      }

      console.log('✅ BYPASS: Rôle déterminé:', role);

      return {
        id: session.user.id,
        email: session.user.email!,
        role: role,
        team: undefined,
      };
    } catch (error) {
      console.error('🚨 BYPASS: Erreur dans getCurrentUser:', error);
      return null;
    }
  },
};

// Service pour les entrées quotidiennes
export const entriesService = {
  // Créer une nouvelle entrée
  async createEntry(entry: Omit<Database['public']['Tables']['daily_entries']['Insert'], 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('daily_entries')
      .insert({
        ...entry,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  },

  // Mettre à jour une entrée existante
  async updateEntry(id: string, updates: Partial<Database['public']['Tables']['daily_entries']['Update']>) {
    const { data, error } = await supabase
      .from('daily_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Récupérer les entrées d'un utilisateur
  async getUserEntries(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Récupérer les entrées d'une équipe (pour les managers)
  async getTeamEntries(team: string, limit = 100) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select(`
        *,
        profiles!inner(team)
      `)
      .eq('profiles.team', team)
      .order('entry_date', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Récupérer les statistiques agrégées d'une équipe
  async getTeamStats(team: string, period: 'week' | 'month' | 'quarter' = 'week') {
    const { data, error } = await supabase
      .rpc('get_team_stats', {
        team_name: team,
        period_type: period,
      });

    return { data, error };
  },
};

// Service pour les profils utilisateur (gardé pour compatibilité mais éviter de l'utiliser)
export const profilesService = {
  // Créer ou mettre à jour un profil
  async upsertProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    console.warn('⚠️ BYPASS MODE: upsertProfile appelé mais ignoré');
    return { data: null, error: null };
  },

  // Récupérer un profil
  async getProfile(userId: string) {
    console.warn('⚠️ BYPASS MODE: getProfile appelé mais retourne null');
    return { data: null, error: null };
  },
};

export default supabase;