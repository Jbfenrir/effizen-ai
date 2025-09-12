import React, { useState, useEffect, useRef } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useTaskHistory, type TaskHistoryItem } from '../hooks/useTaskHistory';

interface TaskAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onTaskSelected?: (taskName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TaskAutocomplete: React.FC<TaskAutocompleteProps> = ({
  value,
  onChange,
  onTaskSelected,
  placeholder = "Ex: Réunion équipe, Développement feature...",
  disabled = false,
  className = "form-input"
}) => {
  const { getSuggestions, addTaskToHistory } = useTaskHistory();
  const [suggestions, setSuggestions] = useState<TaskHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les suggestions quand la valeur change
  useEffect(() => {
    if (value.length >= 2) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [value, getSuggestions]);

  // Gérer les événements clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          // Ajouter la tâche tapée manuellement à l'historique
          addTaskToHistory(value);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: TaskHistoryItem) => {
    onChange(suggestion.name);
    addTaskToHistory(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onTaskSelected) {
      onTaskSelected(suggestion.name);
    }
  };

  // Gérer la perte de focus avec délai pour permettre le clic sur les suggestions
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Gérer le focus
  const handleFocus = () => {
    if (value.length >= 2) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }
  };

  // Formater la date de dernière utilisation
  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.lastUsed}`}
              className={`px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-lime-green bg-opacity-10 border-lime-green' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-dark-blue truncate">
                    {suggestion.name}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-metallic-gray">
                      <TrendingUp size={12} />
                      <span>{suggestion.frequency} fois</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-metallic-gray">
                      <Clock size={12} />
                      <span>{formatLastUsed(suggestion.lastUsed)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Message informatif en bas */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-metallic-gray border-t">
            <div className="flex items-center justify-between">
              <span>💡 Vos tâches les plus utilisées</span>
              <span>Entrée pour valider</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAutocomplete;