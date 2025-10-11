import i18n from '../i18n';
import { adviceEngine } from '../services/adviceEngine';
import type { DailyEntry } from '../types';
import type { AnalyticsData } from './dataAnalytics';

export interface SmartAdvice {
  diagnosis: string;
  recommendation: string;
  color: string;
  icon: string;
  category: 'health' | 'organization'; // Santé ou Organisation
  scientificSources?: string[]; // Sources scientifiques
  learnMoreUrl?: string; // URL pour en savoir plus (assistant)
}

export interface AdvicePair {
  health: SmartAdvice;
  organization: SmartAdvice;
}

// Traductions des conseils IA
const adviceTranslations = {
  en: {
    noData: {
      diagnosis: "No data available for this period.",
      recommendation: "Start by entering your daily information to receive personalized advice based on our workplace well-being expertise."
    },
    lowSleep: {
      diagnosis: "Behavioral analysis: Major deficit detected on 'Sleep' with impact on 'Energy' levels.",
      recommendation: "• Immediate priority: 4-7-8 breathing technique before bedtime\n• Organize: Sleep ritual 30 minutes before (no screens, herbal tea, reading)\n• Medium term: Regular times + bedroom at 19°C max\n• Technique: Body scan meditation for rapid falling asleep"
    },
    lowEnergy: {
      diagnosis: "Behavioral analysis: Energy level below critical threshold impacting overall productivity.",
      recommendation: "• Micro-breaks: 5 minutes every hour (look away, walk)\n• Pomodoro technique: 25 min focused work + 5 min break\n• Energy nutrition: Complex carbs + proteins at breakfast\n• Avoid energy dips: No heavy meals at lunch"
    },
    poorBalance: {
      diagnosis: "Behavioral analysis: Imbalance between efforts and recovery periods, burnout risk.",
      recommendation: "• Morning ritual: 5 min meditation or breathing\n• Active breaks: Walk outside at lunch\n• Social: One positive interaction per day minimum\n• Evening: Complete disconnection after 8 PM"
    },
    lowOptimization: {
      diagnosis: "Behavioral analysis: Time spent on low-value tasks, dispersion on secondary activities.",
      recommendation: "• Eisenhower matrix: Urgent/Important to prioritize\n• Time blocking: Dedicated slots for high-value tasks\n• Delegation: Identify what can be automated/delegated\n• Morning focus: Most important task before 11 AM"
    },
    excellent: {
      diagnosis: "Behavioral analysis: Excellent overall balance with optimal performance maintained.",
      recommendation: "• Continue your good habits to maintain this balance\n• Share your best practices with your team\n• Experiment with advanced optimization techniques\n• Monitor early warning signals to prevent decline"
    },
    healthGood: {
      diagnosis: "Health analysis: Your well-being indicators are excellent.",
      recommendation: "Your sleep, energy, and breaks are optimal. Keep up these good habits that allow you to maintain your health and vitality at work."
    },
    organizationGood: {
      diagnosis: "Organization analysis: Your time management is excellent.",
      recommendation: "You dedicate most of your time to high-value tasks. Continue with this prioritization strategy that maximizes your impact."
    }
  },
  fr: {
    noData: {
      diagnosis: "Aucune donnée disponible pour cette période.",
      recommendation: "Commencez par saisir vos informations quotidiennes pour recevoir des conseils personnalisés basés sur nos expertises en bien-être au travail."
    },
    lowSleep: {
      diagnosis: "Analyse comportementale : Déficit principal détecté sur 'Sommeil' avec impact secondaire sur 'Énergie'.",
      recommendation: "• Priorité immédiate : Technique 4-7-8 de respiration avant sommeil\n• Organiser : Rituel sommeil 30min avant (pas d'écrans, tisane, lecture)\n• Moyen terme : Heures régulières + chambre à 19°C max\n• Technique : Méditation body scan pour endormissement rapide"
    },
    lowEnergy: {
      diagnosis: "Analyse comportementale : Niveau d'énergie sous le seuil critique impactant la productivité globale.",
      recommendation: "• Micro-pauses : 5 minutes toutes les heures (regarder au loin, marcher)\n• Technique Pomodoro : 25 min travail concentré + 5 min pause\n• Nutrition énergie : Glucides complexes + protéines au petit-déjeuner\n• Éviter les baisses : Pas de repas lourd le midi"
    },
    poorBalance: {
      diagnosis: "Analyse comportementale : Déséquilibre entre efforts fournis et périodes de récupération, risque de burnout.",
      recommendation: "• Rituel matinal : 5 min méditation ou respiration\n• Pauses actives : Marche extérieure le midi\n• Social : Une interaction positive par jour minimum\n• Soirée : Déconnexion totale après 20h"
    },
    lowOptimization: {
      diagnosis: "Analyse comportementale : Temps consacré aux tâches à faible valeur ajoutée, dispersion sur activités secondaires.",
      recommendation: "• Matrice Eisenhower : Urgent/Important pour prioriser\n• Time blocking : Créneaux dédiés aux tâches haute valeur\n• Délégation : Identifier ce qui peut être automatisé/délégué\n• Focus matinal : Tâche la plus importante avant 11h"
    },
    excellent: {
      diagnosis: "Analyse comportementale : Excellent équilibre général avec performance optimale maintenue.",
      recommendation: "• Continuez vos bonnes habitudes pour maintenir cet équilibre\n• Partagez vos meilleures pratiques avec votre équipe\n• Expérimentez des techniques d'optimisation avancées\n• Surveillez les signaux faibles pour prévenir toute baisse"
    },
    healthGood: {
      diagnosis: "Analyse santé : Vos indicateurs de bien-être sont excellents.",
      recommendation: "Votre sommeil, votre énergie et vos pauses sont optimaux. Continuez ces bonnes habitudes qui vous permettent de maintenir votre santé et votre vitalité au travail."
    },
    organizationGood: {
      diagnosis: "Analyse organisation : Votre gestion du temps est excellente.",
      recommendation: "Vous consacrez la majorité de votre temps aux tâches à forte valeur ajoutée. Poursuivez cette stratégie de priorisation qui maximise votre impact."
    }
  }
};

