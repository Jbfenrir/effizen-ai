import { supabase } from '../services/supabase';
import { getAllEntries } from './dataAnalytics';
import type { DailyEntry } from '../types';

/**
 * Système de vérification de l'intégrité des données
 * Détecte les jours manquants et les problèmes de saisie
 */

interface IntegrityReport {
  totalDays: number;
  missingDays: string[];
  weekendsMissing: string[];
  recentMissing: string[];
  lastEntry: string | null;
  daysSinceLastEntry: number;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    date?: string;
  }>;
}

export class DataIntegrityChecker {
  /**
   * Vérifie si une date est un jour ouvrable (lundi-vendredi)
   */
  static isWeekday(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Lundi = 1, Vendredi = 5
  }

  /**
   * Génère toutes les dates entre deux dates
   */
  static getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Formate une date en YYYY-MM-DD
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Analyse complète de l'intégrité des données
   */
  static async checkDataIntegrity(userId?: string): Promise<IntegrityReport> {
    try {
      // Récupérer toutes les entrées
      const entries = await getAllEntries();
      console.log('🔍 Vérification intégrité:', entries.length, 'entrées trouvées');

      if (entries.length === 0) {
        return {
          totalDays: 0,
          missingDays: [],
          weekendsMissing: [],
          recentMissing: [],
          lastEntry: null,
          daysSinceLastEntry: 0,
          recommendations: ['Aucune donnée trouvée. Commencez par saisir vos premières données.'],
          alerts: [{
            type: 'warning',
            message: 'Aucune donnée trouvée dans la base.'
          }]
        };
      }

      // Trier les entrées par date
      const sortedEntries = entries.sort((a, b) => a.entry_date.localeCompare(b.entry_date));
      const firstEntry = sortedEntries[0];
      const lastEntry = sortedEntries[sortedEntries.length - 1];

      const firstDate = new Date(firstEntry.entry_date);
      const lastDate = new Date(lastEntry.entry_date);
      const today = new Date();

      // Générer toutes les dates de la période
      const allDates = this.getDatesBetween(firstDate, today);
      const weekdayDates = allDates.filter(date => this.isWeekday(date));

      // Créer un set des dates avec données
      const entryDates = new Set(entries.map(entry => entry.entry_date));

      // Identifier les jours manquants
      const missingWeekdays = weekdayDates
        .filter(date => !entryDates.has(this.formatDate(date)))
        .map(date => this.formatDate(date));

      // Jours manquants récents (7 derniers jours ouvrés)
      const recentWeekdays = weekdayDates
        .slice(-7)
        .map(date => this.formatDate(date));
      const recentMissing = recentWeekdays
        .filter(date => !entryDates.has(date));

      // Weekends manqués (au cas où l'utilisateur saisirait aussi les WE)
      const allWeekends = allDates
        .filter(date => !this.isWeekday(date))
        .map(date => this.formatDate(date));
      const weekendsMissing = allWeekends
        .filter(date => !entryDates.has(date));

      // Nombre de jours depuis dernière saisie
      const daysSinceLastEntry = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Générer recommandations
      const recommendations: string[] = [];
      const alerts: IntegrityReport['alerts'] = [];

      if (missingWeekdays.length > 0) {
        recommendations.push(`Compléter ${missingWeekdays.length} jour(s) ouvré(s) manquant(s)`);

        if (missingWeekdays.length > 10) {
          alerts.push({
            type: 'error',
            message: `${missingWeekdays.length} jours ouvrés manquants détectés`
          });
        } else if (missingWeekdays.length > 5) {
          alerts.push({
            type: 'warning',
            message: `${missingWeekdays.length} jours ouvrés manquants`
          });
        }
      }

      if (recentMissing.length > 0) {
        recommendations.push(`Saisir les données des ${recentMissing.length} jour(s) récent(s)`);
        alerts.push({
          type: 'warning',
          message: `${recentMissing.length} jour(s) récent(s) non saisi(s)`,
          date: recentMissing[0]
        });
      }

      if (daysSinceLastEntry > 3) {
        recommendations.push('Reprendre la saisie quotidienne');
        alerts.push({
          type: 'error',
          message: `Aucune saisie depuis ${daysSinceLastEntry} jour(s)`
        });
      } else if (daysSinceLastEntry > 1) {
        alerts.push({
          type: 'warning',
          message: `Dernière saisie il y a ${daysSinceLastEntry} jour(s)`
        });
      }

      if (recommendations.length === 0) {
        recommendations.push('Données complètes ! Continuez la saisie régulière.');
        alerts.push({
          type: 'info',
          message: 'Toutes les données sont à jour'
        });
      }

      return {
        totalDays: entries.length,
        missingDays: missingWeekdays,
        weekendsMissing,
        recentMissing,
        lastEntry: lastEntry.entry_date,
        daysSinceLastEntry,
        recommendations,
        alerts
      };

    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      return {
        totalDays: 0,
        missingDays: [],
        weekendsMissing: [],
        recentMissing: [],
        lastEntry: null,
        daysSinceLastEntry: 0,
        recommendations: ['Erreur lors de la vérification'],
        alerts: [{
          type: 'error',
          message: 'Impossible de vérifier l\'intégrité des données'
        }]
      };
    }
  }

