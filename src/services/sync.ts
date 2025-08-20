import Dexie, { Table } from 'dexie';
import { supabase, entriesService } from './supabase-bypass';
import CryptoService from './crypto';
import type { DailyEntry } from '../types';

// Interface pour les entrées locales
interface LocalEntry extends Omit<DailyEntry, 'id' | 'created_at'> {
  id?: string;
  local_id: string;
  synced: boolean;
  created_at?: string;
  updated_at?: string;
}

// Base de données locale avec Dexie
class EffiZenDB extends Dexie {
  entries!: Table<LocalEntry>;

  constructor() {
    super('EffiZenDB');
    this.version(1).stores({
      entries: '++local_id, id, user_id, entry_date, synced, created_at',
    });
  }
}

const db = new EffiZenDB();

export class SyncService {
  private static isOnline = navigator.onLine;
  private static syncQueue: string[] = [];

  /**
   * Initialise le service de synchronisation
   */
  static async init() {
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Synchroniser les données existantes au démarrage
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  /**
   * Sauvegarde une entrée (locale + serveur si en ligne)
   */
  static async saveEntry(entry: Omit<DailyEntry, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const localId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Préparer l'entrée locale
      const localEntry: LocalEntry = {
        ...entry,
        local_id: localId,
        synced: false,
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Sauvegarder localement
      await db.entries.add(localEntry);

      // Si en ligne, synchroniser avec le serveur
      if (this.isOnline) {
        try {
          const encryptedEntry = CryptoService.encryptEntry(entry);
          const { data, error } = await entriesService.createEntry(encryptedEntry);

          if (error) throw error;

          // Mettre à jour l'entrée locale avec l'ID du serveur
          await db.entries.update(localId, {
            id: data.id,
            synced: true,
            updated_at: new Date().toISOString(),
          });

          return { success: true };
        } catch (error) {
          console.error('Erreur de synchronisation:', error);
          // Ajouter à la queue de synchronisation
          this.syncQueue.push(localId);
          return { success: true, error: 'Saved locally, will sync when online' };
        }
      } else {
        // Hors ligne, ajouter à la queue
        this.syncQueue.push(localId);
        return { success: true, error: 'Saved locally, will sync when online' };
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      return { success: false, error: 'Failed to save entry' };
    }
  }

  /**
   * Récupère les entrées d'un utilisateur
   */
  static async getEntries(userId: string, limit = 30): Promise<LocalEntry[]> {
    try {
      // Récupérer depuis la base locale
      const localEntries = await db.entries
        .where('user_id')
        .equals(userId)
        .reverse()
        .sortBy('entry_date');

      // Si en ligne, essayer de récupérer depuis le serveur
      if (this.isOnline) {
        try {
          const { data: serverEntries, error } = await entriesService.getUserEntries(userId, limit);
          
          if (!error && serverEntries) {
            // Mettre à jour la base locale avec les données du serveur
            for (const serverEntry of serverEntries) {
              const decryptedEntry = CryptoService.decryptEntry(serverEntry);
              await this.upsertLocalEntry(decryptedEntry);
            }
          }
        } catch (error) {
          console.error('Erreur de récupération serveur:', error);
        }
      }

      return localEntries.slice(0, limit);
    } catch (error) {
      console.error('Erreur de récupération locale:', error);
      return [];
    }
  }

  /**
   * Met à jour une entrée existante
   */
  static async updateEntry(entryId: string, updates: Partial<DailyEntry>): Promise<{ success: boolean; error?: string }> {
    try {
      const timestamp = new Date().toISOString();

      // Mettre à jour localement
      await db.entries.update(entryId, {
        ...updates,
        synced: false,
        updated_at: timestamp,
      });

      // Si en ligne, synchroniser avec le serveur
      if (this.isOnline) {
        try {
          const encryptedUpdates = CryptoService.encryptEntry(updates);
          const { error } = await entriesService.updateEntry(entryId, encryptedUpdates);

          if (error) throw error;

          // Marquer comme synchronisé
          await db.entries.update(entryId, { synced: true });
          return { success: true };
        } catch (error) {
          console.error('Erreur de synchronisation:', error);
          this.syncQueue.push(entryId);
          return { success: true, error: 'Updated locally, will sync when online' };
        }
      } else {
        this.syncQueue.push(entryId);
        return { success: true, error: 'Updated locally, will sync when online' };
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      return { success: false, error: 'Failed to update entry' };
    }
  }

  /**
   * Traite la queue de synchronisation
   */
  private static async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`Synchronisation de ${this.syncQueue.length} entrées...`);

    const queueCopy = [...this.syncQueue];
    this.syncQueue = [];

    for (const localId of queueCopy) {
      try {
        const localEntry = await db.entries.get(localId);
        if (!localEntry) continue;

        if (localEntry.id) {
          // Mise à jour
          const encryptedUpdates = CryptoService.encryptEntry({
            sleep: localEntry.sleep,
            focus: localEntry.focus,
            tasks: localEntry.tasks,
            wellbeing: localEntry.wellbeing,
          });

          const { error } = await entriesService.updateEntry(localEntry.id, encryptedUpdates);
          if (!error) {
            await db.entries.update(localId, { synced: true });
          }
        } else {
          // Création
          const encryptedEntry = CryptoService.encryptEntry({
            entry_date: localEntry.entry_date,
            sleep: localEntry.sleep,
            focus: localEntry.focus,
            tasks: localEntry.tasks,
            wellbeing: localEntry.wellbeing,
          });

          const { data, error } = await entriesService.createEntry(encryptedEntry);
          if (!error && data) {
            await db.entries.update(localId, {
              id: data.id,
              synced: true,
            });
          }
        }
      } catch (error) {
        console.error(`Erreur de synchronisation pour ${localId}:`, error);
        // Remettre dans la queue pour réessayer plus tard
        this.syncQueue.push(localId);
      }
    }

    console.log(`Synchronisation terminée. ${this.syncQueue.length} entrées en attente.`);
  }

  /**
   * Met à jour ou insère une entrée locale
   */
  private static async upsertLocalEntry(entry: DailyEntry) {
    const existing = await db.entries
      .where('entry_date')
      .equals(entry.entry_date)
      .and(e => e.user_id === entry.user_id)
      .first();

    if (existing) {
      await db.entries.update(existing.local_id, {
        ...entry,
        synced: true,
        updated_at: new Date().toISOString(),
      });
    } else {
      await db.entries.add({
        ...entry,
        local_id: crypto.randomUUID(),
        synced: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Nettoie les anciennes entrées
   */
  static async cleanup(olderThanDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await db.entries
      .where('entry_date')
      .below(cutoffDate.toISOString().split('T')[0])
      .delete();
  }

  /**
   * Obtient le statut de synchronisation
   */
  static async getSyncStatus() {
    const pendingCount = await db.entries.where('synced').equals(0).count();
    return {
      isOnline: this.isOnline,
      pendingSync: pendingCount,
      queueLength: this.syncQueue.length,
    };
  }
}

export default SyncService; 