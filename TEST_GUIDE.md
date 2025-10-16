# Guide de Test - Session 16/10/2025

## 🎯 Résumé des modifications

### ✅ Phase 1 : Corrections Exports CSV (PRÊT À TESTER)

**Problèmes résolus :**
1. Export personnel (menu utilisateur) - **CORRIGÉ**
2. Export global admin (dashboard admin) - **AJOUTÉ**

**Fichiers modifiés :**
- `src/components/Header.tsx` (lignes 37-60) : Fonction exportData réparée
- `src/pages/DashboardAdmin.tsx` (lignes 187-319, 353-359) : Export global ajouté
- `src/services/adminService.ts` (lignes 383-399) : Méthode getAllEntries ajoutée
- `src/i18n/locales/fr.json` & `en.json` : Traductions ajoutées

### ✅ Phase 2 : Infrastructure Multi-vues (INFRASTRUCTURE PRÊTE)

**Nouveaux fichiers créés :**
1. `src/services/dataAggregationService.ts` - Service d'agrégation données
2. `src/components/ViewSelector.tsx` - Composant sélecteur de vue
3. Traductions complètes FR/EN dans section `viewSelector.*`

**État** : Infrastructure fonctionnelle, intégration dashboards à finaliser selon retours

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Export personnel (Tous les rôles)

**Pré-requis :** Être connecté avec un compte ayant des données

**Étapes :**
1. Cliquer sur l'icône utilisateur (en haut à droite du header)
2. Cliquer sur "Exporter mes données"
3. **Résultat attendu :**
   - Un fichier CSV est téléchargé : `effizen-data-complet.csv`
   - Le fichier contient les colonnes : Date, Sommeil (h), Fatigue, Energie, Pauses, Bien-être, Score d'optimisation, Tâches
   - Les données correspondent aux entrées de l'utilisateur connecté

**Si échec :**
- Vérifier la console navigateur (F12) pour les erreurs
- Vérifier que l'utilisateur a des données dans Supabase
- Noter le message d'erreur exact

---

### Test 2 : Export global admin (Admin uniquement)

**Pré-requis :** Être connecté avec un compte admin (jbgerberon@gmail.com)

**Étapes :**
1. Aller sur le Dashboard Admin
2. Cliquer sur le bouton vert "Export Global" (en haut à droite)
3. **Résultat attendu :**
   - Un fichier CSV est téléchargé : `effizen-export-global-YYYY-MM-DD.csv`
   - Le fichier contient les colonnes : User ID, Email, Team, Date, Sommeil (h), Fatigue, Energie, Pauses, Bien-être, Score d'optimisation, Tâches
   - Les données incluent TOUS les utilisateurs de la plateforme

**Si échec :**
- Vérifier la console navigateur (F12) pour les erreurs
- Vérifier que le compte est bien admin dans Supabase (table profiles)
- Noter le message d'erreur exact

---

## 📊 Vérification Post-Test

### Export Personnel
- [ ] Fichier téléchargé avec succès
- [ ] Nom du fichier correct : `effizen-data-complet.csv`
- [ ] Toutes les colonnes présentes
- [ ] Données cohérentes avec le dashboard
- [ ] Aucune erreur dans la console

### Export Global Admin
- [ ] Fichier téléchargé avec succès
- [ ] Nom du fichier correct : `effizen-export-global-YYYY-MM-DD.csv`
- [ ] Toutes les colonnes présentes (incluant User ID, Email, Team)
- [ ] Données de tous les utilisateurs présentes
- [ ] Aucune erreur dans la console

---

## 🚀 Déploiement en Production

**Commandes :**
```bash
# Dans WSL
cd /mnt/c/Users/FIAE/Desktop/effizen-ai

# Build final
npm run build

# Push vers Git (après vérification)
git add -A
git commit -m "🔧 FIX: Export CSV personnel + Export global admin + Infrastructure multi-vues

✅ Phase 1 - Corrections exports CSV:
- Correction fonction exportData Header.tsx (ligne 37-60)
- Ajout export global admin DashboardAdmin.tsx (ligne 187-319)
- Ajout méthode getAllEntries adminService.ts
- Traductions FR/EN complètes

✅ Phase 2 - Infrastructure multi-vues:
- Service dataAggregationService.ts (agrégation données)
- Composant ViewSelector.tsx (sélecteur vue)
- Traductions FR/EN section viewSelector

📝 Intégration dashboards à finaliser selon retours utilisateurs

🧪 Testé: Build réussi, aucune erreur TypeScript"

git push
```

