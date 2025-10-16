import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Users, Globe } from 'lucide-react';
import type { ViewType } from '../services/dataAggregationService';

interface ViewSelectorProps {
  userRole: 'employee' | 'manager' | 'admin';
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  availableTeams?: Array<{ id: string; name: string }>;
  selectedTeamId?: string;
  onTeamChange?: (teamId: string) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({
  userRole,
  currentView,
  onViewChange,
  availableTeams = [],
  selectedTeamId,
  onTeamChange
}) => {
  const { t } = useTranslation();

  // Définir les options de vue selon le rôle
  const getViewOptions = () => {
    const options: Array<{ value: ViewType; label: string; icon: React.FC<{ size: number }> }> = [
      { value: 'personal', label: t('viewSelector.myData'), icon: User }
    ];

    if (userRole === 'manager' || userRole === 'admin') {
      options.push({ value: 'team', label: t('viewSelector.myTeam'), icon: Users });
    }

    if (userRole === 'admin') {
      options.push({ value: 'all', label: t('viewSelector.allUsers'), icon: Globe });
    }

    return options;
  };

  const viewOptions = getViewOptions();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white rounded-lg border border-light-gray">
      {/* Sélecteur de vue */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-dark-blue whitespace-nowrap">
          {t('viewSelector.viewLabel')}:
        </label>
        <select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value as ViewType)}
          className="form-select min-w-[200px]"
        >
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </div>

      {/* Sélecteur d'équipe (pour admin uniquement quand vue = team) */}
      {userRole === 'admin' && currentView === 'team' && availableTeams.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-dark-blue whitespace-nowrap">
            {t('viewSelector.selectTeam')}:
          </label>
          <select
            value={selectedTeamId || ''}
            onChange={(e) => onTeamChange?.(e.target.value)}
            className="form-select min-w-[200px]"
          >
            <option value="">{t('viewSelector.allTeams')}</option>
            {availableTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Indicateur du mode */}
      <div className="flex items-center gap-2 px-3 py-1 bg-light-gray rounded-md text-sm">
        {currentView === 'personal' && (
          <>
            <User size={14} className="text-blue-600" />
            <span className="text-metallic-gray">{t('viewSelector.personalMode')}</span>
          </>
        )}
        {currentView === 'team' && (
          <>
            <Users size={14} className="text-green-600" />
            <span className="text-metallic-gray">{t('viewSelector.teamMode')}</span>
          </>
        )}
        {currentView === 'all' && (
          <>
            <Globe size={14} className="text-purple-600" />
            <span className="text-metallic-gray">{t('viewSelector.globalMode')}</span>
          </>
        )}
      </div>

      {/* Info anonymisation */}
      {(currentView === 'team' || currentView === 'all') && (
        <div className="text-xs text-metallic-gray italic">
          {t('viewSelector.anonymizedData')}
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
