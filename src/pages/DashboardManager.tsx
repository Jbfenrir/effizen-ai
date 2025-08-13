import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  TrendingUp, 
  Download, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

// Données simulées pour les métriques d'équipe
const mockTeamData = [
  {
    team: 'Développement',
    avgEnergy: 75,
    avgSleep: 7.8,
    avgFatigue: 2.1,
    hvRatio: 82,
    participants: 12,
    riskLevel: 'low',
  },
  {
    team: 'Marketing',
    avgEnergy: 68,
    avgSleep: 7.2,
    avgFatigue: 2.8,
    hvRatio: 71,
    participants: 8,
    riskLevel: 'medium',
  },
  {
    team: 'Ventes',
    avgEnergy: 62,
    avgSleep: 6.9,
    avgFatigue: 3.2,
    hvRatio: 65,
    participants: 15,
    riskLevel: 'high',
  },
  {
    team: 'RH',
    avgEnergy: 80,
    avgSleep: 8.1,
    avgFatigue: 1.9,
    hvRatio: 88,
    participants: 6,
    riskLevel: 'low',
  },
];

const DashboardManager: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Calculer les métriques globales
  const globalMetrics = {
    avgEnergy: Math.round(mockTeamData.reduce((sum, team) => sum + team.avgEnergy, 0) / mockTeamData.length),
    avgSleep: Math.round((mockTeamData.reduce((sum, team) => sum + team.avgSleep, 0) / mockTeamData.length) * 10) / 10,
    avgFatigue: Math.round((mockTeamData.reduce((sum, team) => sum + team.avgFatigue, 0) / mockTeamData.length) * 10) / 10,
    avgHvRatio: Math.round(mockTeamData.reduce((sum, team) => sum + team.hvRatio, 0) / mockTeamData.length),
    totalParticipants: mockTeamData.reduce((sum, team) => sum + team.participants, 0),
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-lime-green';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-metallic-gray';
    }
  };

  const getRiskLevelBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'high': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const exportReport = async () => {
    setIsExporting(true);
    try {
      // Simuler l'export PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Rapport exporté');
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredTeams = selectedTeam === 'all' 
    ? mockTeamData 
    : mockTeamData.filter(team => team.team === selectedTeam);

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-light-gray">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark-blue">
                {t('dashboard.manager.title')}
              </h1>
              <p className="text-metallic-gray mt-1">
                Vue agrégée de la santé des équipes
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={exportReport}
                disabled={isExporting}
                className="btn-success flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Export...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{t('dashboard.manager.exportReport')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-metallic-gray" />
              <span className="text-sm font-medium text-dark-blue">{t('dashboard.manager.period')}:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="form-select text-sm"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Users size={16} className="text-metallic-gray" />
              <span className="text-sm font-medium text-dark-blue">{t('dashboard.manager.team')}:</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="form-select text-sm"
              >
                <option value="all">{t('dashboard.manager.allTeams')}</option>
                {mockTeamData.map(team => (
                  <option key={team.team} value={team.team}>{team.team}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">{t('dashboard.manager.avgEnergy')}</p>
                <p className="text-2xl font-bold text-dark-blue">{globalMetrics.avgEnergy}/100</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">{t('dashboard.manager.avgSleep')}</p>
                <p className="text-2xl font-bold text-dark-blue">{globalMetrics.avgSleep}h</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">{t('dashboard.manager.avgFatigue')}</p>
                <p className="text-2xl font-bold text-dark-blue">{globalMetrics.avgFatigue}/5</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="text-lime-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">{t('dashboard.manager.hvRatio')}</p>
                <p className="text-2xl font-bold text-dark-blue">{globalMetrics.avgHvRatio}%</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">{t('dashboard.manager.participants')}</p>
                <p className="text-2xl font-bold text-dark-blue">{globalMetrics.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap des risques */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="font-semibold">{t('dashboard.manager.heatmap')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-gray">
                  <th className="text-left py-3 px-4 font-medium text-dark-blue">Équipe</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">Énergie</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">Sommeil</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">Fatigue</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">HV Ratio</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">Participants</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-blue">Risque</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.team} className="border-b border-light-gray hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-dark-blue">{team.team}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 h-2 bg-light-gray rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              team.avgEnergy >= 80 ? 'bg-lime-green' :
                              team.avgEnergy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${team.avgEnergy}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{team.avgEnergy}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{team.avgSleep}h</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{team.avgFatigue}/5</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{team.hvRatio}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium">{team.participants}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBg(team.riskLevel)} ${getRiskLevelColor(team.riskLevel)}`}>
                        {team.riskLevel === 'low' && <CheckCircle size={12} className="mr-1" />}
                        {team.riskLevel === 'medium' && <AlertTriangle size={12} className="mr-1" />}
                        {team.riskLevel === 'high' && <AlertTriangle size={12} className="mr-1" />}
                        {team.riskLevel === 'low' ? 'Faible' : 
                         team.riskLevel === 'medium' ? 'Moyen' : 'Élevé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Évolution des métriques */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Évolution des métriques</h3>
            </div>
            <div className="h-64 flex items-center justify-center bg-light-gray rounded-lg">
              <div className="text-center text-metallic-gray">
                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                <p>Graphique d'évolution</p>
                <p className="text-sm">Recharts sera intégré ici</p>
              </div>
            </div>
          </div>

          {/* Répartition des risques */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Répartition des risques</h3>
            </div>
            <div className="h-64 flex items-center justify-center bg-light-gray rounded-lg">
              <div className="text-center text-metallic-gray">
                <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Graphique de répartition</p>
                <p className="text-sm">Recharts sera intégré ici</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-blue">Faible risque</span>
                <span className="text-sm font-medium text-lime-green">2 équipes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-blue">Risque moyen</span>
                <span className="text-sm font-medium text-yellow-600">1 équipe</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-blue">Risque élevé</span>
                <span className="text-sm font-medium text-red-600">1 équipe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes et recommandations */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Alertes et recommandations</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">Équipe Ventes - Risque élevé</h4>
                    <p className="text-red-700 text-sm mt-1">
                      L'équipe Ventes présente des signes de fatigue élevée (3.2/5) et un ratio de tâches à haute valeur faible (65%).
                      Recommandation : Organiser une session de bien-être et revoir la charge de travail.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Équipe Marketing - Surveillance</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      L'équipe Marketing montre des signes de fatigue modérée. Surveiller l'évolution sur les prochaines semaines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border-l-4 border-lime-green rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-lime-green mt-0.5" />
                  <div>
                    <h4 className="text-green-800 font-medium">Équipes en bonne santé</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Les équipes Développement et RH présentent d'excellents indicateurs de bien-être.
                      Continuer les bonnes pratiques en place.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManager; 