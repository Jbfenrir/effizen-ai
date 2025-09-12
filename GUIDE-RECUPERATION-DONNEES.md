# 🔄 GUIDE DE RÉCUPÉRATION DES DONNÉES HISTORIQUES

## 🚨 PROBLÈME IDENTIFIÉ
Vos données historiques sont stockées dans **localStorage** de votre navigateur local et n'ont jamais été transférées vers Supabase. C'est pourquoi elles n'apparaissent pas en production.

## 🎯 SOLUTION : Migration localStorage → Supabase

### ÉTAPE 1 : Déployer le script de migration
✅ **Terminé** - Le script DataMigration est maintenant dans le code et sera déployé en production.

### ÉTAPE 2 : Accéder au navigateur où vous avez saisi les données
1. **Ouvrir le navigateur** où vous avez originellement saisi vos données historiques
2. **Aller sur localhost:3001** (ou l'URL où vous saisissiez les données)
3. **Se connecter avec jbgerberon@formation-ia-entreprises.ch**

### ÉTAPE 3 : Exécuter le script de migration
1. **Ouvrir la console développeur** (F12)
2. **Exécuter ces commandes une par une :**

```javascript
// 1. Générer un rapport des données localStorage
DataMigration.generateReport();

// 2. Tester la connexion Supabase
await DataMigration.testSupabaseConnection();

// 3. Migrer toutes les données vers Supabase
const result = await DataMigration.migrateToSupabase();
console.log('Résultat migration:', result);
```

### ÉTAPE 4 : Vérifier le résultat
Le script affichera :
- ✅ `success: true` si la migration réussit
- ✅ `migrated: X` nombre d'entrées migrées
- ❌ `errors: [...]` si des erreurs surviennent

### ÉTAPE 5 : Tester en production
1. **Aller sur https://effizen-ai-prod.vercel.app**
2. **Se connecter avec jbgerberon@formation-ia-entreprises.ch**  
3. **Vérifier que toutes les données historiques apparaissent**
4. **Tester l'export CSV pour confirmer**

## 🔧 COMMANDES DE DIAGNOSTIC

Si vous voulez d'abord analyser vos données localStorage :

```javascript
// Voir combien de données vous avez
const entries = DataMigration.getLocalStorageEntries();
console.log(`${entries.length} entrées trouvées`);

// Voir les dates couvertes
const dates = entries.map(e => e.entry_date).sort();
console.log('Première:', dates[0], 'Dernière:', dates[dates.length-1]);

// Voir un exemple d'entrée
console.log('Exemple:', entries[0]);
```

## ⚠️ IMPORTANT

1. **Utilisez le MÊME navigateur** où vous avez saisi les données originalement
2. **Les données localStorage sont locales** - elles n'existent que sur ce navigateur
3. **La migration ne duplique pas** - elle vérifie les doublons
4. **Une fois migrées**, les données seront visibles partout

## 🆘 EN CAS DE PROBLÈME

Si la migration échoue :
1. **Vérifiez l'authentification** : êtes-vous connecté ?
2. **Vérifiez la console** : y a-t-il des erreurs réseau ?
3. **Essayez par petits lots** si beaucoup de données
4. **Contactez-moi** avec les messages d'erreur exacts

## 🎉 APRÈS LA MIGRATION

Une fois terminée :
- ✅ Dashboard production affichera toutes vos données
- ✅ Export CSV sera complet
- ✅ Scores calculés avec tout l'historique
- ✅ Plus de perte de données entre local/production