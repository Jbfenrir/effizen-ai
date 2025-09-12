import { adviceEngine } from '../services/adviceEngine';
import type { DailyEntry } from '../types';
import type { AnalyticsData } from './dataAnalytics';

export interface SmartAdvice {
  diagnosis: string;
  recommendation: string;
  color: string;
  icon: string;
}

/**
 * Générateur de conseils intelligent basé sur le système test-advice
 */
export const generateSmartAdvice = async (
  entries: DailyEntry[], 
  analytics: AnalyticsData
): Promise<SmartAdvice> => {
  
  // Si pas de données, conseil par défaut
  if (!analytics.dataAvailable) {
    return {
      diagnosis: "Aucune donnée disponible pour cette période.",
      recommendation: "Commencez par saisir vos informations quotidiennes pour recevoir des conseils personnalisés basés sur nos expertises en bien-être au travail.",
      color: 'bg-blue-100 border-l-4 border-blue-500',
      icon: '📊'
    };
  }

  try {
    // Générer une analyse avec le moteur de conseils
    const userId = "employee-dashboard"; // ID fictif pour le dashboard
    const analysis = await adviceEngine.analyzeUserData(userId, entries);
    
    // Si des règles expertes sont déclenchées, utiliser le système intelligent
    if (analysis.triggeredRules.length > 0) {
      const topRule = analysis.triggeredRules[0]; // Règle la plus prioritaire
      const advice = topRule.rule.advice;
      
      // Créer un diagnostic court (2-3 lignes)
      const diagnosis = `${advice.problem}`;
      
      // Créer une recommandation pratique (2-5 lignes selon la gravité)
      const immediateActions = advice.actions
        .filter(action => action.category === 'immediate')
        .slice(0, 2); // Max 2 actions immédiates
        
      const dailyActions = advice.actions
        .filter(action => action.category === 'daily')
        .slice(0, 1); // 1 action quotidienne
      
      let recommendationLines = [];
      
      // Actions immédiates
      immediateActions.forEach(action => {
        recommendationLines.push(`🎯 ${action.title}: ${action.description}`);
      });
      
      // Action quotidienne
      if (dailyActions.length > 0) {
        recommendationLines.push(`📅 ${dailyActions[0].title}: ${dailyActions[0].description}`);
      }
      
      // Ressource utile si disponible
      if (advice.resources.length > 0) {
        const resource = advice.resources[0];
        recommendationLines.push(`💡 ${resource.title}: ${resource.description}`);
      }
      
      const recommendation = recommendationLines.join('\n');
      
      // Couleur selon la sévérité
      let color = 'bg-green-100 border-l-4 border-green-500';
      let icon = '🌟';
      
      switch (topRule.rule.severity) {
        case 'critique':
          color = 'bg-red-100 border-l-4 border-red-500';
          icon = '🚨';
          break;
        case 'alerte':
          color = 'bg-orange-100 border-l-4 border-orange-500'; 
          icon = '⚠️';
          break;
        case 'attention':
          color = 'bg-yellow-100 border-l-4 border-yellow-500';
          icon = '💡';
          break;
      }
      
      return { diagnosis, recommendation, color, icon };
    }
    
  } catch (error) {
    console.warn('Erreur lors de la génération des conseils intelligents:', error);
  }
  
  // Fallback : conseils basés sur les scores analytiques mais avec format diagnostic/conseils
  return generateEnhancedFallbackAdvice(analytics);
};

/**
 * Génère des conseils améliorés avec format diagnostic/conseils basés sur les scores
 */