/**
 * Générateur de paire de conseils (Santé + Organisation)
 */
export const generateAdvicePair = async (
  entries: DailyEntry[],
  analytics: AnalyticsData
): Promise<AdvicePair> => {
  // Forcer la langue basée sur i18n.language, avec fallback sur 'fr'
  const detectedLang = i18n.language || 'fr';
  const lang = (detectedLang.startsWith('fr') ? 'fr' : detectedLang.startsWith('en') ? 'en' : 'fr') as 'en' | 'fr';
  console.log('🌍 generateAdvicePair - Langue détectée:', i18n.language, '→ Langue utilisée:', lang);
  const translations = adviceTranslations[lang] || adviceTranslations.fr;

  // Si pas de données, conseils par défaut
  if (!analytics.dataAvailable) {
    return {
      health: {
        diagnosis: translations.noData.diagnosis,
        recommendation: translations.noData.recommendation,
        color: 'bg-blue-100 border-l-4 border-blue-500',
        icon: '📊',
        category: 'health',
        learnMoreUrl: '/assistant'
      },
      organization: {
        diagnosis: translations.noData.diagnosis,
        recommendation: translations.noData.recommendation,
        color: 'bg-blue-100 border-l-4 border-blue-500',
        icon: '📊',
        category: 'organization',
        learnMoreUrl: '/assistant'
      }
    };
  }

  return generateAdvicePairFallback(analytics, lang);
};

/**
 * LEGACY: Générateur de conseils intelligent avec traduction (garde pour compatibilité)
 */
export const generateSmartAdvice = async (
  entries: DailyEntry[],
  analytics: AnalyticsData
): Promise<SmartAdvice> => {

  const lang = i18n.language as 'en' | 'fr';
  const translations = adviceTranslations[lang] || adviceTranslations.fr;

  // Si pas de données, conseil par défaut
  if (!analytics.dataAvailable) {
    return {
      diagnosis: translations.noData.diagnosis,
      recommendation: translations.noData.recommendation,
      color: 'bg-blue-100 border-l-4 border-blue-500',
      icon: '📊',
      category: 'organization',
      learnMoreUrl: '/assistant'
    };
  }

  try {
    // Essayer d'utiliser le moteur de conseils avancé
    const expertAdvice = await adviceEngine.generateExpertAdvice(entries);

    if (expertAdvice && expertAdvice.diagnosis && expertAdvice.recommendation) {
      // Traduire les conseils du moteur si nécessaire
      // Pour l'instant, on garde les conseils du moteur tels quels
      // car ils devraient déjà être dans la bonne langue
      return {
        diagnosis: expertAdvice.diagnosis,
        recommendation: expertAdvice.recommendation,
        color: expertAdvice.color || 'bg-yellow-100 border-l-4 border-yellow-500',
        icon: expertAdvice.icon || '💡',
        category: (expertAdvice as any).category || 'health',
        scientificSources: (expertAdvice as any).scientificSources || [],
        learnMoreUrl: '/assistant'
      };
    }
  } catch (error) {
    console.warn('Erreur génération conseils experts, utilisation fallback:', error);
  }

  // Fallback vers conseils de base traduits
  return generateEnhancedFallbackAdvice(analytics, lang);
};

