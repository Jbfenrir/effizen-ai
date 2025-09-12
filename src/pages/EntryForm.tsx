import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import SleepForm from '../components/SleepForm';
import FocusForm from '../components/FocusForm';
import TasksForm from '../components/TasksForm';
import WellbeingForm from '../components/WellbeingForm';
import type { DailyEntry, Sleep, Focus, Task, Wellbeing } from '../types';
import { format } from 'date-fns';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const EntryForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [entryDate, setEntryDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Données des formulaires
  const [sleep, setSleep] = useState<Sleep>({
    bedTime: '22:00',
    wakeTime: '07:00',
    insomniaDuration: 0,
    duration: 0,
  });

  const [focus, setFocus] = useState<Focus>({
    morningHours: 0,
    afternoonHours: 0,
    drivingHours: 0,
    fatigue: 3,
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  const [wellbeing, setWellbeing] = useState<Wellbeing>({
    meditationsPauses: { morning: false, noon: false, afternoon: false, evening: false },
    sportLeisureHours: 0,
    socialInteraction: false,
    energy: 50,
  });

  // Charger les données pour la date sélectionnée (stockage local pour la démo)
  useEffect(() => {
    const saved = localStorage.getItem('entry-' + entryDate);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSleep(parsed.sleep || { bedTime: '', wakeTime: '', insomniaDuration: 0, duration: 0 });
      setFocus(parsed.focus || { morningHours: 0, afternoonHours: 0, drivingHours: 0, fatigue: 3 });
      setTasks(parsed.tasks || []);
      setWellbeing(parsed.wellbeing || { meditationsPauses: { morning: false, noon: false, afternoon: false, evening: false }, sportLeisureHours: 0, socialInteraction: false, energy: 50 });
    } else {
      setSleep({ bedTime: '', wakeTime: '', insomniaDuration: 0, duration: 0 });
      setFocus({ morningHours: 0, afternoonHours: 0, drivingHours: 0, fatigue: 3 });
      setTasks([]);
      setWellbeing({ meditationsPauses: { morning: false, noon: false, afternoon: false, evening: false }, sportLeisureHours: 0, socialInteraction: false, energy: 50 });
    }
  }, [entryDate]);

  // Ajouter un toast
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove après durée
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  // Sauvegarder les données pour la date sélectionnée
  const saveData = useCallback(async (showToast = true) => {
    setIsLoading(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      const entry = {
        entry_date: entryDate,
        sleep,
        focus,
        tasks,
        wellbeing,
      };
      localStorage.setItem('entry-' + entryDate, JSON.stringify(entry));
      setLastSaved(new Date());
      if (showToast) {
        addToast({
          type: 'success',
          message: t('notifications.saveSuccess'),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      addToast({
        type: 'error',
        message: t('notifications.saveError'),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sleep, focus, tasks, wellbeing, addToast, t, entryDate]);

  // Calculer le score de bien-être global
  const calculateWellbeingScore = () => {
    // Score sommeil (0-100)
    const sleepScore = isNaN(sleep.duration) ? 0 : Math.min((sleep.duration / 8) * 100, 100);
    
    // Score fatigue (0-100) - inversé
    const fatigueScore = isNaN(focus.fatigue) ? 60 : (5 - focus.fatigue) * 20;
    
    // Score méditations/pauses (0-100)
    const meditPauseCount = wellbeing.meditationsPauses ? [wellbeing.meditationsPauses.morning, wellbeing.meditationsPauses.noon, wellbeing.meditationsPauses.afternoon, wellbeing.meditationsPauses.evening].filter(Boolean).length : 0;
    const meditPauseScore = meditPauseCount * 25;
    
    // Score activité sport/loisir (0-100)
    const activityScore = wellbeing.sportLeisureHours > 0 ? Math.min(wellbeing.sportLeisureHours * 25, 100) : 0;
    
    // Score social (0-100)
    const socialScore = wellbeing.socialInteraction ? 100 : 0;
    
    // Score global
    return Math.round((sleepScore + fatigueScore + meditPauseScore + activityScore + socialScore) / 5);
  };

  const wellbeingScore = calculateWellbeingScore();

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header de la page */}
      <div className="bg-white border-b border-light-gray sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="text-metallic-gray" size={24} />
              <div>
                <h1 className="text-xl font-bold text-dark-blue">
                  Saisie quotidienne
                </h1>
                <p className="text-sm text-metallic-gray">
                  {new Date(entryDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            {/* Sélecteur de date */}
            <input
              type="date"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
              className="form-input ml-4"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            
            <div className="flex items-center space-x-4">
              {/* Score de bien-être */}
              <div className="text-center">
                <div className="text-sm text-metallic-gray">Score Bien-être</div>
                <div className={`text-2xl font-bold ${
                  wellbeingScore >= 80 ? 'text-lime-green' : 
                  wellbeingScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {wellbeingScore}/100
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <button
                onClick={() => saveData(true)}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Indicateur de dernière sauvegarde */}
          {lastSaved && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-metallic-gray">
              <CheckCircle size={14} className="text-lime-green" />
              <span>
                Dernière sauvegarde : {lastSaved.toLocaleTimeString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-8">
            <SleepForm
              key={entryDate + '-sleep'}
              initialData={sleep}
              onChange={setSleep}
              disabled={isLoading}
            />
            
            <FocusForm
              key={entryDate + '-focus'}
              initialData={focus}
              onChange={setFocus}
              disabled={isLoading}
            />
          </div>

          {/* Colonne droite */}
          <div className="space-y-8">
            <TasksForm
              key={entryDate + '-tasks'}
              initialData={tasks}
              onChange={setTasks}
              disabled={isLoading}
            />
            
            <WellbeingForm
              key={entryDate + '-wellbeing'}
              initialData={wellbeing}
              onChange={setWellbeing}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions en bas */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Voir le tableau de bord
          </button>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} flex items-center space-x-2`}
          >
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'warning' && <AlertCircle size={16} />}
            {toast.type === 'info' && <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntryForm; 