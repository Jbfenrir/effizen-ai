import React, { useEffect, useState } from 'react';
// Service unifié - Plus de conflit d'instances multiples
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    console.log('🔄 AuthCallback: Traitement du callback...');
    
    // Vérifier si c'est un callback de récupération de mot de passe
    const urlParams = new URLSearchParams(window.location.search);
    const recoveryType = urlParams.get('type');
    
    const handleCallback = async () => {
      try {
        // Vérifier si c'est une récupération de mot de passe
        if (recoveryType === 'recovery') {
          console.log('🔑 AuthCallback: Mode récupération de mot de passe détecté');
          setIsRecovery(true);
          return; // Afficher le formulaire de nouveau mot de passe
        }
        
        // Récupérer la session depuis l'URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthCallback: Erreur:', error);
          window.location.href = '/login';
          return;
        }

        if (session) {
          console.log('✅ AuthCallback: Session établie, redirection...');
          // Attendre un peu pour que le state se mette à jour, puis recharger
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        } else {
          console.log('⚠️ AuthCallback: Pas de session');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('🚨 AuthCallback: Erreur catch:', error);
        window.location.href = '/login';
      }
    };

    handleCallback();
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        console.error('❌ AuthCallback: Erreur mise à jour mot de passe:', error);
      } else {
        console.log('✅ AuthCallback: Mot de passe mis à jour avec succès');
        // Redirection vers le dashboard après succès
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour du mot de passe');
      console.error('🚨 AuthCallback: Erreur catch:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si c'est une récupération de mot de passe, afficher le formulaire
  if (isRecovery) {
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
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto"></div>
        <p className="mt-4 text-metallic-gray">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;