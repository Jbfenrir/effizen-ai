import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter'; // Utiliser AppRouter au lieu de App
import ErrorBoundary from './components/ErrorBoundary';
// Service debug supprimé - cause des instances multiples
import './utils/navigation'; // Import pour rendre navigateTo global
import { initDebugState } from './utils/debug-state';

console.log('🚀 Application EffiZen-AI démarrage...');
initDebugState();

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Element root non trouvé!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: Element root non trouvé</div>';
} else {
  // TEMPORAIRE: StrictMode désactivé pendant la refonte auth (cause doubles exécutions)
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    // </React.StrictMode>,
  );
} 