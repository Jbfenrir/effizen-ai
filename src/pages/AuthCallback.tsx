import React, { useEffect } from 'react';
// Service unifié - Plus de conflit d'instances multiples
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    console.log('🔄 AuthCallback: Traitement du callback...');
    
    const handleCallback = async () => {
      try {
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