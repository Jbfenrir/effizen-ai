import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './index.css';

// Composants de base
import Header from './components/Header';
import NewLoginPage from './pages/NewLoginPage'; // Utiliser la nouvelle page
import AuthCallback from './pages/AuthCallback';
import DashboardEmployee from './pages/DashboardEmployee';
import DashboardManager from './pages/DashboardManager';
import DashboardAdmin from './pages/DashboardAdmin';
import EntryForm from './pages/EntryForm';

// Import du vrai hook d'authentification
import { useAuth } from './hooks/useAuth';

function AppRouter() {
  const { t, ready } = useTranslation();
  const { user, loading, signOut, isAdmin, isManager, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  console.log('🎯 AppRouter - Path:', currentPath, 'Auth:', isAuthenticated);

  // Afficher un loader si i18n ou auth ne sont pas prêts
  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto"></div>
          <p className="mt-4 text-metallic-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  // Gestion du callback
  if (currentPath === '/auth/callback' || currentPath.includes('access_token')) {
    return <AuthCallback />;
  }

  // Redirection si non authentifié
  if (!isAuthenticated && currentPath !== '/login') {
    navigate('/login');
  }

  // Redirection si authentifié et sur login
  if (isAuthenticated && currentPath === '/login') {
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-off-white">
      {user && <Header user={user} onSignOut={signOut} />}
      
      <main className="container mx-auto px-4 py-8">
        {currentPath === '/login' && !isAuthenticated && <NewLoginPage />}
        {currentPath === '/dashboard' && isAuthenticated && (
          isAdmin ? <DashboardAdmin /> :
          isManager ? <DashboardManager /> :
          <DashboardEmployee />
        )}
        {currentPath === '/entry' && isAuthenticated && <EntryForm />}
        {currentPath === '/' && (
          isAuthenticated ? (
            isAdmin ? <DashboardAdmin /> :
            isManager ? <DashboardManager /> :
            <DashboardEmployee />
          ) : <NewLoginPage />
        )}
      </main>
    </div>
  );
}

export default AppRouter;