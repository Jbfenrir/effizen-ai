# 🚀 PHASE 2 : Intégration Dashboards Multi-vues

## 📋 CONTEXTE

**Date de préparation :** 16/10/2025
**Status Phase 1 :** ✅ Déployée en production (commit `beecdf3`)
**Phase 2 :** Infrastructure créée, intégration en attente

## 🎯 OBJECTIF PHASE 2

Intégrer les vues multi-niveaux dans les dashboards :
- **Admin** : Vue Personnel / Vue Équipe (sélection) / Vue Tous utilisateurs
- **Manager** : Vue Personnel / Vue Équipe (automatique, sa propre équipe)
- **Employee** : Vue Personnel uniquement

### Caractéristiques clés
- Données agrégées et anonymisées pour vues Équipe et Tous
- Pas de conseils IA affichés pour vues agrégées
- Sélecteur dropdown intuitif avec indicateurs visuels
- Persistance du choix de vue (localStorage + URL params)

## ✅ INFRASTRUCTURE DÉJÀ CRÉÉE

### 1. Service d'agrégation de données
**Fichier :** `src/services/dataAggregationService.ts` (250 lignes)

**Méthodes disponibles :**
```typescript
class DataAggregationService {
  // Récupération données
  async getPersonalData(userId: string): Promise<DailyEntry[]>
  async getTeamData(teamId: string): Promise<DailyEntry[]>
  async getAllData(): Promise<DailyEntry[]>

  // Agrégation
  aggregateData(entries: DailyEntry[]): AggregatedData
}
```

**Types exportés :**
```typescript
export type ViewType = 'personal' | 'team' | 'all';

export interface AggregatedData {
  wellbeingAvg: number;
  sleepAvg: number;
  energyAvg: number;
  fatigueAvg: number;
  breaksAvg: number;
  optimizationAvg: number;
  participantCount: number;
}
```

### 2. Composant ViewSelector
**Fichier :** `src/components/ViewSelector.tsx` (110 lignes)

**Props :**
```typescript
interface ViewSelectorProps {
  userRole: 'employee' | 'manager' | 'admin';
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  availableTeams?: Array<{ id: string; name: string }>;
  selectedTeamId?: string;
  onTeamChange?: (teamId: string) => void;
}
```

**Fonctionnalités :**
- Options filtrées selon le rôle utilisateur
- Dropdown équipes pour admin en vue équipe
- Indicateurs visuels (badges de mode)
- Message d'information anonymisation

### 3. Traductions complètes
**Fichiers :** `src/i18n/locales/fr.json` & `en.json`

**Clés ajoutées (section `viewSelector`) :**
```json
{
  "viewLabel": "Vue",
  "myData": "Mes données",
  "myTeam": "Mon équipe",
  "allUsers": "Tous les utilisateurs",
  "selectTeam": "Sélectionner une équipe",
  "allTeams": "Toutes les équipes",
  "personalMode": "Mode personnel",
  "teamMode": "Mode équipe (anonymisé)",
  "globalMode": "Mode global (anonymisé)",
  "anonymizedData": "Données agrégées et anonymisées"
}
```

**Total clés i18n :** 277 (FR + EN synchronisées)

## 🛠️ INTÉGRATION À FAIRE

### Étape 1 : DashboardEmployee.tsx

**Imports à ajouter :**
```typescript
import ViewSelector from '../components/ViewSelector';
import { DataAggregationService, ViewType, AggregatedData } from '../services/dataAggregationService';
```

**États à ajouter :**
```typescript
const [currentView, setCurrentView] = useState<ViewType>('personal');
const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
const dataAggService = new DataAggregationService();
```

**useEffect pour charger données selon vue :**
```typescript
useEffect(() => {
  const loadDataByView = async () => {
    if (!user?.id) return;

    let entries: DailyEntry[] = [];

    switch (currentView) {
      case 'personal':
        entries = await dataAggService.getPersonalData(user.id);
        setAggregatedData(null); // Pas d'agrégation en mode personnel
        break;

      case 'team':
        if (user.team) {
          entries = await dataAggService.getTeamData(user.team);
          const aggregated = dataAggService.aggregateData(entries);
          setAggregatedData(aggregated);
        }
        break;

      case 'all':
        // Employee ne devrait pas avoir accès, mais au cas où
        entries = [];
        setAggregatedData(null);
        break;
    }

    // Utiliser entries pour afficher graphiques/statistiques
    // ...
  };

  loadDataByView();
}, [currentView, user, selectedPeriod, customStartDate, customEndDate]);
```

**Composant ViewSelector à intégrer :**
```typescript
<ViewSelector
  userRole="employee"
  currentView={currentView}
  onViewChange={(view) => {
    setCurrentView(view);
    // Sauvegarder dans localStorage si besoin
    localStorage.setItem('dashboardView', view);
  }}
/>
```

**Conditionnellement cacher conseils IA :**
```typescript
{currentView === 'personal' && advicePair && (
  <div className="grid md:grid-cols-2 gap-6">
    {/* Carte conseil Santé */}
    {/* Carte conseil Organisation */}
  </div>
)}

{currentView !== 'personal' && aggregatedData && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-700">
      {t('viewSelector.anonymizedData')} - {aggregatedData.participantCount} participant(s)
    </p>
  </div>
)}
```

### Étape 2 : DashboardManager.tsx

**Similaire à DashboardEmployee, mais :**

