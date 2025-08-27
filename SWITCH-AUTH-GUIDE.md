# 🔄 GUIDE DE BASCULEMENT SYSTÈME AUTH

## 📋 BASCULEMENT RAPIDE

### ➡️ Pour activer le NOUVEAU système (refonte)
```typescript
// Dans src/config/auth-switch.ts, ligne 6 :
USE_AUTH_SYSTEM: 'NEW' as 'NEW' | 'OLD',
```

### ⬅️ Pour revenir à l'ANCIEN système (sauvegarde)
```typescript  
// Dans src/config/auth-switch.ts, ligne 6 :
USE_AUTH_SYSTEM: 'OLD' as 'NEW' | 'OLD',
```

## 🔧 PROCÉDURE COMPLÈTE

1. **Arrêter le serveur** : Ctrl+C
2. **Modifier la configuration** dans `src/config/auth-switch.ts`
3. **Relancer le serveur** : `npm run dev`
4. **Vider le cache navigateur** : Ctrl+Shift+R

## 📊 DIFFÉRENCES ENTRE SYSTÈMES

### 🆕 NOUVEAU SYSTÈME (NEW)
- **Hook** : `useAuthNew.ts`
- **Service** : `supabase-clean.ts`
- **Avantages** : Simplifié, sans boucles infinies, une seule exécution
- **React.StrictMode** : Désactivé (temporairement)
- **Gestion visibilité** : Passive (pas de re-vérification)

### 🔙 ANCIEN SYSTÈME (OLD)  
- **Hook** : `useAuth.ts`
- **Service** : `supabase-bypass.ts`
- **État** : Sauvegarde du commit 57b058e
- **Problèmes connus** : Chargement infini, instances multiples
- **React.StrictMode** : Commenté mais disponible

## ⚠️ IMPORTANT

- **Un seul changement** : Modifier uniquement `USE_AUTH_SYSTEM`
- **Pas de modifications multiples** : Ne pas toucher aux autres fichiers
- **Test immédiat** : Après changement, tester la connexion
- **Cache navigateur** : Vider après chaque basculement

## 🧪 TEST APRÈS BASCULEMENT

1. **Ouvrir** : http://localhost:3000
2. **Observer** : Page de chargement infini ?
3. **Se connecter** : jbgerberon@gmail.com
4. **Changer d'onglet** : Revenir après 5 secondes
5. **Vérifier** : Session maintenue ?

## 📝 LOGS CONSOLE

Le système actif sera indiqué dans la console :
- 🆕 : `AUTH SYSTEM: Utilisation du système NEW`
- 🔙 : `AUTH SYSTEM: Utilisation du système OLD`

## 🚨 EN CAS DE PROBLÈME

Si les deux systèmes posent problème :

```bash
# Retour à la sauvegarde Git complète
git reset --hard 57b058e
npm install
npm run dev
```

---

**Le basculement est conçu pour être instantané et sans risque.**