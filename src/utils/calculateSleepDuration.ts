export function calculateSleepDuration(bedTime: string, wakeTime: string, insomniaDuration: number): number {
  const bed = new Date(`2000-01-01T${bedTime}:00`);
  let wake = new Date(`2000-01-01T${wakeTime}:00`);
  if (wake < bed) {
    wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000);
  }
  const durationMs = wake.getTime() - bed.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  // Correction : soustraire l’insomnie en heures
  return Math.max(0, durationHours - insomniaDuration);
}