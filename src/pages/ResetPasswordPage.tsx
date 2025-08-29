import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔑 ResetPasswordPage: Page de réinitialisation chargée');
    
    // Vérifier si nous avons une session valide (après clic sur lien de récupération)
    const checkRecoverySession = async () => {
      try {
        // Attendre un peu pour que la session soit établie
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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