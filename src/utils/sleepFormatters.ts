/**
 * Utilitaires pour formatter les durées de sommeil
 */

/**
 * Convertit une durée décimale en heures en format HH:MM
 * @param duration Durée en heures (ex: 7.5)
 * @returns Format HH:MM (ex: "07:30")
 */
export const formatSleepDuration = (duration: number): string => {
  if (isNaN(duration) || duration <= 0) {
    return "00:00";
  }

  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);

  // Gérer le cas où les minutes arrondissent à 60
  const finalHours = minutes >= 60 ? hours + 1 : hours;
  const finalMinutes = minutes >= 60 ? 0 : minutes;

  return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
};

/**
 * Convertit un format HH:MM en durée décimale
 * @param timeString Format HH:MM (ex: "07:30")
 * @returns Durée en heures (ex: 7.5)
 */
export const parseSleepDuration = (timeString: string): number => {
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;

  return hours + minutes / 60;
};