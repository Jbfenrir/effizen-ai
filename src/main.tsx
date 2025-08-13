import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter'; // Utiliser AppRouter au lieu de App
import ErrorBoundary from './components/ErrorBoundary';
import './services/debug-auth';

console.log('🚀 Application EffiZen-AI démarrage...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Element root non trouvé!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: Element root non trouvé</div>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} 