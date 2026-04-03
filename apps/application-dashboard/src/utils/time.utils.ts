/**
 * Converts a duration in seconds to a human-readable upper-bound string.
 * e.g. 45  → "less than a minute"
 *      90  → "less than 2 minutes"
 *      180 → "less than 3 minutes"
 */
export function formatExpectedDuration(seconds: number): string {
  if (seconds <= 60) return 'less than a minute';

  const minutes = Math.ceil(seconds / 60);

  return `less than ${minutes} minutes`;
}
