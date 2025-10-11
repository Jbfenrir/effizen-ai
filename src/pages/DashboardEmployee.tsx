import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Activity, Target, Clock, Heart, Calendar, ChevronDown, BookOpen, ExternalLink } from 'lucide-react';
import EnergyBar from '../components/EnergyBar';
import DateRangePicker from '../components/DateRangePicker';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { getDateRangeForPeriod, formatDateRange, type PeriodType, type DateRange } from '../utils/dateUtils';
import { calculateAnalyticsForPeriod, getAllEntries, type AnalyticsData } from '../utils/dataAnalytics';
import { generateAdvicePair, type AdvicePair, type SmartAdvice } from '../utils/adviceGeneratorWithTranslation';
import DataMigration from '../utils/dataMigration';
import DataIntegrityAlert from '../components/DataIntegrityAlert';


const DashboardEmployee: React.FC = () => {
  const { t } = useTranslation();

  // Restaurer la période depuis l'URL ou localStorage
  const getInitialPeriod = (): PeriodType => {
    const params = new URLSearchParams(window.location.search);
    const periodParam = params.get('period');
    if (periodParam && ['today', 'week', 'month', 'custom'].includes(periodParam)) {
      return periodParam as PeriodType;
    }
    const savedPeriod = localStorage.getItem('dashboardPeriod');
    if (savedPeriod && ['today', 'week', 'month', 'custom'].includes(savedPeriod)) {
      return savedPeriod as PeriodType;
    }
    return 'week';
  };

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(getInitialPeriod());

  // Restaurer customDateRange depuis localStorage
  const getInitialCustomRange = (): DateRange | null => {
    const savedRange = localStorage.getItem('dashboardCustomRange');
    if (savedRange) {
      try {
        const parsed = JSON.parse(savedRange);
        // Convertir les strings en objets Date
        if (parsed && parsed.start && parsed.end) {
          return {
            start: new Date(parsed.start),
            end: new Date(parsed.end)
          } as DateRange;
        }
      } catch (e) {
        console.warn('Erreur parsing dashboardCustomRange:', e);
        localStorage.removeItem('dashboardCustomRange'); // Nettoyer la valeur corrompue
      }
    }
    return null;
  };

  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(getInitialCustomRange());
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

  const [advicePair, setAdvicePair] = useState<AdvicePair | null>(null);

  // Exposer DataMigration globalement pour debugging
  useEffect(() => {
    (window as any).DataMigration = DataMigration;
  }, []);

  // Calculer les données analytiques et générer les conseils
  useEffect(() => {
    const loadAnalyticsAndAdvice = async () => {
      try {
        const entries = await getAllEntries();
        const dateRange = selectedPeriod === 'custom' && customDateRange 
          ? customDateRange 
          : getDateRangeForPeriod(selectedPeriod);
        
        const analyticsData = calculateAnalyticsForPeriod(entries, dateRange);
        setAnalytics(analyticsData);
        
        // Générer les conseils intelligents (paire Santé + Organisation)
        try {
          const advice = await generateAdvicePair(entries, analyticsData);
          setAdvicePair(advice);
        } catch (error) {
          console.warn('Erreur génération conseils:', error);
          setAdvicePair(null);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        // En cas d'erreur, utiliser des données vides
        setAnalytics({
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
        setAdvicePair(null);
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
      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('dashboardPeriod', period);
    }
  };

  const handleCustomDateRange = (range: DateRange) => {
    setCustomDateRange(range);
    setSelectedPeriod('custom');
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('dashboardPeriod', 'custom');
    localStorage.setItem('dashboardCustomRange', JSON.stringify(range));
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
                {t('dashboard.employee.subtitle')}
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
                  : t('dashboard.employee.customPeriod')
                }</span>
                <ChevronDown size={14} />
              </button>
            </div>
            
            {/* Affichage de la période sélectionnée */}
            {selectedPeriod !== 'custom' && (
              <div className="text-sm text-metallic-gray">
                {formatDateRange(getCurrentDateRange())} • {dataAvailable ? `${daysWithData} ${t('dashboard.employee.daysWithData')}` : t('dashboard.employee.noData')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alerte intégrité des données */}
        <DataIntegrityAlert className="mb-8" />

        {/* SECTION 1: BIEN-ÉTRE */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-blue mb-2">{t('dashboard.employee.wellbeingSection')}</h2>
            <p className="text-metallic-gray">{t('dashboard.employee.wellbeingOverview')}</p>
          </div>
          
          {/* 4 blocs bien-être : Score, Sommeil, Énergie, Équilibre */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="text-lime-green" size={24} />
                </div>
                <div>
                  <p className="text-sm text-metallic-gray">{t('dashboard.employee.wellbeingScoreLabel')}</p>
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
                  <p className="text-sm text-metallic-gray">{t('dashboard.employee.sleep')}</p>
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
                  <p className="text-sm text-metallic-gray">{t('dashboard.employee.energy')}</p>
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
                  <p className="text-sm text-metallic-gray">{t('dashboard.employee.balance')}</p>
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
                  <h3 className="font-semibold">{t('dashboard.employee.wellbeingProfile')}</h3>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                {dataAvailable && wellbeingRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={wellbeingRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name={t('dashboard.employee.score')} dataKey="score" stroke="#32CD32" fill="#32CD32" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-metallic-gray">
                    <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t('dashboard.employee.noDataAvailable')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Évolution Bien-être avec dates JJ/MM */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="icon" size={20} />
                  <h3 className="font-semibold">{t('dashboard.employee.wellbeingEvolution')}</h3>
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
                      <Line type="monotone" dataKey={t('dashboard.employee.sleepLine')} stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey={t('dashboard.employee.energyLine')} stroke="#32CD32" strokeWidth={2} />
                      <Line type="monotone" dataKey="Fatigue" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey={t('dashboard.employee.pausesLine')} stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-metallic-gray">
                    <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t('dashboard.employee.noDataAvailable')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: OPTIMISATION DU TEMPS TRAVAILLÉ */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-blue mb-2">{t('dashboard.employee.optimizationSection')}</h2>
            <p className="text-metallic-gray">{t('dashboard.employee.optimizationDescription')}</p>
          </div>
          
          {/* Bloc optimisation pleine largeur */}
          <div className="card mb-8">
            <div className="flex items-center space-x-6 p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="text-orange-600" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark-blue">{t('dashboard.employee.optimizationScore')}</h3>
                <p className="text-metallic-gray mb-2">{t('dashboard.employee.highValueTasksTime')}</p>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-orange-600">{optimizationScore}/100</div>
                  <div className="text-sm text-metallic-gray">
                    {optimizationScore >= 70 ? t('dashboard.employee.excellentOptimization') :
                     optimizationScore >= 50 ? t('dashboard.employee.goodOptimization') :
                     optimizationScore >= 30 ? t('dashboard.employee.insufficientOptimization') :
                     t('dashboard.employee.criticalDispersion')}
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
                  <h3 className="font-semibold">{t('dashboard.employee.taskDistribution')}</h3>
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
                    <p>{t('dashboard.employee.noDataAvailable')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Évolution optimisation du temps */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <Activity className="icon" size={20} />
                  <h3 className="font-semibold">{t('dashboard.employee.optimizationEvolution')}</h3>
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
                      <Line type="monotone" dataKey={t('dashboard.employee.optimizationLine')} stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-metallic-gray">
                    <Activity size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t('dashboard.employee.noDataAvailable')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conseils intelligents avec diagnostic et recommandations - 2 BLOCS */}
        {advicePair && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* BLOC 1: SANTÉ */}
            <div className={`rounded-lg ${advicePair.health.color}`}>
              <div className="p-6">
                {/* En-tête avec catégorie */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{advicePair.health.icon}</div>
                  <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-semibold text-dark-blue">
                    {t('dashboard.employee.categoryHealth')}
                  </span>
                </div>

                {/* Diagnostic */}
                <h3 className="font-bold text-dark-blue text-lg mb-3">
                  {t('dashboard.employee.expertDiagnosis')}
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <p className="text-dark-blue font-medium">{advicePair.health.diagnosis}</p>
                </div>

                {/* Conseils */}
                <h3 className="font-bold text-dark-blue text-lg mb-3">
                  {t('dashboard.employee.practicalAdvice')}
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <div className="text-dark-blue whitespace-pre-line">{advicePair.health.recommendation}</div>
                </div>

                {/* Sources scientifiques */}
                {advicePair.health.scientificSources && advicePair.health.scientificSources.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2 mb-2">
                      <BookOpen size={16} className="text-dark-blue mt-1 flex-shrink-0" />
                      <h4 className="font-semibold text-dark-blue text-sm">
                        {t('dashboard.employee.scientificSources')}
                      </h4>
                    </div>
                    <ul className="text-xs text-dark-blue space-y-1 ml-6">
                      {advicePair.health.scientificSources.map((source, index) => (
                        <li key={index} className="opacity-80">• {source}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bouton En savoir plus */}
                {advicePair.health.learnMoreUrl && (
                  <a
                    href={advicePair.health.learnMoreUrl}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-70 hover:bg-opacity-90 text-dark-blue font-medium rounded-lg transition-all duration-200"
                  >
                    <ExternalLink size={16} />
                    <span>{t('dashboard.employee.learnMore')}</span>
                  </a>
                )}
              </div>
            </div>

            {/* BLOC 2: ORGANISATION */}
            <div className={`rounded-lg ${advicePair.organization.color}`}>
              <div className="p-6">
                {/* En-tête avec catégorie */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{advicePair.organization.icon}</div>
                  <span className="px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-semibold text-dark-blue">
                    {t('dashboard.employee.categoryOrganization')}
                  </span>
                </div>

                {/* Diagnostic */}
                <h3 className="font-bold text-dark-blue text-lg mb-3">
                  {t('dashboard.employee.expertDiagnosis')}
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <p className="text-dark-blue font-medium">{advicePair.organization.diagnosis}</p>
                </div>

                {/* Conseils */}
                <h3 className="font-bold text-dark-blue text-lg mb-3">
                  {t('dashboard.employee.practicalAdvice')}
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <div className="text-dark-blue whitespace-pre-line">{advicePair.organization.recommendation}</div>
                </div>

                {/* Sources scientifiques */}
                {advicePair.organization.scientificSources && advicePair.organization.scientificSources.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2 mb-2">
                      <BookOpen size={16} className="text-dark-blue mt-1 flex-shrink-0" />
                      <h4 className="font-semibold text-dark-blue text-sm">
                        {t('dashboard.employee.scientificSources')}
                      </h4>
                    </div>
                    <ul className="text-xs text-dark-blue space-y-1 ml-6">
                      {advicePair.organization.scientificSources.map((source, index) => (
                        <li key={index} className="opacity-80">• {source}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bouton En savoir plus */}
                {advicePair.organization.learnMoreUrl && (
                  <a
                    href={advicePair.organization.learnMoreUrl}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-70 hover:bg-opacity-90 text-dark-blue font-medium rounded-lg transition-all duration-200"
                  >
                    <ExternalLink size={16} />
                    <span>{t('dashboard.employee.learnMore')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Note basée sur l'analyse */}
        {dataAvailable && advicePair && (
          <div className="mt-4 text-center text-sm text-metallic-gray">
            {t('dashboard.employee.basedOnAnalysis', { days: daysWithData })}
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