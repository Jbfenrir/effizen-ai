import i18n from '../i18n';
import { adviceEngine } from '../services/adviceEngine';
import type { DailyEntry } from '../types';
import type { AnalyticsData } from './dataAnalytics';

export interface SmartAdvice {
  diagnosis: string;
  recommendation: string;
  color: string;
  icon: string;
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
    }
  }
};

/**
 * Générateur de conseils intelligent avec traduction
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
      icon: '📊'
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
        icon: expertAdvice.icon || '💡'
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
      icon: '🌟'
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
            icon: '😴'
          };
        }
        break;

      case 'energy':
        if (energyScore < 50) {
          return {
            ...translations.lowEnergy,
            color: 'bg-blue-100 border-l-4 border-blue-500',
            icon: '⚡'
          };
        }
        break;

      case 'balance':
        if (breaksScore < 50) {
          return {
            ...translations.poorBalance,
            color: 'bg-teal-100 border-l-4 border-teal-500',
            icon: '⚖️'
          };
        }
        break;

      case 'optimization':
        if (optimizationScore < 50) {
          return {
            ...translations.lowOptimization,
            color: 'bg-orange-100 border-l-4 border-orange-500',
            icon: '🎯'
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
    icon: '💡'
  };
};

export default generateSmartAdvice;