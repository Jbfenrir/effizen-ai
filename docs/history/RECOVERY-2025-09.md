# Récupération Données Historiques - Septembre 2025

## 📊 Contexte

23 entrées historiques (11/08/2025 - 12/09/2025) étaient stockées dans localStorage et devaient être centralisées dans Supabase pour accès multi-navigateurs.

## 🎯 Solution implémentée

### Bouton "Récupérer Données" dans Dashboard Admin
- **Icône :** Database orange 🟠
- **Composant :** `DataRecoveryModal.tsx`
- **Fonctionnalités :**
  - Détection automatique des doublons
  - Injection par lots de 5 entrées
  - Conversion automatique des formats
  - Feedback temps réel

## 📝 Données CSV intégrées

Les 23 entrées sont hardcodées directement dans `DataRecoveryModal.tsx` :

```typescript
const csvData = [
  { date: '2025-08-11', sleep: 8, fatigue: 2, tasks: ['App (1h)', ...], ... },
  { date: '2025-08-12', sleep: 7, fatigue: 4, tasks: ['Recherche (3h)', ...], ... },
  // ... 21 autres entrées
];
```

## 🔧 Problèmes rencontrés et résolus

### 1. Erreur UUID (09/09/2025)
**Erreur :** `invalid input syntax for type uuid: 'entry_2025_08_11_hist'`
**Solution :** Suppression des IDs personnalisés, auto-génération par Supabase

### 2. Mauvais compte utilisateur (10/09/2025)
**Problème :** Données dans jbgerberon@gmail.com au lieu de @formation-ia-entreprises.ch
**Solution :** Script `transfer-data-to-correct-user.cjs`

### 3. Filtrage dates cassé (11/09/2025)
**Problème :** Période sélectionnée n'affichait rien
**Solution :** Modification `getAllEntries()` pour privilégier Supabase

### 4. Structure tasks incorrecte (12/09/2025)
**Problème :** `TypeError: m.tasks.reduce is not a function`
**Solution :** Script `fix-tasks-structure.cjs`

## 🚀 Utilisation

### Pour récupérer les données :
1. Se connecter en tant qu'admin
2. Aller dans Dashboard Admin
3. Cliquer sur le bouton "Récupérer Données" 🟠
4. Confirmer l'injection
5. Attendre le feedback de succès

### Scripts de maintenance créés :
```bash
# Diagnostic des données
node sync-data-simple.cjs

# Transfert entre comptes
node transfer-data-to-correct-user.cjs

# Correction structure
node fix-tasks-structure.cjs

# Test filtrage
node debug-date-filter.cjs
```

## ✅ Résultat final

- **23 entrées** centralisées dans Supabase
- **Accès multi-navigateurs** fonctionnel
- **Filtrage par dates** opérationnel
- **Export CSV** avec toutes les données

## 📊 Format des données converties

### Entrée CSV originale :
```javascript
{
  date: '2025-08-11',
  sleep: 8,
  fatigue: 2,
  tasks: ['App (1h)', 'Recherche (2h)'],
  breaks: 2,
  sports: 0.5,
  social: true
}
```

### Conversion Supabase :
```javascript
{
  user_id: 'uuid-utilisateur',
  entry_date: '2025-08-11',
  sleep: { duration: 8, quality: 4, bedTime: '22:00', wakeTime: '07:00' },
  focus: { morning: 50, afternoon: 50 },
  tasks: [
    { name: 'App', duration: 1, isHighValue: true },
    { name: 'Recherche', duration: 2, isHighValue: true }
  ],
  wellbeing: {
    breaks: { morning: true, lunch: false, afternoon: true, evening: false },
    sportsHours: 0.5,
    socialInteraction: true
  }
}
```

---
**Commit de référence :** `4cf7f97` - Correction filtrage dates et synchronisation