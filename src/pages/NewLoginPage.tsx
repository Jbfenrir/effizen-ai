import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const NewLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signInWithPassword, signInWithMagicLink, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [message, setMessage] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    
    if (!email || !password) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    const result = await signInWithPassword(email, password);
    
    if (result.success) {
      setMessage('Connexion réussie !');
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

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-blue">
            EffiZen-AI
          </h2>
          <p className="mt-2 text-center text-sm text-metallic-gray">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Mode de connexion */}
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

          {loginMode === 'password' ? (
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

          {/* Info admin */}
          <div className="mt-6 text-xs text-center text-metallic-gray">
            <p><strong>Admin:</strong> jbgerberon@gmail.com</p>
            <p>Mot de passe temporaire: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLoginPage;