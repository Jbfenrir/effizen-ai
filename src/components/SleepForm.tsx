import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sunrise, Clock } from 'lucide-react';
import { calculateSleepDuration } from '../utils/calculateSleepDuration';
import type { Sleep } from '../types';

interface SleepFormProps {
  initialData?: Sleep;
  onChange: (sleep: Sleep) => void;
  disabled?: boolean;
}

const SleepForm: React.FC<SleepFormProps> = ({
  initialData,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [sleep, setSleep] = useState<Sleep>({
    bedTime: initialData?.bedTime || '22:00',
    wakeTime: initialData?.wakeTime || '07:00',
    insomniaDuration: initialData?.insomniaDuration || 0,
    duration: initialData?.duration || 0,
  });

  // Calculer la durée automatiquement
  useEffect(() => {
    const duration = calculateSleepDuration(
      sleep.bedTime,
      sleep.wakeTime,
      sleep.insomniaDuration
    );
    
    const updatedSleep = { ...sleep, duration };
    setSleep(updatedSleep);
    onChange(updatedSleep);
  }, [sleep.bedTime, sleep.wakeTime, sleep.insomniaDuration]);

  const handleChange = (field: keyof Sleep, value: string | number) => {
    setSleep(prev => ({ ...prev, [field]: value }));
  };

  const getSleepQuality = (duration: number) => {
    if (duration >= 7 && duration <= 9) return 'good';
    if (duration < 7) return 'short';
    return 'long';
  };

  const sleepQuality = getSleepQuality(sleep.duration);

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Moon className="icon" size={24} />
          <h3 className="text-lg font-semibold">{t('sleep.title')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heure du coucher */}
        <div className="form-group">
          <label htmlFor="bedTime" className="form-label flex items-center space-x-2">
            <Moon size={16} />
            <span>{t('sleep.bedTime')}</span>
          </label>
          <input
            type="time"
            id="bedTime"
            value={sleep.bedTime}
            onChange={(e) => handleChange('bedTime', e.target.value)}
            className="form-input"
            disabled={disabled}
          />
        </div>

        {/* Heure du lever */}
        <div className="form-group">
          <label htmlFor="wakeTime" className="form-label flex items-center space-x-2">
            <Sunrise size={16} />
            <span>{t('sleep.wakeTime')}</span>
          </label>
          <input
            type="time"
            id="wakeTime"
            value={sleep.wakeTime}
            onChange={(e) => handleChange('wakeTime', e.target.value)}
            className="form-input"
            disabled={disabled}
          />
        </div>

        {/* Durée d'insomnie */}
        <div className="form-group">
          <label htmlFor="insomniaDuration" className="form-label">
            {t('sleep.insomniaDuration')}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              id="insomniaDuration"
              min="0"
              max="8"
              step="0.5"
              value={sleep.insomniaDuration}
              onChange={(e) => handleChange('insomniaDuration', parseFloat(e.target.value) || 0)}
              className="form-input w-24"
              disabled={disabled}
            />
            <span className="text-metallic-gray">{t('sleep.hours')}</span>
          </div>
        </div>

        {/* Durée totale calculée */}
        <div className="form-group">
          <label className="form-label flex items-center space-x-2">
            <Clock size={16} />
            <span>{t('sleep.duration')}</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-light-gray rounded-lg px-4 py-2">
              <span className="text-lg font-semibold text-dark-blue">
                {sleep.duration.toFixed(1)} {t('sleep.hours')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de qualité du sommeil */}
      {sleep.duration > 0 && (
        <div className="mt-6 p-4 rounded-lg border-l-4">
          {sleepQuality === 'good' && (
            <div className="border-lime-green bg-green-50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-lime-green rounded-full"></div>
                <span className="text-green-800 font-medium">
                  {t('sleep.quality')}: Excellent
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                {t('sleep.tips.good')}
              </p>
            </div>
          )}
          
          {sleepQuality === 'short' && (
            <div className="border-yellow-500 bg-yellow-50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800 font-medium">
                  {t('sleep.quality')}: Insuffisant
                </span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                {t('sleep.tips.short')}
              </p>
            </div>
          )}
          
          {sleepQuality === 'long' && (
            <div className="border-blue-500 bg-blue-50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium">
                  {t('sleep.quality')}: Long
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                {t('sleep.tips.long')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Informations supplémentaires */}
      {/* SUPPRESSION: Bloc informations supplémentaires (conseil) */}
    </div>
  );
};

export default SleepForm; 