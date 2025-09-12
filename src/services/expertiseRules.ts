import { ExpertiseRule } from '../types/advice';

/**
 * Base de connaissances : Règles expertes encodées à partir des sources documentaires
 * Basé sur : INRS/DGT/ANACT, Ministère du Travail, ISO 6385:2016, recherches neuropsychologie
 */

export const EXPERTISE_RULES: ExpertiseRule[] = [
  
  // 1. PSYCHOLOGIE DU TRAVAIL - Épuisement énergétique
  {
    id: 'psy-001-energy-burnout',
    domain: 'psychologie',
    name: 'Détection précoce d\'épuisement énergétique',
    description: 'Détecte un niveau d\'énergie constamment faible, précurseur du burnout',
    triggers: [
      {
        metric: 'energy',
        operator: 'lte',
        value: 2, // Très fatigué ou fatigué
        frequency: 'daily',
        threshold: 7 // 7 jours consécutifs
      }
    ],
    analysisPeriodicWeeks: 2,
    severity: 'alerte',
    evidenceLevel: 'scientifique',
    source: 'Guide INRS/DGT/ANACT - Prévention du burnout + Neuropsychologie du stress',
    advice: {
      title: 'Risque d\'épuisement énergétique détecté',
      problem: 'Votre niveau d\'énergie reste constamment faible depuis une semaine, ce qui peut être un signe précoce d\'épuisement professionnel.',
      explanation: 'Les recherches en neuropsychologie montrent qu\'un épuisement énergétique prolongé affecte les fonctions cognitives et peut mener au burnout. Une intervention précoce est cruciale.',
      actions: [
        {
          category: 'immediate',
          title: 'Pause énergisante immédiate',
          description: 'Prenez 15 minutes pour une marche à l\'extérieur ou des exercices de respiration profonde',
          duration: '15 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Micro-pauses régulières',
          description: 'Planifiez 3 pauses de 5 minutes toutes les 2 heures pour éviter l\'accumulation de fatigue',
          duration: '5 minutes x3',
          difficulty: 'facile'
        },
        {
          category: 'weekly',
          title: 'Évaluation de la charge de travail',
          description: 'Analysez vos tâches et identifiez celles que vous pouvez déléguer, reporter ou simplifier',
          difficulty: 'moyen'
        },
        {
          category: 'organizational',
          title: 'Discussion avec votre manager',
          description: 'Évoquez votre charge de travail et explorez des aménagements temporaires',
          difficulty: 'difficile'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Technique de respiration 4-7-8',
          description: 'Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 4 fois.',
          duration: '2 minutes'
        },
        {
          type: 'exercise',
          title: 'Exercices d\'activation douce',
          description: 'Étirements du cou, roulement des épaules, flexions latérales',
          duration: '5 minutes'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 7,
        improvementMetrics: ['energy', 'meditationsPauses'],
        escalationThreshold: 14
      }
    }
  },

  // 2. RPS - Isolement social prolongé
  {
    id: 'rps-001-social-isolation',
    domain: 'rps',
    name: 'Isolement social prolongé - Risque psychosocial',
    description: 'Détecte un manque d\'interactions sociales, facteur de risque psychosocial majeur',
    triggers: [
      {
        metric: 'socialInteraction',
        operator: 'eq',
        value: false,
        frequency: 'daily',
        threshold: 21 // 3 semaines selon consensus experts RPS
      }
    ],
    analysisPeriodicWeeks: 3,
    severity: 'critique',
    evidenceLevel: 'consensus_expert',
    source: 'Brochures RPS Ministère du Travail + Guide prévention RPS entreprise',
    advice: {
      title: 'Isolement social critique - Action immédiate requise',
      problem: 'Vous n\'avez pas eu d\'interactions sociales positives depuis 3 semaines. L\'isolement social est un facteur de risque psychosocial majeur.',
      explanation: 'Le Ministère du Travail identifie l\'isolement comme un des 6 facteurs de RPS les plus critiques. Il augmente significativement les risques de dépression et d\'épuisement professionnel.',
      actions: [
        {
          category: 'immediate',
          title: 'Contact social dans les 24h',
          description: 'Appelez un collègue, un ami ou un membre de votre famille pour une conversation de 10 minutes',
          duration: '10 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Salutations actives',
          description: 'Initiez au moins 2 interactions courtes avec des collègues (bonjour, café, question de travail)',
          difficulty: 'facile'
        },
        {
          category: 'weekly',
          title: 'Activité sociale planifiée',
          description: 'Organisez un déjeuner avec un collègue ou participez à une activité d\'équipe',
          difficulty: 'moyen'
        },
        {
          category: 'organizational',
          title: 'Signalement RPS',
          description: 'Considérez échanger avec les RH sur l\'organisation du travail qui limite les interactions',
          difficulty: 'difficile'
        }
      ],
      resources: [
        {
          type: 'external_help',
          title: 'Soutien psychologique d\'entreprise',
          description: 'Contactez le service de psychologie du travail si disponible dans votre entreprise'
        },
        {
          type: 'technique',
          title: 'Reconstruction du lien social',
          description: 'Commencez par de petites interactions et augmentez progressivement'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 3,
        improvementMetrics: ['socialInteraction'],
        escalationThreshold: 7
      }
    }
  },

  // 3. ERGONOMIE - Rythme de travail problématique
  {
    id: 'ergo-001-work-rhythm',
    domain: 'ergonomie',
    name: 'Rythme de travail non ergonomique',
    description: 'Détecte un déséquilibre entre temps de travail et pauses selon principes ergonomiques',
    triggers: [
      {
        metric: 'workHours', // somme morningHours + afternoonHours
        operator: 'gt',
        value: 8,
        frequency: 'daily',
        threshold: 5
      },
      {
        metric: 'meditationsPausesCount', // nombre de cases cochées
        operator: 'lte',
        value: 1,
        frequency: 'daily',
        threshold: 5
      }
    ],
    analysisPeriodicWeeks: 1,
    severity: 'attention',
    evidenceLevel: 'scientifique',
    source: 'ISO 6385:2016 Principes ergonomiques + Encyclopédie INRS Ergonomie',
    advice: {
      title: 'Rythme de travail non conforme aux principes ergonomiques',
      problem: 'Vous travaillez plus de 8h/jour avec très peu de pauses depuis 5 jours. Cela contrevient aux principes ergonomiques.',
      explanation: 'La norme ISO 6385 recommande des pauses régulières pour maintenir la performance et prévenir la fatigue. Sans pauses, la productivité diminue de 15% après 6h de travail continu.',
      actions: [
        {
          category: 'immediate',
          title: 'Pause obligatoire de 15 minutes',
          description: 'Arrêtez immédiatement votre travail pour une pause complète (pas d\'écran)',
          duration: '15 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Planning de pauses structuré',
          description: 'Programmez 4 pauses de 10 minutes : milieu de matinée, déjeuner, milieu d\'après-midi, et fin de journée',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Analyse de l\'organisation temporelle',
          description: 'Revoir votre planning pour intégrer des créneaux de pauses non négociables',
          difficulty: 'moyen'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Règle des 50/10',
          description: '50 minutes de travail concentré suivies de 10 minutes de pause complète',
          duration: '1 heure'
        }
      ],
      followUp: {
        recheckAfterDays: 3,
        improvementMetrics: ['meditationsPauses', 'workHours']
      }
    }
  },

  // 4. MÉDECINE DOUCE - Déséquilibre global du bien-être
  {
    id: 'med-001-holistic-imbalance',
    domain: 'medecine_douce',
    name: 'Déséquilibre holistique du bien-être',
    description: 'Approche holistique : détecte un déséquilibre simultané sur plusieurs dimensions',
    triggers: [
      {
        metric: 'energy',
        operator: 'lte',
        value: 2,
        frequency: 'daily',
        threshold: 10
      },
      {
        metric: 'sportLeisureHours',
        operator: 'eq',
        value: 0,
        frequency: 'weekly',
        threshold: 2
      },
      {
        metric: 'sleepDuration',
        operator: 'lt',
        value: 6,
        frequency: 'daily',
        threshold: 7
      }
    ],
    analysisPeriodicWeeks: 2,
    severity: 'alerte',
    evidenceLevel: 'bonne_pratique',
    source: 'Médecines douces et gestion holistique du burnout + InfoLivres collection',
    advice: {
      title: 'Déséquilibre énergétique global - Approche holistique recommandée',
      problem: 'Plusieurs dimensions de votre bien-être sont simultanément affectées : énergie faible, manque d\'activité physique et sommeil insuffisant.',
      explanation: 'L\'approche holistique considère que le bien-être dépend de l\'équilibre entre le corps, l\'esprit et l\'environnement. Un déséquilibre multiple nécessite une approche globale.',
      actions: [
        {
          category: 'immediate',
          title: 'Séance de cohérence cardiaque',
          description: 'Pratiquez 5 minutes de respiration rythmée (5 sec inspiration, 5 sec expiration)',
          duration: '5 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Routine matinale énergisante',
          description: 'Réveil 15 min plus tôt pour 5 min d\'étirements + 5 min de méditation + exposition lumière naturelle',
          duration: '15 minutes',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Activité physique douce',
          description: 'Intégrez 2 séances de 30 minutes d\'activité plaisante (marche, yoga, natation)',
          difficulty: 'moyen'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Technique de grounding 5-4-3-2-1',
          description: '5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez',
          duration: '3 minutes'
        },
        {
          type: 'exercise',
          title: 'Salutation au soleil simplifiée',
          description: 'Séquence yoga douce de 6 mouvements pour réveiller le corps en douceur',
          duration: '5 minutes'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 10,
        improvementMetrics: ['energy', 'sportLeisureHours', 'sleepDuration'],
        escalationThreshold: 21
      }
    }
  },

  // 5. PSYCHOLOGIE - Pattern de procrastination / évitement
  {
    id: 'psy-002-avoidance-pattern',
    domain: 'psychologie',
    name: 'Pattern d\'évitement et procrastination',
    description: 'Détecte un pattern de faible productivité avec évitement possible des tâches importantes',
    triggers: [
      {
        metric: 'taskOptimization', // Optimisation du temps travaillé
        operator: 'lt',
        value: 0.3, // Moins de 30% de tâches à haute valeur
        frequency: 'daily',
        threshold: 10
      }
    ],
    analysisPeriodicWeeks: 2,
    severity: 'attention',
    evidenceLevel: 'scientifique',
    source: 'Thérapeute cognitivo-comportemental + Psychologie organisationnelle',
    advice: {
      title: 'Pattern d\'évitement des tâches importantes détecté',
      problem: 'Vous évitez systématiquement les tâches à haute valeur ajoutée et votre productivité déclarée est faible depuis 10 jours.',
      explanation: 'La thérapie cognitivo-comportementale identifie ce pattern comme un mécanisme de défense face au stress. Il peut créer un cercle vicieux d\'anxiété et de culpabilité.',
      actions: [
        {
          category: 'immediate',
          title: 'Technique des 2 minutes',
          description: 'Choisissez UNE tâche importante et travaillez dessus pendant exactement 2 minutes',
          duration: '2 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Priorisation matinale',
          description: 'Identifiez chaque matin LES 3 tâches les plus importantes et commencez par la plus difficile',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Analyse des résistances',
          description: 'Notez ce qui vous freine dans chaque tâche évitée (peur, manque de clarté, perfectionnisme)',
          difficulty: 'moyen'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Technique Pomodoro adaptée',
          description: 'Sessions de 15 minutes (au lieu de 25) pour réduire la résistance initiale',
          duration: '15 minutes'
        }
      ],
      followUp: {
        recheckAfterDays: 5,
        improvementMetrics: ['taskOptimization']
      }
    }
  },

  // 6. RPS - Surcharge cognitive
  {
    id: 'rps-002-cognitive-overload',
    domain: 'rps',
    name: 'Surcharge cognitive - Risque psychosocial',
    description: 'Détecte une surcharge cognitive par accumulation de longues journées sans récupération',
    triggers: [
      {
        metric: 'workHours',
        operator: 'gte',
        value: 10, // 10h+ de travail
        frequency: 'daily',
        threshold: 3 // 3 jours dans la période
      },
      {
        metric: 'meditationsPausesCount',
        operator: 'eq',
        value: 0, // Aucune pause
        frequency: 'daily',
        threshold: 3
      }
    ],
    analysisPeriodicWeeks: 1,
    severity: 'critique',
    evidenceLevel: 'scientifique',
    source: 'INRS Évaluation RPS + Ministère du Travail guide surcharge',
    advice: {
      title: 'SURCHARGE COGNITIVE CRITIQUE - Intervention immédiate nécessaire',
      problem: 'Vous travaillez plus de 10h/jour sans pauses depuis 3 jours. Risque élevé de surcharge cognitive et d\'erreurs.',
      explanation: 'L\'INRS classe la surcharge de travail comme facteur de RPS critique. Au-delà de 10h sans pause, les capacités cognitives diminuent drastiquement et les erreurs augmentent de 50%.',
      actions: [
        {
          category: 'immediate',
          title: 'ARRÊT IMMÉDIAT du travail',
          description: 'Cessez toute activité professionnelle et prenez 30 minutes de repos complet',
          duration: '30 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Limitation horaire stricte',
          description: 'Fixez une limite de 8h de travail maximum par jour pour les 7 prochains jours',
          difficulty: 'moyen'
        },
        {
          category: 'organizational',
          title: 'Signalement urgence RPS',
          description: 'Contactez immédiatement votre manager et/ou RH pour revoir la charge de travail',
          difficulty: 'difficile'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 1, // Suivi quotidien
        improvementMetrics: ['workHours', 'meditationsPauses'],
        escalationThreshold: 3
      }
    }
  },

  // 7. ERGONOMIE - Manque d'activité physique
  {
    id: 'ergo-002-physical-inactivity',
    domain: 'ergonomie',
    name: 'Inactivité physique chronique',
    description: 'Détecte un manque chronique d\'activité physique, problème ergonomique majeur du travail sédentaire',
    triggers: [
      {
        metric: 'sportLeisureHours',
        operator: 'eq',
        value: 0,
        frequency: 'weekly',
        threshold: 4 // 4 semaines sans activité
      }
    ],
    analysisPeriodicWeeks: 4,
    severity: 'attention',
    evidenceLevel: 'scientifique',
    source: 'ISO 6385:2016 + INRS Ergonomie du travail sédentaire',
    advice: {
      title: 'Inactivité physique chronique - Risque ergonomique',
      problem: 'Aucune activité physique ou loisir depuis 4 semaines. Le travail sédentaire sans compensation physique est un risque ergonomique majeur.',
      explanation: 'L\'ergonomie moderne considère l\'activité physique comme essentielle pour compenser la sédentarité. L\'inactivité prolongée augmente les TMS de 40% et la fatigue mentale.',
      actions: [
        {
          category: 'immediate',
          title: 'Marche de 10 minutes',
          description: 'Sortez prendre l\'air et marchez d\'un bon pas pendant 10 minutes',
          duration: '10 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Micro-exercices au bureau',
          description: 'Toutes les 2h : 10 flexions de genoux + 10 rotations d\'épaules + étirement du dos',
          duration: '2 minutes',
          difficulty: 'facile'
        },
        {
          category: 'weekly',
          title: 'Activité physique planifiée',
          description: 'Choisissez 1 activité plaisante et programmez 2 créneaux de 30min/semaine',
          difficulty: 'moyen'
        }
      ],
      resources: [
        {
          type: 'exercise',
          title: 'Programme "Bureau Actif"',
          description: '7 exercices simples à faire au bureau pour réactiver la circulation',
          duration: '5 minutes'
        }
      ],
      followUp: {
        recheckAfterDays: 7,
        improvementMetrics: ['sportLeisureHours']
      }
    }
  },

  // 8. MÉDECINE DOUCE - Troubles du sommeil avec stress
  {
    id: 'med-002-sleep-stress',
    domain: 'medecine_douce',
    name: 'Troubles du sommeil liés au stress',
    description: 'Corrélation entre sommeil insuffisant et niveau d\'énergie bas, approche par médecines douces',
    triggers: [
      {
        metric: 'sleepDuration',
        operator: 'lt',
        value: 6.5,
        frequency: 'daily',
        threshold: 5
      },
      {
        metric: 'energy',
        operator: 'lte',
        value: 2,
        frequency: 'daily',
        threshold: 5
      }
    ],
    analysisPeriodicWeeks: 1,
    severity: 'attention',
    evidenceLevel: 'bonne_pratique',
    source: 'Naturopathie stress chronique + Aromathérapie + Sophrologue',
    advice: {
      title: 'Troubles du sommeil impactant votre énergie',
      problem: 'Vous dormez moins de 6h30 depuis 5 jours et votre niveau d\'énergie en pâtit. Un cercle vicieux stress-insomnie peut s\'installer.',
      explanation: 'La naturopathie identifie le sommeil comme pilier fondamental de l\'énergie vitale. Un sommeil insuffisant perturbe l\'équilibre hormonal et maintient l\'organisme en état de stress.',
      actions: [
        {
          category: 'immediate',
          title: 'Préparation au sommeil ce soir',
          description: 'Arrêt des écrans 1h avant le coucher + tisane camomille + 5 min de respiration abdominale',
          duration: '20 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Routine du soir apaisante',
          description: 'Créez un rituel de 30min : lumière tamisée, lecture/musique douce, température fraîche (18°C)',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Hygiène de sommeil naturelle',
          description: 'Coucher/lever à heures fixes + exposition lumière matinale + éviter caféine après 14h',
          difficulty: 'moyen'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Technique de relaxation progressive',
          description: 'Contractez puis relâchez chaque groupe musculaire de la tête aux pieds',
          duration: '10 minutes'
        },
        {
          type: 'technique',
          title: 'Aromathérapie du sommeil',
          description: 'Lavande vraie : 2 gouttes sur l\'oreiller ou en diffusion 30min avant coucher',
          duration: '30 minutes'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 7,
        improvementMetrics: ['sleepDuration', 'energy']
      }
    }
  },

  // 9. ERGONOMIE COGNITIVE - Optimisation tâches haute valeur ajoutée
  {
    id: 'ergo-003-task-optimization',
    domain: 'ergonomie',
    name: 'Mauvaise optimisation des tâches à haute valeur ajoutée',
    description: 'Détecte une mauvaise allocation du temps vers les tâches stratégiques, problème d\'ergonomie cognitive',
    triggers: [
      {
        metric: 'taskOptimization',
        operator: 'lt',
        value: 0.4, // Moins de 40% du temps sur tâches importantes
        frequency: 'daily',
        threshold: 7 // 7 jours consécutifs
      },
      {
        metric: 'workHours',
        operator: 'gte',
        value: 7, // Au moins 7h de travail
        frequency: 'daily',
        threshold: 5
      }
    ],
    analysisPeriodicWeeks: 2,
    severity: 'attention',
    evidenceLevel: 'scientifique',
    source: 'ISO 6385:2016 Ergonomie cognitive + Psychologie organisationnelle + Méthodes GTD',
    advice: {
      title: 'Optimisation insuffisante des tâches à haute valeur ajoutée',
      problem: 'Vous consacrez moins de 40% de votre temps aux tâches prioritaires depuis 7 jours. Votre charge de travail se disperse sur des activités à faible impact.',
      explanation: 'L\'ergonomie cognitive recommande de concentrer 70% du temps productif sur les tâches à haute valeur ajoutée. La dispersion cognitive réduit l\'efficacité globale de 35% selon les études organisationnelles.',
      actions: [
        {
          category: 'immediate',
          title: 'Audit des tâches de cette semaine',
          description: 'Listez toutes vos tâches de la semaine et classez-les: Critique/Important/Routine/Accessoire',
          duration: '30 minutes',
          difficulty: 'facile'
        },
        {
          category: 'daily',
          title: 'Règle des 3 priorités matinales',
          description: 'Chaque matin, identifiez 3 tâches à haute valeur et réservez-leur les 3 premières heures',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Time-blocking par catégories',
          description: 'Planifiez votre semaine: 70% tâches critiques, 20% importantes, 10% routine',
          difficulty: 'moyen'
        },
        {
          category: 'organizational',
          title: 'Négociation des interruptions',
          description: 'Discutez avec votre équipe de créneaux "focus" sans interruptions pour les tâches stratégiques',
          difficulty: 'difficile'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Matrice d\'Eisenhower adaptée',
          description: 'Urgent/Important : 4 quadrants pour prioriser efficacement toutes vos tâches',
          duration: '15 minutes'
        },
        {
          type: 'technique',
          title: 'Technique du Time-blocking',
          description: 'Réservez des blocs de temps spécifiques pour chaque catégorie de tâche',
          duration: '20 minutes'
        },
        {
          type: 'technique',
          title: 'Principe de Pareto (80/20)',
          description: '80% des résultats proviennent de 20% des activités - identifiez ces 20%',
          duration: '10 minutes'
        }
      ],
      followUp: {
        recheckAfterDays: 7,
        improvementMetrics: ['taskOptimization'],
        escalationThreshold: 14
      }
    }
  },

  // 10. PSYCHOLOGIE - Dispersion cognitive critique
  {
    id: 'psy-003-cognitive-dispersion',
    domain: 'psychologie',
    name: 'Dispersion cognitive critique avec faible productivité',
    description: 'Détecte une dispersion cognitive sévère : très faible ratio de tâches importantes avec productivité globale effondrée',
    triggers: [
      {
        metric: 'taskOptimization',
        operator: 'lt',
        value: 0.2, // Moins de 20% du temps sur tâches importantes
        frequency: 'daily',
        threshold: 10
      },
      {
        metric: 'energy',
        operator: 'lte',
        value: 2.5,
        frequency: 'daily',
        threshold: 7
      }
    ],
    analysisPeriodicWeeks: 2,
    severity: 'critique',
    evidenceLevel: 'scientifique',
    source: 'Psychologie cognitive + Thérapie comportementale + Neuropsychologie attention',
    advice: {
      title: 'DISPERSION COGNITIVE CRITIQUE - Intervention psychologique recommandée',
      problem: 'Moins de 20% de votre temps est consacré aux tâches importantes depuis 10 jours. Risque de désengagement et de burnout par sous-stimulation.',
      explanation: 'La neuropsychologie identifie ce pattern comme un signe de surcharge cognitive paradoxale : l\'évitement des tâches importantes crée une dispersion mentale épuisante. Ce mécanisme de défense peut mener à une spirale de dévalorisation professionnelle.',
      actions: [
        {
          category: 'immediate',
          title: 'PAUSE COGNITIVE de 2 heures',
          description: 'Arrêtez toute activité professionnelle. Sortez, marchez, ou pratiquez une activité manuelle simple',
          duration: '2 heures',
          difficulty: 'facile'
        },
        {
          category: 'immediate',
          title: 'Technique de la "Single Task"',
          description: 'Choisissez UNE seule tâche importante et travaillez dessus 45 minutes sans interruption',
          duration: '45 minutes',
          difficulty: 'moyen'
        },
        {
          category: 'daily',
          title: 'Routine de "recentrage cognitif"',
          description: 'Chaque matin: 10 min méditation + définir 1 objectif principal + éliminer 3 tâches non-essentielles',
          difficulty: 'moyen'
        },
        {
          category: 'weekly',
          title: 'Bilan psychologique personnel',
          description: 'Analysez vos résistances: peur de l\'échec, perfectionnisme, manque de clarté des priorités',
          difficulty: 'difficile'
        },
        {
          category: 'external_help',
          title: 'Accompagnement professionnel',
          description: 'Consultez un psychologue du travail ou coach spécialisé en productivité cognitive',
          difficulty: 'difficile'
        }
      ],
      resources: [
        {
          type: 'technique',
          title: 'Technique de défragmentation mentale',
          description: 'Videz votre esprit sur papier: toutes les tâches, puis catégorisez et priorisez',
          duration: '30 minutes'
        },
        {
          type: 'technique',
          title: 'Respiration de recentrage cognitif',
          description: 'Technique 4-4-4-4: 4 temps d\'inspiration, rétention, expiration, pause',
          duration: '5 minutes'
        },
        {
          type: 'external_help',
          title: 'Ligne d\'écoute psychologique',
          description: 'Si disponible dans votre entreprise, contactez le service de soutien psychologique',
          duration: '30-60 minutes'
        }
      ],
      medicalDisclaimer: true,
      followUp: {
        recheckAfterDays: 3,
        improvementMetrics: ['taskOptimization', 'energy'],
        escalationThreshold: 7
      }
    }
  }

];