import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzvrkcmwzdaffpknuozl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnJrY213emRhZmZwa251b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTM3OTgsImV4cCI6MjA2Nzc4OTc5OH0.GJXkGBy047Dx8cS-uOIQJSEJa5VHQRfdwWb-FkQVbIQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes, utilisation des valeurs par défaut');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types pour l'authentification
export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  team?: string;
}

// Service d'authentification
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

  // Obtenir l'utilisateur actuel
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Récupérer les métadonnées utilisateur depuis la table profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, team')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'employee',
      team: profile?.team,
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

// Service pour les profils utilisateur
export const profilesService = {
  // Créer ou mettre à jour un profil
  async upsertProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    return { data, error };
  },

  // Récupérer un profil
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },
};

export default supabase; 