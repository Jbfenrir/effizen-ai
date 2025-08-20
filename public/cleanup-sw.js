// Script de nettoyage du Service Worker
// À exécuter dans la console du navigateur pour nettoyer complètement

(async function cleanupServiceWorker() {
  console.log('🧹 Nettoyage du Service Worker en cours...');
  
  // 1. Désinscrire tous les Service Workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      const success = await registration.unregister();
      console.log(`Service Worker désinstallé: ${success ? '✅' : '❌'}`, registration.scope);
    }
  }
  
  // 2. Nettoyer tous les caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (let cacheName of cacheNames) {
      const deleted = await caches.delete(cacheName);
      console.log(`Cache supprimé [${cacheName}]: ${deleted ? '✅' : '❌'}`);
    }
  }
  
  // 3. Nettoyer le localStorage et sessionStorage des clés PWA
  const keysToRemove = [
    'workbox-expiration',
    'workbox-precache',
    'workbox-google-analytics',
    'supabase-api',
    'google-fonts'
  ];
  
  for (let key of Object.keys(localStorage)) {
    if (keysToRemove.some(k => key.includes(k))) {
      localStorage.removeItem(key);
      console.log(`localStorage nettoyé: ${key}`);
    }
  }
  
  for (let key of Object.keys(sessionStorage)) {
    if (keysToRemove.some(k => key.includes(k))) {
      sessionStorage.removeItem(key);
      console.log(`sessionStorage nettoyé: ${key}`);
    }
  }
  
  console.log('✅ Nettoyage terminé! Rechargez la page (F5) pour appliquer les changements.');
  
  // 4. Forcer le rechargement après nettoyage
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
})();