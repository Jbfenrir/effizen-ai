import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Target, Clock, AlertTriangle } from 'lucide-react';
import TaskAutocomplete from './TaskAutocomplete';
import { useTaskHistory } from '../hooks/useTaskHistory';
import type { Task } from '../types';

interface TasksFormProps {
  initialData?: Task[];
  onChange: (tasks: Task[]) => void;
  disabled?: boolean;
}

const TasksForm: React.FC<TasksFormProps> = ({
  initialData = [],
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { addTaskToHistory } = useTaskHistory();
  const [tasks, setTasks] = useState<Task[]>(initialData);

  useEffect(() => {
    setTasks(initialData);
  }, [initialData]);

  const addTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: '',
      duration: 0,
      isHighValue: false,
    };
    setTasks(prev => {
      // Ajouter la nouvelle tâche au début pour UX mobile
      const updated = [newTask, ...prev];
      onChange(updated);
      return updated;
    });

    // Focus sur le nouveau champ de saisie au lieu de scroller
    setTimeout(() => {
      const newTaskInput = document.querySelector(`[data-task-id="${newTask.id}"] input[type="text"]`) as HTMLInputElement;
      if (newTaskInput) {
        newTaskInput.focus();
      }
    }, 100);
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.filter(task => task.id !== taskId);
      onChange(updated);
      return updated;
    });
  };

  const updateTask = (taskId: string, field: keyof Task, value: any) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      );
      onChange(updated);
      return updated;
    });
  };

  // Gérer la sélection d'une tâche depuis l'autocomplétion
  const handleTaskNameChange = (taskId: string, taskName: string) => {
    updateTask(taskId, 'name', taskName);
    // Ajouter à l'historique seulement quand la tâche est validée (non vide)
    if (taskName.trim()) {
      addTaskToHistory(taskName.trim());
    }
  };

  const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
  const highValueDuration = tasks
    .filter(task => task.isHighValue)
    .reduce((sum, task) => sum + task.duration, 0);
  const hvRatio = totalDuration > 0 ? (highValueDuration / totalDuration) * 100 : 0;

  const getHvRatioColor = (ratio: number) => {
    if (ratio >= 70) return 'text-lime-green';
    if (ratio >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHvRatioMessage = (ratio: number) => {
    if (ratio >= 70) return t('tasks.tips.good');
    if (ratio >= 50) return t('tasks.tips.low');
    return t('tasks.tips.low');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="icon" size={24} />
            <h3 className="text-lg font-semibold">{t('tasks.title')}</h3>
          </div>
          <button
            type="button"
            onClick={addTask}
            disabled={disabled}
            className="btn-success flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>{t('tasks.addTask')}</span>
          </button>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4" data-tasks-list>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-metallic-gray">
            <Target size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t('tasks.noTasks')}</p>
            <p className="text-sm">{t('tasks.clickToAdd')}</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task.id} data-task-id={task.id} className="border border-light-gray rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Nom de la tâche */}
                <div className="md:col-span-4">
                  <label className="form-label text-sm">
                    {t('tasks.taskName')} #{index + 1}
                  </label>
                  <TaskAutocomplete
                    value={task.name}
                    onChange={(value) => updateTask(task.id, 'name', value)}
                    onTaskSelected={(taskName) => handleTaskNameChange(task.id, taskName)}
                    placeholder="Ex: Réunion équipe, Développement feature..."
                    disabled={disabled}
                  />
                </div>

                {/* Durée */}
                <div className="md:col-span-2">
                  <label className="form-label text-sm">
                    {t('tasks.duration')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      step="0.5"
                      value={task.duration}
                      onChange={(e) => updateTask(task.id, 'duration', parseFloat(e.target.value) || 0)}
                      className="form-input pr-8"
                      disabled={disabled}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-metallic-gray text-sm">
                      h
                    </span>
                  </div>
                </div>

                {/* Haute valeur */}
                <div className="md:col-span-3">
                  <label className="form-label text-sm">
                    {t('tasks.taskType')}
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => updateTask(task.id, 'isHighValue', true)}
                      disabled={disabled}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        task.isHighValue
                          ? 'bg-lime-green text-white'
                          : 'bg-light-gray text-dark-blue hover:bg-gray-200'
                      }`}
                    >
                      {t('tasks.highValue')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTask(task.id, 'isHighValue', false)}
                      disabled={disabled}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        !task.isHighValue
                          ? 'bg-red-100 text-red-800'
                          : 'bg-light-gray text-dark-blue hover:bg-gray-200'
                      }`}
                    >
                      {t('tasks.lowValue')}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    disabled={disabled}
                    className="btn-secondary flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                </div>

                {/* Indicateur visuel */}
                <div className="md:col-span-1 flex justify-center">
                  <div className={`w-4 h-4 rounded-full ${
                    task.isHighValue ? 'bg-lime-green' : 'bg-red-400'
                  }`} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Résumé et statistiques */}
      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-light-gray rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Durée totale */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock size={20} className="text-metallic-gray" />
                <span className="text-sm font-medium text-dark-blue">
                  {t('tasks.totalDuration')}
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                totalDuration > 8 ? 'text-red-600' : 'text-dark-blue'
              }`}>
                {totalDuration.toFixed(1)} h
              </div>
              {totalDuration > 8 && (
                <p className="text-red-600 text-xs mt-1 flex items-center justify-center space-x-1">
                  <AlertTriangle size={12} />
                  <span>{t('tasks.tips.overwork')}</span>
                </p>
              )}
            </div>

            {/* Ratio haute valeur */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target size={20} className="text-metallic-gray" />
                <span className="text-sm font-medium text-dark-blue">
                  {t('tasks.hvRatio')}
                </span>
              </div>
              <div className={`text-2xl font-bold ${getHvRatioColor(hvRatio)}`}>
                {hvRatio.toFixed(0)}%
              </div>
              <p className="text-xs text-metallic-gray mt-1">
                {highValueDuration.toFixed(1)}h / {totalDuration.toFixed(1)}h
              </p>
            </div>

            {/* Répartition */}
            <div className="text-center">
              <div className="text-sm font-medium text-dark-blue mb-2">
                Répartition
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-lime-green">Haute valeur</span>
                  <span>{highValueDuration.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Faible valeur</span>
                  <span>{(totalDuration - highValueDuration).toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksForm; 