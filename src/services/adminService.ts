import { supabase } from './supabase';
import type { 
  User, 
  Team, 
  UserCreateRequest, 
  TeamCreateRequest, 
  AdminMetrics,
  UserWithTeam,
  DetailedUserData,
  DailyEntry 
} from '../types';

/**
 * Service pour les fonctionnalités d'administration
 * Accès complet aux données non-anonymisées
 */
export class AdminService {
  
  /**
   * Récupère tous les utilisateurs avec leurs équipes
   */
  async getAllUsers(): Promise<{ data: UserWithTeam[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          teams!profiles_team_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrichir avec statistiques d'activité
      const enrichedUsers: UserWithTeam[] = await Promise.all(
        data.map(async (user) => {
          const { data: entries } = await supabase
            .from('daily_entries')
            .select('entry_date')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false })
            .limit(1);

          return {
            ...user,
            team_name: user.teams?.name,
            last_entry_date: entries?.[0]?.entry_date || null,
            entries_count: await this.getUserEntriesCount(user.id)
          };
        })
      );

      return { data: enrichedUsers, error: null };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des utilisateurs' 
      };
    }
  }

  /**
   * Récupère toutes les équipes avec le nombre de membres
   */
  async getAllTeams(): Promise<{ data: Team[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          profiles!profiles_team_fkey (count)
        `)
        .order('name');

      if (error) throw error;

      const teamsWithCounts = data.map(team => ({
        ...team,
        members_count: team.profiles?.length || 0
      }));

      return { data: teamsWithCounts, error: null };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des équipes' 
      };
    }
  }

  /**
   * Crée un nouveau compte utilisateur
   */
  async createUser(userData: UserCreateRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier que l'email n'existe pas déjà
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existing) {
        return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
      }

      // Créer le profil utilisateur
      const { error } = await supabase
        .from('profiles')
        .insert({
          email: userData.email,
          role: userData.role,
          team: userData.team_id || null, // Permettre team null
          is_active: true
        });

      if (error) throw error;

      // Envoyer invitation si demandé
      if (userData.send_invitation) {
        await this.sendUserInvitation(userData.email);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur' 
      };
    }
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'utilisateur' 
      };
    }
  }

  /**
   * Supprime (désactive) un utilisateur
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur' 
      };
    }
  }

  /**
   * Crée une nouvelle équipe
   */
  async createTeam(teamData: TeamCreateRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description || null,
          manager_id: teamData.manager_id || null,
          is_active: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'équipe' 
      };
    }
  }

  /**
   * Met à jour une équipe
   */
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'équipe' 
      };
    }
  }

  /**
   * Supprime (désactive) une équipe
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier qu'aucun utilisateur n'est assigné à cette équipe
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('team', teamId)
        .eq('is_active', true);

      if (users && users.length > 0) {
        return { 
          success: false, 
          error: 'Impossible de supprimer une équipe qui contient encore des utilisateurs actifs' 
        };
      }

      const { error } = await supabase
        .from('teams')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'équipe' 
      };
    }
  }

  /**
   * Récupère les détails complets d'un utilisateur (données non-anonymisées)
   */
  async getUserDetails(userId: string): Promise<DetailedUserData | null> {
    try {
      // Récupérer les infos utilisateur
      const { data: user } = await supabase
        .from('profiles')
        .select(`
          *,
          teams!profiles_team_fkey (
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (!user) return null;

      // Récupérer les entrées récentes (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: entries } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      // Calculer les tendances
      const wellbeingTrend = this.calculateWellbeingTrend(entries || []);
      const productivityTrend = this.calculateProductivityTrend(entries || []);

      return {
        user: {
          ...user,
          team_name: user.teams?.name,
          entries_count: entries?.length || 0
        },
        recent_entries: entries || [],
        wellbeing_trend: wellbeingTrend,
        productivity_trend: productivityTrend
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupère les métriques globales du système
   */
  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      // Compter les utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Compter les équipes
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Compter les entrées d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { count: entriesToday } = await supabase
        .from('daily_entries')
        .select('*', { count: 'exact', head: true })
        .eq('entry_date', today);

      // Déterminer la santé du système
      const systemHealth = this.calculateSystemHealth(activeUsers || 0, entriesToday || 0);

      return {
        total_users: totalUsers || 0,
        active_users: activeUsers || 0,
        total_teams: totalTeams || 0,
        entries_today: entriesToday || 0,
        system_health: systemHealth
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      return {
        total_users: 0,
        active_users: 0,
        total_teams: 0,
        entries_today: 0,
        system_health: 'critical'
      };
    }
  }

  // Méthodes utilitaires privées

  private async getUserEntriesCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  private async sendUserInvitation(email: string): Promise<void> {
    // Logique d'envoi d'invitation (à implémenter selon le système d'email)
    console.log(`Invitation envoyée à ${email}`);
  }

  private calculateWellbeingTrend(entries: DailyEntry[]): number[] {
    return entries.map(entry => {
      // Calculer le score de bien-être pour chaque entrée
      const sleepScore = Math.min((entry.sleep?.duration || 0) / 8 * 100, 100);
      const energyScore = entry.wellbeing?.energy || 50;
      const fatigueScore = ((5 - (entry.focus?.fatigue || 3)) / 4) * 100;
      return Math.round((sleepScore + energyScore + fatigueScore) / 3);
    }).slice(0, 7); // 7 derniers jours
  }

  private calculateProductivityTrend(entries: DailyEntry[]): number[] {
    return entries.map(entry => {
      const tasks = entry.tasks || [];
      if (tasks.length === 0) return 0;
      
      const highValueHours = tasks
        .filter((task: any) => task.isHighValue)
        .reduce((sum: number, task: any) => sum + task.duration, 0);
      const totalHours = tasks.reduce((sum: number, task: any) => sum + task.duration, 0);
      
      return totalHours > 0 ? Math.round((highValueHours / totalHours) * 100) : 0;
    }).slice(0, 7); // 7 derniers jours
  }

  private calculateSystemHealth(activeUsers: number, entriesToday: number): AdminMetrics['system_health'] {
    if (activeUsers === 0) return 'critical';
    
    const engagementRate = entriesToday / activeUsers;
    
    if (engagementRate >= 0.8) return 'excellent';
    if (engagementRate >= 0.6) return 'good';
    if (engagementRate >= 0.3) return 'warning';
    return 'critical';
  }
}

export const adminService = new AdminService();