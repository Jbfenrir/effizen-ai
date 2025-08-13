import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Shield, Building, Save } from 'lucide-react';
import { adminService } from '../services/adminService';
// import { mockAdminService as adminService } from '../services/mockAdminService';
import type { UserWithTeam, Team, UserCreateRequest } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserWithTeam | null;
  teams: Team[];
  mode: 'create' | 'edit' | 'view';
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  teams,
  mode
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
    team_id: '',
    send_invitation: true,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le formulaire quand l'utilisateur change
  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        email: user.email,
        role: user.role,
        team_id: user.team || '',
        send_invitation: false,
        is_active: user.is_active ?? true
      });
    } else if (mode === 'create') {
      setFormData({
        email: '',
        role: 'employee',
        team_id: teams.length > 0 ? teams[0].id : '',
        send_invitation: true,
        is_active: true
      });
    }
  }, [user, mode, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (mode === 'create') {
        const userData: UserCreateRequest = {
          email: formData.email,
          role: formData.role,
          team_id: formData.team_id,
          send_invitation: formData.send_invitation
        };
        result = await adminService.createUser(userData);
      } else if (mode === 'edit' && user) {
        result = await adminService.updateUser(user.id, {
          email: formData.email,
          role: formData.role,
          team: formData.team_id,
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
      case 'create': return t('userModal.createTitle');
      case 'edit': return t('userModal.editTitle');
      case 'view': return t('userModal.viewTitle');
      default: return '';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'employee': return 'Salarié';
      default: return role;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-xl font-semibold text-dark-blue flex items-center">
            <User className="mr-2" size={24} />
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <Mail size={16} className="inline mr-1" />
                {t('userModal.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={mode === 'view'}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <Shield size={16} className="inline mr-1" />
                {t('userModal.role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
              >
                <option value="employee">{t('dashboard.admin.employee')}</option>
                <option value="manager">{t('dashboard.admin.manager')}</option>
                <option value="admin">{t('dashboard.admin.administrator')}</option>
              </select>
              {mode === 'view' && (
                <p className="mt-1 text-sm text-metallic-gray">
                  {getRoleLabel(formData.role)}
                </p>
              )}
            </div>

            {/* Équipe */}
            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                <Building size={16} className="inline mr-1" />
                {t('userModal.team')}
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => handleChange('team_id', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50 text-gray-600' : 'border-light-gray'
                }`}
              >
                <option value="">{t('userModal.noTeam')}</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
                    {t('userModal.isActive')}
                  </span>
                </label>
              </div>
            )}

            {/* Invitation (seulement en création) */}
            {mode === 'create' && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.send_invitation}
                    onChange={(e) => handleChange('send_invitation', e.target.checked)}
                    className="form-checkbox text-lime-green"
                  />
                  <span className="text-sm font-medium text-dark-blue">
                    {t('userModal.sendInvitation')}
                  </span>
                </label>
              </div>
            )}

            {/* Informations supplémentaires en mode vue */}
            {mode === 'view' && user && (
              <div className="border-t border-light-gray pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-dark-blue">{t('userModal.createdOn')}</span>
                    <p className="text-metallic-gray">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">{t('userModal.lastEntry')}</span>
                    <p className="text-metallic-gray">
                      {user.last_entry_date ? 
                        new Date(user.last_entry_date).toLocaleDateString('fr-FR') : 
                        t('dashboard.admin.never')
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">{t('userModal.entriesCount')}</span>
                    <p className="text-metallic-gray">{user.entries_count || 0}</p>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">Statut:</span>
                    <p className={user.is_active ? 'text-lime-green' : 'text-red-600'}>
                      {user.is_active ? t('dashboard.admin.active') : t('dashboard.admin.inactive')}
                    </p>
                  </div>
                </div>
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
            {mode === 'view' ? t('userModal.close') : t('common.cancel')}
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
                  <span>{t('userModal.saving')}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{mode === 'create' ? t('userModal.create') : t('userModal.save')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;