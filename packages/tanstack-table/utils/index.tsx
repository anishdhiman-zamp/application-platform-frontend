/**
 * Flattens paginated data from react-query infinite queries or falls back to rows
 * @param data - The infinite query data with pages containing data arrays
 * @param rows - Fallback rows if data is not available
 * @returns Flattened array of row data
 */
export const flattenRowData = <TData = unknown,>(data?: { pages?: { data: TData[] }[] }, rows?: TData[]): TData[] => {
  return data?.pages?.flatMap((page: { data: TData[] }) => page.data) ?? rows ?? [];
};
