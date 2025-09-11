import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// 🔄 SYSTÈME DE BASCULEMENT AUTH - Utiliser la même logique que AppRouter
import { AUTH_CONFIG } from '../config/auth-switch';
import { useAuth } from '../hooks/useAuth';
import { useAuthNew } from '../hooks/useAuthNew';

// Hook sélectionné selon la configuration
const useSelectedAuth = AUTH_CONFIG.USE_AUTH_SYSTEM === 'NEW' ? useAuthNew : useAuth;

const NewLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    signInWithPassword, 
    signInWithMagicLink,
    resetPasswordForEmail,
    loading, 
    error, 
    clearError, 
    user, 
    isAuthenticated 
  } = useSelectedAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'magic' | 'reset'>('password');
  // Mode magic et reset désactivés - masqués sur demande utilisateur
  const magicLinkEnabled = false;
  const resetPasswordEnabled = false;
  const [message, setMessage] = useState<string | null>(null);

  // 🚀 CORRECTION: Redirection automatique après connexion
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🚀 NewLoginPage: Utilisateur connecté détecté, redirection vers dashboard');
      setMessage('Connexion réussie ! Redirection...');
      
      // Redirection immédiate
      setTimeout(() => {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 500); // Petit délai pour montrer le message
    }
  }, [isAuthenticated, user]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    
    if (!email || !password) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    console.log('🔐 NewLoginPage: Tentative de connexion pour:', email);
    const result = await signInWithPassword(email, password);
    
    if (result.success) {
      console.log('✅ NewLoginPage: Connexion réussie, en attente de redirection...');
      setMessage('Connexion réussie ! Redirection en cours...');
      // La redirection sera gérée par useEffect quand user sera défini
    } else {
      console.log('❌ NewLoginPage: Échec de connexion:', result.error);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    
    if (!email) {
      setMessage('Veuillez entrer votre email');
      return;
    }

    const result = await signInWithMagicLink(email);
    
    if (result.success) {
      setMessage('Lien de connexion envoyé ! Vérifiez votre boîte email.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    
    if (!email) {
      setMessage('Veuillez entrer votre email');
      return;
    }

    console.log('🔑 Demande de réinitialisation pour:', email);
    const result = await resetPasswordForEmail(email);
    
    if (result.success) {
      setMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
      // Revenir au mode connexion après succès
      setTimeout(() => {
        setLoginMode('password');
        setMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-blue">
            EffiZen-AI
          </h2>
          <p className="mt-2 text-center text-sm text-metallic-gray">
            Connexion à votre espace de bien-être
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Mode de connexion - onglet Lien email masqué */}
          {magicLinkEnabled && (
            <div className="mb-6">
              <div className="flex rounded-lg bg-light-gray p-1">
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    loginMode === 'password'
                      ? 'bg-white text-dark-blue shadow'
                      : 'text-metallic-gray hover:text-dark-blue'
                  }`}
                >
                  Mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('magic')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    loginMode === 'magic'
                      ? 'bg-white text-dark-blue shadow'
                      : 'text-metallic-gray hover:text-dark-blue'
                  }`}
                >
                  Lien email
                </button>
              </div>
            </div>
          )}

          {loginMode === 'reset' ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-metallic-gray mb-4">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>
              <div>
                <label htmlFor="reset-email" className="sr-only">
                  Email
                </label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  required
                  className="form-input w-full"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setLoginMode('password');
                  setMessage(null);
                  clearError();
                }}
                className="w-full text-sm text-metallic-gray hover:text-dark-blue"
              >
                Retour à la connexion
              </button>
            </form>
          ) : loginMode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input w-full"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input w-full"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
              
              {/* Lien "Mot de passe oublié ?" masqué */}
              {resetPasswordEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('reset');
                    setMessage(null);
                    clearError();
                  }}
                  className="mt-2 w-full text-sm text-metallic-gray hover:text-dark-blue"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input w-full"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Envoi...' : 'Envoyer un lien de connexion'}
              </button>
            </form>
          )}

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewLoginPage;