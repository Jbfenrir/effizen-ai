import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  BarChart3,
  Plus
} from 'lucide-react';

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const { t, i18n } = useTranslation();
  const currentPath = window.location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // SUPPRESSION: const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // SUPPRESSION: const toggleTheme = () => { ... }

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: BarChart3 },
    { name: t('navigation.entry'), href: '/entry', icon: Plus },
  ];

  // Fonction d'export CSV
  const exportData = () => {
    // Récupérer toutes les entrées sauvegardées dans le localStorage
    const entries = Object.keys(localStorage)
      .filter(key => key.startsWith('entry-'))
      .map(key => JSON.parse(localStorage.getItem(key) || '{}'))
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
    
    if (entries.length === 0) {
      alert('Aucune donnée à exporter.');
      return;
    }

    // Calcul des scores comme dans dataAnalytics.ts
    const calculateSleepScore = (sleepData: any): number => {
      if (!sleepData || sleepData.duration === undefined) return 0;
      return Math.min((sleepData.duration / 8) * 100, 100);
    };

    const calculateEnergyScore = (wellbeingData: any): number => {
      if (!wellbeingData || wellbeingData.energy === undefined) return 0;
      return wellbeingData.energy;
    };

    const calculateBreaksScore = (wellbeingData: any): number => {
      if (!wellbeingData?.meditationsPauses) return 0;
      const pausesCount = [
        wellbeingData.meditationsPauses.morning,
        wellbeingData.meditationsPauses.noon,
        wellbeingData.meditationsPauses.afternoon,
        wellbeingData.meditationsPauses.evening
      ].filter(Boolean).length;
      return pausesCount * 25; // 4 créneaux = 100%
    };

    const calculateOptimizationScore = (tasksData: any[], focusData: any): number => {
      if (!tasksData?.length || !focusData) return 0;
      
      const totalHours = focusData.morningHours + focusData.afternoonHours;
      if (totalHours === 0) return 0;
      
      const highValueTasks = tasksData.filter((task: any) => task.isHighValue);
      const highValueHours = highValueTasks.reduce((sum: number, task: any) => sum + task.duration, 0);
      
      const efficiency = (highValueHours / totalHours) * 100;
      const fatigueBonus = Math.max(0, (5 - focusData.fatigue) * 5);
      
      return Math.min(efficiency + fatigueBonus, 100);
    };

    const calculateFatigueScore = (focusData: any): number => {
      if (!focusData || focusData.fatigue === undefined) return 60;
      return (5 - focusData.fatigue) * 20;
    };

    // Générer le CSV avec toutes les colonnes demandées
    const headers = [
      'Date', 
      'Sommeil (h)', 
      'Fatigue', 
      'Energie', 
      'Pauses', 
      'Bien-être',
      'Score d\'optimisation',
      'Tâches'
    ];
    
    const rows = entries.map(e => {
      const sleepScore = Math.round(calculateSleepScore(e.sleep));
      const energyScore = Math.round(calculateEnergyScore(e.wellbeing));
      const breaksScore = Math.round(calculateBreaksScore(e.wellbeing));
      const optimizationScore = Math.round(calculateOptimizationScore(e.tasks, e.focus));
      const fatigueScore = calculateFatigueScore(e.focus);
      const wellbeingScore = Math.round((sleepScore + energyScore + fatigueScore + breaksScore) / 4);
      
      // Compter les pauses actives
      const pausesActive = e.wellbeing?.meditationsPauses ? [
        e.wellbeing.meditationsPauses.morning,
        e.wellbeing.meditationsPauses.noon, 
        e.wellbeing.meditationsPauses.afternoon,
        e.wellbeing.meditationsPauses.evening
      ].filter(Boolean).length : 0;

      return [
        e.entry_date,
        e.sleep?.duration ?? '',
        e.focus?.fatigue ?? '',
        energyScore,
        pausesActive,
        wellbeingScore,
        optimizationScore,
        (e.tasks || []).map(t => `${t.name} (${t.duration}h)`).join(' | ')
      ];
    });
    
    let csv = headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    
    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'effizen-data-complet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-dark-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a 
            href="/dashboard" 
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-lime-green rounded-lg flex items-center justify-center">
              <span className="text-dark-blue font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">EffiZen-AI</span>
          </a>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', item.href);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-gray text-white' 
                      : 'text-metallic-gray hover:text-white hover:bg-blue-gray'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Toggle langue */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-metallic-gray hover:text-white transition-colors duration-200 focus-ring font-bold"
              title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              {i18n.language === 'fr' ? 'FR' : 'EN'} / {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* SUPPRESSION: Toggle thème */}

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 text-metallic-gray hover:text-white transition-colors duration-200 focus-ring"
              >
                <User size={20} />
                <span className="hidden sm:block">{user.email}</span>
                {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-light-gray z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-dark-blue border-b border-light-gray">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-metallic-gray">{user.role} - {user.team}</div>
                    </div>
                    
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-dark-blue hover:bg-light-gray transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      <span>{t('navigation.logout')}</span>
                    </button>
                    <button
                      onClick={exportData}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-dark-blue hover:bg-light-gray transition-colors duration-200"
                    >
                      <span>Exporter mes données</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-gray">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      window.history.pushState({}, '', item.href);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-gray text-white' 
                        : 'text-metallic-gray hover:text-white hover:bg-blue-gray'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 