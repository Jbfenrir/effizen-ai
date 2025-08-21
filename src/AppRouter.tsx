import React, { useEffect, useState, useCallback } from 'react';
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
import TestLoadingPage from './pages/TestLoadingPage';

// Import du hook d'authentification SIMPLIFIÉ pour debug
// import { useAuth } from './hooks/useAuth';
import { useAuthSimple as useAuth } from './hooks/useAuthSimple';

function AppRouter() {
  const { t, ready } = useTranslation();
  const { user, loading, signOut, isAdmin, isManager, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  }, []);

  // Hook pour écouter les changements d'URL
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Hook pour gérer les redirections - VERSION AMÉLIORÉE ANTI-BOUCLE
  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading || !ready) return;
    
    // Ne pas rediriger si on est sur la page de callback
    if (currentPath === '/auth/callback' || currentPath.includes('access_token')) return;
    
    // Tracker pour éviter les redirections multiples
    const lastRedirect = sessionStorage.getItem('lastRedirect');
    const now = Date.now();
    
    // Si une redirection a eu lieu il y a moins de 2 secondes, ne pas rediriger
    if (lastRedirect) {
      const lastRedirectTime = parseInt(lastRedirect, 10);
      if (now - lastRedirectTime < 2000) {
        console.log('🛑 AppRouter: Redirection ignorée (trop récente)');
        return;
      }
    }
    
    console.log('🎯 AppRouter navigation check:', { 
      isAuthenticated, 
      currentPath,
      shouldRedirectToLogin: !isAuthenticated && currentPath !== '/login',
      shouldRedirectToDashboard: isAuthenticated && (currentPath === '/login' || currentPath === '/')
    });
    
    // Utiliser un timeout pour éviter les re-renders immédiats
    const redirectTimeout = setTimeout(() => {
      if (!isAuthenticated && currentPath !== '/login') {
        console.log('🔄 AppRouter: Redirection vers /login');
        sessionStorage.setItem('lastRedirect', now.toString());
        navigate('/login');
      } else if (isAuthenticated && (currentPath === '/login' || currentPath === '/')) {
        console.log('🔄 AppRouter: Redirection vers /dashboard');
        sessionStorage.setItem('lastRedirect', now.toString());
        navigate('/dashboard');
      }
    }, 300); // 300ms de délai pour stabilité
    
    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, currentPath, loading, ready, navigate]);

  console.log('🎯 AppRouter - Path:', currentPath, 'Auth:', isAuthenticated, 'User:', user);

  // Afficher un loader si i18n ou auth ne sont pas prêts
  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto"></div>
          <p className="mt-4 text-metallic-gray">Chargement...</p>
          
          {/* BOUTON D'URGENCE - Si bloqué plus de 5 secondes */}
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-2">Bloqué sur cette page ?</p>
            <button 
              onClick={() => {
                console.log('🚨 Bouton d\'urgence activé!');
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Forcer la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Gestion du callback
  if (currentPath === '/auth/callback' || currentPath.includes('access_token')) {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-off-white">
      {user && <Header user={user} onSignOut={signOut} />}
      
      <main className="container mx-auto px-4 py-8">
        {/* Page de connexion */}
        {(currentPath === '/login' || (!isAuthenticated && currentPath === '/')) && <NewLoginPage />}
        
        {/* Dashboard - uniquement si authentifié */}
        {isAuthenticated && (currentPath === '/dashboard' || currentPath === '/') && (
          isAdmin ? <DashboardAdmin /> :
          isManager ? <DashboardManager /> :
          <DashboardEmployee />
        )}
        
        {/* Formulaire d'entrée - uniquement si authentifié */}
        {isAuthenticated && currentPath === '/entry' && <EntryForm />}
        
        {/* Page de test du bouton d'urgence */}
        {currentPath === '/test-loading' && <TestLoadingPage />}
      </main>
    </div>
  );
}

export default AppRouter;