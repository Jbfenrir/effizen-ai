import { supabase } from './supabase';
import type { DailyEntry } from '../types';

export const entriesService = {
  async createEntry(entry: Omit<DailyEntry, 'id' | 'created_at'>): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('daily_entries')
        .insert({
          user_id: user.id,
          entry_date: entry.entry_date,
          sleep: entry.sleep,
          focus: entry.focus,
          tasks: entry.tasks,
          wellbeing: entry.wellbeing,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception creating entry:', error);
      return { data: null, error };
    }
  },

  async updateEntry(entryId: string, updates: Partial<DailyEntry>): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .update({
          sleep: updates.sleep,
          focus: updates.focus,
          tasks: updates.tasks,
          wellbeing: updates.wellbeing,
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception updating entry:', error);
      return { data: null, error };
    }
  },

  async upsertEntry(entry: Omit<DailyEntry, 'id' | 'created_at'>): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data: existingEntry } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('entry_date', entry.entry_date)
        .single();

      if (existingEntry) {
        return await this.updateEntry(existingEntry.id, entry);
      } else {
        return await this.createEntry(entry);
      }
    } catch (error) {
      console.error('Exception upserting entry:', error);
      return { data: null, error };
    }
  },

  async getUserEntries(userId: string, limit = 30): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching entries:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching entries:', error);
      return { data: null, error };
    }
  },

  async getEntryByDate(userId: string, entryDate: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', entryDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entry by date:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching entry by date:', error);
      return { data: null, error };
    }
  },

  async deleteEntry(entryId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error deleting entry:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception deleting entry:', error);
      return { error };
    }
  },
};

export default entriesService;