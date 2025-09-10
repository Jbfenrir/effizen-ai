import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserPlus, 
  Building, 
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Shield,
  Key
} from 'lucide-react';
import { adminService } from '../services/adminService';
// import { mockAdminService as adminService } from '../services/mockAdminService';
import UserModal from '../components/UserModal';
import TeamModal from '../components/TeamModal';
import PasswordResetModal from '../components/PasswordResetModal';
import type { UserWithTeam, Team, AdminMetrics } from '../types';

const DashboardAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teams'>('overview');
  const [users, setUsers] = useState<UserWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    total_users: 0,
    active_users: 0,
    total_teams: 0,
    entries_today: 0,
    system_health: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'employee' | 'manager' | 'admin'>('all');
  
  // États pour les modals
  const [userModal, setUserModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    user?: UserWithTeam | null;
  }>({ isOpen: false, mode: 'create', user: null });
  
  const [teamModal, setTeamModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    team?: Team | null;
  }>({ isOpen: false, mode: 'create', team: null });
  
  const [passwordResetModal, setPasswordResetModal] = useState<{
    isOpen: boolean;
    userEmail: string;
    userId: string;
  }>({ isOpen: false, userEmail: '', userId: '' });

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResult, teamsResult, metricsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllTeams(),
        adminService.getAdminMetrics()
      ]);

      if (usersResult.error) {
        console.error('Erreur chargement utilisateurs:', usersResult.error);
      } else {
        setUsers(usersResult.data);
      }

      if (teamsResult.error) {
        console.error('Erreur chargement équipes:', teamsResult.error);
      } else {
        setTeams(teamsResult.data);
      }

      setMetrics(metricsData);
    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.team_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getSystemHealthColor = () => {
    switch (metrics.system_health) {
      case 'excellent': return 'text-lime-green';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemHealthBg = () => {
    switch (metrics.system_health) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t('dashboard.admin.administrator');
      case 'manager': return t('dashboard.admin.manager');
      case 'employee': return t('dashboard.admin.employee');
      default: return role;
    }
  };

  const handleUserAction = async (action: 'view' | 'edit' | 'delete', userId: string) => {
    const user = users.find(u => u.id === userId);
    
    switch (action) {
      case 'view':
        setUserModal({ isOpen: true, mode: 'view', user });
        break;
      case 'edit':
        setUserModal({ isOpen: true, mode: 'edit', user });
        break;
      case 'delete':
        if (confirm(t('dashboard.admin.confirmDeactivateUser'))) {
          const result = await adminService.deleteUser(userId);
          if (result.success) {
            loadDashboardData();
          } else {
            alert(t('common.error') + ': ' + result.error);
          }
        }
        break;
    }
  };
  
  const handleTeamAction = async (action: 'view' | 'edit' | 'delete', teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    
    switch (action) {
      case 'view':
        setTeamModal({ isOpen: true, mode: 'view', team });
        break;
      case 'edit':
        setTeamModal({ isOpen: true, mode: 'edit', team });
        break;
      case 'delete':
        if (confirm(t('dashboard.admin.confirmDeactivateTeam'))) {
          const result = await adminService.deleteTeam(teamId);
          if (result.success) {
            loadDashboardData();
          } else {
            alert(t('common.error') + ': ' + result.error);
          }
        }
        break;
    }
  };
  
  const handleModalSuccess = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto mb-4"></div>
          <p className="text-metallic-gray">{t('common.loading') || 'Chargement du dashboard administrateur...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-light-gray">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-blue">
                  {t('dashboard.admin.title') || 'Dashboard Administrateur'}
                </h1>
                <p className="text-metallic-gray mt-1">
                  {t('dashboard.admin.subtitle') || 'Gestion globale du système EffiZen-AI'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-success flex items-center space-x-2">
                <Download size={16} />
                <span>{t('dashboard.admin.globalExport') || 'Export Global'}</span>
              </button>
              <button 
                onClick={() => setUserModal({ isOpen: true, mode: 'create', user: null })}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>{t('dashboard.admin.newUser') || 'Nouvel Utilisateur'}</span>
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="mt-6 flex space-x-1 bg-light-gray rounded-lg p-1">
            {[
              { key: 'overview', label: t('dashboard.admin.overview') || 'Vue d\'ensemble', icon: Activity },
              { key: 'users', label: t('dashboard.admin.users') || 'Utilisateurs', icon: Users },
              { key: 'teams', label: t('dashboard.admin.teams') || 'Équipes', icon: Building }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-dark-blue shadow-sm'
                      : 'text-metallic-gray hover:text-dark-blue'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Métriques globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-metallic-gray">{t('dashboard.admin.totalUsers') || 'Total Utilisateurs'}</p>
                    <p className="text-2xl font-bold text-dark-blue">{metrics.total_users}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-lime-green" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-metallic-gray">{t('dashboard.admin.activeUsers') || 'Utilisateurs Actifs'}</p>
                    <p className="text-2xl font-bold text-dark-blue">{metrics.active_users}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-metallic-gray">{t('dashboard.admin.teams')}</p>
                    <p className="text-2xl font-bold text-dark-blue">{metrics.total_teams}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-metallic-gray">{t('dashboard.admin.entriesToday') || 'Saisies Aujourd\'hui'}</p>
                    <p className="text-2xl font-bold text-dark-blue">{metrics.entries_today}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${getSystemHealthBg()} rounded-lg flex items-center justify-center`}>
                    <Settings className={getSystemHealthColor()} size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-metallic-gray">{t('dashboard.admin.systemHealth') || 'Santé Système'}</p>
                    <p className={`text-lg font-bold capitalize ${getSystemHealthColor()}`}>
                      {metrics.system_health}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes système */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">{t('dashboard.admin.systemAlerts') || 'Alertes Système'}</h3>
              </div>
              <div className="space-y-4">
                {metrics.system_health === 'critical' && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                      <div>
                        <h4 className="text-red-800 font-medium">{t('dashboard.admin.criticalHealth')}</h4>
                        <p className="text-red-700 text-sm mt-1">
                          {t('dashboard.admin.lowEngagement')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.active_users < metrics.total_users * 0.8 && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-800 font-medium">{t('dashboard.admin.inactiveUsers')}</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          {metrics.total_users - metrics.active_users} utilisateur(s) n'ont pas été actifs récemment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.system_health === 'excellent' && (
                  <div className="p-4 bg-green-50 border-l-4 border-lime-green rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle size={20} className="text-lime-green mt-0.5" />
                      <div>
                        <h4 className="text-green-800 font-medium">{t('dashboard.admin.excellentHealth')}</h4>
                        <p className="text-green-700 text-sm mt-1">
                          {t('dashboard.admin.excellentEngagement')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gestion des utilisateurs */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="card">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 flex-1 min-w-80">
                  <Search size={16} className="text-metallic-gray" />
                  <input
                    type="text"
                    placeholder={t('dashboard.admin.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-metallic-gray" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="all">{t('dashboard.admin.allRoles')}</option>
                    <option value="employee">{t('dashboard.admin.employees')}</option>
                    <option value="manager">{t('dashboard.admin.managers')}</option>
                    <option value="admin">{t('dashboard.admin.administrators')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">
                  {t('dashboard.admin.users')} ({filteredUsers.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-gray">
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.email')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.role')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.team')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.lastEntry')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.entries')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.status')}</th>
                      <th className="text-center py-3 px-4 font-medium text-dark-blue">{t('dashboard.admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-light-gray hover:bg-gray-50">
                        <td className="py-3 px-4 text-dark-blue">{user.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {user.team_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {user.last_entry_date ? 
                            new Date(user.last_entry_date).toLocaleDateString('fr-FR') : 
                            t('dashboard.admin.never')
                          }
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium">
                          {user.entries_count || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? t('dashboard.admin.active') : t('dashboard.admin.inactive')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleUserAction('view', user.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title={t('dashboard.admin.viewDetails')}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleUserAction('edit', user.id)}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors"
                              title={t('dashboard.admin.edit')}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setPasswordResetModal({ 
                                isOpen: true, 
                                userEmail: user.email, 
                                userId: user.id 
                              })}
                              className="text-purple-600 hover:text-purple-800 transition-colors"
                              title={t('dashboard.admin.resetPassword')}
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleUserAction('delete', user.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title={t('dashboard.admin.deactivate')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Gestion des équipes */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('dashboard.admin.teams')} ({teams.length})</h3>
                  <button 
                    onClick={() => setTeamModal({ isOpen: true, mode: 'create', team: null })}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Building size={16} />
                    <span>{t('dashboard.admin.newTeam')}</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="border border-light-gray rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-dark-blue">{team.name}</h4>
                        {team.description && (
                          <p className="text-sm text-metallic-gray mt-1">{team.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleTeamAction('view', team.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title={t('dashboard.admin.viewDetails')}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => handleTeamAction('edit', team.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title={t('dashboard.admin.edit')}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleTeamAction('delete', team.id)}
                          className="text-red-600 hover:text-red-800"
                          title={t('dashboard.admin.deactivate')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-metallic-gray">
                        {team.members_count || 0} {t('dashboard.admin.members')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        team.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {team.is_active ? t('dashboard.admin.active') : t('dashboard.admin.inactive')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ isOpen: false, mode: 'create', user: null })}
        onSuccess={handleModalSuccess}
        user={userModal.user}
        teams={teams}
        mode={userModal.mode}
      />
      
      <TeamModal
        isOpen={teamModal.isOpen}
        onClose={() => setTeamModal({ isOpen: false, mode: 'create', team: null })}
        onSuccess={handleModalSuccess}
        team={teamModal.team}
        users={users}
        mode={teamModal.mode}
      />
      
      <PasswordResetModal
        isOpen={passwordResetModal.isOpen}
        onClose={() => setPasswordResetModal({ isOpen: false, userEmail: '', userId: '' })}
        userEmail={passwordResetModal.userEmail}
        userId={passwordResetModal.userId}
      />
    </div>
  );
};

export default DashboardAdmin;