  /**
   * Export CSV de sauvegarde automatique
   */
  static async generateBackupCSV(): Promise<string> {
    try {
      const entries = await getAllEntries();

      if (entries.length === 0) {
        return 'Date;Sommeil (h);Fatigue;Tâches;Bien-être\n';
      }

      // Header
      let csv = 'Date;Sommeil (h);Fatigue;Tâches;Bien-être\n';

      // Trier par date décroissante
      const sortedEntries = entries.sort((a, b) => b.entry_date.localeCompare(a.entry_date));

      // Convertir chaque entrée
      for (const entry of sortedEntries) {
        const date = entry.entry_date.split('-').reverse().join('/'); // YYYY-MM-DD → DD/MM/YYYY
        const sleepHours = entry.sleep.duration || 0;
        const fatigue = entry.focus.fatigue || 3;

        // Formatter les tâches: "nom (durée) | nom2 (durée)"
        const tasks = entry.tasks
          .map(task => `${task.name} (${task.duration}h)`)
          .join(' | ');

        const wellbeing = Math.round((entry.wellbeing.energy || 50) / 20); // 0-100 → 1-5

        csv += `${date};${sleepHours};${fatigue};${tasks};${wellbeing}\n`;
      }

      return csv;
    } catch (error) {
      console.error('❌ Erreur génération CSV:', error);
      return 'Erreur lors de la génération du CSV\n';
    }
  }

  /**
   * Télécharge automatiquement un backup CSV
   */
  static async downloadBackup(filename?: string): Promise<void> {
    try {
      const csv = await this.generateBackupCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `effizen-backup-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Backup CSV téléchargé');
    } catch (error) {
      console.error('❌ Erreur téléchargement backup:', error);
    }
  }

  /**
   * Sauvegarde automatique quotidienne en localStorage
   */
  static async autoBackup(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastBackup = localStorage.getItem('effizen_last_backup');

      // Si backup déjà fait aujourd'hui, skip
      if (lastBackup === today) {
        console.log('📦 Backup déjà effectué aujourd\'hui');
        return true;
      }

      const csv = await this.generateBackupCSV();

      // Sauvegarder en localStorage avec rotation (garder 7 derniers)
      for (let i = 6; i >= 0; i--) {
        const oldKey = `effizen_backup_${i}`;
        const newKey = `effizen_backup_${i + 1}`;
        const oldData = localStorage.getItem(oldKey);

        if (oldData) {
          if (i === 6) {
            localStorage.removeItem(oldKey); // Supprimer le plus ancien
          } else {
            localStorage.setItem(newKey, oldData);
          }
        }
      }

      // Sauvegarder le nouveau
      localStorage.setItem('effizen_backup_0', JSON.stringify({
        date: today,
        csv: csv,
        entries: (await getAllEntries()).length
      }));

      localStorage.setItem('effizen_last_backup', today);

      console.log('✅ Auto-backup quotidien effectué');
      return true;
    } catch (error) {
      console.error('❌ Erreur auto-backup:', error);
      return false;
    }
  }

  /**
   * Récupère la liste des backups disponibles
   */
  static getAvailableBackups(): Array<{date: string; entries: number; size: string}> {
    const backups = [];

    for (let i = 0; i < 7; i++) {
      const data = localStorage.getItem(`effizen_backup_${i}`);
      if (data) {
        try {
          const backup = JSON.parse(data);
          backups.push({
            date: backup.date,
            entries: backup.entries,
            size: `${Math.round(backup.csv.length / 1024)}KB`
          });
        } catch (error) {
          console.warn(`Backup ${i} corrompu`);
        }
      }
    }

    return backups;
  }
}

// Exposition globale
if (typeof window !== 'undefined') {
  (window as any).DataIntegrityChecker = DataIntegrityChecker;

  // Auto-backup au chargement de la page
  DataIntegrityChecker.autoBackup();
}

export default DataIntegrityChecker;