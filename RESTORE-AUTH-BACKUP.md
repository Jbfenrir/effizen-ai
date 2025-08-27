# 🛡️ RESTAURATION SYSTÈME AUTH ORIGINAL

## 📋 COMMANDE DE RESTAURATION RAPIDE

Si la nouvelle refonte d'authentification pose problème, utilisez cette commande pour revenir à l'état précédent :

```bash
git reset --hard 57b058e
```

## 🔄 PROCÉDURE COMPLÈTE DE RESTAURATION

### 1. Arrêter le serveur
```bash
# Dans le terminal où tourne npm run dev
Ctrl + C
```

### 2. Revenir à la version précédente
```bash
cd C:\Users\FIAE\Desktop\effizen-ai
wsl
git reset --hard 57b058e
```

### 3. Nettoyer et redémarrer
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 4. Vider le cache navigateur
- Chrome/Edge: Ctrl+Shift+R puis Ctrl+Shift+Delete
- Firefox: Ctrl+F5 puis Ctrl+Shift+Delete

## 📊 ÉTAT DE LA SAUVEGARDE (Commit 57b058e)

### ✅ Fonctionnalités sauvegardées
- Dashboard admin opérationnel (après bouton "Forcer la connexion")
- Création utilisateurs avec mots de passe temporaires
- Gestion équipes (CRUD complet)
- Interface multilingue (FR/EN)
- Déploiement Vercel automatique

### 🚨 Problèmes connus dans cette sauvegarde
- Page de chargement infini au lancement
- Nécessité de cliquer "Forcer la connexion" à chaque fois
- Instances multiples GoTrueClient
- Problème de changement d'onglet (retour en chargement infini)

### 🏗️ Architecture sauvegardée
- **Service Auth :** `src/services/supabase-bypass.ts` (version singleton window)
- **Hook Auth :** `src/hooks/useAuth.ts` (avec gestion visibilitychange)
- **Router :** `src/AppRouter.tsx` (SPA avec bouton d'urgence)
- **Client Supabase :** Dual (anon + service_role)

## 🔧 TESTS DISPONIBLES APRÈS RESTAURATION

Les scripts de test créés pendant l'investigation sont inclus :
- `test-tab-switch-fix.cjs` - Test changement onglet
- `test-final-fix.cjs` - Test complet avec Puppeteer
- `debug-runtime.cjs` - Debug en temps réel
- `test-manual-page.html` - Page de test manuel

## 📞 EN CAS DE PROBLÈME

Si la restauration échoue :

1. **Vérification de l'état Git :**
   ```bash
   git log --oneline -5
   # Vous devez voir le commit 57b058e en tête
   ```

2. **Force clean si nécessaire :**
   ```bash
   git clean -fd
   git reset --hard 57b058e
   ```

3. **Rebuild complet :**
   ```bash
   rm -rf dist node_modules package-lock.json
   npm install
   npm run build
   ```

## 📝 NOTES IMPORTANTES

- **Commit de sauvegarde :** `57b058e` - "SAUVEGARDE: État avant refonte auth complète"
- **Date de sauvegarde :** 2025-08-27
- **Statut production :** ✅ Déployable (avec bouton "Forcer la connexion")
- **Environnement de test :** WSL + npm run dev requis

---

**🔒 Cette sauvegarde garantit un retour possible à l'état fonctionnel précédent à tout moment.**