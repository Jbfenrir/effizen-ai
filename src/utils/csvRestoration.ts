import { supabase } from '../services/supabase';
import type { DailyEntry, Sleep, Focus, Task, Wellbeing } from '../types';

/**
 * Script de restauration des données depuis CSV exporté
 * Récupère les données perdues entre le 13/09 et le 23/09
 */

interface CSVRow {
  Date: string;
  'Sommeil (h)': string;
  Fatigue: string;
  Tâches: string;
  'Bien-être': string;
}

export class CSVRestoration {
  /**
   * Parse une ligne CSV et convertit en format DailyEntry
   */
  static parseCSVRow(row: CSVRow, userId: string): DailyEntry | null {
    try {
      const entryDate = this.convertDateFormat(row.Date);
      if (!entryDate) return null;

      // Sleep
      const sleepHours = parseFloat(row['Sommeil (h)']) || 0;
      const sleep: Sleep = {
        bedTime: '22:00', // Valeur par défaut
        wakeTime: '07:00', // Valeur par défaut
        duration: sleepHours,
        insomniaDuration: 0,
      };

      // Focus (fatigue)
      const fatigueValue = parseInt(row.Fatigue) || 3;
      const fatigue = Math.min(Math.max(fatigueValue, 1), 5) as 1 | 2 | 3 | 4 | 5;
      const focus: Focus = {
        morningHours: 0,
        afternoonHours: 0,
        drivingHours: 0,
        fatigue: fatigue,
      };

      // Tasks - parser les tâches depuis le format "tâche (durée) | tâche2 (durée)"
      const tasksString = row.Tâches || '';
      const tasks: Task[] = this.parseTasks(tasksString);

      // Wellbeing - valeurs par défaut raisonnables
      const wellbeing: Wellbeing = {
        meditationsPauses: {
          morning: false,
          noon: false,
          afternoon: false,
          evening: false
        },
        sportLeisureHours: 0,
        socialInteraction: false,
        energy: row['Bien-être'] ? parseInt(row['Bien-être']) * 20 : 50, // Convertir 1-5 en 0-100
      };

      const entry: DailyEntry = {
        id: '',
        user_id: userId,
        entry_date: entryDate,
        sleep,
        focus,
        tasks,
        wellbeing,
        created_at: new Date().toISOString(),
      };

      return entry;
    } catch (error) {
      console.error('Erreur parsing ligne CSV:', error, row);
      return null;
    }
  }

  /**
   * Convertit format date DD/MM/YYYY vers YYYY-MM-DD
   */
  static convertDateFormat(dateStr: string): string | null {
    try {
      const [day, month, year] = dateStr.split('/');
      if (!day || !month || !year) return null;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Erreur conversion date:', dateStr);
      return null;
    }
  }

  /**
   * Parse les tâches depuis le format CSV
   * Exemple: "orga (1h) | mails (0.5h) | rdv (1h)"
   */
  static parseTasks(tasksString: string): Task[] {
    if (!tasksString.trim()) return [];

    try {
      return tasksString.split('|').map(taskStr => {
        const trimmed = taskStr.trim();
        const match = trimmed.match(/(.+?)\s*\((.+?)\)/);

        if (match) {
          const [, name, durationStr] = match;
          const duration = parseFloat(durationStr.replace('h', '').replace(',', '.')) || 0;

          return {
            id: crypto.randomUUID(),
            name: name.trim(),
            duration,
            completed: true,
            isHighValue: false,
          };
        } else {
          // Tâche sans durée
          return {
            id: crypto.randomUUID(),
            name: trimmed,
            duration: 0,
            completed: true,
            isHighValue: false,
          };
        }
      }).filter(task => task.name.length > 0);
    } catch (error) {
      console.error('Erreur parsing tâches:', tasksString);
      return [];
    }
  }

  /**
   * Restaure les données depuis un CSV
   */
  static async restoreFromCSV(csvContent: string, userId: string): Promise<{
    success: boolean;
    restored: number;
    errors: string[];
    details: any[];
  }> {
    const errors: string[] = [];
    const details: any[] = [];
    let restored = 0;

    try {
      console.log('🔄 Début restauration CSV pour utilisateur:', userId);

      // Parser le CSV (format simple : lignes séparées par \n, colonnes par ;)
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV vide ou invalide');
      }

      const headers = lines[0].split(';');
      console.log('📋 Headers CSV:', headers);

      // Traiter chaque ligne
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';');
        if (values.length !== headers.length) {
          errors.push(`Ligne ${i + 1}: nombre de colonnes incorrect`);
          continue;
        }

        // Créer l'objet CSV
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Parser vers DailyEntry
        const entry = this.parseCSVRow(rowData, userId);
        if (!entry) {
          errors.push(`Ligne ${i + 1}: impossible de parser l'entrée`);
          continue;
        }

        // Vérifier si l'entrée existe déjà
        const { data: existing } = await supabase
          .from('daily_entries')
          .select('id')
          .eq('user_id', userId)
          .eq('entry_date', entry.entry_date)
          .single();

        if (existing) {
          details.push({
            date: entry.entry_date,
            status: 'skipped',
            reason: 'Entrée existante'
          });
          continue;
        }

        // Insérer l'entrée
        const { error: insertError } = await supabase
          .from('daily_entries')
          .insert({
            user_id: entry.user_id,
            entry_date: entry.entry_date,
            sleep: entry.sleep,
            focus: entry.focus,
            tasks: entry.tasks,
            wellbeing: entry.wellbeing,
          });

        if (insertError) {
          errors.push(`${entry.entry_date}: ${insertError.message}`);
          details.push({
            date: entry.entry_date,
            status: 'error',
            reason: insertError.message
          });
        } else {
          restored++;
          details.push({
            date: entry.entry_date,
            status: 'restored',
            tasks: entry.tasks.length,
            sleepHours: entry.sleep.duration
          });
          console.log(`✅ Restauré: ${entry.entry_date}`);
        }
      }

      console.log(`📊 Restauration terminée: ${restored} entrées restaurées, ${errors.length} erreurs`);

      return {
        success: errors.length === 0 || restored > 0,
        restored,
        errors,
        details
      };

    } catch (error) {
      console.error('❌ Erreur restauration CSV:', error);
      return {
        success: false,
        restored: 0,
        errors: [`Erreur générale: ${(error as Error).message}`],
        details: []
      };
    }
  }

  /**
   * Utilitaire pour charger depuis un fichier CSV et restaurer
   */
  static async restoreFromFile(file: File, userId: string) {
    try {
      const csvContent = await file.text();
      return await this.restoreFromCSV(csvContent, userId);
    } catch (error) {
      console.error('Erreur lecture fichier:', error);
      return {
        success: false,
        restored: 0,
        errors: [`Erreur lecture fichier: ${(error as Error).message}`],
        details: []
      };
    }
  }
}

// Exposition globale pour utilisation en console
if (typeof window !== 'undefined') {
  (window as any).CSVRestoration = CSVRestoration;
}

export default CSVRestoration;