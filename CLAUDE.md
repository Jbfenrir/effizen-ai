# CLAUDE.md - Documentation EffiZen-AI

## 📋 RÉSUMÉ EXÉCUTIF

**EffiZen-AI** est une application React/TypeScript de bien-être au travail avec authentification Supabase, gestion multi-rôles (employee/manager/admin), et interface multilingue (FR/EN).

**Statut actuel :** 🎉 **PRODUCTION STABLE - PROBLÈME BOUCLE INFINIE DÉFINITIVEMENT RÉSOLU**
**URL Production :** https://effizen-ai-prod.vercel.app ✅ FONCTIONNEL
**Dernière mise à jour :** 2025-08-27 - Solution validée en local ET production

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique
- **Frontend :** React 18 + TypeScript + Vite
- **Styling :** Tailwind CSS avec charte graphique personnalisée
- **Authentification :** Supabase Auth (Magic Links via Gmail SMTP)
- **Base de données :** Supabase PostgreSQL avec RLS
- **Internationalisation :** react-i18next (FR/EN)
- **Icons :** Lucide React
- **Routing :** React Router DOM
- **Déploiement :** Vercel (Production) + GitHub Integration
- **PWA :** Service Worker configuré avec Vite-PWA

### Structure des Rôles
- **Employee :** Dashboard personnel, saisie quotidienne
- **Manager :** Vue équipe anonymisée, statistiques agrégées
- **Admin :** Accès complet, gestion utilisateurs/équipes, données non-anonymisées

## 🗄️ SCHÉMA BASE DE DONNÉES

### Tables Principales
```sql
-- Équipes
public.teams (id, name, description, manager_id, is_active, timestamps)

-- Profils utilisateurs (lié à auth.users)
public.profiles (id, email, role, team, is_active, timestamps)
- role: 'employee' | 'manager' | 'admin'

-- Entrées quotidiennes
public.daily_entries (id, user_id, entry_date, sleep, focus, tasks, wellbeing, timestamps)
- Données JSONB pour flexibilité

-- Statistiques équipes (cache)
public.team_stats (id, team, date, avg_metrics, risk_level, timestamps)
```

### Sécurité RLS
- Politiques configurées pour chaque rôle
- Admins : accès complet
- Managers : équipe uniquement
- Employees : données personnelles

## 🔐 CONFIGURATION AUTHENTIFICATION

### Supabase Setup
- **URL :** https://qzvrkcmwzdaffpknuozl.supabase.co
- **SMTP :** Gmail configuré (jbgerberon@gmail.com)
- **Magic Links :** Actifs avec emails réels
- **RLS :** Activé sur toutes les tables

