import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import './index.css';

// Composants de base
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import DashboardEmployee from './pages/DashboardEmployee';
import DashboardManager from './pages/DashboardManager';
import DashboardAdmin from './pages/DashboardAdmin';
import EntryForm from './pages/EntryForm';

// Import du vrai hook d'authentification
import { useAuth } from './hooks/useAuth';

function App() {
  const { t, ready } = useTranslation();
  const { user, loading, signOut, isAdmin, isManager, isAuthenticated } = useAuth();

  console.log('🎯 App render - i18n ready:', ready, 'auth loading:', loading);

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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-off-white">
        {user && <Header user={user} onSignOut={signOut} />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/auth/callback" 
              element={<AuthCallback />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  isAdmin ? <DashboardAdmin /> :
                  isManager ? <DashboardManager /> : 
                  <DashboardEmployee />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/entry" 
              element={
                isAuthenticated ? <EntryForm /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App; 