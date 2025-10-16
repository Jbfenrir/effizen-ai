# CLAUDE.md - Instructions Claude Code

## 🎯 CONTEXTE IMMÉDIAT

**EffiZen-AI** - Application React/TypeScript de bien-être au travail
- **Production :** https://effizen-ai-prod.vercel.app
- **Admin :** jbgerberon@gmail.com (ID: 8ac44380-8445-49a8-b4a9-16f602d0e7d4)
- **Status :** ✅ Corrections exports CSV + Trigger auto-sync Auth/Profiles - En attente exécution SQL (16/10/2025)

## 📁 DOCUMENTATION COMPLÈTE

La documentation détaillée est maintenant organisée dans le dossier `docs/` :

- 📚 [`docs/README.md`](docs/README.md) - Vue d'ensemble du projet
- 🏗️ [`docs/architecture/`](docs/architecture/) - Stack technique et BDD
- 📜 [`docs/history/`](docs/history/) - Historique et problèmes résolus
- 📖 [`docs/guides/`](docs/guides/) - Guides de développement
- ✨ [`docs/features/`](docs/features/) - Fonctionnalités et roadmap

## 🚀 DÉMARRAGE RAPIDE

```bash
# OBLIGATOIRE : Utiliser WSL sur Windows
cd C:\Users\FIAE\Desktop\effizen-ai
wsl
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm install
npm run dev
```

## ⚠️ RÈGLES CRITIQUES CLAUDE CODE

### 1. TOUJOURS commencer par
- Lire ce fichier CLAUDE.md
- **LIRE OBLIGATOIREMENT** [`docs/guides/COMPORTEMENT.md`](docs/guides/COMPORTEMENT.md) - Protocoles de communication et gestion des limitations
- Vérifier l'état actuel avec `git status`
- Consulter la doc spécifique si besoin dans `docs/`

### 2. JAMAIS
- Commiter de données sensibles (emails, IDs, mots de passe)
- Créer de nouveaux services Supabase (utiliser l'existant)
- Utiliser npm hors de WSL
- **AJOUTER CODE AVEC t('...') SANS AJOUTER CLÉS DANS fr.json ET en.json** ⚠️

### 3. Solutions aux problèmes fréquents
- **npm not found** → Utiliser WSL uniquement
- **Build errors** → `npm run build` (sans TypeScript check)
- **Modifications non visibles** → Relancer serveur (Ctrl+C → npm run dev)
- **Restauration urgente** → `git reset --hard 57b058e`

## 📊 ÉTAT ACTUEL DES FONCTIONNALITÉS

### ✅ Opérationnel
- Dashboard admin avec récupération données CSV
- **Système de conseils double (Santé + Organisation)**
- **Page Assistant avec conseils détaillés**
- **Persistance état Dashboard (période + dates)**
- **Format temps HH:MM (durées lisibles)**
- **Export CSV personnel et global (robustes JSONB)**
- Reset password (3 solutions)
- **Traductions i18n complètes (277/277 clés - 100%)**

### 🔧 En cours / Attente utilisateur
- **Trigger auto-sync Auth ↔ Profiles** (script SQL prêt, à exécuter dans Supabase Dashboard)
- Infrastructure Phase 2 (dashboards multi-vues : Personnel/Équipe/Tous)
- Optimisation performances
- Contenu page Assistant

### 📝 TODO Prioritaires
Voir [`docs/features/TODO.md`](docs/features/TODO.md)

## 🆘 SUPPORT RAPIDE

- **Problème ?** → [`docs/guides/TROUBLESHOOTING.md`](docs/guides/TROUBLESHOOTING.md)
- **Architecture ?** → [`docs/architecture/STACK.md`](docs/architecture/STACK.md)
- **Historique ?** → [`docs/history/CHANGELOG.md`](docs/history/CHANGELOG.md)

---
**Dernière mise à jour :** 2025-10-16
**Version :** 9.1 - Corrections exports CSV + Trigger auto-sync Auth/Profiles + Infrastructure dashboards multi-vues
- to memorize : lorsque je te dirais d'effectuer une sauvegarde, tu devras suivre le process suivant : Pour sauvegarder les éléments d'une session :

  1. Pendant la session : Documentez dans le fichier approprié selon le type :
    - Nouveau bug résolu → docs/history/PROBLEMS-SOLVED.md
    - Nouvelle fonctionnalité → docs/features/IMPLEMENTED.md
    - Changement important → docs/history/CHANGELOG.md avec la date
  2. En fin de session : Mettez à jour :
    - CLAUDE.md : Section "CONTEXTE IMMÉDIAT" si changement majeur
    - docs/history/CHANGELOG.md : Ajout entrée datée avec résumé
  3. Commande de commit :
  git add -A
  git commit -m "📝 SESSION: [Date] - [Résumé des changements]"
- to memorize A chaque fois que tu pousses Une version en prod tu dois absolument t'assurer de ne pas altérer ni supprimer de données utilisateurs De la prod Qu'elle soit stockée dans supabase ou autre.