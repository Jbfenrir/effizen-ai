# Stack Technique et Architecture

## 🏗️ Technologies utilisées

### Frontend
- **React 18** + **TypeScript** - Framework principal
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Styling avec charte graphique personnalisée
- **React Router DOM** - Routing SPA
- **Lucide React** - Bibliothèque d'icônes
- **react-i18next** - Internationalisation FR/EN

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL avec Row Level Security (RLS)
  - Authentication (Magic Links via Gmail SMTP)
  - Real-time subscriptions
- **Vercel** - Déploiement et hosting

### PWA & Performance
- **Vite PWA** - Service Worker pour mode offline
- **Web Vitals** - Monitoring performances

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Header.tsx      # Navigation avec changement langue
│   ├── UserModal.tsx   # Gestion utilisateurs (admin)
│   ├── TeamModal.tsx   # Gestion équipes (admin)
│   ├── PasswordResetModal.tsx # Reset password
│   ├── DataRecoveryModal.tsx  # Récupération données CSV
│   └── DateRangePicker.tsx    # Sélection périodes
├── pages/              # Pages principales
│   ├── LoginPage.tsx   # Connexion
│   ├── DashboardAdmin.tsx     # Interface admin
│   ├── DashboardManager.tsx   # Interface manager
│   ├── DashboardEmployee.tsx  # Interface employé
│   └── EntryForm.tsx   # Saisie quotidienne
├── services/           # Services API
│   ├── supabase.ts     # Client Supabase unifié
│   ├── adminService.ts # CRUD admin
│   └── sync.ts         # Synchronisation données
├── hooks/
│   └── useAuth.ts      # Hook authentification
├── utils/
│   ├── dataAnalytics.ts      # Analyses et calculs
│   ├── adviceGenerator.ts    # Génération conseils
│   └── expertRules.ts        # Règles expertes
├── i18n/              # Traductions
│   ├── fr.json
│   ├── en.json
│   └── index.ts
└── types/             # Types TypeScript
    ├── index.ts
    └── supabase.ts
```

## 🔄 Architecture du système d'authentification

### Service Supabase unifié
- **UN SEUL** service : `src/services/supabase.ts`
- **Singleton GLOBAL** attaché à `window` pour survivre au HMR
- **Clients duaux** :
  - `supabase` (anon key) - pour les opérations utilisateur
  - `supabaseAdmin` (service role key) - pour les opérations admin

### Hooks d'authentification
- `useAuth.ts` - Hook principal (système actuel)
- `useAuthNew.ts` - Version optimisée (NEW system)
- Configuration via `auth-switch.ts` pour basculer

## 🌐 Environnements

### Développement local
- URL : http://localhost:3000 (ou :3001)
- WSL obligatoire pour npm
- Hot Module Replacement (HMR) actif

### Production
- URL : https://effizen-ai-prod.vercel.app
- Build automatique sur push main
- Service Worker PWA actif

## 📊 Structure des rôles

1. **Employee** : Dashboard personnel, saisie quotidienne
2. **Manager** : Vue équipe anonymisée, statistiques
3. **Admin** : Accès complet, gestion utilisateurs/équipes