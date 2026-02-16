interface SearchFieldConfig<T> {
  getValue: (item: T) => string;
  weight: number;
}

interface PrioritizedSearchOptions<T> {
  items: T[];
  query: string;
  fields: SearchFieldConfig<T>[];
  exactMatchBonus?: number;
  startsWithBonus?: number;
}

/**
 * Performs a prioritized search across multiple fields with configurable weights.
 * Results are sorted by relevance score, with higher-weighted fields taking priority.
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
        const fieldValue = (field.getValue(item) ?? '').toLowerCase();
        const matches = fieldValue.includes(queryLower);

        if (matches) {
          hasMatch = true;
          totalScore += field.weight;

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

  return scoredItems.sort((a, b) => b.score - a.score).map((result) => result.item);
};
