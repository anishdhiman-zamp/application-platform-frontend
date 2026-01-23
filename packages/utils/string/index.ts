/**
 * Formats a word as singular or plural based on count.
 * @param count - The count to determine singular/plural.
 * @param word - The singular form of the word.
 * @param pluralWord - Optional custom plural form. Defaults to word + 's'.
 * @returns The formatted string with count and appropriate word form.
 * @example
 * formatPlural(1, 'file') // "1 file"
 * formatPlural(3, 'file') // "3 files"
 * formatPlural(2, 'child', 'children') // "2 children"
 */
export const formatPlural = (count: number, word: string, pluralWord?: string): string => {
  return `${count} ${count > 1 ? (pluralWord ?? `${word}s`) : word}`;
};
