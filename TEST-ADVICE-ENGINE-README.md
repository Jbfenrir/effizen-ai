# 🧪 GUIDE DE TEST - MOTEUR DE CONSEILS INTELLIGENTS EFFIZEN-AI

## 📋 RÉSUMÉ
Le système de conseils intelligents est maintenant opérationnel et prêt pour les tests. Il analyse les données de bien-être sur 21 jours et génère des conseils personnalisés basés sur 8 règles expertes issues de 4 domaines : psychologie, prévention RPS, ergonomie et médecine douce.

## 🚀 DÉMARRAGE RAPIDE

### 1. Lancer l'application
```bash
# Depuis PowerShell
cd C:\Users\FIAE\Desktop\effizen-ai
wsl
npm run dev
```
Le serveur démarre sur http://localhost:3003 (ou autre port disponible)

### 2. Accéder à l'interface de test
Ouvrir dans votre navigateur : **http://localhost:3003/test-advice**

## 🎯 SCÉNARIOS DE TEST DISPONIBLES

### Test Burnout 🔥
- **Données simulées** : 21 jours avec sommeil insuffisant (5-6h), fatigue élevée, pas de pauses, peu d'interactions sociales
- **Règles attendues** : 
  - Épuisement professionnel avancé
  - Horaires de travail excessifs
  - Insuffisance de sommeil
  - Absence de récupération
- **Niveau de risque attendu** : HIGH ou CRITICAL

### Test Isolation 🏠
- **Données simulées** : 21 jours avec bon sommeil mais AUCUNE interaction sociale
- **Règles attendues** :
  - Isolement social prolongé (sévérité: critique)
- **Niveau de risque attendu** : CRITICAL

### Test Équilibré ✅
- **Données simulées** : 21 jours avec bonnes habitudes (8h sommeil, pauses régulières, sport, interactions sociales)
- **Règles attendues** : Peu ou aucune règle déclenchée
- **Niveau de risque attendu** : LOW

## 📊 COMPRENDRE LES RÉSULTATS

### 1. Niveau de risque global
- **LOW** (vert) : Situation saine
- **MEDIUM** (jaune) : Points d'attention
- **HIGH** (orange) : Intervention recommandée
- **CRITICAL** (rouge) : Action urgente requise

### 2. Patterns détectés
Pour chaque métrique analysée :
- **Métrique** : energy, workHours, sleepDuration, socialInteraction, etc.
- **Tendance** : improving, stable, declining
- **Niveau de préoccupation** : none, low, medium, high

### 3. Règles déclenchées
- **Nom de la règle** : Description claire du problème identifié
- **Confiance** : Pourcentage de certitude (70-100%)
- **Domaine** : psychologie, rps, ergonomie, medecine_douce
- **Sévérité** : info, attention, alerte, critique

### 4. Conseils générés
Chaque conseil comprend :
- **Titre** : Problématique principale
- **Diagnostic** : Explication du problème détecté
- **Actions recommandées** : Liste d'actions pratiques classées par :
  - Catégorie : immediate, daily, weekly, organizational
  - Difficulté : facile, moyen, difficile
  - Durée estimée

## 🔍 RÈGLES EXPERTES IMPLÉMENTÉES

### Psychologie (3 règles)
1. **Épuisement professionnel avancé** - Fatigue ≤2 pendant 7 jours
2. **Isolement social prolongé** - Aucune interaction pendant 21 jours
3. **Manque de sommeil chronique** - <6h pendant 14 jours

### Prévention RPS (2 règles)
4. **Horaires de travail excessifs** - >10h/jour pendant 14 jours
5. **Déséquilibre vie pro/perso** - Travail >8h + sport <1h pendant 7 jours

### Ergonomie (2 règles)
6. **Absence de pauses régulières** - <2 pauses/jour pendant 7 jours
7. **Sédentarité excessive** - <0.5h activité pendant 14 jours

### Médecine douce (1 règle)
8. **Absence de récupération** - Aucune pause + sport <0.5h pendant 7 jours

## 📝 TESTS À EFFECTUER

### Test 1 : Validation des scénarios
1. Cliquer sur "Test Burnout"
   - ✅ Vérifier niveau de risque HIGH/CRITICAL
   - ✅ Vérifier au moins 3-4 règles déclenchées
   - ✅ Vérifier conseils sur sommeil, pauses, charge de travail

2. Cliquer sur "Test Isolation"
   - ✅ Vérifier niveau de risque CRITICAL
   - ✅ Vérifier règle "Isolement social prolongé"
   - ✅ Vérifier conseils sur interactions sociales

3. Cliquer sur "Test Équilibré"
   - ✅ Vérifier niveau de risque LOW
   - ✅ Vérifier peu/pas de règles déclenchées

### Test 2 : Cohérence des conseils
- ✅ Les conseils sont-ils pratiques et réalisables ?
- ✅ Les actions sont-elles bien catégorisées (immédiat/quotidien/hebdomadaire) ?
- ✅ Les difficultés sont-elles réalistes ?
- ✅ Y a-t-il des disclaimers médicaux quand nécessaire ?

### Test 3 : Performance
- ✅ L'analyse se fait-elle rapidement (<2 secondes) ?
- ✅ L'interface reste-t-elle responsive pendant l'analyse ?
- ✅ Les résultats s'affichent-ils correctement ?

## 🐛 PROBLÈMES CONNUS
- L'interface de test n'est accessible qu'en développement (pas en production)
- Les données sont simulées (pas de vraies données utilisateur pour l'instant)
- Maximum 5 conseils affichés pour éviter la surcharge

## 📧 FEEDBACK
Après vos tests, merci de noter :
1. Les règles qui se déclenchent correctement
2. Les conseils qui semblent pertinents
3. Les améliorations souhaitées
4. Les bugs éventuels rencontrés

## 🔄 PROCHAINES ÉTAPES
Une fois les tests validés, 3 options d'évolution :
1. **Enrichir le système de règles** avec plus d'expertise
2. **Développer l'analyse prédictive** avec machine learning
3. **Intégrer dans les dashboards** employee/manager/admin

---
*Dernière mise à jour : 11/09/2025*  
*Version : 1.0 - Système de test initial*  
*Contact : jbgerberon@gmail.com*