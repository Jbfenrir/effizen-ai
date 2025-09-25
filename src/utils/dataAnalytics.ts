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
 * Calcule le score d'équilibre complet (méditations/pauses + sport + social)
 */
const calculateBreaksScore = (wellbeingData: any): number => {
  if (!wellbeingData) return 0;
  
  // Composante 1: Méditations/Pauses (40% du score équilibre)
  let pausesScore = 0;
  if (wellbeingData.meditationsPauses) {
    const pausesCount = [
      wellbeingData.meditationsPauses.morning,
      wellbeingData.meditationsPauses.noon,
      wellbeingData.meditationsPauses.afternoon,
      wellbeingData.meditationsPauses.evening
    ].filter(Boolean).length;
    pausesScore = (pausesCount / 4) * 40; // Max 40 points sur 100
  }
  
  // Composante 2: Sport/Loisirs (40% du score équilibre)
  let sportScore = 0;
  if (wellbeingData.sportLeisureHours !== undefined) {
    // Recommandation OMS : 1h/jour = optimal
    sportScore = Math.min((wellbeingData.sportLeisureHours / 1) * 40, 40);
  }
  
  // Composante 3: Interactions sociales (20% du score équilibre) 
  let socialScore = 0;
  if (wellbeingData.socialInteraction === true) {
    socialScore = 20; // Bonus si interaction sociale présente
  }
  
  return Math.round(pausesScore + sportScore + socialScore);
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

  // Données pour graphique ligne évolution bien-être avec dates JJ/MM
  const wellbeingLineData = filteredEntries.map(entry => {
    const date = new Date(entry.entry_date);
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      Sommeil: Math.round(calculateSleepScore(entry.sleep)),
      Énergie: Math.round(calculateEnergyScore(entry.wellbeing)),
      Fatigue: Math.round(calculateFatigueScore(entry.focus)),
      Pauses: Math.round(calculateBreaksScore(entry.wellbeing))
    };
  });

  // Données pour graphique radar tâches avec regroupement intelligent
  const allTasks: { [key: string]: number } = {};
  let totalTaskTime = 0;

  // Fonction de normalisation des noms de tâches
  const normalizeTaskName = (name: string): string => {
    const normalized = name.toLowerCase()
      .replace(/[\s-_]+/g, ' ') // Normaliser espaces, tirets, underscores
      .trim();
    
    // Dictionnaire de regroupement intelligent
    const groupings: { [key: string]: string } = {
      // Réunions
      'rdv': 'Réunions',
      'rendez vous': 'Réunions', 
      'rendez-vous': 'Réunions',
      'reunion': 'Réunions',
      'réunion': 'Réunions',
      'meeting': 'Réunions',
      // Administration
      'admin': 'Administration',
      'administratif': 'Administration',
      'gestion': 'Administration',
      // Formation - patterns étendus
      'formation': 'Formation',
      'forma': 'Formation',
      'prep forma': 'Formation',
      'prepforma': 'Formation',
      'preparation formation': 'Formation',
      'préparation': 'Formation',
      'cours': 'Formation',
      'apprentissage': 'Formation',
      // Développement
      'dev': 'Développement',
      'developpement': 'Développement',
      'développement': 'Développement',
      'coding': 'Développement',
      'programmation': 'Développement',
      // Communication
      'mail': 'Communication',
      'mails': 'Communication',
      'email': 'Communication',
      'emails': 'Communication',
      'echange': 'Communication',
      'discussion': 'Communication',
      // Recherche
      'recherche': 'Recherche',
      'veille': 'Recherche',
      'analyse': 'Recherche',
      'etude': 'Recherche'
    };
    
    
    // Vérifier si le nom normalisé correspond à une catégorie
    for (const [key, group] of Object.entries(groupings)) {
      if (normalized.includes(key)) {
        return group;
      }
    }
    
    // Si pas de correspondance, capitaliser la première lettre
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  filteredEntries.forEach(entry => {
    if (entry.tasks) {
      entry.tasks.forEach(task => {
        const normalizedName = normalizeTaskName(task.name);
        allTasks[normalizedName] = (allTasks[normalizedName] || 0) + task.duration;
        totalTaskTime += task.duration;
      });
    }
  });

  const tasksRadarData = Object.entries(allTasks)
    .map(([name, duration]) => ({
      subject: name,
      score: Math.round((duration / totalTaskTime) * 100)
    }))
    .filter(task => task.score >= 5) // Réduit à 5% pour plus de détail
    .sort((a, b) => b.score - a.score); // Trier par score décroissant

  // Données pour graphique ligne optimisation avec dates JJ/MM
  const optimizationLineData = filteredEntries.map(entry => {
    const date = new Date(entry.entry_date);
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
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

/**
 * Récupère toutes les entrées depuis Supabase pour l'utilisateur connecté
 */
export const getAllEntriesFromSupabase = async (): Promise<DailyEntry[]> => {
  try {
    // Import dynamique pour éviter les erreurs de build
    const { supabase } = await import('../services/supabase');

    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.warn('Utilisateur non connecté:', userError);
      return [];
    }

    console.log(`🔍 Tentative de récupération des données pour user: ${user.email} (ID: ${user.id})`);

    // CORRECTIF TEMPORAIRE URGENT pour jbgerberon@gmail.com
    // Si l'utilisateur est jbgerberon@gmail.com mais que son user.id ne correspond pas
    // à l'ID utilisé lors de la restauration des données, utiliser l'ID correct
    let targetUserId = user.id;
    if (user.email === 'jbgerberon@gmail.com') {
      targetUserId = '8ac44380-84d5-49a8-b4a0-16f602d0e7d4';
      console.log(`🔧 CORRECTIF: Utilisation de l'UUID correct pour jbgerberon@gmail.com: ${targetUserId}`);
    }

    // Récupérer les entrées de l'utilisateur
    const { data: entries, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', targetUserId)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des entrées:', error);
      console.log('Tentative avec user.id original...', user.id);

      // Fallback: essayer avec l'ID original si le correctif échoue
      const { data: fallbackEntries, error: fallbackError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: true });

      if (fallbackError) {
        console.error('Erreur fallback aussi:', fallbackError);
        return [];
      }

      console.log(`📊 Fallback réussi: ${fallbackEntries?.length || 0} entrées trouvées`);
      return fallbackEntries || [];
    }

    console.log(`📊 Récupération réussie: ${entries?.length || 0} entrées trouvées`);
    return entries || [];
  } catch (error) {
    console.error('Erreur lors de la récupération depuis Supabase:', error);
    return [];
  }
};

/**
 * Fonction universelle pour récupérer les entrées selon l'environnement
 */
export const getAllEntries = async (): Promise<DailyEntry[]> => {
  // TOUJOURS essayer Supabase d'abord (même en localhost)
  // Car les données ont été centralisées dans Supabase
  try {
    const supabaseEntries = await getAllEntriesFromSupabase();
    if (supabaseEntries.length > 0) {
      console.log(`📊 Chargé ${supabaseEntries.length} entrées depuis Supabase`);
      return supabaseEntries;
    }
    console.log('📊 Supabase accessible mais aucune entrée trouvée');
  } catch (error) {
    console.warn('⚠️ Erreur chargement Supabase, fallback localStorage:', error);
  }
  
  // Fallback vers localStorage seulement si Supabase échoue
  console.log('📊 Tentative de chargement depuis localStorage...');
  const localEntries = getAllEntriesFromStorage();
  console.log(`📊 Chargé ${localEntries.length} entrées depuis localStorage`);
  return localEntries;
};