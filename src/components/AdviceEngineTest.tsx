import React, { useState } from 'react';
import { adviceEngine } from '../services/adviceEngine';
import type { DailyEntry } from '../types';

const AdviceEngineTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Données de test simulant différents scénarios
  const createTestData = (scenario: 'burnout' | 'isolation' | 'healthy'): DailyEntry[] => {
    const baseDate = new Date();
    const entries: DailyEntry[] = [];

    for (let i = 0; i < 21; i++) { // 3 semaines de données
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);

      let entry: DailyEntry;

      switch (scenario) {
        case 'burnout':
          entry = {
            id: `test-${i}`,
            user_id: 'test-user',
            entry_date: date.toISOString(),
            sleep: {
              bedTime: '01:00',
              wakeTime: '06:00',
              insomniaDuration: Math.random() > 0.5 ? 60 : 0,
              duration: 5 + Math.random() * 1
            },
            focus: {
              morningHours: 4 + Math.random() * 2,
              afternoonHours: 4 + Math.random() * 2,
              drivingHours: 0,
              fatigue: 1 + Math.random() * 1 // Très fatigué
            },
            tasks: [],
            wellbeing: {
              meditationsPauses: {
                morning: false,
                noon: false,
                afternoon: false,
                evening: false
              },
              sportLeisureHours: 0,
              socialInteraction: Math.random() > 0.8,
              energy: 20 + Math.random() * 20
            },
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          };
          break;

        case 'isolation':
          entry = {
            id: `test-${i}`,
            user_id: 'test-user',
            entry_date: date.toISOString(),
            sleep: {
              bedTime: '23:00',
              wakeTime: '07:00',
              insomniaDuration: 0,
              duration: 8
            },
            focus: {
              morningHours: 3,
              afternoonHours: 3,
              drivingHours: 0,
              fatigue: 3
            },
            tasks: [],
            wellbeing: {
              meditationsPauses: {
                morning: false,
                noon: false,
                afternoon: false,
                evening: false
              },
              sportLeisureHours: 0.5,
              socialInteraction: false, // Aucune interaction sociale
              energy: 60
            },
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          };
          break;

        case 'healthy':
          entry = {
            id: `test-${i}`,
            user_id: 'test-user',
            entry_date: date.toISOString(),
            sleep: {
              bedTime: '22:30',
              wakeTime: '06:30',
              insomniaDuration: 0,
              duration: 8 // Optimal: 8h
            },
            focus: {
              morningHours: 3.5,
              afternoonHours: 3.5,
              drivingHours: 0,
              fatigue: 4.2 // Bonne énergie (4-5 optimal)
            },
            tasks: [],
            wellbeing: {
              meditationsPauses: {
                morning: true,
                noon: true,
                afternoon: true,
                evening: Math.random() > 0.3 // 3-4 pauses optimales
              },
              sportLeisureHours: 1.5, // Optimal: 1-3h
              socialInteraction: Math.random() > 0.2, // ~80% des jours
              energy: 80 // Bonne énergie
            },
            created_at: date.toISOString(),
            updated_at: date.toISOString()
          };
          break;
      }

      entries.push(entry);
    }

    return entries.reverse(); // Chronologique
  };

  const runTest = async (scenario: 'burnout' | 'isolation' | 'healthy') => {
    setIsLoading(true);
    try {
      const testData = createTestData(scenario);
      const analysis = await adviceEngine.analyzeUserData('test-user', testData);
      setTestResults({ scenario, analysis });
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-dark-blue mb-6">Test du Moteur de Conseils</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => runTest('burnout')}
          disabled={isLoading}
          className="btn-primary"
        >
          Test Burnout
        </button>
        <button
          onClick={() => runTest('isolation')}
          disabled={isLoading}
          className="btn-primary"
        >
          Test Isolation
        </button>
        <button
          onClick={() => runTest('healthy')}
          disabled={isLoading}
          className="btn-primary"
        >
          Test Équilibré
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-green"></div>
          <span className="ml-2">Analyse en cours...</span>
        </div>
      )}

      {testResults && !isLoading && (
        <div className="space-y-6">
          {testResults.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Erreur: {testResults.error}
            </div>
          ) : (
            <>
              <div className="bg-light-gray p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Scénario testé: {testResults.scenario}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Niveau de risque:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      testResults.analysis.riskLevel === 'critique' ? 'bg-red-200 text-red-800' :
                      testResults.analysis.riskLevel === 'élevé' ? 'bg-orange-200 text-orange-800' :
                      testResults.analysis.riskLevel === 'moyen' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {testResults.analysis.riskLevel}
                    </span>
                  </div>
                  <div>
                    <strong>Règles déclenchées:</strong> {testResults.analysis.triggeredRules.length}
                  </div>
                </div>
              </div>

              {testResults.analysis.patterns && testResults.analysis.patterns.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">Patterns détectés</h4>
                  <p className="text-sm text-gray-600 mb-3">Les indicateurs colorés représentent le niveau de préoccupation/risque, pas la valeur moyenne.</p>
                  <div className="space-y-3">
                    {testResults.analysis.patterns.map((pattern: any, index: number) => {
                      // Traduction des noms de métriques
                      const metricLabels: any = {
                        'energy': 'Énergie',
                        'socialInteraction': 'Interactions sociales',
                        'workHours': 'Heures travaillées',
                        'meditationsPausesCount': 'Pauses/Méditations',
                        'sportLeisureHours': 'Sport/Loisirs',
                        'sleepDuration': 'Durée de sommeil'
                      };
                      
                      // Déterminer la couleur selon le niveau de préoccupation
                      const getColorClass = (level: string, metric: string) => {
                        // Toutes les métriques utilisent maintenant un niveau de préoccupation/risque
                        // donc "élevé" = toujours mauvais (rouge)
                        
                        if (level === 'aucun') {
                          return 'bg-green-200 text-green-800';  // Vert = pas de préoccupation
                        } else if (level === 'faible') {
                          return 'bg-lime-200 text-lime-800';    // Vert clair = préoccupation faible
                        } else if (level === 'moyen') {
                          return 'bg-yellow-200 text-yellow-800'; // Jaune = préoccupation moyenne
                        } else if (level === 'élevé') {
                          return 'bg-red-200 text-red-800';      // Rouge = préoccupation élevée
                        }
                        return 'bg-gray-200 text-gray-800';
                      };
                      
                      // Calculer la moyenne pour les booléens (interactions sociales)
                      const calculateBooleanAverage = (values: any[]) => {
                        if (!Array.isArray(values)) return null;
                        const trueCount = values.filter(v => v === true).length;
                        return `${Math.round((trueCount / values.length) * 100)}% des jours`;
                      };
                      
                      return (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{metricLabels[pattern.metric] || pattern.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Tendance: {pattern.trend}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getColorClass(pattern.concernLevel, pattern.metric)}`}>
                                Niveau de préoccupation: {pattern.concernLevel}
                              </span>
                            </div>
                          </div>
                          {(pattern.average !== undefined || pattern.metric === 'socialInteraction') && (
                            <div className="text-sm text-gray-600">
                              Moyenne: {pattern.metric === 'socialInteraction' 
                                ? calculateBooleanAverage(pattern.values)
                                : typeof pattern.average === 'number' ? pattern.average.toFixed(1) : pattern.average}
                            </div>
                          )}
                          {pattern.referenceValues && (
                            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                              <div><strong>Optimal:</strong> {pattern.referenceValues.optimal}</div>
                              <div><strong>Acceptable:</strong> {pattern.referenceValues.acceptable}</div>
                              <div><strong>Préoccupant:</strong> {pattern.referenceValues.concerning}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {testResults.analysis.triggeredRules && testResults.analysis.triggeredRules.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">Règles déclenchées</h4>
                  <div className="space-y-4">
                    {testResults.analysis.triggeredRules.map((rule: any, index: number) => (
                      <div key={index} className="border-l-4 border-lime-green pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-dark-blue">{rule.rule.name}</h5>
                          <span className="text-sm text-gray-600">
                            Confiance: {Math.round(rule.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rule.rule.description}</p>
                        <div className="text-xs text-gray-600">
                          <strong>Domaine:</strong> {rule.rule.domain} |{' '}
                          <strong>Sévérité:</strong> {rule.rule.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResults.analysis.recommendations && testResults.analysis.recommendations.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">Conseils générés</h4>
                  <div className="space-y-4">
                    {testResults.analysis.recommendations.map((advice: any, index: number) => (
                      <div key={index} className="bg-lime-green bg-opacity-10 p-4 rounded">
                        <h5 className="font-medium text-dark-blue mb-2">
                          {advice.advice.title}
                        </h5>
                        <p className="text-sm text-gray-700 mb-3">{advice.advice.problem}</p>
                        <div className="space-y-2">
                          <h6 className="font-medium text-sm">Actions recommandées:</h6>
                          {advice.advice.actions.map((action: any, actionIndex: number) => (
                            <div key={actionIndex} className="ml-4 text-sm">
                              <strong>{action.title}:</strong> {action.description}
                              <span className="ml-2 text-xs text-gray-600">
                                ({action.category}, {action.difficulty})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdviceEngineTest;