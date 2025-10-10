# 🔥 INCIDENT : Clés de traductions affichées en brut - 10/10/2025

## 📋 RÉSUMÉ EXÉCUTIF

**Date** : 10 octobre 2025
**Durée** : ~2h (08h17 - 10h03)
**Gravité** : HAUTE - Affectation de l'expérience utilisateur en production
**Impact** : Quasi-totalité des textes affichés en format brut `dashboard.employee.xxx` au lieu des traductions

---

## 🎯 SYMPTÔMES OBSERVÉS

### Problèmes constatés
1. **132 clés de traduction manquantes** sur 265 utilisées dans le code
2. Affichage brut type `dashboard.employee.subtitle` au lieu du texte traduit
3. Erreur `key 'sleep.quality (fr)' returned an object instead of string`
4. Sections entières non traduites : admin, userModal, teamModal, common, auth

### Captures d'écran
- `EffiZen-AI-10-10-2025_08_17_AM.png` : Problème initial massif
- `EffiZen-AI-10-10-2025_09_59_AM.png` : "dashboard employee subtitle"
- `EffiZen-AI-10-10-2025_10_00_AM.png` : Erreur sleep.quality

---

## 🔍 ANALYSE DE LA CAUSE RACINE

### 1. Cause principale : AJOUTS INCRÉMENTAUX NON SYNCHRONISÉS

#### Chronologie reconstruction
```
26/09/2025 : Dernier commit traductions "🌐 FIX: Dernières traductions hard-codées"
  ↓
Période 26/09 - 10/10 : Ajouts de fonctionnalités SANS mise à jour i18n
  ↓
10/10/2025 08h17 : Détection massive du problème
```

#### Preuve technique
```bash
# Structure initiale (jusqu'à 26/09)
src/i18n/
  ├── fr.json          # Fichier racine
  └── en.json          # Fichier racine

# Structure actuelle modifiée
src/i18n/
  ├── locales/
  │   ├── fr.json      # Nouveau chemin
  │   └── en.json      # Nouveau chemin
  ├── fr.json.old      # Anciens fichiers
  └── en.json.old
```

**Problème** : Le déplacement des fichiers de `src/i18n/*.json` vers `src/i18n/locales/*.json` a été fait, MAIS les nouvelles clés ajoutées au code n'ont pas été synchronisées dans les fichiers de traduction.

### 2. Causes contributives

#### A. Absence de validation automatique
- ❌ Aucun test vérifiant que toutes les clés `t('...')` existent dans les JSON
- ❌ Aucun hook pre-commit pour valider les traductions
- ❌ Pas de CI/CD vérifiant l'intégrité i18n

#### B. Processus manuel non documenté
- ❌ Pas de checklist pour ajout de fonctionnalité
- ❌ Process "Ajouter fonctionnalité → Ajouter clés i18n" non formalisé
- ❌ Pas de revue systématique des clés de traduction

#### C. Structure fragmentée
- Duplication de clé `subtitle` (lignes 197 et 213) non détectée
- Conflits string/object (`sleep.quality`) non validés
- Fichiers backup/incomplete créant de la confusion

### 3. Facteur aggravant : Développement contexte limité

Lors du développement de nouvelles fonctionnalités (Dashboard Admin, modals User/Team), les clés de traduction ont été ajoutées au code TypeScript mais **pas synchronisées** dans fr.json/en.json.

**Exemple** :
```tsx
// Code ajouté dans AdminDashboard.tsx
<h1>{t('dashboard.admin.title')}</h1>

// Mais fr.json ne contenait PAS la clé dashboard.admin.title
```

---

## ✅ SOLUTION APPLIQUÉE

### Étapes de résolution

#### 1. Analyse systématique (08h17 - 09h00)
```bash
# Extraction de toutes les clés utilisées
grep -r "t(['\"]" src/ --include="*.tsx" --include="*.ts" | \
  grep -o "t(['\"][^'\"]*['\"])" | \
  sed "s/t(['\"]//; s/['\"])//g" | \
  sort -u > /tmp/all_translation_keys.txt

# Résultat : 265 clés utilisées
```

#### 2. Identification des manquantes (09h00 - 09h20)
Script Node.js pour comparer :
```javascript
const keys = fs.readFileSync('/tmp/clean_translation_keys.txt', 'utf8')
  .split('\n').filter(Boolean);
const frJson = JSON.parse(fs.readFileSync('src/i18n/locales/fr.json', 'utf8'));

const missing = keys.filter(key => !hasKey(frJson, key));
// Résultat : 132 clés manquantes
```

#### 3. Ajout systématique (09h20 - 09h45)
Ajout de TOUTES les sections manquantes :
- ✅ `common` (7 clés)
- ✅ `auth` (6 clés)
- ✅ `dashboard.admin` (60+ clés)
- ✅ `dashboard.admin.passwordReset` (10 clés)
- ✅ `userModal` (14 clés)
- ✅ `teamModal` (14 clés)
- ✅ Corrections diverses (focus, tasks, sleep, wellbeing)

#### 4. Corrections spécifiques finales (09h45 - 10h03)
- Suppression duplication `dashboard.employee.subtitle` (ligne 213)
- Validation structure `sleep.quality` (string, pas object)
- Validation JSON avec `jsonlint`

---

## 📊 IMPACT

### Utilisateurs affectés
- **Production** : Tous les utilisateurs francophones et anglophones
- **Durée d'exposition** : Indéterminée (entre 26/09 et 10/10)

### Données
- ✅ Aucune perte de données
- ✅ Fonctionnalités opérationnelles
- ❌ Expérience utilisateur dégradée (textes incompréhensibles)

