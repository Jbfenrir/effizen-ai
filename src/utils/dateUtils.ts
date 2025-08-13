import { startOfWeek, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export type PeriodType = 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Calcule la plage de dates pour une période donnée
 */
export const getDateRangeForPeriod = (period: PeriodType, customRange?: DateRange): DateRange => {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      };
    
    case 'week':
      // Lundi au vendredi de la semaine calendaire courante
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = lundi
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // +4 jours = vendredi
      weekEnd.setHours(23, 59, 59, 999);
      
      return {
        start: weekStart,
        end: weekEnd
      };
    
    case 'month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today)
      };
    
    case 'custom':
      if (!customRange) {
        throw new Error('Custom range required for custom period');
      }
      return {
        start: new Date(customRange.start.getFullYear(), customRange.start.getMonth(), customRange.start.getDate()),
        end: new Date(customRange.end.getFullYear(), customRange.end.getMonth(), customRange.end.getDate(), 23, 59, 59, 999)
      };
    
    default:
      return getDateRangeForPeriod('today');
  }
};

/**
 * Formate une plage de dates pour l'affichage
 */
export const formatDateRange = (range: DateRange, locale: string = 'fr'): string => {
  const dateLocale = locale === 'fr' ? fr : undefined;
  const startFormatted = format(range.start, 'dd/MM', { locale: dateLocale });
  const endFormatted = format(range.end, 'dd/MM/yyyy', { locale: dateLocale });
  
  // Si même mois et année, n'afficher l'année qu'une fois
  if (range.start.getMonth() === range.end.getMonth() && 
      range.start.getFullYear() === range.end.getFullYear()) {
    return `${startFormatted} - ${format(range.end, 'dd/MM/yyyy', { locale: dateLocale })}`;
  }
  
  return `${format(range.start, 'dd/MM/yyyy', { locale: dateLocale })} - ${endFormatted}`;
};

/**
 * Vérifie si une date est dans une plage donnée
 */
export const isDateInRange = (date: Date | string, range: DateRange): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isWithinInterval(dateObj, range);
};

/**
 * Génère la liste des dates dans une plage (format YYYY-MM-DD)
 */
export const getDatesInRange = (range: DateRange): string[] => {
  const dates: string[] = [];
  const current = new Date(range.start);
  
  while (current <= range.end) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Filtre les données d'entrée par période
 */
export const filterEntriesByDateRange = (entries: any[], range: DateRange): any[] => {
  return entries.filter(entry => {
    if (!entry.entry_date) return false;
    return isDateInRange(entry.entry_date, range);
  });
};