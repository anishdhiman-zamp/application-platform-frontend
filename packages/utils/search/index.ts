/**
 * Configuration for a searchable field with its priority weight
 */
interface SearchFieldConfig<T> {
  /** Function to extract the field value from an item */
  getValue: (item: T) => string;
  /** Base score for matches in this field (higher = more important) */
  weight: number;
}

/**
 * Options for the prioritized search function
 */
interface PrioritizedSearchOptions<T> {
  /** Array of items to search through */
  items: T[];
  /** Search query string */
  query: string;
  /** Configuration for searchable fields with their priorities */
  fields: SearchFieldConfig<T>[];
  /** Bonus score for exact matches (default: 50) */
  exactMatchBonus?: number;
  /** Bonus score for "starts with" matches (default: 25) */
  startsWithBonus?: number;
}

/**
 * Performs a prioritized search across multiple fields with configurable weights.
 * Results are sorted by relevance score, with higher-weighted fields taking priority.
 *
 * @param options - Search configuration options
 * @returns Filtered and sorted array of items based on search relevance
 *
 * @example
 * // Search skills prioritizing name over description
 * const results = prioritizedSearch({
 *   items: skills,
 *   query: 'payment',
 *   fields: [
 *     { getValue: (s) => s.name, weight: 100 },
 *     { getValue: (s) => s.description, weight: 10 },
 *   ],
 * });
 *
 * @example
 * // Search users by name, email, and department
 * const results = prioritizedSearch({
 *   items: users,
 *   query: 'john',
 *   fields: [
 *     { getValue: (u) => u.name, weight: 100 },
 *     { getValue: (u) => u.email, weight: 50 },
 *     { getValue: (u) => u.department, weight: 10 },
 *   ],
 *   exactMatchBonus: 100,
 *   startsWithBonus: 50,
 * });
 */
export const prioritizedSearch = <T>({
  items,
  query,
  fields,
  exactMatchBonus = 50,
  startsWithBonus = 25,
}: PrioritizedSearchOptions<T>): T[] => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return items;

  const queryLower = trimmedQuery.toLowerCase();

  const scoredItems = items
    .map((item) => {
      let totalScore = 0;
      let hasMatch = false;

      for (const field of fields) {
        const fieldValue = field.getValue(item).toLowerCase();
        const matches = fieldValue.includes(queryLower);

        if (matches) {
          hasMatch = true;
          totalScore += field.weight;

          // Apply bonuses for better match quality
          if (fieldValue === queryLower) {
            totalScore += exactMatchBonus;
          } else if (fieldValue.startsWith(queryLower)) {
            totalScore += startsWithBonus;
          }
        }
      }

      return hasMatch ? { item, score: totalScore } : null;
    })
    .filter((result): result is { item: T; score: number } => result !== null);

  // Sort by score descending
  return scoredItems.sort((a, b) => b.score - a.score).map((result) => result.item);
};
