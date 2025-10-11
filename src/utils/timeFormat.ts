/**
 * Utilities for time formatting and conversion
 */

/**
 * Convert decimal hours to HH:MM format
 * @param hours - Decimal hours (e.g., 7.5, 2.25)
 * @returns Formatted string in HH:MM format (e.g., "07:30", "02:15")
 */
export function hoursToHHMM(hours: number): string {
  if (hours === 0 || isNaN(hours)) return '00:00';

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Convert HH:MM format to decimal hours
 * @param timeStr - Time string in HH:MM format (e.g., "07:30", "02:15")
 * @returns Decimal hours (e.g., 7.5, 2.25)
 */
export function hhmmToHours(timeStr: string): number {
  if (!timeStr || timeStr === '00:00') return 0;

  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return 0;

  return hours + (minutes / 60);
}

/**
 * Format duration for display (compact version with "h" suffix)
 * @param hours - Decimal hours
 * @returns Formatted string (e.g., "7h30", "2h15")
 */
export function formatDurationCompact(hours: number): string {
  if (hours === 0 || isNaN(hours)) return '0h00';

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}h${m.toString().padStart(2, '0')}`;
}