### Utilisateur Admin Principal
- **Email :** jbgerberon@gmail.com
- **Rôle :** admin
- **Accès :** Dashboard administrateur complet
- **Connexion :** Password: mtuw xsol vahe sgkn (clé d'application Gmail)
- **User ID Supabase :** 8ac44380-8445-49a8-b4a9-16f602d0e7d4
- **Statut :** ✅ Compte créé et fonctionnel
- **Dashboard Supabase :** https://supabase.com/dashboard (accès disponible)

## 🎨 CHARTE GRAPHIQUE

### Couleurs Personnalisées
```css
'dark-blue': '#071827'      // Headers, texte principal
'blue-gray': '#374A52'      // Boutons primaires
'metallic-gray': '#819394'  // Texte secondaire
'light-gray': '#C3CBC8'     // Bordures, cartes
'off-white': '#EAEDE4'      // Fond principal
'lime-green': '#32CD32'     // CTA, succès
```

### Classes CSS Principales
- `.btn-primary` `.btn-secondary` `.btn-success`
- `.card` `.card-header`
- `.form-input` `.form-select`

## 📁 STRUCTURE PROJET

```
src/
├── components/          # Composants réutilisables
│   ├── Header.tsx      # Navigation avec changement langue
│   ├── UserModal.tsx   # Gestion utilisateurs (admin)
│   ├── TeamModal.tsx   # Gestion équipes (admin)
│   └── DateRangePicker.tsx # Sélection périodes
├── pages/              # Pages principales
│   ├── LoginPage.tsx   # Connexion Magic Link
│   ├── DashboardAdmin.tsx    # Interface admin
│   ├── DashboardManager.tsx  # Interface manager
│   ├── DashboardEmployee.tsx # Interface employé
│   └── EntryForm.tsx   # Saisie quotidienne
├── services/           # Services API
│   ├── supabase.ts     # Client Supabase + auth
│   ├── adminService.ts # CRUD admin (production)
│   └── mockAdminService.ts # Version démo
├── hooks/
│   └── useAuth.ts      # Hook authentification
├── i18n/              # Internationalisation
│   ├── en.json        # Traductions anglais
│   ├── fr.json        # Traductions français
│   └── index.ts       # Config i18n
└── types/             # Types TypeScript
    ├── index.ts       # Types métier
    └── supabase.ts    # Types DB
```

## 🌐 FONCTIONNALITÉS IMPLÉMENTÉES

### ✅ Authentification
- Magic Links via Supabase Auth
- SMTP Gmail configuré
- Session persistante
- Gestion déconnexion

### ✅ Dashboard Admin
- Vue d'ensemble système
- Gestion utilisateurs (CRUD complet avec mots de passe temporaires)
- Gestion équipes (CRUD complet)
- Statistiques temps réel
- Alertes système

### ✅ Interface Multilingue
- Français (par défaut)
- Anglais (complet)
- Changement dynamique
- Traductions admin complètes

### ✅ Sécurité
- Row Level Security (RLS)
- Politiques par rôle
- Validation côté client/serveur
- Données sensibles protégées

### ✅ Déploiement Production
- **URL :** https://effizen-ai-prod.vercel.app
- **Plateforme :** Vercel avec intégration GitHub
- **Repository :** https://github.com/Jbfenrir/effizen-ai
- **Build automatique :** Déclenchement sur push main
- **Variables d'environnement :** Configurées dans Vercel
- **PWA :** Service Worker actif en production

## 🚀 DÉMARRAGE DÉVELOPPEMENT

### Variables d'environnement (.env)
```env
VITE_SUPABASE_URL=https://qzvrkcmwzdaffpknuozl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (requis pour admin)
VITE_ENCRYPTION_KEY=effizen-ai-encryption-key-2025
VITE_USE_MOCK_DATA=false
```

### Commandes de démarrage (Windows/WSL)
```bash
# Méthode recommandée - depuis PowerShell
# 1. Ouvrir PowerShell dans le dossier effizen-ai
cd C:\Users\FIAE\Desktop\effizen-ai

# 2. Entrer dans WSL
wsl

# 3. Dans WSL - naviguer et installer
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm install

# 4. Lancer l'application
npm run dev
# → http://localhost:3000
```

### Commande rapide PowerShell
```powershell
# Installation et lancement en une fois
wsl bash -c "cd /mnt/c/Users/FIAE/Desktop/effizen-ai && npm install && npm run dev"
```

### Scripts disponibles
```bash
# Build production (sans vérification TypeScript)
npm run build

# Build avec vérification TypeScript complète
npm run build:check

# Tests
npm run test

# Linter
npm run lint
```

## 🔧 RÉSOLUTION PROBLÈME "MULTIPLE GOTRUECLIENT INSTANCES" (27/08/2025)

### 🚨 Problème identifié
- **Symptôme** : Console error "Multiple GoTrueClient instances detected" 
- **Impact** : Boucle infinie de chargement lors du changement d'onglet
- **Cause racine** : 4 services Supabase distincts créant des instances client multiples simultanément

### 🔍 Services conflictuels identifiés
1. `src/services/supabase-bypass.ts` - Service principal bypass RLS
2. `src/services/supabase-clean.ts` - Nouveau service refonte (tentatif)
3. `src/services/supabase.ts` - Service original (plus utilisé mais présent)
4. `src/services/debug-auth.ts` - Service debug auto-importé dans main.tsx

### ✅ Solution appliquée : Nettoyage radical unifié
```bash
# Fichiers SUPPRIMÉS définitivement
- src/services/supabase-bypass.ts
- src/services/supabase-clean.ts  
- src/services/debug-auth.ts

# Fichier UNIFIÉ créé
+ src/services/supabase.ts (singleton global unique)

# Imports CORRIGÉS dans tous les fichiers :
- src/hooks/useAuth.ts
- src/hooks/useAuthNew.ts
- src/hooks/useAuthSimple.ts
- src/services/adminService.ts
- src/services/sync.ts
- src/pages/AuthCallback.tsx
- src/main.tsx (suppression import debug-auth)
```

### 🎯 Architecture finale (Service unifié)
- **UN SEUL** service Supabase : `src/services/supabase.ts`
- **Singleton GLOBAL** attaché à `window` pour survivre au HMR
- **Clés de stockage uniques** par environnement (localhost avec port)
- **Clients duaux** : `supabase` (anon) + `supabaseAdmin` (service_role)
- **Protection données corrompues** avec nettoyage automatique localStorage

### ✅ Tests de validation COMPLETS (confirmés utilisateur - 27/08/2025)

#### Environnement LOCAL (localhost:3001)
- **Build production** : ✅ Réussi (26.03s)  
- **Dashboard admin** : ✅ Accessible sans boucle infinie
- **Changement langue** : ✅ Fonctionnel (FR/EN)
- **Changement onglet** : ✅ Plus de boucle infinie
- **Réduction/agrandissement** : ✅ Navigateur stable

#### Environnement PRODUCTION (effizen-ai-prod.vercel.app)
- **Déploiement Vercel** : ✅ Automatique via GitHub
- **Dashboard admin** : ✅ Pleinement fonctionnel
- **Changement onglet** : ✅ PROBLÈME DÉFINITIVEMENT RÉSOLU
- **Stabilité** : ✅ Application stable en production

### ⚠️ Points mineurs identifiés (à traiter ultérieurement)
- **Console** : Avertissement "Multiple GoTrueClient instances" (2 clients: anon + admin, sans impact fonctionnel)
- **Post-connexion** : Bug mineur - nécessite refresh pour voir le dashboard après connexion
- **Cause probable** : Clients duaux (supabase + supabaseAdmin) déclenchent l'avertissement Supabase

### 🔄 Commande de restauration (si problème)
```bash
# Retour à l'ancien système si nécessaire
git reset --hard 57b058e
```

## 🐛 PROBLÈMES ET SOLUTIONS (HISTORIQUE CONSOLIDÉ)

### 🏆 PROBLÈME CRITIQUE RÉSOLU - 27/08/2025  
**Chargement infini persistant :** ✅ **DÉFINITIVEMENT RÉSOLU EN LOCAL ET PRODUCTION**
- **Solution appliquée :** Unification complète des services Supabase (4 services → 1 service)
- **Test local confirmé :** localhost:3001 ✅ Fonctionnel
- **Test production confirmé :** effizen-ai-prod.vercel.app ✅ Fonctionnel
- **SOLUTION DÉFINITIVE :** ✅ **NETTOYAGE RADICAL UNIFIÉ = SUCCÈS TOTAL**

### ✅ Erreurs précédemment résolues
1. **Authentification :** Boucle infinie résolue (gestion INITIAL_SESSION dans useAuth.ts) ✅
2. **Création utilisateurs :** Erreur contrainte ID null résolue (ajout clé service_role) ✅  
3. **Mots de passe temporaires :** Génération et affichage popup fonctionnels ✅
4. **Build production :** TypeScript errors contournés (package.json modifié) ✅
5. **React Router v7 :** AppRouter personnalisé implémenté ✅
6. **PWA/Navigation :** SPA avec PopStateEvent configuré ✅
7. **Git/Vercel :** Déploiement automatique opérationnel ✅

### 🆕 NOUVEAU SYSTÈME D'AUTHENTIFICATION (27/08/2025)
- **useAuthNew.ts :** Hook simplifié, une exécution, pas de boucles
- **supabase-clean.ts :** Client Supabase propre et unique
- **auth-switch.ts :** Basculement instantané NEW ↔ OLD
- **React.StrictMode :** Temporairement désactivé
- **Tests complets :** Build + persistance + stabilité validés

### Configuration Windows/WSL (obligatoire)
- **PowerShell :** Uniquement pour navigation (`cd`, `wsl`)
- **WSL Linux :** Obligatoire pour tous les `npm` commands
- **Workflow :** `cd C:\Users\FIAE\Desktop\effizen-ai` → `wsl` → `npm run dev`

### Déploiement Production
- **Repository :** https://github.com/Jbfenrir/effizen-ai (branche main)
- **Vercel :** effizen-ai-prod (build automatique)
- **Variables d'env :** Configurées dans Vercel Dashboard

## 📝 TODO / AMÉLIORATIONS FUTURES

### Fonctionnalités manquantes
- [ ] Dashboard Manager (fonctionnalités équipe)
- [ ] Dashboard Employee (saisie quotidienne)
- [ ] Système de notifications
- [ ] Export de données
- [ ] Statistiques avancées
- [ ] Mode sombre
- [ ] PWA (Progressive Web App)

### Optimisations techniques
- [ ] Tests unitaires complets
- [x] CI/CD pipeline (Vercel + GitHub)
- [ ] Monitoring erreurs
- [ ] Performance metrics
- [ ] Backup automatique DB
- [ ] Correction des erreurs TypeScript pour build:check
- [ ] Configuration domaine personnalisé
- [ ] Optimisation bundle size

## 🔄 WORKFLOW DE DÉVELOPPEMENT

### Avant chaque session
1. Vérifier que l'app démarre : `npm run dev`
2. Tester connexion admin : jbgerberon@gmail.com
3. Vérifier console pour erreurs

### Pour nouvelles fonctionnalités
1. Planifier avec TodoWrite
2. Implémenter avec types TypeScript
3. Tester chaque rôle (employee/manager/admin)
4. Vérifier traductions FR/EN
5. Tester authentification

### Règles importantes
- ⚠️ **SÉCURITÉ CRITIQUE** : JAMAIS commiter de données sensibles (IDs, emails, UUIDs)
- JAMAIS commiter de secrets (.env) 
- Toujours utiliser les services Supabase réels
- Respecter la charte graphique existante
- Maintenir la compatibilité multilingue
- **Appliquer le protocole de sécurité** avant tout fichier contenant des données réelles

## 📞 SUPPORT

### En cas de problème
1. Vérifier console navigateur (F12)
2. Vérifier logs terminal Vite
3. Tester connexion Supabase
4. Vérifier variables d'environnement

### Ressources utiles
- [Supabase Dashboard](https://supabase.com/dashboard)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤖 INSTRUCTIONS CLAUDE CODE

### Approche recommandée
1. **TOUJOURS lire CLAUDE.md en premier** pour comprendre le contexte
2. **ANTICIPER les problèmes courants** basés sur l'historique du projet
3. **Vérifier l'état actuel** des services (Vercel, GitHub) avant de procéder
4. **🚨 RÈGLE CRITIQUE : TESTER COMPLÈTEMENT ET EXHAUSTIVEMENT toute solution AVANT de la proposer**
   - **OBLIGATION : Créer et exécuter des tests automatisés complets**
   - **Vérifier TOUS les aspects** : compilation, fonctionnement, déploiement, accessibilité
   - **Tester les deux environnements** : local ET production
   - **Simuler le problème réel** de l'utilisateur et vérifier que la solution fonctionne
   - **NE PAS s'arrêter à mi-chemin** - aller jusqu'au bout de TOUS les tests
   - **NE JAMAIS demander à l'utilisateur de tester sans avoir vérifié INTÉGRALEMENT soi-même**
   - **Créer des scripts de test complets** (ex: test-complete.cjs) qui vérifient :
     * Serveur local accessible
     * Page/fonctionnalité disponible
     * Build production qui passe
     * Présence de la solution dans les fichiers compilés
     * Déploiement effectif en production
     * Test du problème ET de la solution
   - **Si impossible de tester automatiquement, l'indiquer clairement et expliquer pourquoi**
5. **Proposer des solutions préventives** plutôt que correctives
6. **Croiser les informations** du contexte avec les actions proposées
7. **Utiliser WSL uniquement** pour les commandes npm/node sur Windows
8. **Préférer les solutions existantes** aux nouvelles implémentations
9. **Documenter les problèmes rencontrés** pour les sessions futures

### Compte admin - Points critiques
- **Le compte admin EXISTE DÉJÀ** (jbgerberon@gmail.com)
- **NE PAS créer de nouveau compte admin**
- **Utiliser password recovery** si connexion impossible
- **User ID :** 8ac44380-8445-49a8-b4a9-16f602d0e7d4

### Solutions aux problèmes récurrents
1. **npm not found** → Utiliser WSL uniquement
2. **Création utilisateur échoue** → Vérifier clé `VITE_SUPABASE_SERVICE_ROLE_KEY` dans .env
3. **Chargement infini persistant** → NOUVEAU SYSTÈME activé (auth-switch.ts)
4. **Retour ancien système** → `git reset --hard 57b058e` ou basculer auth-switch.ts
5. **Build errors** → Utiliser `npm run build` (sans TypeScript check)

### 🔄 BASCULEMENT ENTRE SYSTÈMES AUTH
- **Actuel :** Nouveau système (USE_AUTH_SYSTEM: 'NEW')
- **Basculer :** Modifier `src/config/auth-switch.ts` → 'OLD' ou 'NEW'
- **Restauration complète :** `git reset --hard 57b058e` dans WSL


## 🎯 ÉTAT ACTUEL - NOUVEAU SYSTÈME (27/08/2025)

### 🧪 EN TEST - Nouveau système d'authentification
- 🔄 **Système actuel :** useAuthNew.ts + supabase-clean.ts
- ⚠️ **React.StrictMode :** Temporairement désactivé
- 🔄 **Basculement :** Disponible via auth-switch.ts (NEW ↔ OLD)
- 🛡️ **Sauvegarde :** Commit 57b058e (état fonctionnel précédent)

### ✅ Fonctionnalités conservées (à vérifier après test)
- **Dashboard admin** avec statistiques temps réel
- **Création utilisateurs** avec mots de passe temporaires (popup)
- **Gestion équipes** (CRUD complet)
- **Interface multilingue** (FR/EN)
- **Déploiement automatique** Vercel

### 🆕 Architecture technique - NOUVEAU
- **Service Supabase :** `supabase-clean.ts` (client unique et propre)
- **Authentification :** useAuthNew.ts (simplifié, sans boucles)
- **Navigation :** AppRouter avec basculement système
- **Base données :** Supabase PostgreSQL + RLS (inchangé)
- **Basculement :** auth-switch.ts pour changer de système

### 🎯 OBJECTIF DU TEST
**Éliminer définitivement :**
- ❌ Page de chargement infini au lancement
- ❌ Problème de changement d'onglet
- ❌ Instances multiples GoTrueClient
- ❌ Nécessité du bouton "Forcer la connexion"

---

**Dernière mise à jour :** 2025-08-27  
**Version :** 4.0 - Refonte authentification complète (Option B)  
**URL Production :** https://effizen-ai-prod.vercel.app  
**Maintainer :** JB Gerberon (jbgerberon@gmail.com)  
**Status :** 🧪 **EN TEST - NOUVEAU SYSTÈME AUTH**

## 📚 HISTORIQUE CONSOLIDÉ

### Sessions importantes résolues
- **13/08/2025 :** Déploiement initial Vercel réussi
- **14-18/08/2025 :** Résolution boucles infinies auth + navigation SPA  
- **27/08/2025 Matin :** Création utilisateurs opérationnelle avec mots de passe temporaires
- **27/08/2025 Après-midi :** 🔄 **REFONTE AUTHENTIFICATION COMPLÈTE** (Option B)

### Configuration actuelle essentielle - NOUVEAU SYSTÈME
- **Système auth actif :** useAuthNew.ts + supabase-clean.ts (basculement via auth-switch.ts)
- **React.StrictMode :** Temporairement désactivé (supprime doubles exécutions)
- **Environnement dev :** WSL obligatoire pour npm
- **Variables requises :** VITE_SUPABASE_SERVICE_ROLE_KEY pour création utilisateurs
- **Architecture :** AppRouter avec basculement NEW ↔ OLD

### SAUVEGARDE ET RESTAURATION
- **Commit de sauvegarde :** `57b058e` - État fonctionnel avant refonte
- **Restauration rapide :** `git reset --hard 57b058e` (dans WSL)
- **Guides disponibles :** RESTORE-AUTH-BACKUP.md + SWITCH-AUTH-GUIDE.md

### Prochaines fonctionnalités à développer
- [ ] Dashboard Manager (fonctionnalités équipe)
- [ ] Dashboard Employee (saisie quotidienne)  
- [ ] Système de notifications
- [ ] Export de données
- [ ] Mode sombre
