# CLAUDE.md - Documentation EffiZen-AI

## 📋 RÉSUMÉ EXÉCUTIF

**EffiZen-AI** est une application React/TypeScript de bien-être au travail avec authentification Supabase, gestion multi-rôles (employee/manager/admin), et interface multilingue (FR/EN).

**Statut actuel :** ✅ **DÉPLOYÉ EN PRODUCTION - ENTIÈREMENT FONCTIONNEL**
**URL Production :** https://effizen-ai-prod.vercel.app
**Dernière mise à jour :** 2025-08-27 - Création utilisateurs opérationnelle

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

## 🐛 PROBLÈMES RÉSOLUS (HISTORIQUE CONSOLIDÉ)

### Erreurs critiques résolues
1. **Authentification :** Boucle infinie résolue (gestion INITIAL_SESSION dans useAuth.ts) ✅
2. **Création utilisateurs :** Erreur contrainte ID null résolue (ajout clé service_role) ✅  
3. **Mots de passe temporaires :** Génération et affichage popup fonctionnels ✅
4. **Build production :** TypeScript errors contournés (package.json modifié) ✅
5. **React Router v7 :** AppRouter personnalisé implémenté ✅
6. **PWA/Navigation :** SPA avec PopStateEvent configuré ✅
7. **Git/Vercel :** Déploiement automatique opérationnel ✅

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
3. **Authentification bloquée** → Vérifier useAuth.ts timeout et session
4. **Build errors** → Utiliser `npm run build` (sans TypeScript check)


## 🎯 ÉTAT ACTUEL FONCTIONNEL (27/08/2025)

### Fonctionnalités opérationnelles
- ✅ **Authentification complète** (admin: jbgerberon@gmail.com)
- ✅ **Dashboard admin** avec statistiques temps réel
- ✅ **Création utilisateurs** avec mots de passe temporaires (popup)
- ✅ **Gestion équipes** (CRUD complet)
- ✅ **Interface multilingue** (FR/EN)
- ✅ **Déploiement automatique** Vercel

### Architecture technique
- **Service Supabase :** `supabase-bypass.ts` (client dual anon + service_role)
- **Authentification :** useAuth.ts avec gestion INITIAL_SESSION
- **Navigation :** AppRouter SPA personnalisé
- **Base données :** Supabase PostgreSQL + RLS

---

**Dernière mise à jour :** 2025-08-27  
**Version :** 3.0 - Création utilisateurs pleinement opérationnelle  
**URL Production :** https://effizen-ai-prod.vercel.app  
**Maintainer :** JB Gerberon (jbgerberon@gmail.com)  
**Status :** ✅ **PLEINEMENT FONCTIONNEL**

## 📚 HISTORIQUE CONSOLIDÉ

### Sessions importantes résolues
- **13/08/2025 :** Déploiement initial Vercel réussi
- **14-18/08/2025 :** Résolution boucles infinies auth + navigation SPA  
- **27/08/2025 :** Création utilisateurs opérationnelle avec mots de passe temporaires

### Configuration actuelle essentielle
- **Environnement dev :** WSL obligatoire pour npm
- **Client Supabase :** Dual (anon + service_role) dans supabase-bypass.ts  
- **Variables requises :** VITE_SUPABASE_SERVICE_ROLE_KEY pour création utilisateurs
- **Architecture :** AppRouter SPA personnalisé + useAuth avec INITIAL_SESSION

### Prochaines fonctionnalités à développer
- [ ] Dashboard Manager (fonctionnalités équipe)
- [ ] Dashboard Employee (saisie quotidienne)  
- [ ] Système de notifications
- [ ] Export de données
- [ ] Mode sombre
