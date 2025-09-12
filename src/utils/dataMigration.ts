/**
 * Script de migration des données localStorage vers Supabase
 * À exécuter dans le navigateur pour récupérer les données historiques
 */

import { supabase } from '../services/supabase';
import type { DailyEntry } from '../types';

export class DataMigration {
  
  /**
   * Récupère toutes les entrées depuis localStorage
   */
  static getLocalStorageEntries(): DailyEntry[] {
    const entries: DailyEntry[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('entry-')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.entry_date) {
            // Ajouter un ID temporaire et user_id si manquant
            if (!entry.id) entry.id = crypto.randomUUID();
            entries.push(entry);
          }
        } catch (error) {
          console.warn('Erreur parsing entrée:', key, error);
        }
      }
    });

    // Trier par date
    return entries.sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
  }

  /**
   * Migre les données localStorage vers Supabase
   */
  static async migrateToSupabase(): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      migrated: 0,
      errors: [] as string[]
    };

    try {
      // Vérifier l'authentification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        result.errors.push('Utilisateur non connecté');
        return result;
      }

      console.log('🔄 Utilisateur connecté:', user.email);
      console.log('🔄 User ID:', user.id);

      // Récupérer les entrées localStorage
      const localEntries = this.getLocalStorageEntries();
      console.log(`📊 ${localEntries.length} entrées trouvées dans localStorage`);

      if (localEntries.length === 0) {
        result.errors.push('Aucune donnée dans localStorage');
        return result;
      }

      // Vérifier les données existantes dans Supabase pour éviter les doublons
      const { data: existingEntries, error: fetchError } = await supabase
        .from('daily_entries')
        .select('entry_date')
        .eq('user_id', user.id);

      if (fetchError) {
        result.errors.push(`Erreur lecture Supabase: ${fetchError.message}`);
        return result;
      }

      const existingDates = new Set(
        (existingEntries || []).map(e => e.entry_date)
      );

      console.log(`📊 ${existingDates.size} entrées déjà présentes dans Supabase`);

      // Filtrer les nouvelles entrées
      const newEntries = localEntries.filter(entry => 
        !existingDates.has(entry.entry_date)
      );

      console.log(`📊 ${newEntries.length} nouvelles entrées à migrer`);

      if (newEntries.length === 0) {
        result.success = true;
        result.errors.push('Toutes les données sont déjà migrées');
        return result;
      }

      // Préparer les données pour Supabase
      const supabaseEntries = newEntries.map(entry => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        entry_date: entry.entry_date,
        sleep: entry.sleep || null,
        focus: entry.focus || null,
        tasks: entry.tasks || [],
        wellbeing: entry.wellbeing || null,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Migration par lots de 10 pour éviter les timeouts
      const batchSize = 10;
      let migrated = 0;

      for (let i = 0; i < supabaseEntries.length; i += batchSize) {
        const batch = supabaseEntries.slice(i, i + batchSize);
        
        console.log(`🔄 Migration lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(supabaseEntries.length/batchSize)}: ${batch.length} entrées`);

        const { data, error } = await supabase
          .from('daily_entries')
          .insert(batch);

        if (error) {
          result.errors.push(`Erreur lot ${Math.floor(i/batchSize) + 1}: ${error.message}`);
          console.error('Erreur migration batch:', error);
        } else {
          migrated += batch.length;
          console.log(`✅ Lot ${Math.floor(i/batchSize) + 1} migré avec succès`);
        }

        // Pause entre les lots
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      result.migrated = migrated;
      result.success = migrated > 0;

      if (result.success) {
        console.log(`🎉 Migration terminée: ${migrated} entrées migrées vers Supabase`);
      }

    } catch (error) {
      console.error('Erreur migration:', error);
      result.errors.push(`Erreur générale: ${error}`);
    }

    return result;
  }

  /**
   * Affiche un rapport des données localStorage
   */
  static generateReport(): void {
    const entries = this.getLocalStorageEntries();
    
    console.log('📊 RAPPORT DONNÉES LOCALSTORAGE');
    console.log('================================');
    console.log(`Total entrées: ${entries.length}`);
    
    if (entries.length > 0) {
      const dates = entries.map(e => e.entry_date).sort();
      console.log(`Première entrée: ${dates[0]}`);
      console.log(`Dernière entrée: ${dates[dates.length - 1]}`);
      
      console.log('\n📅 Entrées par mois:');
      const byMonth = entries.reduce((acc, entry) => {
        const month = entry.entry_date.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, count]) => {
          console.log(`  ${month}: ${count} entrées`);
        });

      console.log('\n📋 Structure d\'une entrée exemple:');
      console.log(JSON.stringify(entries[0], null, 2));
    }
  }

  /**
   * Test de connexion Supabase
   */
  static async testSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.error('❌ Test connexion échoué:', error);
        return false;
      }
      
      console.log('✅ Connexion Supabase OK');
      return true;
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      return false;
    }
  }
}

// Exposer globalement pour utilisation dans la console
(window as any).DataMigration = DataMigration;

export default DataMigration;