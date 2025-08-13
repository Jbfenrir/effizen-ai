# CLAUDE.md - Documentation EffiZen-AI

## 📋 RÉSUMÉ EXÉCUTIF

**EffiZen-AI** est une application React/TypeScript de bien-être au travail avec authentification Supabase, gestion multi-rôles (employee/manager/admin), et interface multilingue (FR/EN).

**Statut actuel :** ✅ **PRODUCTION - ENTIÈREMENT FONCTIONNELLE**

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique
- **Frontend :** React 18 + TypeScript + Vite
- **Styling :** Tailwind CSS avec charte graphique personnalisée
- **Authentification :** Supabase Auth (Magic Links via Gmail SMTP)
- **Base de données :** Supabase PostgreSQL avec RLS
- **Internationalisation :** react-i18next (FR/EN)
- **Icons :** Lucide React
- **Routing :** React Router DOM

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
- **Connexion :** Password recovery via Supabase (compte existant)
- **User ID Supabase :** 8ac44380-8445-49a8-b4a9-16f602d0e7d4
- **Statut :** ✅ Compte créé et fonctionnel

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
- Gestion utilisateurs (CRUD complet)
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

## 🚀 DÉMARRAGE DÉVELOPPEMENT

### Variables d'environnement (.env)
```env
VITE_SUPABASE_URL=https://qzvrkcmwzdaffpknuozl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ENCRYPTION_KEY=12345678901234567890123456789012
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
# Build production
npm run build

# Tests
npm run test

# Linter
npm run lint
```

## 🐛 PROBLÈMES RÉSOLUS

### Erreurs corrigées
1. **Tailwind config :** .cjs → .js
2. **LoginPage :** isLoading → loading
3. **Contraintes DB :** Rôle admin ajouté
4. **Dépendances :** npm cache nettoyé
5. **Traductions :** Interface admin complète
6. **React Router v7 :** Contourné avec AppRouter personnalisé
7. **PWA en développement :** Désactivé pour éviter conflits
8. **Authentification :** Double mode (mot de passe + magic link)
9. **Rate limit email :** Résolu avec connexion par mot de passe
10. **Chargement infini :** Timeout de sécurité ajouté

### Problèmes spécifiques Windows/WSL
- **npm install :** Problèmes de permissions → utiliser WSL uniquement
- **Vite non reconnu :** Installer dépendances via WSL
- **PowerShell scripts :** Utiliser `wsl bash -c "commandes"`
- **Chemins :** Toujours utiliser `/mnt/c/Users/FIAE/Desktop/effizen-ai`

### Points d'attention
- Toujours utiliser `loading` pas `isLoading` dans LoginPage
- RLS peut bloquer requêtes → vérifier politiques
- Types Supabase à sync si schema change
- **IMPORTANT :** Le compte admin existe déjà dans Supabase
- Utiliser password recovery pour accéder au compte admin
- React Router v7 incompatible → AppRouter personnalisé utilisé

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
- [ ] CI/CD pipeline
- [ ] Monitoring erreurs
- [ ] Performance metrics
- [ ] Backup automatique DB

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
- JAMAIS commiter de secrets (.env)
- Toujours utiliser les services Supabase réels
- Respecter la charte graphique existante
- Maintenir la compatibilité multilingue

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
2. **Vérifier l'état des comptes utilisateurs** avant de proposer des créations
3. **Utiliser WSL uniquement** pour les commandes npm/node sur Windows
4. **Préférer les solutions existantes** aux nouvelles implémentations
5. **Documenter les problèmes rencontrés** pour les sessions futures

### Compte admin - Points critiques
- **Le compte admin EXISTE DÉJÀ** (jbgerberon@gmail.com)
- **NE PAS créer de nouveau compte admin**
- **Utiliser password recovery** si connexion impossible
- **User ID :** 8ac44380-8445-49a8-b4a9-16f602d0e7d4

### Problèmes récurrents et solutions
1. **"npm not found"** → Utiliser WSL : `wsl bash -c "commandes"`
2. **"Invalid login credentials"** → Utiliser password recovery Supabase
3. **"Rate limit exceeded"** → Utiliser connexion par mot de passe
4. **Chargement infini** → Vérifier timeout dans useAuth (5s)
5. **React Router errors** → AppRouter personnalisé est utilisé

### Architecture actuelle
- **Router :** AppRouter personnalisé (pas React Router v7)
- **Auth :** Double mode (password + magic link)
- **UI :** NewLoginPage avec onglets
- **PWA :** Désactivé en développement
- **Base :** Supabase avec RLS configuré

### Workflow de debugging
1. Vérifier les logs console (F12)
2. Contrôler l'état d'authentification dans useAuth
3. Vérifier la connexion Supabase
4. Tester avec password recovery si nécessaire
5. Documenter la solution dans CLAUDE.md

---

**Dernière mise à jour :** 2025-08-13  
**Version :** 1.1 - Production Ready + Auth améliorée  
**Maintainer :** JB Gerberon (jbgerberon@gmail.com)