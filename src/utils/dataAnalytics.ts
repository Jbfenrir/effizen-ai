import type { DailyEntry } from '../types';
import { filterEntriesByDateRange, type DateRange } from './dateUtils';

/**
 * Interface pour les données analytiques calculées
 */
export interface AnalyticsData {
  wellbeingScore: number;
  sleepScore: number;
  energyScore: number;
  fatigueScore: number;
  breaksScore: number;
  optimizationScore: number;
  wellbeingRadarData: Array<{ subject: string; score: number }>;
  wellbeingLineData: Array<{ date: string; Sommeil: number; Énergie: number; Fatigue: number; Pauses: number }>;
  tasksRadarData: Array<{ subject: string; score: number }>;
  optimizationLineData: Array<{ date: string; Optimisation: number }>;
  dataAvailable: boolean;
  daysWithData: number;
}

/**
 * Calcule le score de sommeil à partir des données d'entrée
 */
const calculateSleepScore = (sleepData: any): number => {
  if (!sleepData || sleepData.duration === undefined) return 0;
  // Score basé sur 8h recommandées
  return Math.min((sleepData.duration / 8) * 100, 100);
};

/**
 * Calcule le score d'énergie à partir des données de bien-être
 */
const calculateEnergyScore = (wellbeingData: any): number => {
  if (!wellbeingData || wellbeingData.energy === undefined) return 0;
  return wellbeingData.energy;
};

/**
 * Calcule le score de fatigue (inversé, moins de fatigue = meilleur score)
 */
const calculateFatigueScore = (focusData: any): number => {
  if (!focusData || focusData.fatigue === undefined) return 60;
  return (5 - focusData.fatigue) * 20;
};

/**
 * Calcule le score des pauses
 */
const calculateBreaksScore = (wellbeingData: any): number => {
  if (!wellbeingData?.breaks) return 0;
  const breaksCount = [
    wellbeingData.breaks.am,
    wellbeingData.breaks.noon,
    wellbeingData.breaks.pm
  ].filter(Boolean).length;
  return breaksCount * 33.33;
};

/**
 * Calcule le score d'optimisation du temps (productivité)
 */
const calculateOptimizationScore = (tasksData: any[], focusData: any): number => {
  if (!tasksData?.length || !focusData) return 0;
  
  // Calcul basé sur les tâches à haute valeur et les heures de focus
  const totalHours = focusData.morningHours + focusData.afternoonHours;
  if (totalHours === 0) return 0;
  
  const highValueTasks = tasksData.filter((task: any) => task.isHighValue);
  const highValueHours = highValueTasks.reduce((sum, task) => sum + task.duration, 0);
  
  // Pourcentage de temps sur tâches à haute valeur + bonus anti-fatigue
  const efficiency = (highValueHours / totalHours) * 100;
  const fatigueBonus = Math.max(0, (5 - focusData.fatigue) * 5);
  
  return Math.min(efficiency + fatigueBonus, 100);
};

/**
 * Calcule les données analytiques pour une période donnée
 */
