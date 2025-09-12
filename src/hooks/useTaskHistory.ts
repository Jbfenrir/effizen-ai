import { useState, useEffect } from 'react';

const TASK_HISTORY_KEY = 'effizen_task_history';
const MAX_HISTORY_SIZE = 50; // Limiter le nombre de tâches mémorisées

export interface TaskHistoryItem {
  name: string;
  frequency: number; // Nombre de fois utilisée
  lastUsed: string; // Date ISO string
}

export const useTaskHistory = () => {
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);

  // Charger l'historique depuis localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(TASK_HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TaskHistoryItem[];
        setTaskHistory(parsed);
      } catch (error) {
        console.warn('Erreur lors du chargement de l\'historique des tâches:', error);
        localStorage.removeItem(TASK_HISTORY_KEY);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const saveToStorage = (history: TaskHistoryItem[]) => {
    try {
      localStorage.setItem(TASK_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de l\'historique des tâches:', error);
    }
  };

  // Ajouter ou mettre à jour une tâche dans l'historique
  const addTaskToHistory = (taskName: string) => {
    if (!taskName.trim()) return;

    const normalizedName = taskName.trim();
    
    setTaskHistory(prev => {
      const existingIndex = prev.findIndex(item => 
        item.name.toLowerCase() === normalizedName.toLowerCase()
      );

      let updated: TaskHistoryItem[];

      if (existingIndex >= 0) {
        // Mettre à jour la fréquence et la date de dernière utilisation
        updated = prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, frequency: item.frequency + 1, lastUsed: new Date().toISOString() }
            : item
        );
      } else {
        // Ajouter nouvelle tâche
        updated = [
          ...prev,
          {
            name: normalizedName,
            frequency: 1,
            lastUsed: new Date().toISOString()
          }
        ];
      }

      // Trier par fréquence décroissante puis par date récente
      updated.sort((a, b) => {
        if (a.frequency !== b.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });

      // Limiter la taille de l'historique
      if (updated.length > MAX_HISTORY_SIZE) {
        updated = updated.slice(0, MAX_HISTORY_SIZE);
      }

      saveToStorage(updated);
      return updated;
    });
  };

  // Obtenir les suggestions basées sur la saisie de l'utilisateur
  const getSuggestions = (input: string, maxResults: number = 8): TaskHistoryItem[] => {
    if (!input.trim()) return [];

    const normalizedInput = input.toLowerCase().trim();
    
    return taskHistory
      .filter(item => 
        item.name.toLowerCase().includes(normalizedInput)
      )
      .slice(0, maxResults);
  };

  // Nettoyer l'historique (pour maintenance future)
  const clearHistory = () => {
    setTaskHistory([]);
    localStorage.removeItem(TASK_HISTORY_KEY);
  };

  return {
    taskHistory,
    addTaskToHistory,
    getSuggestions,
    clearHistory
  };
};