import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    console.log('🔑 ResetPasswordPage: Page de réinitialisation chargée');
    console.log('📍 URL complète:', window.location.href);
    
    // Vérifier si nous avons les paramètres de récupération dans l'URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
    const type = hashParams.get('type') || searchParams.get('type');
    const code = searchParams.get('code'); // Pour le flux PKCE
    
    console.log('🔍 Paramètres détectés:', { 
      accessToken: !!accessToken, 
      refreshToken: !!refreshToken,
      type, 
      code: !!code 
    });
    
    const checkRecoverySession = async () => {
      try {
        // PRIORITÉ 1: Gérer le flux PKCE avec code
        if (code && !accessToken) {
          console.log('🔄 ResetPasswordPage: Code PKCE détecté, échange en cours...');
          
          try {
            const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('❌ ResetPasswordPage: Erreur échange code:', exchangeError);
              setError('Erreur lors de la validation du lien. Veuillez demander un nouveau lien.');
              return;
            }
            
            if (session && session.user) {
              console.log('✅ ResetPasswordPage: Session établie via PKCE pour:', session.user.email);
              setSessionReady(true);
              window.history.replaceState({}, document.title, '/reset-password');
              return;
            }
          } catch (pkceError) {
            console.error('🚨 ResetPasswordPage: Erreur PKCE:', pkceError);
            setError('Erreur lors du traitement du lien de récupération.');
            return;
          }
        }
        
        // PRIORITÉ 2: Gérer les tokens directs (access_token + refresh_token)
        if (accessToken && type === 'recovery') {
          console.log('🔄 ResetPasswordPage: Token de récupération détecté, établissement de la session...');
          
          try {
            // Forcer l'établissement de la session avec un refresh token valide
            const sessionData = {
              access_token: accessToken,
              refresh_token: refreshToken || 'placeholder-refresh-token',
              expires_in: 3600,
              token_type: 'bearer'
            };
            
            const { data, error: sessionError } = await supabase.auth.setSession(sessionData);
            
            if (sessionError) {
              console.error('❌ ResetPasswordPage: Erreur établissement session:', sessionError);
              // Essayer une méthode alternative si setSession échoue
              console.log('🔄 Tentative alternative avec refreshSession...');
              
              // Alternative: forcer une nouvelle session
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError || !refreshData?.session) {
                console.error('❌ ResetPasswordPage: Échec méthode alternative:', refreshError);
                setError('Lien de récupération expiré ou invalide. Veuillez demander un nouveau lien.');
                return;
              } else {
                console.log('✅ ResetPasswordPage: Session alternative établie');
                setSessionReady(true);
                window.history.replaceState({}, document.title, '/reset-password');
                return;
              }
            }
            
            if (data?.session && data.session.user) {
              console.log('✅ ResetPasswordPage: Session établie avec succès pour:', data.session.user.email);
              setSessionReady(true);
              window.history.replaceState({}, document.title, '/reset-password');
              return;
            }
          } catch (tokenError) {
            console.error('🚨 ResetPasswordPage: Erreur traitement token:', tokenError);
            setError('Erreur lors du traitement du token de récupération.');
            return;
          }
        }
        
        // PRIORITÉ 3: Vérifier si nous avons déjà une session valide
        console.log('🔍 Vérification session existante...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ ResetPasswordPage: Erreur session:', error);
          setError('Lien de réinitialisation invalide ou expiré');
          return;
        }

        if (!session?.user) {
          console.error('❌ ResetPasswordPage: Aucune session utilisateur');
          setError('Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.');
          return;
        }

        console.log('✅ ResetPasswordPage: Session utilisateur valide:', session.user.email);
        console.log('🔑 ResetPasswordPage: Prêt pour la réinitialisation');
        setSessionReady(true);
      } catch (error) {
        console.error('🚨 ResetPasswordPage: Erreur catch:', error);
        setError('Une erreur est survenue lors de la vérification');
      }
    };

    checkRecoverySession();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔑 ResetPasswordPage: Mise à jour du mot de passe...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        console.error('❌ ResetPasswordPage: Erreur mise à jour:', error);
      } else {
        console.log('✅ ResetPasswordPage: Mot de passe mis à jour avec succès');
        setSuccess(true);
        
        // Redirection vers le dashboard après succès
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour du mot de passe');
      console.error('🚨 ResetPasswordPage: Erreur catch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-dark-blue">
              Mot de passe mis à jour !
            </h2>
            <p className="mt-2 text-sm text-metallic-gray">
              Redirection vers votre dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-green mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un état de chargement pendant la vérification de session
  if (!sessionReady && !error) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-dark-blue">
              Vérification en cours...
            </h2>
            <p className="mt-2 text-sm text-metallic-gray">
              Validation de votre lien de réinitialisation
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-green mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le lien est invalide
  if (error && !sessionReady) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-dark-blue">
              Erreur de validation
            </h2>
            <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
            <a href="/login" className="mt-4 inline-block text-lime-green hover:text-blue-gray">
              Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-blue">
            Réinitialiser votre mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-metallic-gray">
            Entrez votre nouveau mot de passe ci-dessous
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-dark-blue mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                className="form-input w-full"
                placeholder="Minimum 6 caractères"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-dark-blue mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="form-input w-full"
                placeholder="Retapez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;