import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes, utilisation des valeurs par défaut');
}

// Créer une clé de stockage différente pour local vs production
const storageKey = window.location.hostname === 'localhost' 
  ? 'supabase.auth.token.local' 
  : 'supabase.auth.token.prod';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: storageKey, // Clé de stockage séparée
  },
});

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

  // Obtenir la session actuelle
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // VERSION BYPASS - Obtenir l'utilisateur actuel SANS accéder à la table profiles
  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('🚀 BYPASS MODE: getCurrentUser sans table profiles');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ BYPASS: Pas d\'utilisateur Supabase', error);
      return null;
    }

    console.log('✅ BYPASS: Utilisateur Supabase trouvé:', user.email);

    // BYPASS: Déterminer le rôle basé sur l'email uniquement
    // Pas d'accès à la table profiles pour éviter les problèmes RLS
    let role: 'employee' | 'manager' | 'admin' = 'employee';
    
    // Liste des emails admin (à adapter selon vos besoins)
    const adminEmails = ['jbgerberon@gmail.com'];
    const managerEmails: string[] = []; // Ajouter les emails des managers si nécessaire
    
    if (adminEmails.includes(user.email || '')) {
      role = 'admin';
    } else if (managerEmails.includes(user.email || '')) {
      role = 'manager';
    }

    console.log('✅ BYPASS: Rôle déterminé:', role);

    return {
      id: user.id,
      email: user.email!,
      role: role,
      team: undefined, // Pas d'équipe en mode bypass
    };
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