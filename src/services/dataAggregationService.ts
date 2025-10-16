// Service d'agrégation des données pour vues multi-niveaux
import { supabase } from './supabase';
import type { DailyEntry } from '../types';

export type ViewType = 'personal' | 'team' | 'all';

export interface AggregatedData {
  avgWellbeingScore: number;
  avgSleepScore: number;
  avgEnergyScore: number;
  avgFatigueScore: number;
  avgBreaksScore: number;
  avgOptimizationScore: number;
  totalEntries: number;
  participantsCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Service pour l'agrégation de données selon différents niveaux de vue
 */
export class DataAggregationService {

  /**
   * Récupère les données personnelles de l'utilisateur connecté
   */
  async getPersonalData(userId: string): Promise<DailyEntry[]> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération données personnelles:', error);
      return [];
    }
  }

  /**
   * Récupère les données agrégées d'une équipe (anonymisées)
   */
  async getTeamData(teamId: string): Promise<DailyEntry[]> {
    try {
      // Récupérer tous les membres de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('team', teamId)
        .eq('is_active', true);

      if (membersError) throw membersError;

      if (!teamMembers || teamMembers.length === 0) {
        return [];
      }

      const memberIds = teamMembers.map(m => m.id);

      // Récupérer toutes les entrées des membres de l'équipe
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .in('user_id', memberIds)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération données équipe:', error);
      return [];
    }
  }

  /**
   * Récupère toutes les données (admin uniquement, anonymisées)
   */
  async getAllData(): Promise<DailyEntry[]> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .order('entry_date', { ascending: true});

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération toutes les données:', error);
      return [];
    }
  }

  /**
   * Agrège les données pour une vue (calcule les moyennes)
   */
  aggregateData(entries: DailyEntry[]): AggregatedData {
    if (entries.length === 0) {
      return {
        avgWellbeingScore: 0,
        avgSleepScore: 0,
        avgEnergyScore: 0,
        avgFatigueScore: 0,
        avgBreaksScore: 0,
        avgOptimizationScore: 0,
        totalEntries: 0,
        participantsCount: 0,
        dateRange: { start: '', end: '' }
      };
    }

    // Calculer les scores pour chaque entrée
    const scores = entries.map(entry => ({
      sleep: this.calculateSleepScore(entry.sleep),
      energy: this.calculateEnergyScore(entry.wellbeing),
      fatigue: this.calculateFatigueScore(entry.focus),
      breaks: this.calculateBreaksScore(entry.wellbeing),
      optimization: this.calculateOptimizationScore(entry.tasks, entry.focus)
    }));

    // Calculer les moyennes
    const avgSleepScore = scores.reduce((sum, s) => sum + s.sleep, 0) / scores.length;
    const avgEnergyScore = scores.reduce((sum, s) => sum + s.energy, 0) / scores.length;
    const avgFatigueScore = scores.reduce((sum, s) => sum + s.fatigue, 0) / scores.length;
    const avgBreaksScore = scores.reduce((sum, s) => sum + s.breaks, 0) / scores.length;
    const avgOptimizationScore = scores.reduce((sum, s) => sum + s.optimization, 0) / scores.length;

    const avgWellbeingScore = Math.round(
      (avgSleepScore + avgEnergyScore + avgFatigueScore + avgBreaksScore) / 4
    );

    // Compter les participants uniques
    const uniqueUsers = new Set(entries.map(e => e.user_id));

    // Déterminer la plage de dates
    const dates = entries.map(e => e.entry_date).sort();

    return {
      avgWellbeingScore,
      avgSleepScore: Math.round(avgSleepScore),
      avgEnergyScore: Math.round(avgEnergyScore),
      avgFatigueScore: Math.round(avgFatigueScore),
      avgBreaksScore: Math.round(avgBreaksScore),
      avgOptimizationScore: Math.round(avgOptimizationScore),
      totalEntries: entries.length,
      participantsCount: uniqueUsers.size,
      dateRange: {
        start: dates[0] || '',
        end: dates[dates.length - 1] || ''
      }
    };
  }

  // Fonctions de calcul des scores (identiques à dataAnalytics.ts)

  private calculateSleepScore(sleepData: any): number {
    if (!sleepData || sleepData.duration === undefined) return 0;
    return Math.min((sleepData.duration / 8) * 100, 100);
  }

  private calculateEnergyScore(wellbeingData: any): number {
    if (!wellbeingData || wellbeingData.energy === undefined) return 0;
    return wellbeingData.energy;
  }

  private calculateFatigueScore(focusData: any): number {
    if (!focusData || focusData.fatigue === undefined) return 60;
    return (5 - focusData.fatigue) * 20;
  }

  private calculateBreaksScore(wellbeingData: any): number {
    if (!wellbeingData) return 0;

    let pausesScore = 0;
    if (wellbeingData.meditationsPauses) {
      const pausesCount = [
        wellbeingData.meditationsPauses.morning,
        wellbeingData.meditationsPauses.noon,
        wellbeingData.meditationsPauses.afternoon,
        wellbeingData.meditationsPauses.evening
      ].filter(Boolean).length;
      pausesScore = (pausesCount / 4) * 40;
    }

    let sportScore = 0;
    if (wellbeingData.sportLeisureHours !== undefined) {
      sportScore = Math.min((wellbeingData.sportLeisureHours / 1) * 40, 40);
    }

    let socialScore = 0;
    if (wellbeingData.socialInteraction === true) {
      socialScore = 20;
    }

    return Math.round(pausesScore + sportScore + socialScore);
  }

  private calculateOptimizationScore(tasksData: any[], focusData: any): number {
    if (!tasksData?.length || !focusData) return 0;

    const totalHours = focusData.morningHours + focusData.afternoonHours;
    if (totalHours === 0) return 0;

    const highValueTasks = tasksData.filter((task: any) => task.isHighValue);
    const highValueHours = highValueTasks.reduce((sum: number, task: any) => sum + task.duration, 0);

    const efficiency = (highValueHours / totalHours) * 100;
    const fatigueBonus = Math.max(0, (5 - focusData.fatigue) * 5);

    return Math.min(efficiency + fatigueBonus, 100);
  }
}

export const dataAggregationService = new DataAggregationService();
