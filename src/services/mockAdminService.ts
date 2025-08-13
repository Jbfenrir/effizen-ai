/**
 * Service admin en mode MOCK pour le développement
 * Utilise localStorage au lieu de Supabase
 */
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

// Clés de stockage
const USERS_STORAGE_KEY = 'effizen_users';
const TEAMS_STORAGE_KEY = 'effizen_teams';

// Données mock initiales
const INITIAL_USERS: UserWithTeam[] = [
  {
    id: '1',
    email: 'admin@effizen.ai',
    role: 'admin',
    team: '',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
    team_name: undefined,
    last_entry_date: undefined,
    entries_count: 0
  }
];

const INITIAL_TEAMS: Team[] = [];

/**
 * Service Mock pour l'administration en développement
 */
export class MockAdminService {
  
  private getUsers(): UserWithTeam[] {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  }

  private saveUsers(users: UserWithTeam[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private getTeams(): Team[] {
    const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    return JSON.parse(stored);
  }

  private saveTeams(teams: Team[]): void {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }

  private generateId(): string {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Récupère tous les utilisateurs avec leurs équipes
   */
  async getAllUsers(): Promise<{ data: UserWithTeam[]; error: string | null }> {
    try {
      const users = this.getUsers();
      const teams = this.getTeams();

      // Enrichir avec les noms d'équipe
      const enrichedUsers = users.map(user => ({
        ...user,
        team_name: user.team ? teams.find(t => t.id === user.team)?.name : undefined,
        entries_count: this.getUserEntriesCount(user.id)
      }));

      return { data: enrichedUsers, error: null };
    } catch (error) {
      return { 
        data: [], 
        error: 'Erreur lors de la récupération des utilisateurs' 
      };
    }
  }

  /**
   * Récupère toutes les équipes avec le nombre de membres
   */
  async getAllTeams(): Promise<{ data: Team[]; error: string | null }> {
    try {
      const teams = this.getTeams();
      const users = this.getUsers();

      // Enrichir avec le nombre de membres
      const teamsWithCounts = teams.map(team => ({
        ...team,
        members_count: users.filter(u => u.team === team.id).length
      }));

      return { data: teamsWithCounts, error: null };
    } catch (error) {
      return { 
        data: [], 
        error: 'Erreur lors de la récupération des équipes' 
      };
    }
  }

  /**
   * Crée un nouveau compte utilisateur
   */
  async createUser(userData: UserCreateRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();

      // Vérifier que l'email n'existe pas déjà
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
      }

      // Créer le nouvel utilisateur
      const newUser: UserWithTeam = {
        id: this.generateId(),
        email: userData.email,
        role: userData.role,
        team: userData.team_id || '',
        created_at: new Date().toISOString(),
        is_active: true,
        team_name: undefined,
        last_entry_date: undefined,
        entries_count: 0
      };

      users.push(newUser);
      this.saveUsers(users);

      return { success: true };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la création de l\'utilisateur' 
      };
    }
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.saveUsers(users);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour de l\'utilisateur' 
      };
    }
  }

  /**
   * Supprime (désactive) un utilisateur
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      users[userIndex].is_active = false;
      users[userIndex].updated_at = new Date().toISOString();

      this.saveUsers(users);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'utilisateur' 
      };
    }
  }

  /**
   * Crée une nouvelle équipe
   */
  async createTeam(teamData: TeamCreateRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const teams = this.getTeams();

      // Vérifier que le nom n'existe pas déjà
      if (teams.some(t => t.name === teamData.name)) {
        return { success: false, error: 'Une équipe avec ce nom existe déjà' };
      }

      // Créer la nouvelle équipe
      const newTeam: Team = {
        id: this.generateId(),
        name: teamData.name,
        description: teamData.description || '',
        manager_id: teamData.manager_id || '',
        created_at: new Date().toISOString(),
        is_active: true,
        members_count: 0
      };

      teams.push(newTeam);
      this.saveTeams(teams);

      return { success: true };
    } catch (error) {
      console.error('Erreur création équipe:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la création de l\'équipe' 
      };
    }
  }

  /**
   * Met à jour une équipe
   */
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<{ success: boolean; error?: string }> {
    try {
      const teams = this.getTeams();
      const teamIndex = teams.findIndex(t => t.id === teamId);

      if (teamIndex === -1) {
        return { success: false, error: 'Équipe non trouvée' };
      }

      teams[teamIndex] = {
        ...teams[teamIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.saveTeams(teams);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour de l\'équipe' 
      };
    }
  }

  /**
   * Supprime (désactive) une équipe
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getUsers();
      const teams = this.getTeams();

      // Vérifier qu'aucun utilisateur n'est assigné à cette équipe
      const usersInTeam = users.filter(u => u.team === teamId && u.is_active);
      if (usersInTeam.length > 0) {
        return { 
          success: false, 
          error: 'Impossible de supprimer une équipe qui contient encore des utilisateurs actifs' 
        };
      }

      const teamIndex = teams.findIndex(t => t.id === teamId);
      if (teamIndex === -1) {
        return { success: false, error: 'Équipe non trouvée' };
      }

      teams[teamIndex].is_active = false;
      teams[teamIndex].updated_at = new Date().toISOString();

      this.saveTeams(teams);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'équipe' 
      };
    }
  }

  /**
   * Récupère les détails complets d'un utilisateur
   */
  async getUserDetails(userId: string): Promise<DetailedUserData | null> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);

      if (!user) return null;

      // Mock des données d'entrées (à remplacer par vraies données si nécessaire)
      const mockEntries: DailyEntry[] = [];
      const wellbeingTrend = [70, 75, 80, 78, 82, 85, 88];
      const productivityTrend = [65, 68, 70, 75, 72, 78, 80];

      return {
        user,
        recent_entries: mockEntries,
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
      const users = this.getUsers();
      const teams = this.getTeams();

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active).length;
      const totalTeams = teams.filter(t => t.is_active).length;

      // Mock des entrées du jour
      const entriesToday = Math.floor(activeUsers * 0.7); // 70% des utilisateurs actifs

      // Calculer la santé du système
      let systemHealth: AdminMetrics['system_health'] = 'good';
      if (activeUsers === 0) systemHealth = 'critical';
      else if (entriesToday / activeUsers >= 0.8) systemHealth = 'excellent';
      else if (entriesToday / activeUsers >= 0.6) systemHealth = 'good';
      else if (entriesToday / activeUsers >= 0.3) systemHealth = 'warning';
      else systemHealth = 'critical';

      return {
        total_users: totalUsers,
        active_users: activeUsers,
        total_teams: totalTeams,
        entries_today: entriesToday,
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

  // Méthodes utilitaires

  private getUserEntriesCount(userId: string): number {
    // Mock - en production, compter les vraies entrées
    return Math.floor(Math.random() * 30);
  }
}

export const mockAdminService = new MockAdminService();