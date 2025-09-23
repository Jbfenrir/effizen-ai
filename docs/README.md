# EffiZen-AI - Documentation Principale

## 📋 Vue d'ensemble

**EffiZen-AI** est une application React/TypeScript de bien-être au travail avec authentification Supabase, gestion multi-rôles et interface multilingue.

**URL Production :** https://effizen-ai-prod.vercel.app
**Statut actuel :** ✅ Solution de récupération de données intégrée et fonctionnelle

## 🚀 Démarrage rapide

```bash
# Depuis PowerShell Windows
cd C:\Users\FIAE\Desktop\effizen-ai
wsl

# Dans WSL
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm install
npm run dev
# → http://localhost:3000
```

## 📁 Structure de la documentation

- [`CLAUDE.md`](../CLAUDE.md) - Instructions spécifiques pour Claude Code
- **Architecture/**
  - [`STACK.md`](architecture/STACK.md) - Stack technique et architecture
  - [`DATABASE.md`](architecture/DATABASE.md) - Base de données et Supabase
  - [`SECURITY.md`](architecture/SECURITY.md) - Authentification et sécurité
- **History/**
  - [`CHANGELOG.md`](history/CHANGELOG.md) - Historique des sessions
  - [`PROBLEMS-SOLVED.md`](history/PROBLEMS-SOLVED.md) - Problèmes résolus
  - [`RECOVERY-2025-09.md`](history/RECOVERY-2025-09.md) - Récupération données septembre
- **Guides/**
  - [`DEVELOPMENT.md`](guides/DEVELOPMENT.md) - Guide de développement
  - [`DEPLOYMENT.md`](guides/DEPLOYMENT.md) - Déploiement et production
  - [`TROUBLESHOOTING.md`](guides/TROUBLESHOOTING.md) - Résolution de problèmes
- **Features/**
  - [`IMPLEMENTED.md`](features/IMPLEMENTED.md) - Fonctionnalités implémentées
  - [`AI-ADVISOR.md`](features/AI-ADVISOR.md) - Système de conseils intelligent
  - [`TODO.md`](features/TODO.md) - Roadmap et améliorations futures

## 🔑 Accès administrateur principal

- **Email :** jbgerberon@gmail.com
- **Rôle :** admin
- **User ID Supabase :** 8ac44380-8445-49a8-b4a9-16f602d0e7d4

## 🎨 Charte graphique

```css
'dark-blue': '#071827'      // Headers
'blue-gray': '#374A52'      // Boutons primaires
'metallic-gray': '#819394'  // Texte secondaire
'light-gray': '#C3CBC8'     // Bordures
'off-white': '#EAEDE4'      // Fond
'lime-green': '#32CD32'     // CTA, succès
```

## 📊 Dernières mises à jour

- **14/09/2025** : Récupération données CSV finalisée
- **12/09/2025** : Corrections dashboard + Système conseils
- **10/09/2025** : Système reset password implémenté

---
**Maintainer :** JB Gerberon (jbgerberon@gmail.com)
**Version :** 7.3