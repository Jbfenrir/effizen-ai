# 📝 Liste complète des textes français à traduire

## 🏠 DashboardEmployee.tsx

### Section Bien-être
- ❌ `"🌱 Bien-être"` → Ligne 177
- ❌ `"Score de bien-être"` → Ligne 189
- ❌ `"Sommeil"` → Ligne 201
- ❌ `"Énergie"` → Ligne 213
- ❌ `"Équilibre"` → Ligne 225

### Graphiques Bien-être
- ❌ `"Profil Bien-être"` → Ligne 239
- ❌ `"Score"` (dans Radar) → Ligne 249
- ❌ `"Évolution Bien-être"` → Ligne 267
- ❌ `"Sommeil"` (dans Line) → Ligne 279
- ❌ `"Énergie"` (dans Line) → Ligne 280
- ❌ `"Pauses"` (dans Line) → Ligne 281

### Section Optimisation
- ❌ `"🎯 Optimisation du temps travaillé"` → Ligne 299
- ❌ `"Analyse dans quelle mesure vous consacrez votre temps et votre énergie aux tâches les plus importantes de votre poste."` → Ligne 300
- ❌ `"Score d'Optimisation"` → Ligne 310
- ❌ `"🎆 Excellente optimisation"` → Ligne 315
- ❌ `"👍 Bonne optimisation"` → Ligne 316
- ❌ `"⚠️ Optimisation insuffisante"` → Ligne 317
- ❌ `"🚨 Dispersion critique"` → Ligne 318
- ❌ `"Répartition du temps des tâches"` → Ligne 332
- ❌ `"Évolution de l'optimisation du temps"` → Ligne 379
- ❌ `"Optimisation"` (dans Line) → Ligne 391

### Section Conseils
- ❌ `"🎯 Diagnostic Expert"` → Ligne 413
- ❌ `"💡 Conseils Pratiques"` → Ligne 420

## 🔧 WellbeingForm.tsx

### Labels de qualité (Résumés)
- ❌ `"Excellent !"` → Ligne 211
- ❌ `"Bien"` → Ligne 212
- ❌ `"Correct"` → Ligne 213
- ❌ `"À améliorer"` → Ligne 213
- ❌ `"Très actif"` → Ligne 229
- ❌ `"Actif"` → Ligne 230
- ❌ `"Peu actif"` → Ligne 231
- ❌ `"Inactif"` → Ligne 231
- ❌ `"Connecté"` → Ligne 246
- ❌ `"Isolé"` → Ligne 246

## 📊 dataAnalytics.ts (Catégories de tâches)

### Catégories affichées dans le graphique (Légende)
- ❌ `"Réunions"` → Lignes 181-186
- ❌ `"Formation"` → Lignes 192-199
- ❌ `"Développement"` → Lignes 201-203
- ❌ `"Communication"` → Lignes 211-214
- ❌ `"Networking"` → Lignes 219-222
- ❌ `"Marketing"` → Lignes 225-227
- ❌ `"Partenariat"` → Lignes 229-233
- ❌ `"Transport"` → Lignes 236-238
- ❌ `"Stratégie"` → Lignes 242-244
- ❌ `"App"` → Lignes 247-249

## 📋 Résumé par priorité

### 🔥 URGENT (Visible dans l'interface)
1. Dashboard Employee - Titres de sections (Bien-être, Optimisation)
2. Dashboard Employee - Labels des graphiques
3. WellbeingForm - Labels de qualité (Excellent, Bien, Actif, etc.)

### 📌 IMPORTANT (Légendes des graphiques)
4. dataAnalytics.ts - Catégories de tâches

## ✅ Plan d'action

1. Ajouter clés dashboard.employee dans en.json et fr.json
2. Modifier DashboardEmployee.tsx pour utiliser t()
3. Ajouter clés wellbeing.quality dans en.json et fr.json
4. Modifier WellbeingForm.tsx pour utiliser t()
5. Créer système de traduction pour catégories de tâches