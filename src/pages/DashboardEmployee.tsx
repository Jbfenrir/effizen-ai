import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Activity, Target, Clock, Heart, Calendar, ChevronDown } from 'lucide-react';
import EnergyBar from '../components/EnergyBar';
import DateRangePicker from '../components/DateRangePicker';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { getDateRangeForPeriod, formatDateRange, type PeriodType, type DateRange } from '../utils/dateUtils';
import { calculateAnalyticsForPeriod, getAllEntriesFromStorage, type AnalyticsData } from '../utils/dataAnalytics';
import { generateSmartAdvice, type SmartAdvice } from '../utils/adviceGenerator';


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
  
  const [smartAdvice, setSmartAdvice] = useState<SmartAdvice | null>(null);

  // Calculer les données analytiques et générer les conseils
  useEffect(() => {
    const loadAnalyticsAndAdvice = async () => {
      const entries = getAllEntriesFromStorage();
      const dateRange = selectedPeriod === 'custom' && customDateRange 
        ? customDateRange 
        : getDateRangeForPeriod(selectedPeriod);
      
      const analyticsData = calculateAnalyticsForPeriod(entries, dateRange);
      setAnalytics(analyticsData);
      
      // Générer les conseils intelligents
      try {
        const advice = await generateSmartAdvice(entries, analyticsData);
        setSmartAdvice(advice);
      } catch (error) {
        console.warn('Erreur génération conseils:', error);
        setSmartAdvice(null);
      }
    };
    
    loadAnalyticsAndAdvice();
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

  // Extraire les données analytiques
  const { wellbeingScore, sleepScore, energyScore, breaksScore, optimizationScore, dataAvailable, daysWithData, wellbeingRadarData, wellbeingLineData, tasksRadarData, optimizationLineData } = analytics;


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
        {/* SECTION 1: BIEN-ÉTRE */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-blue mb-2">🌱 Bien-être</h2>
            <p className="text-metallic-gray">Vue d'ensemble de votre équilibre personnel</p>
          </div>
          
          {/* 4 blocs bien-être : Score, Sommeil, Énergie, Équilibre */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-lime-green" size={24} />
                </div>
                <div>
                  <p className="text-sm text-metallic-gray">Score de bien-être</p>
                  <p className="text-2xl font-bold text-dark-blue">{wellbeingScore}/100</p>
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
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-teal-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-metallic-gray">Équilibre</p>
                  <p className="text-2xl font-bold text-dark-blue">{breaksScore}/100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques bien-être */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profil Bien-être */}
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

            {/* Évolution Bien-être avec dates JJ/MM */}
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
          </div>
        </div>

        {/* SECTION 2: OPTIMISATION DU TEMPS TRAVAILLÉ */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-blue mb-2">🎯 Optimisation du temps travaillé</h2>
            <p className="text-metallic-gray">Analyse dans quelle mesure vous consacrez votre temps et votre énergie aux tâches les plus importantes de votre poste.</p>
          </div>
          
          {/* Bloc optimisation pleine largeur */}
          <div className="card mb-8">
            <div className="flex items-center space-x-6 p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="text-orange-600" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark-blue">Score d'Optimisation</h3>
                <p className="text-metallic-gray mb-2">Temps consacré aux tâches à haute valeur ajoutée</p>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-orange-600">{optimizationScore}/100</div>
                  <div className="text-sm text-metallic-gray">
                    {optimizationScore >= 70 ? '🎆 Excellente optimisation' : 
                     optimizationScore >= 50 ? '👍 Bonne optimisation' :
                     optimizationScore >= 30 ? '⚠️ Optimisation insuffisante' :
                     '🚨 Dispersion critique'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques optimisation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camembert répartition des tâches */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <Target className="icon" size={20} />
                  <h3 className="font-semibold">Répartition du temps des tâches</h3>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                {dataAvailable && tasksRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksRadarData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="score"
                        nameKey="subject"
                      >
                        {tasksRadarData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              '#32CD32', // Vert lime
                              '#ff7300', // Orange
                              '#6366f1', // Bleu
                              '#f59e0b', // Jaune
                              '#ef4444', // Rouge
                              '#8b5cf6', // Violet
                            ][index % 6]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-metallic-gray">
                    <Target size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Évolution optimisation du temps */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <Activity className="icon" size={20} />
                  <h3 className="font-semibold">Évolution de l'optimisation du temps</h3>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                {dataAvailable && optimizationLineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={optimizationLineData}>  
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Optimisation" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-metallic-gray">
                    <Activity size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conseils intelligents avec diagnostic et recommandations */}
        {smartAdvice && (
          <div className={`mt-8 rounded-lg ${smartAdvice.color}`}>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{smartAdvice.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark-blue text-lg mb-3">
                    🎯 Diagnostic Expert
                  </h3>
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                    <p className="text-dark-blue font-medium">{smartAdvice.diagnosis}</p>
                  </div>
                  
                  <h3 className="font-bold text-dark-blue text-lg mb-3">
                    💡 Conseils Pratiques
                  </h3>
                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="text-dark-blue whitespace-pre-line">{smartAdvice.recommendation}</div>
                  </div>
                  
                  {dataAvailable && (
                    <div className="mt-4 text-sm text-dark-blue opacity-75">
                      Basé sur {daysWithData} jour(s) d'analyse avec nos expertises en bien-être au travail
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal sélecteur de dates */}
        {showDatePicker && (
          <DateRangePicker
            value={customDateRange || getCurrentDateRange()}
            onChange={handleCustomDateRange}
            onClose={() => setShowDatePicker(false)}
          />
        )}

      </div>
    </div>
  );
};

export default DashboardEmployee; 