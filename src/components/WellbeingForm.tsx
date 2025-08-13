import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Coffee, Dumbbell, Wrench, Battery } from 'lucide-react';
import EnergyBar from './EnergyBar';
import type { Wellbeing } from '../types';

interface WellbeingFormProps {
  initialData?: Wellbeing;
  onChange: (wellbeing: Wellbeing) => void;
  disabled?: boolean;
}

const WellbeingForm: React.FC<WellbeingFormProps> = ({
  initialData,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [wellbeing, setWellbeing] = useState<Wellbeing>({
    meditations: {
      am: initialData?.meditations.am || false,
      pm: initialData?.meditations.pm || false,
    },
    breaks: {
      am: initialData?.breaks?.am || false,
      noon: initialData?.breaks?.noon || false,
      pm: initialData?.breaks?.pm || false,
    },
    sportHours: initialData?.sportHours || 0,
    manualHours: initialData?.manualHours || 0,
    energy: initialData?.energy || 50,
  });

  useEffect(() => {
    setWellbeing({
      meditations: {
        am: initialData?.meditations?.am || false,
        pm: initialData?.meditations?.pm || false,
      },
      breaks: {
        am: initialData?.breaks?.am || false,
        noon: initialData?.breaks?.noon || false,
        pm: initialData?.breaks?.pm || false,
      },
      sportHours: initialData?.sportHours || 0,
      manualHours: initialData?.manualHours || 0,
      energy: initialData?.energy || 50,
    });
  }, [initialData]);

  // SUPPRESSION: useEffect(() => { onChange(wellbeing); }, [wellbeing, onChange]);

  const handleChange = (field: keyof Wellbeing, value: any) => {
    setWellbeing(prev => {
      const updated = { ...prev, [field]: value };
      onChange(updated);
      return updated;
    });
  };

  const handleMeditationChange = (time: 'am' | 'pm', value: boolean) => {
    setWellbeing(prev => {
      const updated = {
        ...prev,
        meditations: { ...prev.meditations, [time]: value },
      };
      onChange(updated);
      return updated;
    });
  };

  const handleBreakChange = (time: 'am' | 'noon' | 'pm', value: boolean) => {
    setWellbeing(prev => {
      const updated = {
        ...prev,
        breaks: { ...prev.breaks, [time]: value },
      };
      onChange(updated);
      return updated;
    });
  };

  const getActivityScore = () => {
    let score = 0;
    if (wellbeing.sportHours > 0) score += 50;
    if (wellbeing.manualHours > 0) score += 50;
    return score;
  };

  const activityScore = getActivityScore();

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Heart className="icon" size={24} />
          <h3 className="text-lg font-semibold">{t('wellbeing.title')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Méditations */}
        <div className="md:col-span-2">
          <label className="form-label flex items-center space-x-2">
            <Heart size={16} />
            <span>{t('wellbeing.meditations.title')}</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="meditation-am"
                checked={wellbeing.meditations.am}
                onChange={(e) => handleMeditationChange('am', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-am" className="text-sm font-medium text-dark-blue">
                {t('wellbeing.meditations.am')}
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="meditation-pm"
                checked={wellbeing.meditations.pm}
                onChange={(e) => handleMeditationChange('pm', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-pm" className="text-sm font-medium text-dark-blue">
                {t('wellbeing.meditations.pm')}
              </label>
            </div>
          </div>
          <p className="text-sm text-metallic-gray mt-2">
            {t('wellbeing.tips.meditation')}
          </p>
        </div>

        {/* Pauses */}
        <div className="form-group">
          <label className="form-label flex items-center space-x-2">
            <Coffee size={16} />
            <span>{t('wellbeing.breaks')}</span>
          </label>
          <div className="flex space-x-6 mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="break-am"
                checked={wellbeing.breaks.am}
                onChange={e => handleBreakChange('am', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="break-am" className="text-sm font-medium text-dark-blue">Matin</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="break-noon"
                checked={wellbeing.breaks.noon}
                onChange={e => handleBreakChange('noon', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="break-noon" className="text-sm font-medium text-dark-blue">Midi</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="break-pm"
                checked={wellbeing.breaks.pm}
                onChange={e => handleBreakChange('pm', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="break-pm" className="text-sm font-medium text-dark-blue">Après-midi</label>
            </div>
          </div>
          <p className="text-sm text-metallic-gray mt-2">
            {t('wellbeing.tips.breaks')}
          </p>
        </div>

        {/* Heures de sport */}
        <div className="form-group">
          <label htmlFor="sportHours" className="form-label flex items-center space-x-2">
            <Dumbbell size={16} />
            <span>{t('wellbeing.sportHours')}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="sportHours"
              min="0"
              max="4"
              step="0.5"
              value={wellbeing.sportHours}
              onChange={(e) => handleChange('sportHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
        </div>

        {/* Heures d'activité manuelle */}
        <div className="form-group">
          <label htmlFor="manualHours" className="form-label flex items-center space-x-2">
            <Wrench size={16} />
            <span>{t('wellbeing.manualHours')}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="manualHours"
              min="0"
              max="4"
              step="0.5"
              value={wellbeing.manualHours}
              onChange={(e) => handleChange('manualHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
        </div>
      </div>

      {/* Barre d'énergie */}
      {/* SUPPRESSION: tout le bloc affichage et saisie du niveau d'énergie */}

      {/* Score d'activité */}
      <div className="mt-6 p-4 bg-light-gray rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Méditations */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Méditations
            </div>
            <div className="text-2xl font-bold text-lime-green">
              {(wellbeing.meditations.am ? 1 : 0) + (wellbeing.meditations.pm ? 1 : 0)}/2
            </div>
            <div className="text-xs text-metallic-gray">
              {wellbeing.meditations.am && wellbeing.meditations.pm ? 'Parfait !' : 'Peut mieux faire'}
            </div>
          </div>

          {/* Pauses */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Pauses
            </div>
            <div className="text-2xl font-bold text-dark-blue">
              {['am', 'noon', 'pm'].filter(k => wellbeing.breaks[k as 'am'|'noon'|'pm']).length} / 3
            </div>
            <div className="text-xs text-metallic-gray">
              {['am', 'noon', 'pm'].filter(k => wellbeing.breaks[k as 'am'|'noon'|'pm']).length === 3 ? 'Excellent' :
               ['am', 'noon', 'pm'].filter(k => wellbeing.breaks[k as 'am'|'noon'|'pm']).length === 2 ? 'Correct' : 'À améliorer'}
            </div>
          </div>

          {/* Activités */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Activités
            </div>
            <div className={`text-2xl font-bold ${
              activityScore >= 100 ? 'text-lime-green' : 
              activityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {activityScore}/100
            </div>
            <div className="text-xs text-metallic-gray">
              {activityScore >= 100 ? 'Sport + Manuel' : 
               activityScore >= 50 ? 'Une activité' : 'Aucune activité'}
            </div>
          </div>
        </div>
      </div>

      {/* Conseils selon les données */}
      {/* SUPPRESSION: Blocs conseils selon les données (énergie, pauses, activité) */}

      {/* Informations supplémentaires */}
      {/* SUPPRESSION: Bloc informations supplémentaires (conseil) */}
    </div>
  );
};

export default WellbeingForm; 