/**
 * Génération de conseils améliorés avec format expert (traduits)
 */
const generateEnhancedFallbackAdvice = (analytics: AnalyticsData, lang: 'en' | 'fr' = 'fr'): SmartAdvice => {
  const { wellbeingScore, sleepScore, energyScore, breaksScore, optimizationScore } = analytics;
  const translations = adviceTranslations[lang] || adviceTranslations.fr;

  // Identifier le domaine le plus problématique
  const scores = [
    { domain: 'sleep', score: sleepScore },
    { domain: 'energy', score: energyScore },
    { domain: 'balance', score: breaksScore },
    { domain: 'optimization', score: optimizationScore }
  ];

  const lowestScore = Math.min(...scores.map(s => s.score));
  const criticalDomain = scores.find(s => s.score === lowestScore);

  // Si tout est excellent (>= 80)
  if (wellbeingScore >= 80 && optimizationScore >= 70) {
    return {
      ...translations.excellent,
      color: 'bg-green-100 border-l-4 border-green-500',
      icon: '🌟',
      category: 'organization',
      scientificSources: [
        'Bakker & Demerouti (2017) - Job Demands-Resources Theory',
        'Fredrickson (2001) - Broaden-and-build theory of positive emotions'
      ],
      learnMoreUrl: '/assistant'
    };
  }

  // Conseils basés sur le domaine critique
  if (criticalDomain) {
    switch (criticalDomain.domain) {
      case 'sleep':
        if (sleepScore < 50) {
          return {
            ...translations.lowSleep,
            color: 'bg-purple-100 border-l-4 border-purple-500',
            icon: '😴',
            category: 'health',
            scientificSources: [
              'Walker, M. (2017) - Why We Sleep: Unlocking the Power of Sleep and Dreams',
              'National Sleep Foundation (2015) - Sleep Duration Recommendations',
              'Harvard Medical School (2019) - Sleep and Mental Health'
            ],
            learnMoreUrl: '/assistant'
          };
        }
        break;

      case 'energy':
        if (energyScore < 50) {
          return {
            ...translations.lowEnergy,
            color: 'bg-blue-100 border-l-4 border-blue-500',
            icon: '⚡',
            category: 'health',
            scientificSources: [
              'Cirillo, F. (2006) - The Pomodoro Technique',
              'Loehr & Schwartz (2003) - The Power of Full Engagement',
              'WHO (2020) - Physical activity guidelines'
            ],
            learnMoreUrl: '/assistant'
          };
        }
        break;

      case 'balance':
        if (breaksScore < 50) {
          return {
            ...translations.poorBalance,
            color: 'bg-teal-100 border-l-4 border-teal-500',
            icon: '⚖️',
            category: 'health',
            scientificSources: [
              'Maslach & Leiter (2016) - Understanding Burnout',
              'Kabat-Zinn (1990) - Full Catastrophe Living: Using Mindfulness',
              'APA (2019) - Stress in the Workplace'
            ],
            learnMoreUrl: '/assistant'
          };
        }
        break;

      case 'optimization':
        if (optimizationScore < 50) {
          return {
            ...translations.lowOptimization,
            color: 'bg-orange-100 border-l-4 border-orange-500',
            icon: '🎯',
            category: 'organization',
            scientificSources: [
              'Eisenhower, D. (1954) - Eisenhower Matrix',
              'Newport, C. (2016) - Deep Work: Rules for Focused Success',
              'Allen, D. (2001) - Getting Things Done: The Art of Stress-Free Productivity'
            ],
            learnMoreUrl: '/assistant'
          };
        }
        break;
    }
  }

  // Conseil générique si aucun cas spécifique
  return {
    diagnosis: lang === 'en'
      ? `Behavioral analysis: Overall well-being at ${wellbeingScore}%. Areas for improvement identified.`
      : `Analyse comportementale : Bien-être global à ${wellbeingScore}%. Des axes d'amélioration identifiés.`,
    recommendation: lang === 'en'
      ? `• Priority: Focus on the lowest score area\n• Method: Apply one technique at a time\n• Tracking: Note your progress daily\n• Support: Consult a professional if symptoms persist`
      : `• Priorité : Focus sur le domaine au score le plus faible\n• Méthode : Appliquer une technique à la fois\n• Suivi : Noter vos progrès quotidiennement\n• Support : Consulter un professionnel si les symptômes persistent`,
    color: 'bg-yellow-100 border-l-4 border-yellow-500',
    icon: '💡',
    category: 'health',
    scientificSources: [
      'Seligman, M. (2011) - Flourish: A Visionary New Understanding of Happiness',
      'Deci & Ryan (2000) - Self-Determination Theory'
    ],
    learnMoreUrl: '/assistant'
  };
};

