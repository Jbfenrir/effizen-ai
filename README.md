# EffiZen-AI

## Brief de développement

> **Vision & objectif**
> Construire une Progressive Web App (PWA) responsive qui aide chaque collaborateur à maintenir un haut niveau d’énergie et une charge mentale optimisée, tout en donnant aux managers une vue agrégée et anonyme de la santé globale des équipes, afin de prévenir durablement le burn-out sans « flicage ».

---

## Stack & contraintes techniques
- **Front-end** : React 18 + Vite, Hooks only, Typescript
- **Styling** : Tailwind CSS (palette custom)
- **Icones** : lucide-react
- **Graphiques** : Recharts (Radar, LineChart, BarChart)
- **i18n** : react-i18next (FR & EN, toggle dans le header)
- **Offline/Sync** : IndexedDB (Dexie) + Supabase (PostgreSQL, EU)
- **Chiffrement** : AES-256 côté client (CryptoJS)
- **Auth** : Supabase « Sign-in with email + magic link »
- **PWA** : Vite-PWA plugin
- **Tests** : Vitest + @testing-library/react (80% min)
- **Lint/format** : ESLint Airbnb + Prettier

---

## Installation

```bash
# 1. Cloner le repo
$ git clone <repo-url>
$ cd effizen-ai

# 2. Installer les dépendances
$ npm install

# 3. Copier le fichier d'exemple d'environnement
$ cp .env.example .env
# puis renseigner VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ENCRYPTION_KEY

# 4. Lancer le projet en dev
$ npm run dev

# 5. (Optionnel) Lancer Supabase localement
$ npx supabase start
```

---

## Scripts utiles
- `npm run dev` : Lancer le serveur Vite
- `npm run build` : Build de production
- `npm run preview` : Preview du build
- `npm run lint` : Lint du code
- `npm run test` : Lancer les tests unitaires

---

## Structure du projet

```
/src
  /components
    SleepForm.tsx
    FocusForm.tsx
    TasksForm.tsx
    WellbeingForm.tsx
    EnergyBar.tsx
    Charts/*.tsx
  /pages
    DashboardEmployee.tsx
    DashboardManager.tsx
    EntryForm.tsx
    LoginPage.tsx
  /services
    supabase.ts
    crypto.ts
    sync.ts
  /i18n
    index.ts
    fr.json
    en.json
  /hooks
  /types
  /utils
  /__tests__
```

---

## Charte graphique
- Bleu très sombre : #071827 (headers, fond hero)
- Bleu-gris foncé : #374A52 (boutons primaires)
- Gris clair métallique : #819394 (texte secondaire, icônes)
- Gris très clair : #C3CBC8 (cartes, bords listes)
- Blanc cassé : #EAEDE4 (fond principal)
- Lime Green : #32CD32 (CTA, badges succès)
- Police : Roboto (fallback : Open Sans)
- Hiérarchie : H1 32px, H2 24px, body 16px
- Icônes : minimaliste, trait 2px, accent lime green

---

## Sécurité & RGPD
- Chiffrement AES-256 côté client avant upload
- Row Level Security Supabase
- Purge auto des daily_entries > 1 an
- Vue manager : agrégation anonyme, entries ≥ 3
- Hébergement exclusif UE/Suisse

---

## Déploiement
- Vercel (EU-FRA region)
- Supabase (EU Central)

---

## Liens utiles
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## Auteur
EffiZen-AI — 2024 