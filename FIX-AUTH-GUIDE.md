# Guide de résolution du problème d'authentification EffiZen-AI

## 🔴 Problème identifié

**Récursion infinie dans les politiques RLS de Supabase** sur la table `profiles`.

L'erreur exacte : `infinite recursion detected in policy for relation "profiles"`

Cette erreur empêche la récupération du profil utilisateur après connexion, causant une boucle infinie.

## ✅ Solution temporaire (ACTIVE MAINTENANT)

J'ai créé un service bypass (`supabase-bypass.ts`) qui :
- Contourne complètement la table `profiles`
- Détermine le rôle basé sur l'email uniquement
- Permet l'accès immédiat à l'application

**L'application devrait maintenant fonctionner sur http://localhost:3000**

### Pour tester :
1. Ouvrir http://localhost:3000
2. Se connecter avec :
   - Email : jbgerberon@gmail.com
   - Mot de passe : mtuw xsol vahe sgkn

## 🔧 Solution permanente (À APPLIQUER DANS SUPABASE)

### Étape 1 : Exécuter le script SQL de correction

1. Aller sur https://supabase.com/dashboard
2. Se connecter et sélectionner le projet EffiZen-AI
3. Aller dans **SQL Editor**
4. Copier et exécuter le contenu du fichier `fix-rls-policies-v2.sql`

Ce script :
- Désactive temporairement RLS
- Supprime toutes les politiques problématiques
- Crée des politiques simples sans récursion
- Réactive RLS

### Étape 2 : Vérifier que le profil admin existe

Dans le SQL Editor, exécuter :

```sql
SELECT * FROM profiles WHERE email = 'jbgerberon@gmail.com';
```

Si aucun résultat, exécuter :

```sql
INSERT INTO profiles (id, email, role, is_active, created_at, updated_at)
VALUES (
  '8ac44380-8445-49a8-b4a9-16f602d0e7d4',
  'jbgerberon@gmail.com',
  'admin',
  true,
  NOW(),
  NOW()
);
```

### Étape 3 : Revenir au service normal

Une fois les politiques RLS corrigées :

1. Éditer `src/hooks/useAuth.ts`
2. Commenter la ligne 3 et décommenter la ligne 4 :

```typescript
// import { authService, type AuthUser } from '../services/supabase-bypass';
import { authService, type AuthUser } from '../services/supabase';
```

3. Faire de même dans `src/pages/AuthCallback.tsx`

4. Tester que tout fonctionne

## 📝 Fichiers créés pour le débogage

- `test-auth.js` - Script de test Node.js pour l'authentification
- `fix-rls-policies.sql` - Premier script SQL (problématique)
- `fix-rls-policies-v2.sql` - Script SQL corrigé
- `src/services/supabase-bypass.ts` - Service temporaire sans table profiles

## 🚀 Déploiement en production

Une fois le problème RLS résolu :

1. Revenir au service normal (voir Étape 3)
2. Tester en local
3. Commit et push :

```bash
git add .
git commit -m "Fix: Résolution du problème d'authentification RLS"
git push origin main
```

4. Vercel déploiera automatiquement
5. Tester sur https://effizen-ai-prod.vercel.app

## ⚠️ Points d'attention

1. **NE PAS** créer de politiques RLS qui référencent la table elle-même (cause de récursion)
2. **TOUJOURS** tester les politiques RLS avant de les appliquer en production
3. **GARDER** le service bypass comme solution de secours

## 📞 Support

Si le problème persiste :
1. Vérifier les logs dans la console du navigateur (F12)
2. Vérifier les logs Supabase : Dashboard → Logs → API
3. Contacter le support Supabase si nécessaire

---

**Dernière mise à jour :** 18/08/2025
**Auteur :** Claude Code
**Status :** Solution temporaire active, en attente d'application de la solution permanente