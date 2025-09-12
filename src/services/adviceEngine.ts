import { EXPERTISE_RULES } from './expertiseRules';
import type { 
  UserAnalysis, 
  DataPattern, 
  TriggeredRule, 
  GeneratedAdvice,
  ExpertiseRule,
  RuleTrigger
} from '../types/advice';
import type { DailyEntry } from '../types';

/**
 * Moteur d'analyse et de génération de conseils
 * Analyseur de données historiques basé sur les règles expertes
 */

export class AdviceEngine {
  
  /**
   * Analyse les données d'un utilisateur et génère des conseils personnalisés
   */
  async analyzeUserData(userId: string, entries: DailyEntry[]): Promise<UserAnalysis> {
    const analysisDate = new Date();
    
    // 1. Analyser les patterns dans les données
    const patterns = this.analyzeDataPatterns(entries);
    
    // 2. Évaluer chaque règle experte
    const triggeredRules = this.evaluateExpertiseRules(entries, patterns);
    
    // 3. Calculer le niveau de risque global
    const riskLevel = this.calculateRiskLevel(triggeredRules);
    
    // 4. Générer les conseils recommandés
    const recommendations = this.generateRecommendations(userId, triggeredRules);
    
    return {
      userId,
      analysisDate,
      patterns,
      triggeredRules,
      riskLevel,
      recommendations
    };
  }

  /**
   * Analyse les patterns dans les données historiques
   */
  private analyzeDataPatterns(entries: DailyEntry[]): DataPattern[] {
    const patterns: DataPattern[] = [];
    
    if (entries.length === 0) return patterns;
    
    // Analyser le pattern d'énergie
    const energyValues = entries.map(e => e.focus.fatigue);
    patterns.push(this.createPattern('energy', entries, energyValues));
    
    // Analyser les interactions sociales
    const socialValues = entries.map(e => e.wellbeing.socialInteraction || false);
    patterns.push(this.createBooleanPattern('socialInteraction', entries, socialValues));
    
    // Analyser les heures de travail (somme morning + afternoon)
    const workHours = entries.map(e => e.focus.morningHours + e.focus.afternoonHours);
    patterns.push(this.createPattern('workHours', entries, workHours));
    
    // Analyser les pauses/méditations
    const pausesValues = entries.map(e => {
      const mp = e.wellbeing.meditationsPauses;
      if (!mp) return 0;
      return [mp.morning, mp.noon, mp.afternoon, mp.evening].filter(Boolean).length;
    });
    patterns.push(this.createPattern('meditationsPausesCount', entries, pausesValues));
    
    // Analyser l'activité physique/loisir
    const activityValues = entries.map(e => e.wellbeing.sportLeisureHours || 0);
    patterns.push(this.createPattern('sportLeisureHours', entries, activityValues));
    
    // Analyser le sommeil
    const sleepValues = entries.map(e => e.sleep.duration);
    patterns.push(this.createPattern('sleepDuration', entries, sleepValues));
    
    // Analyser l'optimisation du temps travaillé (Option B: analyse indirecte)
    const highValueRatios = entries.map(e => {
      const totalTaskTime = e.tasks.reduce((sum, task) => sum + task.duration, 0);
      if (totalTaskTime === 0) return 0;
      const highValueTime = e.tasks
        .filter(task => task.isHighValue)
        .reduce((sum, task) => sum + task.duration, 0);
      return highValueTime / totalTaskTime;
    });
    patterns.push(this.createPattern('taskOptimization', entries, highValueRatios));
    
    return patterns.filter(p => p.values.length > 0);
  }

  private createPattern(metric: string, entries: DailyEntry[], values: number[]): DataPattern {
    const validValues = values.filter(v => !isNaN(v) && v !== undefined);
    const average = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
    
    return {
      metric,
      period: {
        start: new Date(entries[0]?.entry_date || Date.now()),
        end: new Date(entries[entries.length - 1]?.entry_date || Date.now())
      },
      trend: this.calculateTrend(metric, validValues),
      values: validValues,
      average,
      concernLevel: this.assessConcernLevel(metric, validValues, average),
      referenceValues: this.getReferenceValues(metric)
    };
  }

