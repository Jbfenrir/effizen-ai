# 📋 GUIDE ÉTAPE PAR ÉTAPE - Exécution des scripts SQL dans Supabase

## 🎯 Objectif
Corriger définitivement les politiques RLS qui causent le problème d'authentification.

---

## 📝 ÉTAPE 1 : Se connecter à Supabase

1. **Ouvrir votre navigateur** et aller sur : https://supabase.com

2. **Cliquer sur "Sign In"** (en haut à droite)

3. **Se connecter avec GitHub** (le plus simple)
   - Ou utiliser votre email/mot de passe si vous avez créé un compte directement

---

## 🗂️ ÉTAPE 2 : Accéder à votre projet

1. **Une fois connecté**, vous verrez le Dashboard Supabase

2. **Trouver votre projet** : Il devrait s'appeler quelque chose comme "effizen-ai" ou similaire

3. **Cliquer sur le projet** pour l'ouvrir

---

## 💻 ÉTAPE 3 : Ouvrir le SQL Editor

1. **Dans le menu de gauche**, chercher l'icône "SQL Editor"
   - C'est généralement représenté par `< >` ou un symbole de code
   - C'est dans la section du milieu du menu

2. **Cliquer sur "SQL Editor"**
   - Une nouvelle page s'ouvre avec un éditeur de texte

---

## 📄 ÉTAPE 4 : Copier le script SQL

1. **Ouvrir le fichier** `fix-rls-policies-v2.sql` dans votre éditeur de texte
   - Ce fichier est dans le dossier effizen-ai

2. **Sélectionner TOUT le contenu** (Ctrl+A)

3. **Copier** (Ctrl+C)

---

## ▶️ ÉTAPE 5 : Exécuter le script

1. **Dans le SQL Editor de Supabase**, coller le script (Ctrl+V)

2. **IMPORTANT** : Avant d'exécuter, vérifier que vous êtes bien dans le bon projet
   - Le nom du projet est affiché en haut de la page

3. **Cliquer sur le bouton "RUN"** (ou "Exécuter")
   - C'est un bouton vert généralement en bas à droite de l'éditeur
   - Ou utilisez le raccourci Ctrl+Enter

4. **Attendre** que le script s'exécute
   - Vous devriez voir des messages de succès en vert
   - Si vous voyez des erreurs en rouge, ne paniquez pas (voir section dépannage)

---

## ✅ ÉTAPE 6 : Vérifier que tout fonctionne

1. **Dans le SQL Editor**, effacer le contenu et coller cette requête de vérification :

```sql
-- Vérifier que le profil admin existe
SELECT * FROM profiles WHERE email = 'jbgerberon@gmail.com';
```

2. **Cliquer sur "RUN"**

3. **Vous devriez voir** :
   - Une ligne avec vos informations
   - Le rôle doit être "admin"
   - is_active doit être "true"

---

## 🔍 ÉTAPE 7 : Vérifier les politiques RLS

1. **Effacer le SQL Editor** et coller :

```sql
-- Voir toutes les politiques sur la table profiles
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

2. **Cliquer sur "RUN"**

3. **Vous devriez voir** 5 politiques :
   - Admin can modify all profiles
   - Admin can read all profiles
   - Users can insert own profile
   - Users can read own profile
   - Users can update own profile

---

## 🚨 DÉPANNAGE - Si quelque chose ne fonctionne pas

### Erreur : "relation profiles does not exist"
→ La table profiles n'existe pas. Il faut d'abord créer la structure de base de données.

### Erreur : "duplicate key value violates unique constraint"
→ Le profil existe déjà, c'est normal. Continuez.

### Erreur : "permission denied"
→ Vous n'avez pas les droits. Vérifiez que vous êtes bien connecté en tant que propriétaire du projet.

### Les politiques ne se créent pas
1. D'abord, supprimer TOUTES les anciennes politiques :

```sql
-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for admins to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can modify all profiles" ON public.profiles;
```

2. Puis réexécuter le script `fix-rls-policies-v2.sql`

---

## 🎉 ÉTAPE 8 : Tester l'application

1. **Retourner sur votre application locale** : http://localhost:3000

2. **Se connecter avec** :
   - Email : jbgerberon@gmail.com
   - Mot de passe : mtuw xsol vahe sgkn

3. **Vous devriez maintenant** :
   - Rester connecté (pas de déconnexion automatique)
   - Voir le dashboard admin
   - Pouvoir naviguer entre les onglets

---

## 📞 Si ça ne fonctionne toujours pas

1. **Vérifier la console du navigateur** (F12) pour voir les erreurs

2. **Me montrer** :
   - Les erreurs dans la console
   - Les résultats des requêtes SQL de vérification
   - Ce qui s'affiche dans Supabase

3. **Alternative temporaire** : L'application fonctionne déjà en production sur https://effizen-ai-prod.vercel.app

---

**Dernière mise à jour** : 18/08/2025
**Auteur** : Claude Code