```typescript
// Récupérer les équipes disponibles
const [availableTeams, setAvailableTeams] = useState<Array<{ id: string; name: string }>>([]);

useEffect(() => {
  const loadTeams = async () => {
    // Récupérer toutes les équipes depuis adminService ou Supabase
    const teams = await adminService.getTeams();
    setAvailableTeams(teams);
  };
  loadTeams();
}, []);

// ViewSelector pour Manager
<ViewSelector
  userRole="manager"
  currentView={currentView}
  onViewChange={setCurrentView}
  availableTeams={availableTeams}
  selectedTeamId={selectedTeamId}
  onTeamChange={setSelectedTeamId}
/>
```

**Logique de chargement :**
```typescript
case 'team':
  // Manager voit automatiquement son équipe
  if (user.team) {
    entries = await dataAggService.getTeamData(user.team);
  }
  break;
```

### Étape 3 : DashboardAdmin.tsx

**Déjà partiellement fait, mais ajouter :**

```typescript
// ViewSelector pour Admin (toutes options)
<ViewSelector
  userRole="admin"
  currentView={currentView}
  onViewChange={setCurrentView}
  availableTeams={availableTeams}
  selectedTeamId={selectedTeamId}
  onTeamChange={setSelectedTeamId}
/>
```

**Logique de chargement :**
```typescript
case 'personal':
  entries = await dataAggService.getPersonalData(user.id);
  break;

case 'team':
  if (selectedTeamId) {
    entries = await dataAggService.getTeamData(selectedTeamId);
  } else {
    // Toutes les équipes
    entries = await dataAggService.getAllData();
  }
  break;

case 'all':
  entries = await dataAggService.getAllData();
  break;
```

## 📊 AFFICHAGE DES DONNÉES AGRÉGÉES

Pour les vues agrégées, remplacer les données brutes par `aggregatedData` :

```typescript
{aggregatedData && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    <StatCard
      title={t('dashboard.employee.wellbeingScore')}
      value={Math.round(aggregatedData.wellbeingAvg)}
      unit="/100"
    />
    <StatCard
      title={t('dashboard.employee.sleepAvg')}
      value={aggregatedData.sleepAvg.toFixed(1)}
      unit="h"
    />
    <StatCard
      title={t('dashboard.employee.energyAvg')}
      value={Math.round(aggregatedData.energyAvg)}
      unit="/100"
    />
    {/* ... autres stats */}
  </div>
)}
```

## 🧪 TESTS À EFFECTUER

### Test 1 : Employee
1. Se connecter avec compte employee
2. Vérifier que seule l'option "Mes données" est disponible
3. Vérifier que les conseils IA sont affichés
4. Vérifier que les données personnelles sont affichées

### Test 2 : Manager
1. Se connecter avec compte manager
2. Sélectionner "Mes données" → Conseils IA visibles
3. Sélectionner "Mon équipe" → Données agrégées, pas de conseils
4. Vérifier le compteur de participants

### Test 3 : Admin
1. Se connecter avec compte admin
2. Tester les 3 vues : Personnel / Équipe (sélection) / Tous
3. Vérifier dropdown équipes en vue Équipe
4. Vérifier agrégation correcte
5. Vérifier que conseils IA n'apparaissent qu'en mode Personnel

### Test 4 : Persistance
1. Sélectionner une vue
2. Rafraîchir la page (Ctrl+F5)
3. Vérifier que la vue sélectionnée est restaurée

## 🚨 POINTS D'ATTENTION

### Sécurité RLS Supabase
- Vérifier que les policies RLS permettent aux managers de lire les données de leur équipe
- Vérifier que les employees ne peuvent lire QUE leurs propres données
- Policies actuelles dans `docs/architecture/DATABASE.md`

### Gestion des équipes manquantes
```typescript
// Si user n'a pas d'équipe assignée
if (currentView === 'team' && !user.team) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-700">
        {t('dashboard.noTeamAssigned')}
      </p>
    </div>
  );
}
```

### Performance
- Les vues agrégées peuvent charger BEAUCOUP de données
- Considérer pagination ou limite temporelle (ex: 30 derniers jours)
- Mettre en cache les résultats si possible

## 📝 TRADUCTIONS À AJOUTER (si besoin)

Si des messages supplémentaires sont nécessaires :

```json
// fr.json
{
  "dashboard": {
    "noTeamAssigned": "Vous n'êtes assigné à aucune équipe",
    "loadingTeamData": "Chargement des données d'équipe...",
    "noDataAvailable": "Aucune donnée disponible pour cette période"
  }
}
```

## ✅ CHECKLIST FINALE

Avant de déployer Phase 2 :

- [ ] ViewSelector intégré dans DashboardEmployee
- [ ] ViewSelector intégré dans DashboardManager
- [ ] ViewSelector intégré dans DashboardAdmin
- [ ] Logique de chargement données par vue implémentée
- [ ] Conseils IA conditionnellement affichés (mode personnel uniquement)
- [ ] Données agrégées affichées correctement
- [ ] Tests avec 3 rôles effectués
- [ ] Persistance vue testée
- [ ] Traductions complètes vérifiées
- [ ] Build production réussi
- [ ] Push GitHub effectué
- [ ] Déploiement Vercel vérifié
- [ ] Tests en production avec vrais utilisateurs

## 📚 RÉFÉRENCES

- **Guide de tests Phase 1 :** `TEST_GUIDE.md`
- **Service d'agrégation :** `src/services/dataAggregationService.ts`
- **Composant sélecteur :** `src/components/ViewSelector.tsx`
- **Architecture BDD :** `docs/architecture/DATABASE.md`
- **Changelog :** `docs/history/CHANGELOG.md`

---

**Préparé le :** 16/10/2025
**Commit de départ :** `beecdf3`
**Statut :** Prêt pour intégration 🚀