  private createBooleanPattern(metric: string, entries: DailyEntry[], values: boolean[]): DataPattern {
    return {
      metric,
      period: {
        start: new Date(entries[0]?.entry_date || Date.now()),
        end: new Date(entries[entries.length - 1]?.entry_date || Date.now())
      },
      trend: 'stable',
      values,
      concernLevel: this.assessBooleanConcernLevel(metric, values),
      referenceValues: this.getReferenceValues(metric)
    };
  }

  private calculateTrend(metric: string, values: number[]): 'amélioration' | 'stable' | 'déclin' {
    if (values.length < 3) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = (secondAvg - firstAvg) / firstAvg;
    
    // Pour certaines métriques, une augmentation est positive, pour d'autres négative
    const isPositiveMetric = ['energy', 'sleepDuration', 'meditationsPausesCount', 'sportLeisureHours', 'taskOptimization'].includes(metric);
    const isNegativeMetric = ['workHours'].includes(metric);
    
    if (isPositiveMetric) {
      if (diff > 0.1) return 'amélioration';
      if (diff < -0.1) return 'déclin';
    } else if (isNegativeMetric) {
      if (diff > 0.1) return 'déclin';
      if (diff < -0.1) return 'amélioration';
    }
    
    return 'stable';
  }

  private assessConcernLevel(metric: string, values: number[], average: number): 'aucun' | 'faible' | 'moyen' | 'élevé' {
    switch (metric) {
      case 'energy':
        // Plus l'énergie est élevée, mieux c'est (échelle 1-5)
        if (average >= 4) return 'aucun';        // 4-5: Très bon niveau d'énergie
        if (average >= 3) return 'faible';       // 3-3.99: Niveau correct
        if (average >= 2) return 'moyen';        // 2-2.99: Attention requise
        return 'élevé';                          // <2: Fatigue préoccupante
      
      case 'workHours':
        // Moins d'heures travaillées est mieux (recommandations ergonomiques)
        if (average <= 7) return 'aucun';        // ≤7h: Charge de travail saine
        if (average <= 8) return 'faible';       // 7.01-8h: Acceptable
        if (average <= 9) return 'moyen';        // 8.01-9h: Zone d'attention
        return 'élevé';                          // >9h: Surcharge préoccupante
      
      case 'sleepDuration':
        // 7-9h est optimal selon les expertises du sommeil
        if (average >= 7 && average <= 9) return 'aucun';     // 7-9h: Durée optimale
        if (average >= 6.5 && average < 7) return 'faible';    // 6.5-6.99h: Légèrement insuffisant
        if (average > 9 && average <= 9.5) return 'faible';    // 9.01-9.5h: Légèrement excessif
        if (average >= 6 && average < 6.5) return 'moyen';     // 6-6.49h: Insuffisant
        if (average > 9.5 && average <= 10) return 'moyen';    // 9.51-10h: Excessif
        return 'élevé';                                         // <6h ou >10h: Très préoccupant
      
      case 'meditationsPausesCount':
        // Plus de pauses est mieux (recommandations ergonomiques)
        if (average >= 3) return 'aucun';        // ≥3: Excellent rythme de pauses
        if (average >= 2) return 'faible';       // 2-2.99: Rythme correct
        if (average >= 1) return 'moyen';        // 1-1.99: Insuffisant
        return 'élevé';                          // <1: Très préoccupant
      
      case 'sportLeisureHours':
        // Plus d'activité est mieux (recommandation OMS: minimum 1h/jour)
        if (average >= 1) return 'aucun';        // ≥1h: Niveau recommandé atteint
        if (average >= 0.5) return 'faible';     // 0.5-0.99h: Sous les recommandations
        if (average >= 0.25) return 'moyen';     // 0.25-0.49h: Très insuffisant
        return 'élevé';                          // <0.25h: Sédentarité préoccupante
      
      case 'taskOptimization':
        // Plus de temps sur tâches à haute valeur est mieux (approche temporelle)
        if (average >= 0.7) return 'aucun';     // ≥70%: Excellente optimisation
        if (average >= 0.5) return 'faible';    // 50-69.99%: Bonne optimisation
        if (average >= 0.3) return 'moyen';     // 30-49.99%: Optimisation insuffisante
        return 'élevé';                         // <30%: Dispersion critique
      
      default:
        return 'faible';
    }
  }

