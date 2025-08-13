import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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

  // Fonction d’export CSV
  const exportData = () => {
    // Récupérer toutes les entrées sauvegardées dans le localStorage
    const entries = Object.keys(localStorage)
      .filter(key => key.startsWith('entry-'))
      .map(key => JSON.parse(localStorage.getItem(key) || '{}'));
    if (entries.length === 0) {
      alert('Aucune donnée à exporter.');
      return;
    }
    // Générer le CSV
    const headers = ['Date', 'Sommeil (h)', 'Fatigue', 'Tâches', 'Bien-être'];
    const rows = entries.map(e => [
      e.entry_date,
      e.sleep?.duration ?? '',
      e.focus?.fatigue ?? '',
      (e.tasks || []).map(t => t.name + ' (' + t.duration + 'h)').join(' | '),
      Object.entries(e.wellbeing?.breaks || {}).map(([k, v]) => (v ? k : null)).filter(Boolean).join(', ')
    ]);
    let csv = headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'effizen-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-dark-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lime-green rounded-lg flex items-center justify-center">
              <span className="text-dark-blue font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">EffiZen-AI</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-gray text-white' 
                      : 'text-metallic-gray hover:text-white hover:bg-blue-gray'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
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
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-gray text-white' 
                        : 'text-metallic-gray hover:text-white hover:bg-blue-gray'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
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