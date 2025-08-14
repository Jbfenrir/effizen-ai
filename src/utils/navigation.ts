// Fonction de navigation globale pour éviter les rechargements de page
export const navigateTo = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

// Export pour usage global
if (typeof window !== 'undefined') {
  (window as any).navigateTo = navigateTo;
}