  private assessBooleanConcernLevel(metric: string, values: boolean[]): 'aucun' | 'faible' | 'moyen' | 'élevé' {
    if (metric === 'socialInteraction') {
      const trueCount = values.filter(v => v === true).length;
      const ratio = trueCount / values.length;
      
      // Plus d'interactions sociales est mieux
      if (ratio >= 0.7) return 'aucun';
      if (ratio >= 0.4) return 'faible';
      if (ratio >= 0.2) return 'moyen';
      return 'élevé';
    }
    
    return 'faible';
  }

  /**
   * Évalue toutes les règles expertes contre les données
   */
  private evaluateExpertiseRules(entries: DailyEntry[], patterns: DataPattern[]): TriggeredRule[] {
    const triggeredRules: TriggeredRule[] = [];
    
    for (const rule of EXPERTISE_RULES) {
      const evaluation = this.evaluateRule(rule, entries, patterns);
      if (evaluation.confidence > 0.7) {
        triggeredRules.push(evaluation);
      }
    }
    
    return triggeredRules.sort((a, b) => b.confidence - a.confidence);
  }

  private evaluateRule(rule: ExpertiseRule, entries: DailyEntry[], patterns: DataPattern[]): TriggeredRule {
    let matchedConditions: string[] = [];
    let totalConditions = rule.triggers.length;
    
    for (const trigger of rule.triggers) {
      if (this.evaluateTrigger(trigger, entries, patterns)) {
        matchedConditions.push(`${trigger.metric} ${trigger.operator} ${trigger.value}`);
      }
    }
    
    const confidence = matchedConditions.length / totalConditions;
    
    return {
      rule,
      triggerDate: new Date(),
      matchedConditions,
      confidence
    };
  }

  private evaluateTrigger(trigger: RuleTrigger, entries: DailyEntry[], patterns: DataPattern[]): boolean {
    // Récupérer les données pour la métrique
    const pattern = patterns.find(p => p.metric === trigger.metric);
    if (!pattern) return false;
    
    const values = pattern.values;
    
    // Appliquer la logique selon le type de fréquence
    switch (trigger.frequency) {
      case 'daily':
        return this.evaluateDailyTrigger(trigger, values as number[] | boolean[]);
      
      case 'weekly':
        return this.evaluateWeeklyTrigger(trigger, values as number[]);
      
      case 'cumulative':
        return this.evaluateCumulativeTrigger(trigger, values as number[]);
      
      default:
        return false;
    }
  }

  private evaluateDailyTrigger(trigger: RuleTrigger, values: number[] | boolean[]): boolean {
    if (values.length < trigger.threshold) return false;
    
    // Prendre les X derniers jours (threshold)
    const recentValues = values.slice(-trigger.threshold);
    
    // Vérifier que la condition est respectée sur tous les jours récents
    return recentValues.every(value => this.checkCondition(value, trigger.operator, trigger.value));
  }

