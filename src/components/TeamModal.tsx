import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Building, User, FileText, Save } from 'lucide-react';
import { adminService } from '../services/adminService';
// import { mockAdminService as adminService } from '../services/mockAdminService';
import type { Team, TeamCreateRequest, UserWithTeam } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team?: Team | null;
  users: UserWithTeam[];
  mode: 'create' | 'edit' | 'view';
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  team,
  users,
  mode
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrer les managers disponibles
  const availableManagers = users.filter(user => 
    user.role === 'manager' && user.is_active
  );

  // Initialiser le formulaire
  useEffect(() => {
    if (team && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: team.name,
        description: team.description || '',
        manager_id: team.manager_id || '',
        is_active: team.is_active
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        manager_id: '',
        is_active: true
      });
    }
  }, [team, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (mode === 'create') {
        const teamData: TeamCreateRequest = {
          name: formData.name,
          description: formData.description || undefined,
          manager_id: formData.manager_id || undefined
        };
        result = await adminService.createTeam(teamData);
      } else if (mode === 'edit' && team) {
        result = await adminService.updateTeam(team.id, {
          name: formData.name,
          description: formData.description || undefined,
          manager_id: formData.manager_id || undefined,
          is_active: formData.is_active
        });
      }

      if (result?.success) {
        onSuccess();
        onClose();
      } else {
        setError(result?.error || t('common.error'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return t('teamModal.createTitle');
      case 'edit': return t('teamModal.editTitle');
      case 'view': return t('teamModal.viewTitle');
      default: return '';
    }
  };

  // Obtenir le nom du manager
  const getManagerName = (managerId: string) => {
    const manager = users.find(u => u.id === managerId);
    return manager ? manager.email : t('teamModal.noManager');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-xl font-semibold text-dark-blue flex items-center">
            <Building className="mr-2" size={24} />
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-metallic-gray hover:text-dark-blue transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Nom de l'équipe */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <Building size={16} className="inline mr-1" />
                {t('teamModal.teamName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={mode === 'view'}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
                placeholder="Ex: Development, Marketing..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <FileText size={16} className="inline mr-1" />
                {t('teamModal.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
                placeholder={t('teamModal.description')}
              />
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <User size={16} className="inline mr-1" />
                {t('teamModal.responsibleManager')}
              </label>
              <select
                value={formData.manager_id}
                onChange={(e) => handleChange('manager_id', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
              >
                <option value="">{t('teamModal.noManager')}</option>
                {availableManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.email}
                  </option>
                ))}
              </select>
              {mode === 'view' && (
                <p className="mt-1 text-sm text-metallic-gray">
                  {getManagerName(formData.manager_id)}
                </p>
              )}
            </div>

            {/* Statut (seulement en édition) */}
            {mode === 'edit' && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="form-checkbox text-lime-green"
                  />
                  <span className="text-sm font-medium text-dark-blue">
                    {t('teamModal.isActive')}
                  </span>
                </label>
              </div>
            )}

            {/* Informations supplémentaires en mode vue */}
            {mode === 'view' && team && (
              <div className="border-t border-light-gray pt-4 mt-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-dark-blue">{t('teamModal.createdOn')}</span>
                    <p className="text-metallic-gray">
                      {new Date(team.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-dark-blue">{t('teamModal.lastModified')}</span>
                    <p className="text-metallic-gray">
                      {team.updated_at ? 
                        new Date(team.updated_at).toLocaleDateString('fr-FR') : 
                        t('dashboard.admin.never')
                      }
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-dark-blue">{t('teamModal.membersCount')}</span>
                    <p className="text-metallic-gray">{team.members_count || 0}</p>
                  </div>

                  <div>
                    <span className="font-medium text-dark-blue">Statut:</span>
                    <p className={team.is_active ? 'text-lime-green' : 'text-red-600'}>
                      {team.is_active ? t('dashboard.admin.active') : t('dashboard.admin.inactive')}
                    </p>
                  </div>
                </div>

                {/* Liste des membres (si disponible) */}
                {team.members_count && team.members_count > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-dark-blue">{t('teamModal.teamMembers')}</span>
                    <div className="mt-2 space-y-1">
                      {users
                        .filter(user => user.team === team.id)
                        .map(member => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span className="text-metallic-gray">{member.email}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role === 'manager' ? t('dashboard.admin.manager') : t('dashboard.admin.employee')}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-light-gray">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-metallic-gray hover:text-dark-blue transition-colors"
          >
            {mode === 'view' ? t('teamModal.close') : t('common.cancel')}
          </button>
          
          {mode !== 'view' && (
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-4 py-2 bg-lime-green text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('teamModal.saving')}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{mode === 'create' ? t('teamModal.create') : t('teamModal.save')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamModal;