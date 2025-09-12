// Types pour le système de conseils intelligent

export interface ExpertiseRule {
  id: string;
  domain: 'psychologie' | 'rps' | 'ergonomie' | 'medecine_douce';
  name: string;
  description: string;
  
  // Conditions de déclenchement
  triggers: RuleTrigger[];
  
  // Période d'analyse selon l'expertise
  analysisPeriodicWeeks: number;
  
  // Niveau de gravité
  severity: 'info' | 'attention' | 'alerte' | 'critique';
  
  // Template de conseil
  advice: AdviceTemplate;
  
  // Niveau de preuve scientifique
  evidenceLevel: 'scientifique' | 'consensus_expert' | 'bonne_pratique';
  
  // Source de l'expertise
  source: string;
}

export interface RuleTrigger {
  metric: string; // 'energy', 'socialInteraction', 'meditationsPauses', etc.
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq';
  value: number | boolean;
  frequency: 'daily' | 'weekly' | 'cumulative'; // Type de fréquence
  threshold: number; // Nombre de jours/semaines
}

export interface AdviceTemplate {
  title: string;
  problem: string; // Diagnostic du problème identifié
  explanation: string; // Pourquoi c'est important (base scientifique)
  actions: ActionableAdvice[]; // Conseils pratiques et concrets
  resources?: Resource[]; // Ressources complémentaires
  medicalDisclaimer?: boolean; // Si nécessite avertissement médical
  followUp: FollowUpStrategy; // Stratégie de suivi
}

export interface ActionableAdvice {
  category: 'immediate' | 'daily' | 'weekly' | 'organizational';
  title: string;
  description: string;
  duration?: string; // ex: "5 minutes", "2 semaines"
  difficulty: 'facile' | 'moyen' | 'difficile';
}

export interface Resource {
  type: 'technique' | 'exercise' | 'reading' | 'external_help';
  title: string;
  description: string;
  url?: string;
  duration?: string;
}

export interface FollowUpStrategy {
  recheckAfterDays: number;
  improvementMetrics: string[]; // Métriques à surveiller pour l'amélioration
  escalationThreshold?: number; // Jours après lesquels escalader
}

export interface UserAnalysis {
  userId: string;
  analysisDate: Date;
  patterns: DataPattern[];
  triggeredRules: TriggeredRule[];
  riskLevel: 'faible' | 'moyen' | 'élevé' | 'critique';
  recommendations: GeneratedAdvice[];
}

export interface DataPattern {
  metric: string;
  period: { start: Date; end: Date };
  trend: 'amélioration' | 'stable' | 'déclin';
  values: number[] | boolean[];
  average?: number;
  concernLevel: 'aucun' | 'faible' | 'moyen' | 'élevé';
  referenceValues?: {
    optimal: string;
    acceptable: string;
    concerning: string;
  };
}

export interface TriggeredRule {
  rule: ExpertiseRule;
  triggerDate: Date;
  matchedConditions: string[];
  confidence: number; // 0-1
}

export interface GeneratedAdvice {
  id: string;
  ruleId: string;
  userId: string;
  generatedAt: Date;
  priority: number; // 1-5, 5 étant le plus urgent
  advice: AdviceTemplate;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  followUpDate?: Date;
}