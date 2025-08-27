# 🚀 GUIDE RAPIDE - Corriger les Problèmes de Base de Données

## ⚠️ Problème actuel
- Les équipes et utilisateurs créés ne persistent pas
- Erreurs 400 dans la console (tables manquantes ou RLS bloquant)

## ✅ Solution en 5 étapes simples

### Étape 1 : Ouvrir Supabase
1. Ouvrez votre navigateur
2. Allez sur : **https://supabase.com/dashboard**
3. Connectez-vous avec votre compte GitHub

### Étape 2 : Sélectionner votre projet
- Cliquez sur le projet **"effizen-ai"** (ou celui avec l'URL `qzvrkcmwzdaffpknuozl`)

### Étape 3 : Ouvrir l'éditeur SQL
- Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône cylindre)
- Cliquez sur le bouton **"+ New query"** en haut

### Étape 4 : Exécuter le script
1. **Ouvrez le fichier** `fix-database-tables.sql` (dans le dossier effizen-ai)
2. **Copiez TOUT le contenu** du fichier (Ctrl+A puis Ctrl+C)
3. **Collez** dans l'éditeur SQL de Supabase (Ctrl+V)
4. Cliquez sur le bouton vert **"RUN"** en bas à droite

### Étape 5 : Vérifier le succès
Vous devriez voir dans les résultats :
- ✅ "Script exécuté avec succès !"
- 📊 Tables créées
- 🔒 Politiques RLS configurées
- 👤 Profil admin configuré

## 🎯 Résultat attendu
Après avoir exécuté le script :
1. **Rafraîchissez votre application** (F5)
2. Les erreurs 400 devraient disparaître
3. Vous pourrez créer des équipes et utilisateurs
4. Les données persisteront entre les sessions

## 🆘 En cas de problème
Si vous voyez des erreurs lors de l'exécution :
- **"relation already exists"** → C'est OK, la table existe déjà
- **"duplicate key"** → C'est OK, la donnée existe déjà
- **Autre erreur** → Copiez le message d'erreur pour que je puisse vous aider

## 📝 Notes importantes
- Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans problème
- Il crée automatiquement votre profil admin
- Il crée une équipe de test pour vérifier que tout fonctionne