export const calculateAnalyticsForPeriod = (
  entries: DailyEntry[],
  dateRange: DateRange
): AnalyticsData => {
  // Filtrer les entrées par période
  const filteredEntries = filterEntriesByDateRange(entries, dateRange);
  
  if (filteredEntries.length === 0) {
    return {
      wellbeingScore: 0,
      sleepScore: 0,
      energyScore: 0,
      fatigueScore: 0,
      breaksScore: 0,
      optimizationScore: 0,
      wellbeingRadarData: [],
      wellbeingLineData: [],
      tasksRadarData: [],
      optimizationLineData: [],
      dataAvailable: false,
      daysWithData: 0
    };
  }

  // Calculer les scores moyens (uniquement sur les jours avec données)
  const scores = filteredEntries.map(entry => ({
    sleep: calculateSleepScore(entry.sleep),
    energy: calculateEnergyScore(entry.wellbeing),
    fatigue: calculateFatigueScore(entry.focus),
    breaks: calculateBreaksScore(entry.wellbeing),
    optimization: calculateOptimizationScore(entry.tasks, entry.focus)
  }));

  const avgSleepScore = scores.reduce((sum, s) => sum + s.sleep, 0) / scores.length;
  const avgEnergyScore = scores.reduce((sum, s) => sum + s.energy, 0) / scores.length;
  const avgFatigueScore = scores.reduce((sum, s) => sum + s.fatigue, 0) / scores.length;
  const avgBreaksScore = scores.reduce((sum, s) => sum + s.breaks, 0) / scores.length;
  const avgOptimizationScore = scores.reduce((sum, s) => sum + s.optimization, 0) / scores.length;

  // Score bien-être global
  const wellbeingScore = Math.round(
    (avgSleepScore + avgEnergyScore + avgFatigueScore + avgBreaksScore) / 4
  );

  // Données pour graphique radar bien-être
  const wellbeingRadarData = [
    { subject: 'Sommeil', score: Math.round(avgSleepScore) },
    { subject: 'Énergie', score: Math.round(avgEnergyScore) },
    { subject: 'Fatigue', score: Math.round(avgFatigueScore) },
    { subject: 'Pauses', score: Math.round(avgBreaksScore) }
  ];

  // Données pour graphique ligne évolution bien-être
  const wellbeingLineData = filteredEntries.map(entry => {
    const date = new Date(entry.entry_date).toLocaleDateString('fr-FR', { 
      weekday: 'short' 
    });
    return {
      date: date.charAt(0).toUpperCase() + date.slice(1),
      Sommeil: Math.round(calculateSleepScore(entry.sleep)),
      Énergie: Math.round(calculateEnergyScore(entry.wellbeing)),
      Fatigue: Math.round(calculateFatigueScore(entry.focus)),
      Pauses: Math.round(calculateBreaksScore(entry.wellbeing))
    };
  });

  // Données pour graphique radar tâches (>20% du temps)
  const allTasks: { [key: string]: number } = {};
  let totalTaskTime = 0;

  filteredEntries.forEach(entry => {
    if (entry.tasks) {
      entry.tasks.forEach(task => {
        allTasks[task.name] = (allTasks[task.name] || 0) + task.duration;
        totalTaskTime += task.duration;
      });
    }
  });

  const tasksRadarData = Object.entries(allTasks)
    .map(([name, duration]) => ({
      subject: name,
      score: Math.round((duration / totalTaskTime) * 100)
    }))
    .filter(task => task.score >= 20);

  // Données pour graphique ligne optimisation
  const optimizationLineData = filteredEntries.map(entry => {
    const date = new Date(entry.entry_date).toLocaleDateString('fr-FR', { 
      weekday: 'short' 
    });
    return {
      date: date.charAt(0).toUpperCase() + date.slice(1),
      Optimisation: Math.round(calculateOptimizationScore(entry.tasks, entry.focus))
    };
  });

  return {
    wellbeingScore,
    sleepScore: Math.round(avgSleepScore),
    energyScore: Math.round(avgEnergyScore),
    fatigueScore: Math.round(avgFatigueScore),
    breaksScore: Math.round(avgBreaksScore),
    optimizationScore: Math.round(avgOptimizationScore),
    wellbeingRadarData,
    wellbeingLineData,
    tasksRadarData,
    optimizationLineData,
    dataAvailable: true,
    daysWithData: filteredEntries.length
  };
};

/**
 * Récupère toutes les entrées depuis le localStorage
 */
export const getAllEntriesFromStorage = (): DailyEntry[] => {
  const entries: DailyEntry[] = [];
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('entry-')) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        if (entry.entry_date) {
          entries.push(entry);
        }
      } catch (error) {
        console.warn('Erreur lors du parsing de l\'entrée:', key, error);
      }
    }
  });

  // Trier par date
  return entries.sort((a, b) => 
    new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );
};