**Vercel déploiera automatiquement** après le push.

---

## ⚠️ Points d'attention

### Données Supabase
- **IMPORTANT :** Les exports utilisent maintenant UNIQUEMENT Supabase
- Vérifier que les données utilisateurs sont bien dans `daily_entries`
- En cas de doute, utiliser le bouton "Récupérer Données" du Dashboard Admin

### Sécurité RLS (Row Level Security)
- Export personnel : Utilise `auth.uid()` automatiquement (sécurisé)
- Export global : Nécessite rôle `admin` dans table `profiles`
- Si erreur de permission, vérifier les politiques RLS dans Supabase

### Performance
- Export global peut être lent si beaucoup de données
- Pas de limite implémentée actuellement
- Si nécessaire, ajouter pagination/filtrage par date

---

## 📝 Notes pour développements futurs

### Phase 2 - Intégration Multi-vues (À finaliser)

**Objectif :** Permettre aux utilisateurs de voir :
- **Employee** : Ses données personnelles uniquement
- **Manager** : Ses données OU données de son équipe (anonymisées)
- **Admin** : Ses données OU équipe spécifique OU tous utilisateurs (anonymisé)

**Infrastructure prête :**
- ✅ Service `dataAggregationService` : Méthodes de récupération par niveau
- ✅ Composant `ViewSelector` : Dropdown avec options selon rôle
- ✅ Traductions FR/EN complètes

**Reste à faire :**
1. Intégrer `ViewSelector` dans `DashboardEmployee.tsx` (ligne ~216)
2. Intégrer `ViewSelector` dans `DashboardManager.tsx`
3. Adapter logique `useEffect` pour charger données selon vue sélectionnée
4. Désactiver conseils AI quand vue != 'personal'
5. Tester les 3 rôles (Employee, Manager, Admin)

**Code type d'intégration :**
```typescript
import ViewSelector from '../components/ViewSelector';
import { dataAggregationService, type ViewType } from '../services/dataAggregationService';

// Dans le composant
const [currentView, setCurrentView] = useState<ViewType>('personal');
const [userProfile, setUserProfile] = useState<any>(null);

// Charger profil utilisateur
useEffect(() => {
  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('profiles')
      .select('*, teams(name)')
      .eq('id', user.id)
      .single();
    setUserProfile(data);
  };
  loadProfile();
}, []);

// Adapter chargement données
useEffect(() => {
  const loadData = async () => {
    let entries = [];
    if (currentView === 'personal') {
      entries = await dataAggregationService.getPersonalData(userProfile.id);
    } else if (currentView === 'team') {
      entries = await dataAggregationService.getTeamData(userProfile.team);
    } else if (currentView === 'all') {
      entries = await dataAggregationService.getAllData();
    }

    // Calculer analytics
    const analytics = calculateAnalyticsForPeriod(entries, dateRange);
    setAnalytics(analytics);

    // NE générer conseils QUE si vue personnelle
    if (currentView === 'personal') {
      const advice = await generateAdvicePair(entries, analytics);
      setAdvicePair(advice);
    } else {
      setAdvicePair(null); // Pas de conseils pour vues agrégées
    }
  };
  loadData();
}, [currentView, selectedPeriod, customDateRange]);

// Dans le JSX (après DataIntegrityAlert)
{userProfile && (
  <ViewSelector
    userRole={userProfile.role}
    currentView={currentView}
    onViewChange={setCurrentView}
    availableTeams={teams}
    selectedTeamId={selectedTeamId}
    onTeamChange={setSelectedTeamId}
  />
)}
```

---

## 🐛 Problèmes connus

### Avertissement Build (Non bloquant)
```
/src/services/supabase.ts is dynamically imported... but also statically imported
```
**Impact** : Aucun, le build fonctionne correctement
**Raison** : Import dynamique dans Header.tsx pour l'export CSV
**Action** : Aucune, comportement normal de Vite

---

## 📞 Support

En cas de problème :
1. Vérifier la console navigateur (F12)
2. Vérifier les logs Vercel (vercel.com → projet → logs)
3. Vérifier Supabase Dashboard (Auth + Database)
4. Consulter `docs/guides/TROUBLESHOOTING.md`

---

**Date :** 16/10/2025
**Version :** Phase 1 complète + Infrastructure Phase 2
**Build :** ✅ Réussi (35.16s)
**Status :** Prêt pour tests et déploiement