const generateEnhancedFallbackAdvice = (analytics: AnalyticsData): SmartAdvice => {
  const { wellbeingScore, sleepScore, energyScore, breaksScore, optimizationScore } = analytics;
  
  // Identifier les 2 domaines les plus problématiques
  const scores = [
    { domain: 'sommeil', score: sleepScore, label: 'Sommeil' },
    { domain: 'energy', score: energyScore, label: 'Énergie' },
    { domain: 'breaks', score: breaksScore, label: 'Équilibre' },
    { domain: 'optimization', score: optimizationScore, label: 'Optimisation' }
  ];
  
  const lowScores = scores.filter(s => s.score < 60).sort((a, b) => a.score - b.score);
  
  // Excellent état général
  if (wellbeingScore >= 75 && optimizationScore >= 70) {
    return {
      diagnosis: `Bilan optimal : Bien-être global à ${wellbeingScore}/100 et optimisation du temps à ${optimizationScore}/100. Votre équilibre professionnel est exemplaire.`,
      recommendation: `🎉 Excellence maintenue !\n💪 Vos habitudes actuelles sont optimales - maintenez ce rythme.\n📊 Partagez vos bonnes pratiques avec votre équipe.`,
      color: 'bg-green-100 border-l-4 border-green-500',
      icon: '🌟'
    };
  }
  
  // Problèmes détectés - Format diagnostic expert
  if (lowScores.length > 0) {
    const primaryIssue = lowScores[0];
    const secondaryIssue = lowScores.length > 1 ? lowScores[1] : null;
    
    let diagnosis = `Analyse comportementale : Déficit principal détecté sur "${primaryIssue.label}" (${primaryIssue.score}/100)`;
    if (secondaryIssue) {
      diagnosis += ` avec impact secondaire sur "${secondaryIssue.label}" (${secondaryIssue.score}/100)`;
    }
    diagnosis += `. Score bien-être global : ${wellbeingScore}/100.`;
    
    let recommendations = [];
    
    // Conseils spécialisés selon le domaine prioritaire
    switch (primaryIssue.domain) {
      case 'sommeil':
        recommendations.push("🌙 Priorité absolue : Régularisez votre cycle de sommeil (coucher/lever à heures fixes)");
        recommendations.push("📱 Action immédiate : Pas d'écrans 1h avant le coucher");
        break;
      case 'energy':
        recommendations.push("⚡ Focus énergie : Identifiez vos pics naturels d'énergie dans la journée");
        recommendations.push("🍎 Nutrition : Privilégiez des repas légers et réguliers");
        break;
      case 'breaks':
        recommendations.push("⏸️ Protocole micro-pauses : 5 minutes toutes les heures de travail intense");
        recommendations.push("🧘 Technique immédiate : Respiration 4-7-8 lors des moments de stress");
        break;
      case 'optimization':
        recommendations.push("🎯 Méthode Eisenhower : Classez vos tâches par urgence/importance");
        recommendations.push("⏰ Technique Pomodoro : 25 min concentration + 5 min pause");
        break;
    }
    
    // Conseil de synergie si problème secondaire
    if (secondaryIssue) {
      recommendations.push(`💡 Synergie : Améliorer votre ${primaryIssue.label.toLowerCase()} aura un effet positif sur votre ${secondaryIssue.label.toLowerCase()}`);
    }
    
    const recommendation = recommendations.join('\n');
    
    // Couleur selon la gravité
    let color = 'bg-orange-100 border-l-4 border-orange-500';
    let icon = '⚠️';
    
    if (wellbeingScore < 40) {
      color = 'bg-red-100 border-l-4 border-red-500';
      icon = '🚨';
    } else if (wellbeingScore < 60) {
      color = 'bg-yellow-100 border-l-4 border-yellow-500';
      icon = '💡';
    }
    
    return { diagnosis, recommendation, color, icon };
  }
  
  // État moyen - potentiel d'amélioration
  return {
    diagnosis: `Profil équilibré : Bien-être à ${wellbeingScore}/100 avec marge d'optimisation identifiée. Vos fondamentaux sont solides.`,
    recommendation: `📈 Stratégie d'amélioration progressive :\n🎯 Concentrez-vous sur vos scores les plus bas des graphiques ci-dessus\n🔄 Adoptez une approche par étapes (1 changement par semaine)`,
    color: 'bg-blue-100 border-l-4 border-blue-500',
    icon: '📊'
  };
};

/**
 * Génère des conseils de base basés sur les scores analytiques (ancienne version)
 */
const generateFallbackAdvice = (analytics: AnalyticsData): SmartAdvice => {
  const { wellbeingScore, sleepScore, energyScore, breaksScore, optimizationScore } = analytics;
  
  // Tout va bien
  if (wellbeingScore >= 75 && optimizationScore >= 70) {
    return {
      diagnosis: `Excellent ! Votre bien-être est à ${wellbeingScore}/100 et votre optimisation à ${optimizationScore}/100.`,
      recommendation: `🎉 Continuez sur cette lancée ! Votre équilibre actuel est optimal.\n💪 Maintenez vos bonnes habitudes de sommeil, d'énergie et de gestion du temps.`,
      color: 'bg-green-100 border-l-4 border-green-500',
      icon: '🌟'
    };
  }
  
  // Problèmes détectés
  const lowAreas = [];
  if (sleepScore < 60) lowAreas.push('sommeil');
  if (energyScore < 60) lowAreas.push('énergie'); 
  if (breaksScore < 60) lowAreas.push('équilibre');
  if (optimizationScore < 60) lowAreas.push('optimisation du temps');
  
  if (lowAreas.length > 0) {
    const diagnosis = `Scores faibles détectés sur ${lowAreas.length} dimension(s) : ${lowAreas.join(', ')}. Bien-être global à ${wellbeingScore}/100.`;
    
    let recommendations = [];
    
    if (sleepScore < 60) {
      recommendations.push("😴 Sommeil : Visez 7-8h de sommeil régulier avec un coucher à heure fixe");
    }
    if (energyScore < 60) {
      recommendations.push("⚡ Énergie : Prenez 3 pauses de 5 minutes dans votre journée");
    }
    if (breaksScore < 60) {
      recommendations.push("🧘 Équilibre : Intégrez méditation ou pauses aux 4 créneaux quotidiens");
    }
    if (optimizationScore < 60) {
      recommendations.push("🎯 Focus : Concentrez 70% de votre temps sur vos tâches prioritaires");
    }
    
    const recommendation = recommendations.slice(0, 3).join('\n'); // Max 3 recommandations
    
    return {
      diagnosis,
      recommendation,
      color: 'bg-red-100 border-l-4 border-red-500',
      icon: '⚠️'
    };
  }
  
  // Scores moyens
  return {
    diagnosis: `Bien-être à ${wellbeingScore}/100. Des améliorations sont possibles pour optimiser votre équilibre.`,
    recommendation: `📈 Concentrez-vous sur vos points faibles identifiés dans les graphiques.\n🎯 Analysez vos patterns pour identifier les moments d'amélioration.`,
    color: 'bg-yellow-100 border-l-4 border-yellow-500',
    icon: '💡'
  };
};