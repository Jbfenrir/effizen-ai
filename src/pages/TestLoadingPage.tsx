// Page de test pour simuler le chargement infini et tester le bouton d'urgence
import React, { useState } from 'react';

const TestLoadingPage: React.FC = () => {
  const [showLoadingForever, setShowLoadingForever] = useState(false);

  if (showLoadingForever) {
    // Simuler exactement la même interface que AppRouter
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-green mx-auto"></div>
          <p className="mt-4 text-metallic-gray">Chargement...</p>
          
          {/* BOUTON D'URGENCE - Identique à AppRouter */}
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-2">Bloqué sur cette page ?</p>
            <button 
              onClick={() => {
                console.log('🚨 Bouton d\'urgence activé depuis test!');
                localStorage.clear();
                sessionStorage.clear();
                alert('Cache nettoyé ! Cliquez OK pour retourner.');
                setShowLoadingForever(false);
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

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-dark-blue mb-6">Test du bouton d'urgence</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <p className="text-metallic-gray mb-4">
            Cette page permet de tester le bouton d'urgence qui apparaît lors d'un chargement infini.
          </p>
          
          <button 
            onClick={() => setShowLoadingForever(true)}
            className="px-6 py-3 bg-lime-green text-white rounded-lg hover:bg-green-600 mb-4"
          >
            🧪 Simuler chargement infini
          </button>
          
          <div className="text-sm text-metallic-gray">
            <p>Après avoir cliqué, vous verrez :</p>
            <ul className="text-left mt-2">
              <li>• Spinner de chargement</li>
              <li>• Bouton rouge "Forcer la connexion"</li>
              <li>• Test du nettoyage du cache</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-gray text-white rounded hover:bg-dark-blue"
          >
            ← Retour à l'application
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestLoadingPage;