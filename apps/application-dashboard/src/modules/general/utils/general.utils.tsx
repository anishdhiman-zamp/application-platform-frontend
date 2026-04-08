export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export const getTimezoneDisplay = (): string => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offsetMin) % 60).padStart(2, '0');
  const city = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;

  return `(GMT${sign}${hours}:${minutes}) ${city}`;
};
