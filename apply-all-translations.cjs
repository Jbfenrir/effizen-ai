#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Application de toutes les traductions...\n');

// Remplacement dans DashboardEmployee.tsx
const dashboardPath = path.join(__dirname, 'src/pages/DashboardEmployee.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const dashboardReplacements = [
  { from: '🌱 Bien-être', to: `{t('dashboard.employee.wellbeingSection')}` },
  { from: 'Score de bien-être', to: `{t('dashboard.employee.wellbeingScoreLabel')}` },
  { from: '>Sommeil<', to: `>{t('dashboard.employee.sleep')}<` },
  { from: '>Énergie<', to: `>{t('dashboard.employee.energy')}<` },
  { from: '>Équilibre<', to: `>{t('dashboard.employee.balance')}<` },
  { from: '>Profil Bien-être<', to: `>{t('dashboard.employee.wellbeingProfile')}<` },
  { from: 'name="Score"', to: `name={t('dashboard.employee.score')}` },
  { from: '>Évolution Bien-être<', to: `>{t('dashboard.employee.wellbeingEvolution')}<` },
  { from: 'dataKey="Sommeil"', to: `dataKey={t('dashboard.employee.sleepLine')}` },
  { from: 'dataKey="Énergie"', to: `dataKey={t('dashboard.employee.energyLine')}` },
  { from: 'dataKey="Pauses"', to: `dataKey={t('dashboard.employee.pausesLine')}` },
  { from: '🎯 Optimisation du temps travaillé', to: `{t('dashboard.employee.optimizationSection')}` },
  { from: 'Analyse dans quelle mesure vous consacrez votre temps et votre énergie aux tâches les plus importantes de votre poste.', to: `{t('dashboard.employee.optimizationDescription')}` },
  { from: '>Score d\'Optimisation<', to: `>{t('dashboard.employee.optimizationScore')}<` },
  { from: '🎆 Excellente optimisation', to: `{t('dashboard.employee.excellentOptimization')}` },
  { from: '👍 Bonne optimisation', to: `{t('dashboard.employee.goodOptimization')}` },
  { from: '⚠️ Optimisation insuffisante', to: `{t('dashboard.employee.insufficientOptimization')}` },
  { from: '🚨 Dispersion critique', to: `{t('dashboard.employee.criticalDispersion')}` },
  { from: '>Répartition du temps des tâches<', to: `>{t('dashboard.employee.taskDistribution')}<` },
  { from: '>Évolution de l\'optimisation du temps<', to: `>{t('dashboard.employee.optimizationEvolution')}<` },
  { from: 'dataKey="Optimisation"', to: `dataKey={t('dashboard.employee.optimizationLine')}` },
  { from: '🎯 Diagnostic Expert', to: `{t('dashboard.employee.expertDiagnosis')}` },
  { from: '💡 Conseils Pratiques', to: `{t('dashboard.employee.practicalAdvice')}` }
];

dashboardReplacements.forEach(({ from, to }) => {
  const before = dashboardContent;
  dashboardContent = dashboardContent.replace(from, to);
  if (before !== dashboardContent) {
    console.log(`✅ Remplacé: "${from.substring(0, 40)}..."`);
  }
});

fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
console.log('\n✅ DashboardEmployee.tsx mis à jour\n');

// Remplacement dans WellbeingForm.tsx
const wellbeingPath = path.join(__dirname, 'src/components/WellbeingForm.tsx');
let wellbeingContent = fs.readFileSync(wellbeingPath, 'utf8');

const wellbeingReplacements = [
  { from: '\'Excellent !\'', to: `t('wellbeing.quality.excellent')` },
  { from: '\'Bien\'', to: `t('wellbeing.quality.good')` },
  { from: '\'Correct\'', to: `t('wellbeing.quality.fair')` },
  { from: '\'À améliorer\'', to: `t('wellbeing.quality.toImprove')` },
  { from: '\'Très actif\'', to: `t('wellbeing.quality.veryActive')` },
  { from: '\'Actif\'', to: `t('wellbeing.quality.active')` },
  { from: '\'Peu actif\'', to: `t('wellbeing.quality.lessActive')` },
  { from: '\'Inactif\'', to: `t('wellbeing.quality.inactive')` },
  { from: '\'Connecté\'', to: `t('wellbeing.quality.connected')` },
  { from: '\'Isolé\'', to: `t('wellbeing.quality.isolated')` }
];

wellbeingReplacements.forEach(({ from, to }) => {
  const before = wellbeingContent;
  wellbeingContent = wellbeingContent.replace(new RegExp(from, 'g'), to);
  if (before !== wellbeingContent) {
    console.log(`✅ Remplacé: ${from}`);
  }
});

fs.writeFileSync(wellbeingPath, wellbeingContent, 'utf8');
console.log('\n✅ WellbeingForm.tsx mis à jour\n');

console.log('🎉 Toutes les traductions ont été appliquées !');
console.log('📝 Pensez à vérifier le serveur localhost:3001');