/**
 * Génération de paire de conseils (Santé + Organisation) - Fallback
 */
const generateAdvicePairFallback = (analytics: AnalyticsData, lang: 'en' | 'fr' = 'fr'): AdvicePair => {
  const { sleepScore, energyScore, breaksScore, optimizationScore } = analytics;
  const translations = adviceTranslations[lang] || adviceTranslations.fr;

  // Calcul score santé (moyenne sommeil, énergie, pauses)
  const healthScore = (sleepScore + energyScore + breaksScore) / 3;

  // CONSEIL SANTÉ
  let healthAdvice: SmartAdvice;
  if (healthScore >= 70) {
    // Santé excellente
    healthAdvice = {
      ...translations.healthGood,
      color: 'bg-green-100 border-l-4 border-green-500',
      icon: '💚',
      category: 'health',
      scientificSources: [
        'WHO (2020) - Guidelines on physical activity and sedentary behaviour',
        'Walker, M. (2017) - Why We Sleep'
      ],
      learnMoreUrl: '/assistant'
    };
  } else {
    // Trouver le problème santé principal
    const healthScores = [
      { domain: 'sleep', score: sleepScore },
      { domain: 'energy', score: energyScore },
      { domain: 'balance', score: breaksScore }
    ];
    const lowestHealthScore = Math.min(...healthScores.map(s => s.score));
    const criticalHealthDomain = healthScores.find(s => s.score === lowestHealthScore);

    switch (criticalHealthDomain?.domain) {
      case 'sleep':
        healthAdvice = {
          ...translations.lowSleep,
          color: 'bg-purple-100 border-l-4 border-purple-500',
          icon: '😴',
          category: 'health',
          scientificSources: [
            'Walker, M. (2017) - Why We Sleep: Unlocking the Power of Sleep and Dreams',
            'National Sleep Foundation (2015) - Sleep Duration Recommendations',
            'Harvard Medical School (2019) - Sleep and Mental Health'
          ],
          learnMoreUrl: '/assistant'
        };
        break;
      case 'energy':
        healthAdvice = {
          ...translations.lowEnergy,
          color: 'bg-blue-100 border-l-4 border-blue-500',
          icon: '⚡',
          category: 'health',
          scientificSources: [
            'Cirillo, F. (2006) - The Pomodoro Technique',
            'Loehr & Schwartz (2003) - The Power of Full Engagement',
            'WHO (2020) - Physical activity guidelines'
          ],
          learnMoreUrl: '/assistant'
        };
        break;
      default:
        healthAdvice = {
          ...translations.poorBalance,
          color: 'bg-teal-100 border-l-4 border-teal-500',
          icon: '⚖️',
          category: 'health',
          scientificSources: [
            'Maslach & Leiter (2016) - Understanding Burnout',
            'Kabat-Zinn (1990) - Full Catastrophe Living: Using Mindfulness',
            'APA (2019) - Stress in the Workplace'
          ],
          learnMoreUrl: '/assistant'
        };
    }
  }

  // CONSEIL ORGANISATION
  let organizationAdvice: SmartAdvice;
  if (optimizationScore >= 70) {
    // Organisation excellente
    organizationAdvice = {
      ...translations.organizationGood,
      color: 'bg-green-100 border-l-4 border-green-500',
      icon: '🎯',
      category: 'organization',
      scientificSources: [
        'Bakker & Demerouti (2017) - Job Demands-Resources Theory',
        'Newport, C. (2016) - Deep Work: Rules for Focused Success'
      ],
      learnMoreUrl: '/assistant'
    };
  } else {
    // Organisation à améliorer
    organizationAdvice = {
      ...translations.lowOptimization,
      color: 'bg-orange-100 border-l-4 border-orange-500',
      icon: '📊',
      category: 'organization',
      scientificSources: [
        'Eisenhower, D. (1954) - Eisenhower Matrix',
        'Newport, C. (2016) - Deep Work: Rules for Focused Success',
        'Allen, D. (2001) - Getting Things Done: The Art of Stress-Free Productivity'
      ],
      learnMoreUrl: '/assistant'
    };
  }

  return {
    health: healthAdvice,
    organization: organizationAdvice
  };
};

export default generateSmartAdvice;