---

## 🛡️ PRÉCONISATIONS

### 🔴 URGENTES (À implémenter sous 7 jours)

#### 1. Script de validation pre-commit
```bash
# À créer : .husky/pre-commit
#!/bin/bash

echo "🔍 Vérification des clés i18n..."

# Extraire toutes les clés t('...')
USED_KEYS=$(grep -roh "t(['\"][^'\"]*['\"])" src/ | \
  sed "s/t(['\"]//; s/['\"])//g" | sort -u)

# Vérifier chaque clé existe dans fr.json ET en.json
node scripts/validate-i18n.js

if [ $? -ne 0 ]; then
  echo "❌ Certaines clés de traduction sont manquantes !"
  echo "Ajoutez-les dans src/i18n/locales/fr.json et en.json"
  exit 1
fi

echo "✅ Toutes les clés i18n sont présentes"
```

#### 2. Script Node.js de validation
```javascript
// scripts/validate-i18n.js
const fs = require('fs');
const path = require('path');

function getAllTranslationKeys(dir) {
  // Extraire récursivement toutes les clés t('...') du code
}

function validateKeys(keys, fr, en) {
  const missingFr = keys.filter(k => !hasKey(fr, k));
  const missingEn = keys.filter(k => !hasKey(en, k));

  if (missingFr.length || missingEn.length) {
    console.error('❌ Clés manquantes:');
    console.error('FR:', missingFr);
    console.error('EN:', missingEn);
    process.exit(1);
  }
}

// Run validation
const keys = getAllTranslationKeys('./src');
const fr = require('../src/i18n/locales/fr.json');
const en = require('../src/i18n/locales/en.json');
validateKeys(keys, fr, en);
```

#### 3. Test automatisé Jest
```typescript
// __tests__/i18n.test.ts
describe('i18n completeness', () => {
  it('should have all keys used in code defined in fr.json', () => {
    const usedKeys = extractAllKeys('./src');
    const frKeys = Object.keys(frTranslations);

    usedKeys.forEach(key => {
      expect(hasKey(frTranslations, key)).toBe(true);
    });
  });

  it('should have fr.json and en.json synchronized', () => {
    const frKeys = flattenKeys(frTranslations);
    const enKeys = flattenKeys(enTranslations);

    expect(frKeys.sort()).toEqual(enKeys.sort());
  });
});
```

### 🟡 IMPORTANTES (À implémenter sous 30 jours)

#### 4. Documentation process développement
Créer `docs/guides/ADDING-FEATURES.md` :
```markdown
# Checklist : Ajout d'une nouvelle fonctionnalité

## Étape 1 : Développement
- [ ] Coder la fonctionnalité
- [ ] Utiliser UNIQUEMENT `t('...')` pour les textes

## Étape 2 : Traductions (OBLIGATOIRE)
- [ ] Lister toutes les nouvelles clés `t('...')`
- [ ] Ajouter les clés dans `src/i18n/locales/fr.json`
- [ ] Ajouter les clés dans `src/i18n/locales/en.json`
- [ ] Vérifier aucune duplication de clé
- [ ] Valider JSON : `npx jsonlint src/i18n/locales/*.json`

## Étape 3 : Test
- [ ] Tester en FR
- [ ] Tester en EN
- [ ] Vérifier aucun texte brut affiché

## Étape 4 : Commit
- [ ] Script pre-commit passe ✅
- [ ] Commit : `git commit -m "✨ FEAT: [description]"`
```

#### 5. CI/CD Github Actions
```yaml
# .github/workflows/validate-i18n.yml
name: Validate i18n

on: [push, pull_request]

jobs:
  i18n-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Validate translations
        run: npm run validate:i18n
```

#### 6. Outil CLI pour développeurs
```bash
# npm run i18n:check
# Affiche un rapport détaillé :
# - Clés utilisées non définies
# - Clés définies non utilisées
# - Différences FR/EN
# - Duplications
```

### 🟢 SOUHAITABLES (Amélioration continue)

#### 7. Migration vers solution managée
Évaluer des outils comme :
- **Lokalise** : Gestion traductions en ligne
- **i18next-scanner** : Extraction automatique des clés
- **TypeScript i18n** : Typage fort des clés

#### 8. Monitoring production
- Alertes Sentry pour clés manquantes
- Logs serveur si `t('key')` retourne 'key'
- Dashboard métriques couverture i18n

---

## 📈 MÉTRIQUES

### Avant correction
- Clés utilisées : 265
- Clés définies : 133
- **Couverture : 50.2%** ❌

### Après correction
- Clés utilisées : 265
- Clés définies : 265
- **Couverture : 100%** ✅

---

## 📚 RÉFÉRENCES

### Fichiers modifiés
- `src/i18n/locales/fr.json` (+131 clés)
- `src/i18n/locales/en.json` (+131 clés)

### Commits liés
- `6e61596` : Dernier commit avant incident
- À créer : Commit correction + préconisations

### Documentation
- `docs/guides/COMPORTEMENT.md` : Protocole Claude
- `docs/architecture/STACK.md` : Stack technique
- Ce document : Post-mortem incident

---

## ✅ VALIDATION

- [x] Problème identifié et analysé
- [x] Solution appliquée et testée
- [x] Préconisations documentées
- [ ] Préconisations urgentes implémentées (7 jours)
- [ ] Préconisations importantes implémentées (30 jours)

---

**Rédigé par** : Claude Code (Assistant IA)
**Validé par** : Jean-Baptiste Gerberon
**Date** : 10 octobre 2025
