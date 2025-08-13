import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Activity, Target, Clock, Heart, Calendar, ChevronDown } from 'lucide-react';
import EnergyBar from '../components/EnergyBar';
import DateRangePicker from '../components/DateRangePicker';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDateRangeForPeriod, formatDateRange, type PeriodType, type DateRange } from '../utils/dateUtils';
import { calculateAnalyticsForPeriod, getAllEntriesFromStorage, type AnalyticsData } from '../utils/dataAnalytics';


const DashboardEmployee: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
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
  });

  // Calculer les données analytiques
  useEffect(() => {
    const entries = getAllEntriesFromStorage();
    const dateRange = selectedPeriod === 'custom' && customDateRange 
      ? customDateRange 
      : getDateRangeForPeriod(selectedPeriod);
    
    const analyticsData = calculateAnalyticsForPeriod(entries, dateRange);
    setAnalytics(analyticsData);
  }, [selectedPeriod, customDateRange]);

  const handlePeriodChange = (period: PeriodType) => {
    if (period === 'custom') {
      setShowDatePicker(true);
    } else {
      setSelectedPeriod(period);
      setCustomDateRange(null);
    }
  };

  const handleCustomDateRange = (range: DateRange) => {
    setCustomDateRange(range);
    setSelectedPeriod('custom');
  };

  const getCurrentDateRange = () => {
    return selectedPeriod === 'custom' && customDateRange 
      ? customDateRange 
      : getDateRangeForPeriod(selectedPeriod);
  };

  // Génération de la recommandation personnalisée basée sur les vraies données
  const { wellbeingScore, sleepScore, energyScore, breaksScore, optimizationScore, dataAvailable, daysWithData, wellbeingRadarData, wellbeingLineData, tasksRadarData, optimizationLineData } = analytics;
  
  let recommendation = {
    color: 'bg-green-100 border-l-4 border-green-500',
    icon: '🌟',
    title: 'Bravo !',
    message: `Votre bien-être global est excellent (${wellbeingScore}/100). Continuez ainsi !`
  };
  
  if (!dataAvailable) {
    recommendation = {
      color: 'bg-blue-100 border-l-4 border-blue-500',
      icon: '📊',
      title: 'Données insuffisantes',
      message: 'Aucune donnée disponible pour cette période. Commencez par saisir vos informations quotidiennes.'
    };
  } else if (wellbeingScore < 60 || optimizationScore < 60) {
    const lowAreas = [];
    if (sleepScore < 60) lowAreas.push('sommeil');
    if (energyScore < 60) lowAreas.push('énergie');
    if (breaksScore < 60) lowAreas.push('pauses');
    if (optimizationScore < 60) lowAreas.push('optimisation du temps');
    
    recommendation = {
      color: 'bg-red-100 border-l-4 border-red-500',
      icon: '⚠️',
      title: 'Attention',
      message: `Scores faibles détectés : ${lowAreas.join(', ')}. Concentrez-vous sur ces aspects pour améliorer votre bien-être global (${wellbeingScore}/100).`
    };
  } else if (wellbeingScore < 75 || optimizationScore < 75) {
    recommendation = {
      color: 'bg-yellow-100 border-l-4 border-yellow-500',
      icon: '💡',
      title: 'À surveiller',
      message: `Bien-être à ${wellbeingScore}/100 sur ${daysWithData} jour(s). Consultez les graphiques pour identifier vos axes de progrès.`
    };
  } else {
    recommendation.message = `Excellent ! Bien-être à ${wellbeingScore}/100 et optimisation à ${optimizationScore}/100 sur ${daysWithData} jour(s).`;
  }


  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-light-gray">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark-blue">
                {t('dashboard.employee.title')}
              </h1>
              <p className="text-metallic-gray mt-1">
                Suivez votre bien-être et votre productivité
              </p>
            </div>

            {/* Sélecteur de période */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                {[
                  { key: 'today', label: t('dashboard.employee.today') || "Aujourd'hui" },
                  { key: 'week', label: t('dashboard.employee.week') || 'Cette semaine' },
                  { key: 'month', label: t('dashboard.employee.month') || 'Ce mois' },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => handlePeriodChange(period.key as PeriodType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      selectedPeriod === period.key
                        ? 'bg-blue-gray text-white'
                        : 'bg-light-gray text-dark-blue hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              
              {/* Bouton période personnalisée */}
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  selectedPeriod === 'custom'
                    ? 'bg-blue-gray text-white'
                    : 'bg-light-gray text-dark-blue hover:bg-gray-200'
                }`}
              >
                <Calendar size={16} />
                <span>{selectedPeriod === 'custom' && customDateRange 
                  ? formatDateRange(customDateRange) 
                  : 'Personnalisée'
                }</span>
                <ChevronDown size={14} />
              </button>
            </div>
            
            {/* Affichage de la période sélectionnée */}
            {selectedPeriod !== 'custom' && (
              <div className="text-sm text-metallic-gray">
                {formatDateRange(getCurrentDateRange())} • {dataAvailable ? `${daysWithData} jour(s) avec données` : 'Aucune donnée'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="text-lime-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">Score Bien-être</p>
                <p className="text-2xl font-bold text-dark-blue">{wellbeingScore}/100</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">Énergie</p>
                <p className="text-2xl font-bold text-dark-blue">{energyScore}/100</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">Sommeil</p>
                <p className="text-2xl font-bold text-dark-blue">{sleepScore}/100</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-metallic-gray">Optimisation du temps travaillé</p>
                <p className="text-2xl font-bold text-dark-blue">{optimizationScore}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Radar Bien-être */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <BarChart3 className="icon" size={20} />
                <h3 className="font-semibold">Profil Bien-être</h3>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {dataAvailable && wellbeingRadarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={wellbeingRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#32CD32" fill="#32CD32" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-metallic-gray">
                  <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Ligne évolution bien-être */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <TrendingUp className="icon" size={20} />
                <h3 className="font-semibold">Évolution Bien-être</h3>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {dataAvailable && wellbeingLineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wellbeingLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Sommeil" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="Énergie" stroke="#32CD32" strokeWidth={2} />
                    <Line type="monotone" dataKey="Fatigue" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="Pauses" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-metallic-gray">
                  <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Radar tâches */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <Target className="icon" size={20} />
                <h3 className="font-semibold">Répartition du temps sur les tâches</h3>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={tasksRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Temps (%)" dataKey="score" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Ligne optimisation du temps */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-2">
                <Activity className="icon" size={20} />
                <h3 className="font-semibold">Évolution Optimisation du temps</h3>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={optimizationLineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Optimisation" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommandation personnalisée */}
        <div className={`mt-8 p-4 rounded-lg ${recommendation.color}`}>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{recommendation.icon}</div>
            <div>
              <p className="font-bold text-dark-blue mb-1">{recommendation.title}</p>
              <p className="text-dark-blue">{recommendation.message}</p>
            </div>
          </div>
        </div>
        
        {/* Modal sélecteur de dates */}
        {showDatePicker && (
          <DateRangePicker
            value={customDateRange || getCurrentDateRange()}
            onChange={handleCustomDateRange}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        {/* Barre d'énergie actuelle */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Votre énergie actuelle</h3>
            </div>
            <EnergyBar
              energy={energyScore}
              showIcon={true}
              showPercentage={true}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployee; 