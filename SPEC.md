# Spécification fonctionnelle EffiZen-AI (historique enrichi)

## 1. Vision & Objectif
Construire une Progressive Web App (PWA) responsive qui aide chaque collaborateur à maintenir un haut niveau d’énergie et une charge mentale optimisée, tout en donnant aux managers une vue agrégée et anonyme de la santé globale des équipes, afin de prévenir durablement le burn-out sans « flicage ».

## 2. Stack & Contraintes techniques
- **Front-end** : React 18 + Vite, Typescript, hooks only (useState/useEffect/useContext). Aucun framework de formulaire (pas de Formik/React-Hook-Form).
- **Styling** : Tailwind CSS (palette custom, voir charte graphique).
- **Icônes** : lucide-react, couleur par défaut #819394.
- **Graphiques** : Recharts v2 (Radar, LineChart, BarChart, responsive).
- **i18n** : react-i18next, FR & EN, bouton toggle dans le header.
- **Offline/Sync** : IndexedDB (local-first) via dexie + Supabase (PostgreSQL, eu-central-1). Synchronisation chiffrée AES-256, row-level security.
- **Auth** : Supabase « Sign-in with email + magic link ». Rôles : employee, manager.
- **PWA** : Vite-PWA plugin (service-worker, manifest). Installable mobile & desktop.
- **Tests** : Vitest + @testing-library/react, couverture min 80 %.
- **Lint/format** : ESLint Airbnb + Prettier, hooks/exhaustive-deps activé.

## 3. Charte graphique
- **Palette** :
  - Bleu très sombre #071827 (headers, fond hero)
  - Bleu-gris foncé #374A52 (boutons primaires)
  - Gris clair métallique #819394 (texte secondaire, icônes)
  - Gris très clair #C3CBC8 (cartes, bords listes)
  - Blanc cassé #EAEDE4 (fond principal)
  - Lime Green #32CD32 (CTA, badges succès)
- **Police** : Roboto (fallback : Open Sans)
- **Hiérarchie** : H1 32 px, H2 24 px, body 16 px
- **Icônes** : minimaliste, trait 2 px, accent lime green

## 4. Modèle de données (PostgreSQL / Supabase)
- **users** : id, email, role (employee/manager), team, created_at
- **daily_entries** : id, user_id, entry_date, sleep (jsonb), focus (jsonb), tasks (jsonb), wellbeing (jsonb), created_at
- **aggregated_metrics** (vue matérialisée, nightly) : team, day, avg_energy, avg_sleep, avg_fatigue, hv_ratio, entries
- **RGPD / NLPD** :
  - Purge automatique des daily_entries après 1 an
  - Vue manager : seules les lignes où entries ≥ 3 sont visibles, sinon agrégation dans “Company-wide”
  - Hébergement exclusif en UE/Suisse

## 5. Fonctionnalités & UI
### 5.1 Vue Employé (Saisie)
- **Sommeil** : heure coucher, lever, insomnie (h). Durée = (lever - coucher) − insomnie. Gestion after-midnight.
- **Focus/Fatigue** : heures matin (≤6), aprem (≤6), conduite, fatigue 1-5 (boutons colorés, mapping couleur vert/jaune/rouge)
- **Répartition des tâches** : lignes dynamiques (autocomplete), durée, switch High-Value. Total + alerte > 8h.
- **Bien-être & Énergie** : méditations AM/PM (toggle), sport h, manuel h, pauses matin/midi/après-midi (cases à cocher)
- **Actions** : sauvegarde manuelle (bouton), feedback immédiat, toast succès lime green après sync

### 5.2 Vue Dashboard Employé
- **Graphiques** :
  1. Radar : sommeil, énergie, fatigue (inversé), pauses
  2. Ligne : évolution de ces scores
  3. Radar : temps passé sur les tâches (≥ 20% du temps)
  4. Ligne : évolution du score d’optimisation du temps travaillé
- **KPI** : cartes Tailwind avec icônes
- **Recommandation** : personnalisée, colorée selon les scores globaux

### 5.3 Vue Manager
- **Filtres** : période, équipe
- **Heatmap risques** : couleur selon avg_energy & hv_ratio
- **Export PDF** : “Santé globale” (html-to-pdf)
- **Aucune donnée nominative**

## 6. Calculs & recommandations IA
- **Score Bien-être (0-100)** :
  - sleepScore = min(duration/8 * 100, 100)
  - fatigueScore = (5 - fatigue) * 20
  - meditScore = 50 * nMeditations
  - pauseScore = nb pauses cochées * 33.33
  - activityScore = (sport>0?50:0) + (manual>0?50:0)
  - wellbeingScore = moyenne([sleepScore, fatigueScore, meditScore, pauseScore, activityScore])
- **Règles** :
  - Si energy < 50 et ≥ 3 jours d’affilée : notification repos actif/micro-sieste
  - Si hvRatio < 0.7 : suggestion d’automatisation/délégation des tâches low-value
  - Si totalDur > 8 : alerte “Limitez-vous à 8 h”
- **Messages colorés** : info #374A52, warning #FFA500, alert #FF5555

## 7. Navigation & expérience
- **Header fixe** : logo EffiZen-AI, bouton langue FR/EN, menu utilisateur (export, logout)
- **Layout** : grille 12 colonnes (desktop), 1 colonne (mobile)
- **Transitions** : transition-colors duration-200
- **A11y** : focus ring lime green, labels explicites

## 8. Backend & sécurité Supabase
- **Storage** : daily_entries chiffré côté client (CryptoJS AES)
- **Row Level Security** :
  - employees : accès à leurs propres daily_entries
  - managers : accès à la vue agrégée uniquement
- **Fonctions** : cron job nightly pour peupler aggregated_metrics, suppression auto des entrées > 365j

## 9. Internationalisation
- **Ressources** : JSON fr.json / en.json
- **Hook** : useLocale() + bouton toggle
- **Détection** : langue navigateur au premier chargement

## 10. Build & déploiement
- **Commandes** : npm i, npm run dev, npm run build, npx supabase start
- **Déploiement** : Vercel (EU-FRA region) + Supabase EU Central
- **ENV** : VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## 11. Livrables attendus
- /src/components/ : SleepForm.tsx, FocusForm.tsx, TasksForm.tsx, WellbeingForm.tsx, EnergyBar.tsx, Charts/*.tsx
- /src/pages/ : DashboardEmployee.tsx, DashboardManager.tsx
- /src/services/ : supabase.ts, crypto.ts, sync.ts
- /src/i18n/ : index.ts, fr.json, en.json
- /tailwind.config.cjs : palette custom
- /__tests__/ : tests unitaires

---

# (Suites : voir sections précédentes pour les règles UX, corrections, plan d’action, historique, etc.) 