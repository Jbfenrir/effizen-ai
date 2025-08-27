// 🔄 SYSTÈME DE BASCULEMENT AUTH
// Permet de changer facilement entre ancien et nouveau système

export const AUTH_CONFIG = {
  // 🚨 CHANGEZ CETTE VALEUR POUR BASCULER :
  // - 'NEW' : Nouveau système d'auth (refonte complète)
  // - 'OLD' : Ancien système d'auth (version de sauvegarde)
  USE_AUTH_SYSTEM: 'NEW' as 'NEW' | 'OLD',
  
  // Options de debug
  DEBUG_ENABLED: true,
  LOG_AUTH_EVENTS: true,
};

// Messages d'information pour le développeur
if (AUTH_CONFIG.DEBUG_ENABLED) {
  const system = AUTH_CONFIG.USE_AUTH_SYSTEM;
  const color = system === 'NEW' ? '🆕' : '🔙';
  
  console.log(`${color} AUTH SYSTEM: Utilisation du système ${system}`);
  
  if (system === 'OLD') {
    console.log('📋 Pour revenir au nouveau système: AUTH_CONFIG.USE_AUTH_SYSTEM = "NEW"');
  } else {
    console.log('📋 Pour revenir à l\'ancien système: AUTH_CONFIG.USE_AUTH_SYSTEM = "OLD"');
  }
  
  console.log('📁 Fichier de configuration: src/config/auth-switch.ts');
}