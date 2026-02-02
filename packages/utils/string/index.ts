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

/**
 * Normalizes a string by converting to lowercase and removing non-alphanumeric characters
 * @param value - The string to normalize
 * @returns Normalized string (lowercase, alphanumeric only)
 */
export const normalize = (value?: string): string => {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
};

/**
 * Returns a string prefixed with the appropriate indefinite article (a/an).
 * Determines the article based on whether the word starts with a vowel sound.
 * @param word - The word to prefix with an article
 * @returns The word prefixed with 'a' or 'an'
 * @example
 * withArticle('apple') // "an apple"
 * withArticle('banana') // "a banana"
 * withArticle('Gmail') // "a gmail"
 */
export const withArticle = (word: string): string => {
  const lowerWord = word.toLowerCase();
  const article = /^[aeiou]/.test(lowerWord) ? 'an' : 'a';
  return `${article} ${lowerWord}`;
};
