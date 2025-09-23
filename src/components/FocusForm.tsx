import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, Battery } from 'lucide-react';
import type { Focus } from '../types';

interface FocusFormProps {
  initialData?: Focus;
  onChange: (focus: Focus) => void;
  disabled?: boolean;
}

const FocusForm: React.FC<FocusFormProps> = ({
  initialData,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [focus, setFocus] = useState<Focus>({
    morningHours: initialData?.morningHours || 0,
    afternoonHours: initialData?.afternoonHours || 0,
    drivingHours: initialData?.drivingHours || 0,
    fatigue: initialData?.fatigue || 3,
  });

  useEffect(() => {
    setFocus({
      morningHours: initialData?.morningHours || 0,
      afternoonHours: initialData?.afternoonHours || 0,
      drivingHours: initialData?.drivingHours || 0,
      fatigue: initialData?.fatigue || 3,
    });
  }, [initialData]);

  const totalHours = focus.morningHours + focus.afternoonHours + focus.drivingHours;

  // SUPPRESSION: useEffect(() => { onChange(focus); }, [focus, onChange]);

  const handleChange = (field: keyof Focus, value: number) => {
    setFocus(prev => {
      const updated = { ...prev, [field]: value };
      onChange(updated);
      return updated;
    });
  };

  const energyLevels = [
    { value: 1, label: t('focus.veryTired'), color: 'fatigue-btn-5' },
    { value: 2, label: t('focus.tired'), color: 'fatigue-btn-4' },
    { value: 3, label: t('focus.neutral'), color: 'fatigue-btn-3' },
    { value: 4, label: t('focus.energetic'), color: 'fatigue-btn-2' },
    { value: 5, label: t('focus.veryEnergetic'), color: 'fatigue-btn-1' },
  ];

  const getFatigueColor = (level: number) => {
    if (level <= 2) return 'text-green-600';
    if (level === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Battery className="icon" size={24} />
          <h3 className="text-lg font-semibold">{t('focus.title')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heures de travail matin */}
        <div className="form-group">
          <label htmlFor="morningHours" className="form-label">
            {t('focus.morningHours')}
          </label>
          <div className="relative">
            <input
              type="number"
              id="morningHours"
              min="0"
              max="6"
              step="0.5"
              value={focus.morningHours}
              onChange={(e) => handleChange('morningHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
          {focus.morningHours > 6 && (
            <p className="text-red-600 text-sm mt-1">
              Maximum 6 heures recommandé pour le matin
            </p>
          )}
        </div>

        {/* Heures de travail après-midi */}
        <div className="form-group">
          <label htmlFor="afternoonHours" className="form-label">
            {t('focus.afternoonHours')}
          </label>
          <div className="relative">
            <input
              type="number"
              id="afternoonHours"
              min="0"
              max="6"
              step="0.5"
              value={focus.afternoonHours}
              onChange={(e) => handleChange('afternoonHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
          {focus.afternoonHours > 6 && (
            <p className="text-red-600 text-sm mt-1">
              Maximum 6 heures recommandé pour l'après-midi
            </p>
          )}
        </div>

        {/* Heures de conduite */}
        <div className="form-group">
          <label htmlFor="drivingHours" className="form-label">
            {t('focus.drivingHours')}
          </label>
          <div className="relative">
            <input
              type="number"
              id="drivingHours"
              min="0"
              max="4"
              step="0.5"
              value={focus.drivingHours}
              onChange={(e) => handleChange('drivingHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
        </div>

        {/* Total des heures */}
        <div className="form-group">
          <label className="form-label flex items-center space-x-2">
            <Clock size={16} />
            <span>{t('focus.totalHours')}</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-lg px-4 py-2 ${
              totalHours > 8 ? 'bg-red-100 border border-red-300' : 'bg-light-gray'
            }`}>
              <span className={`text-lg font-semibold ${
                totalHours > 8 ? 'text-red-700' : 'text-dark-blue'
              }`}>
                {totalHours.toFixed(1)} h
              </span>
            </div>
          </div>
          {totalHours > 8 && (
            <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
              <AlertTriangle size={14} />
              <span>{t('focus.warning')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Niveau d'énergie */}
      <div className="mt-6">
        <label className="form-label">
          Niveau d'énergie
        </label>
        <div className="grid grid-cols-5 gap-2">
          {energyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleChange('fatigue', level.value)}
              disabled={disabled}
              className={`fatigue-btn ${level.color} ${
                focus.fatigue === level.value ? 'ring-2 ring-lime-green ring-offset-2' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{level.value}</div>
                <div className="text-xs">{level.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Indicateur d'énergie actuel */}
      <div className="mt-4 p-3 rounded-lg bg-light-gray">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-dark-blue">
            {t('focus.currentLevel')} :
          </span>
          <span className={`text-sm font-semibold ${getFatigueColor(focus.fatigue)}`}>
            {energyLevels.find(l => l.value === focus.fatigue)?.label || t('focus.neutral')}
          </span>
        </div>
      </div>

      {/* Conseils selon le niveau de fatigue */}
      {/* SUPPRESSION: Bloc conseils selon le niveau de fatigue */}

      {/* Informations supplémentaires */}
      {/* SUPPRESSION: Bloc informations supplémentaires (conseil) */}
    </div>
  );
};

export default FocusForm; 