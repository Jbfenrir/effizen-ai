import React, { useState } from 'react';
import { X, Key, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase, supabaseAdmin } from '../services/supabase';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userId,
}) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Générer un mot de passe aléatoire
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setGeneratedPassword(password);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError(t('dashboard.admin.passwordReset.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('dashboard.admin.passwordReset.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vérifier si supabaseAdmin est disponible
      if (!supabaseAdmin) {
        // Alternative : Envoyer un email de réinitialisation
        console.log('Service admin non disponible, utilisation de la méthode email');
        
        // Afficher le mot de passe généré pour copie manuelle
        if (!generatedPassword) {
          setError('Veuillez générer un mot de passe à communiquer manuellement à l\'utilisateur');
          setLoading(false);
          return;
        }
        
        // Simuler le succès pour permettre la copie du mot de passe
        setSuccess(true);
        setError('');
        
        // Message informatif
        console.log('Mot de passe à configurer manuellement pour:', userEmail);
        console.log('Nouveau mot de passe:', generatedPassword || newPassword);
        
      } else {
        // Utiliser updateUserById si admin disponible
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (updateError) {
          throw updateError;
        }
      }

      setSuccess(true);
      
      // Copier le mot de passe dans le presse-papiers si généré
      if (generatedPassword) {
        try {
          await navigator.clipboard.writeText(generatedPassword);
        } catch (err) {
          console.error('Erreur copie presse-papiers:', err);
        }
      }

      // Fermer après 3 secondes
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        setGeneratedPassword('');
      }, 3000);
    } catch (err) {
      console.error('Erreur reset password:', err);
      setError(t('dashboard.admin.passwordReset.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-dark-blue flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('dashboard.admin.passwordReset.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-metallic-gray hover:text-dark-blue"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-light-gray/20 rounded">
          <p className="text-sm text-metallic-gray">
            {t('dashboard.admin.passwordReset.resetFor')}: <span className="font-semibold">{userEmail}</span>
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                {!supabaseAdmin ? 'Mot de passe généré avec succès !' : t('dashboard.admin.passwordReset.success')}
              </p>
              {generatedPassword && (
                <>
                  <p className="text-sm text-green-700 mt-1">
                    {t('dashboard.admin.passwordReset.passwordCopied')}
                  </p>
                  {!supabaseAdmin && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ Configuration manuelle requise : Utilisez la Solution 1 (SQL) dans Supabase Dashboard
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {!supabaseAdmin && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Mode génération manuelle</p>
                  <p>Le service de reset automatique n'est pas disponible. Le mot de passe sera généré et copié dans le presse-papiers.</p>
                  <p className="mt-1">Vous devrez le configurer manuellement via :</p>
                  <code className="block mt-1 p-1 bg-yellow-100 rounded text-xs">
                    UPDATE auth.users SET encrypted_password = crypt('[MOT_DE_PASSE]', gen_salt('bf')) WHERE email = '{userEmail}'
                  </code>
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-blue mb-2">
                {t('dashboard.admin.passwordReset.newPassword')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input flex-1"
                  placeholder={t('dashboard.admin.passwordReset.passwordPlaceholder')}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="btn-secondary px-3"
                  disabled={loading}
                >
                  {t('dashboard.admin.passwordReset.generate')}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-blue mb-2">
                {t('dashboard.admin.passwordReset.confirmPassword')}
              </label>
              <input
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder={t('dashboard.admin.passwordReset.confirmPlaceholder')}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {generatedPassword && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{t('dashboard.admin.passwordReset.generated')}:</span>
                </p>
                <code className="text-blue-900 font-mono text-sm block mt-1 p-2 bg-white rounded">
                  {generatedPassword}
                </code>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? t('common.saving') : t('dashboard.admin.passwordReset.reset')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;