  private evaluateWeeklyTrigger(trigger: RuleTrigger, values: number[]): boolean {
    // Pour les déclencheurs hebdomadaires, grouper par semaines et vérifier
    const weeksToCheck = trigger.threshold;
    const daysPerWeek = 7;
    const totalDaysNeeded = weeksToCheck * daysPerWeek;
    
    if (values.length < totalDaysNeeded) return false;
    
    const recentValues = values.slice(-totalDaysNeeded);
    
    // Grouper par semaines et vérifier chaque semaine
    for (let week = 0; week < weeksToCheck; week++) {
      const weekStart = week * daysPerWeek;
      const weekEnd = (week + 1) * daysPerWeek;
      const weekValues = recentValues.slice(weekStart, weekEnd);
      
      const weeklyTotal = weekValues.reduce((sum, val) => sum + val, 0);
      if (!this.checkCondition(weeklyTotal, trigger.operator, trigger.value)) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateCumulativeTrigger(trigger: RuleTrigger, values: number[]): boolean {
    const total = values.reduce((sum, val) => sum + val, 0);
    return this.checkCondition(total, trigger.operator, trigger.value);
  }

  private checkCondition(actualValue: number | boolean, operator: string, expectedValue: number | boolean): boolean {
    switch (operator) {
      case 'lt': return Number(actualValue) < Number(expectedValue);
      case 'lte': return Number(actualValue) <= Number(expectedValue);
      case 'gt': return Number(actualValue) > Number(expectedValue);
      case 'gte': return Number(actualValue) >= Number(expectedValue);
      case 'eq': return actualValue === expectedValue;
      case 'neq': return actualValue !== expectedValue;
      default: return false;
    }
  }

  private calculateRiskLevel(triggeredRules: TriggeredRule[]): 'faible' | 'moyen' | 'élevé' | 'critique' {
    if (triggeredRules.length === 0) return 'faible';
    
    const criticalRules = triggeredRules.filter(r => r.rule.severity === 'critique');
    const alertRules = triggeredRules.filter(r => r.rule.severity === 'alerte');
    
    if (criticalRules.length > 0) return 'critique';
    if (alertRules.length >= 2) return 'élevé';
    if (alertRules.length >= 1 || triggeredRules.length >= 3) return 'moyen';
    
    return 'faible';
  }

  private getReferenceValues(metric: string): { optimal: string; acceptable: string; concerning: string } {
    const references = {
      energy: {
        optimal: '≥4 (Énergie excellente)',
        acceptable: '3-3.99 (Énergie correcte)',
        concerning: '<2 (Fatigue préoccupante)'
      },
      workHours: {
        optimal: '≤7h/jour (Charge saine)',
        acceptable: '7.01-8h/jour (Acceptable)',
        concerning: '>9h/jour (Surcharge)'
      },
      sleepDuration: {
        optimal: '7-9h/nuit (Durée idéale)',
        acceptable: '6.5-6.99h ou 9.01-9.5h (Acceptable)',
        concerning: '<6h ou >10h (Très préoccupant)'
      },
      meditationsPausesCount: {
        optimal: '≥3 pauses/jour (Excellent)',
        acceptable: '2-2.99 pauses/jour (Correct)',
        concerning: '<1 pause/jour (Très insuffisant)'
      },
      sportLeisureHours: {
        optimal: '≥1h/jour (Recommandation OMS)',
        acceptable: '0.5-0.99h/jour (Sous-optimal)',
        concerning: '<0.25h/jour (Sédentarité)'
      },
      socialInteraction: {
        optimal: '>70% des jours (Très social)',
        acceptable: '40-70% des jours (Moyen)',
        concerning: '<20% des jours (Isolement)'
      },
      taskOptimization: {
        optimal: '≥70% (Excellente optimisation)',
        acceptable: '50-69.99% (Bonne optimisation)',
        concerning: '<30% (Dispersion critique)'
      }
    };
    
    return references[metric] || {
      optimal: 'Non défini',
      acceptable: 'Non défini',
      concerning: 'Non défini'
    };
  }

  private generateRecommendations(userId: string, triggeredRules: TriggeredRule[]): GeneratedAdvice[] {
    const recommendations: GeneratedAdvice[] = [];
    
    // Prioriser les règles par sévérité et confiance
    const sortedRules = triggeredRules.sort((a, b) => {
      const severityOrder = { 'critique': 4, 'alerte': 3, 'attention': 2, 'info': 1 };
      const aSeverity = severityOrder[a.rule.severity];
      const bSeverity = severityOrder[b.rule.severity];
      
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return b.confidence - a.confidence;
    });
    
    // Générer max 5 conseils pour éviter la surcharge
    const topRules = sortedRules.slice(0, 5);
    
    for (let i = 0; i < topRules.length; i++) {
      const rule = topRules[i];
      recommendations.push({
        id: `advice_${userId}_${rule.rule.id}_${Date.now()}`,
        ruleId: rule.rule.id,
        userId,
        generatedAt: new Date(),
        priority: 5 - i, // Plus prioritaire = numéro plus élevé
        advice: rule.rule.advice,
        status: 'active',
        followUpDate: new Date(Date.now() + rule.rule.advice.followUp.recheckAfterDays * 24 * 60 * 60 * 1000)
      });
    }
    
    return recommendations;
  }
}

// Instance singleton pour l'application
export const adviceEngine = new AdviceEngine();