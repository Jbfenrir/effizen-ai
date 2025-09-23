import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Coffee, Dumbbell, Users } from 'lucide-react';
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
    meditationsPauses: {
      morning: initialData?.meditationsPauses?.morning || false,
      noon: initialData?.meditationsPauses?.noon || false,
      afternoon: initialData?.meditationsPauses?.afternoon || false,
      evening: initialData?.meditationsPauses?.evening || false,
    },
    sportLeisureHours: initialData?.sportLeisureHours || 0,
    socialInteraction: initialData?.socialInteraction || false,
    energy: initialData?.energy || 50,
  });

  useEffect(() => {
    setWellbeing({
      meditationsPauses: {
        morning: initialData?.meditationsPauses?.morning || false,
        noon: initialData?.meditationsPauses?.noon || false,
        afternoon: initialData?.meditationsPauses?.afternoon || false,
        evening: initialData?.meditationsPauses?.evening || false,
      },
      sportLeisureHours: initialData?.sportLeisureHours || 0,
      socialInteraction: initialData?.socialInteraction || false,
      energy: initialData?.energy || 50,
    });
  }, [initialData]);

  const handleChange = (field: keyof Wellbeing, value: any) => {
    setWellbeing(prev => {
      const updated = { ...prev, [field]: value };
      onChange(updated);
      return updated;
    });
  };

  const handleMeditationPauseChange = (time: 'morning' | 'noon' | 'afternoon' | 'evening', value: boolean) => {
    setWellbeing(prev => {
      const updated = {
        ...prev,
        meditationsPauses: { ...prev.meditationsPauses, [time]: value },
      };
      onChange(updated);
      return updated;
    });
  };

  const getMeditationPauseScore = () => {
    const { morning, noon, afternoon, evening } = wellbeing.meditationsPauses;
    const count = [morning, noon, afternoon, evening].filter(Boolean).length;
    return (count / 4) * 100;
  };

  const meditationPauseScore = getMeditationPauseScore();

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Heart className="icon" size={24} />
          <h3 className="text-lg font-semibold">{t('wellbeing.title')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Méditations / Pauses */}
        <div>
          <label className="form-label flex items-center space-x-2">
            <Coffee size={16} />
            <span>Méditations / Pauses</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="meditation-pause-morning"
                checked={wellbeing.meditationsPauses.morning}
                onChange={(e) => handleMeditationPauseChange('morning', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-pause-morning" className="text-sm font-medium text-dark-blue">
                Matin
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="meditation-pause-noon"
                checked={wellbeing.meditationsPauses.noon}
                onChange={(e) => handleMeditationPauseChange('noon', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-pause-noon" className="text-sm font-medium text-dark-blue">
                Midi
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="meditation-pause-afternoon"
                checked={wellbeing.meditationsPauses.afternoon}
                onChange={(e) => handleMeditationPauseChange('afternoon', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-pause-afternoon" className="text-sm font-medium text-dark-blue">
                Après-midi
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="meditation-pause-evening"
                checked={wellbeing.meditationsPauses.evening}
                onChange={(e) => handleMeditationPauseChange('evening', e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
              />
              <label htmlFor="meditation-pause-evening" className="text-sm font-medium text-dark-blue">
                Soir
              </label>
            </div>
          </div>
          <p className="text-sm text-metallic-gray mt-2">
            {t('wellbeing.meditationsHelp')}
          </p>
        </div>

        {/* Heures de sport/loisir */}
        <div className="form-group">
          <label htmlFor="sportLeisureHours" className="form-label flex items-center space-x-2">
            <Dumbbell size={16} />
            <span>Heures de sport/loisir</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="sportLeisureHours"
              min="0"
              max="8"
              step="0.5"
              value={wellbeing.sportLeisureHours}
              onChange={(e) => handleChange('sportLeisureHours', parseFloat(e.target.value) || 0)}
              className="form-input pr-12"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray">
              h
            </span>
          </div>
          <p className="text-sm text-metallic-gray mt-1">
            {t('wellbeing.sportsHelp')}
          </p>
        </div>

        {/* Interaction sociale quotidienne */}
        <div className="form-group">
          <label className="form-label flex items-center space-x-2">
            <Users size={16} />
            <span>Interaction sociale quotidienne</span>
          </label>
          <div className="flex items-center space-x-3 mt-2">
            <input
              type="checkbox"
              id="socialInteraction"
              checked={wellbeing.socialInteraction}
              onChange={(e) => handleChange('socialInteraction', e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-lime-green bg-gray-100 border-gray-300 rounded focus:ring-lime-green focus:ring-2"
            />
            <label htmlFor="socialInteraction" className="text-sm font-medium text-dark-blue">
              J'ai eu des interactions sociales positives aujourd'hui
            </label>
          </div>
          <p className="text-sm text-metallic-gray mt-2">
            {t('wellbeing.socialHelp')}
          </p>
        </div>
      </div>

      {/* Score d'équilibre */}
      <div className="mt-6 p-4 bg-light-gray rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Méditations/Pauses */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Méditations / Pauses
            </div>
            <div className="text-2xl font-bold text-lime-green">
              {[wellbeing.meditationsPauses.morning, wellbeing.meditationsPauses.noon, 
                wellbeing.meditationsPauses.afternoon, wellbeing.meditationsPauses.evening].filter(Boolean).length}/4
            </div>
            <div className="text-xs text-metallic-gray">
              {meditationPauseScore >= 75 ? 'Excellent !' : 
               meditationPauseScore >= 50 ? 'Bien' : 
               meditationPauseScore >= 25 ? 'Correct' : 'À améliorer'}
            </div>
          </div>

          {/* Sport/Loisir */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Sport / Loisir
            </div>
            <div className={`text-2xl font-bold ${
              wellbeing.sportLeisureHours >= 2 ? 'text-lime-green' : 
              wellbeing.sportLeisureHours >= 1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {wellbeing.sportLeisureHours}h
            </div>
            <div className="text-xs text-metallic-gray">
              {wellbeing.sportLeisureHours >= 2 ? 'Très actif' : 
               wellbeing.sportLeisureHours >= 1 ? 'Actif' : 
               wellbeing.sportLeisureHours > 0 ? 'Peu actif' : 'Inactif'}
            </div>
          </div>

          {/* Social */}
          <div className="text-center">
            <div className="text-sm font-medium text-dark-blue mb-2">
              Social
            </div>
            <div className={`text-2xl font-bold ${
              wellbeing.socialInteraction ? 'text-lime-green' : 'text-red-600'
            }`}>
              {wellbeing.socialInteraction ? '✓' : '✗'}
            </div>
            <div className="text-xs text-metallic-gray">
              {wellbeing.socialInteraction ? 'Connecté' : 'Isolé'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WellbeingForm;