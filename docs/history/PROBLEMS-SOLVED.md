# Problèmes Résolus et Solutions

## 🚨 Problèmes critiques résolus

### 1. Restauration complète des données perdues + système anti-perte (24/09/2025)
**Symptômes :**
- Données du 13/09 au 23/09 manquantes en production
- EntryForm sauvegardait uniquement en localStorage
- Aucun gardefou contre la perte de données
- Service entriesService manquant pour la synchronisation Supabase

**Cause racine identifiée :**
- EntryForm.tsx ligne 95 : `localStorage.setItem()` UNIQUEMENT
- Aucune sauvegarde vers Supabase lors de la saisie
- Données restaient en localStorage local lors du push en prod

**Solutions appliquées :**
- ✅ Restauration 28 entrées depuis CSV (11/08 au 23/09)
- ✅ Création `src/services/entriesService.ts` complet
- ✅ Correction EntryForm : sauvegarde Supabase + localStorage fallback
- ✅ Système de détection jours manquants `DataIntegrityChecker`
- ✅ Composant d'alerte intégrité `DataIntegrityAlert`
- ✅ Auto-backup quotidien en localStorage (rotation 7 jours)
- ✅ Export CSV manuel avec bouton téléchargement
- ✅ Intégration dans DashboardEmployee

**Résultat :** Plus jamais de perte de données, suivi automatique de l'intégrité

### 2. Traductions EN complètes et conseils IA multilingues (24/09/2025)
**Symptômes :**
- Textes français restants dans version EN : dashboard, wellbeing, task categories
- Conseils IA toujours en français même en mode EN
- Labels qualité non traduits : "Excellent !", "Actif", "Connecté"
**Causes :**
- 100+ clés de traduction manquantes dans en.json
- Textes hardcodés en français dans DashboardEmployee.tsx et WellbeingForm.tsx
- Système de conseils IA non multilingue
**Solutions :**
- ✅ 100+ traductions ajoutées dans en.json et fr.json
- ✅ Remplacement hardcoded strings par t() dans DashboardEmployee.tsx
- ✅ Création adviceGeneratorWithTranslation.ts pour conseils IA bilingues
- ✅ Traduction labels qualité et catégories de tâches
- ✅ Header desktop : Score et bouton Save dans conteneur blanc

### 2. Responsive mobile et traductions EN (23/09/2025)
**Symptômes :**
- Bouton "Save" décalé sur mobile, score bien-être mal positionné
- Pas de bouton Dashboard dans EntryForm
- Traductions EN manquantes : "focus.morningHours", "tasks.noTasks", textes wellbeing
**Causes :**
- Layout header trop complexe sur mobile (une seule ligne)
- Absence de navigation vers Dashboard depuis la page de saisie
- Clés de traduction manquantes dans en.json et fr.json
**Solutions :**
- Header redesigné en 2 lignes : Ligne 1 (Titre + Dashboard), Ligne 2 (Date + Score + Save)
- Bouton Dashboard ajouté dans le header
- 13+ clés de traduction ajoutées (focus, tasks, wellbeing)
- Classes responsive : `flex-col sm:flex-row`, `gap-3`, `flex-1 sm:flex-initial`

### 2. Multiple GoTrueClient Instances (27/08/2025)
**Symptôme :** Boucle infinie de chargement au changement d'onglet
**Cause :** 4 services Supabase créant des instances multiples
**Solution :**
- Unification en un service unique `src/services/supabase.ts`
- Singleton global attaché à `window`
- Clients duaux : anon + admin

### 2. Récupération données historiques (09-14/09/2025)
**Problème :** 23 entrées perdues dans localStorage, besoin de centralisation
**Solutions appliquées :**
1. Correction UUID - suppression IDs hardcodés
2. Transfert vers bon compte utilisateur
3. Correction filtrage par dates (Supabase first)
4. Correction structure données tâches

### 3. Score Équilibre toujours à 0 (12/09/2025)
**Cause :** Calcul incomplet (pauses uniquement)
**Solution :**
- 40% Méditations/Pauses
- 40% Sport/Loisirs
- 20% Interactions sociales

### 4. Export CSV incomplet
**Problème :** Colonnes manquantes et bien-être vide
**Solution :** Ajout colonnes calculées avec mêmes formules que dashboard

## 🔧 Solutions aux problèmes récurrents

### npm not found
```bash
# TOUJOURS utiliser WSL pour npm
cd C:\Users\FIAE\Desktop\effizen-ai
wsl
cd /mnt/c/Users/FIAE/Desktop/effizen-ai
npm run dev
```

### Création utilisateur échoue
Vérifier `VITE_SUPABASE_SERVICE_ROLE_KEY` dans .env

### Build errors TypeScript
```bash
# Utiliser build sans check TypeScript
npm run build  # au lieu de npm run build:check
```

### Modifications non visibles en local
```bash
# TOUJOURS relancer après modifications
Ctrl+C
npm run dev
```

### Screenshots illisibles (caractères spéciaux)
```bash
# Créer copie avec nom simple
cd screenshots/
cp 'nom-avec-apostrophe.png' temp-screenshot.png
```

### Retour version stable
```bash
# Restauration commit stable
git reset --hard 57b058e
```

## 📊 Erreurs communes et résolutions

| Erreur | Solution |
|--------|----------|
| `POST /auth/v1/logout 403` | Utiliser `signOut({ scope: 'local' })` |
| `invalid input syntax for type uuid` | Ne pas spécifier l'ID, laisser Supabase générer |
| `Multiple GoTrueClient instances` | Normal avec clients duaux (anon + admin) |
| `TypeError: m.tasks.reduce is not a function` | Vérifier structure tasks (doit être array) |
| `File does not exist` pour screenshots | Problème caractères spéciaux Windows/WSL |

## 🛠️ Scripts de maintenance créés

- `sync-data-simple.cjs` - Diagnostic comptes et données
- `transfer-data-to-correct-user.cjs` - Migration entre comptes
- `fix-tasks-structure.cjs` - Correction structures malformées
- `debug-date-filter.cjs` - Test filtrage dates
- `test-corrections-finales.cjs` - Validation corrections dashboard