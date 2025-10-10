import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

console.log('🔥 DÉBUT INITIALISATION i18n');
console.log('📦 FR importé:', typeof fr, 'clés:', Object.keys(fr).slice(0, 5));
console.log('📦 EN importé:', typeof en, 'clés:', Object.keys(en).slice(0, 5));

const resources = {
  fr: {
    translation: fr,
  },
  en: {
    translation: en,
  },
};

console.log('✅ Resources créées');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || navigator.language.split('-')[0] || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Debug: afficher les ressources chargées
console.log('🌍 i18n initialisé avec langue:', i18n.language);
console.log('📦 Ressources FR chargées:', Object.keys(resources.fr.translation));
console.log('✅ Test traduction categoryHealth:', i18n.t('dashboard.employee.categoryHealth'));

// Exposer i18n globalement pour debug
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
}

export default i18n; 