/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique EffiZen-AI
        'dark-blue': '#071827',      // Bleu très sombre - Headers, fond hero
        'blue-gray': '#374A52',      // Bleu-gris foncé - Boutons primaires
        'metallic-gray': '#819394',  // Gris clair métallique - Texte secondaire, icônes
        'light-gray': '#C3CBC8',     // Gris très clair - Cartes, bords listes
        'off-white': '#EAEDE4',      // Blanc cassé - Fond principal
        'lime-green': '#32CD32',     // Lime Green - CTA, badges succès
      },
      fontFamily: {
        'sans': ['Roboto', 'Open Sans', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2' }],
        'h2': ['24px', { lineHeight: '1.3' }],
        'body': ['16px', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '200': '200ms',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(50, 205, 50, 0.3)',
      },
    },
  },
  plugins: [],
} 