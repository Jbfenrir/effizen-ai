import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, error: authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn(email);
      
      if (result.success) {
        setIsSent(true);
      } else {
        setError(result.error || t('auth.magicLinkError'));
      }
    } catch (err) {
      setError(t('auth.magicLinkError'));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (isSent) {
      setIsSent(false);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-gray flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="w-16 h-16 bg-lime-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-dark-blue font-bold text-2xl">E</span>
            </div>
            
            <h1 className="text-2xl font-bold text-dark-blue mb-2">
              {t('auth.signInTitle')}
            </h1>
            <p className="text-metallic-gray">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t('auth.emailPlaceholder')}
                    className="form-input pl-10"
                    required
                    disabled={loading}
                  />
                  <Mail 
                    size={20} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metallic-gray" 
                  />
                </div>
              </div>

              {(error || authError) && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{error || authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>{t('auth.sendMagicLink')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-lime-green rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-dark-blue mb-2">
                  {t('auth.magicLinkSent')}
                </h2>
                <p className="text-metallic-gray">
                  Vérifiez votre boîte de réception et cliquez sur le lien de connexion.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
                className="btn-secondary w-full"
              >
                Envoyer un nouveau lien
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage; 