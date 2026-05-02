import type {
  CategoryGroupType,
  ComponentCategoryType,
  ComponentEntryType,
} from 'modules/design-system/types/design-system.types';

export const filterEntriesByQuery = (entries: ComponentEntryType[], query: string): ComponentEntryType[] => {
  if (!entries) return [];
  const trimmed = query?.trim().toLowerCase() ?? '';

  if (!trimmed) return entries;

  return entries.filter((entry) => {
    const name = entry.name?.toLowerCase() ?? '';
    const category = entry.category?.toLowerCase() ?? '';
    const description = entry.description?.toLowerCase() ?? '';
    const filePath = entry.filePath?.toLowerCase() ?? '';

    return (
      name.includes(trimmed) ||
      category.includes(trimmed) ||
      description.includes(trimmed) ||
      filePath.includes(trimmed)
    );
  });
};

export const groupEntriesByCategory = (entries: ComponentEntryType[]): CategoryGroupType[] => {
  if (!entries) return [];

  const map = new Map<ComponentCategoryType, ComponentEntryType[]>();

  for (const entry of entries) {
    const bucket = map.get(entry.category) ?? [];

    bucket.push(entry);
    map.set(entry.category, bucket);
  }

  return Array.from(map.entries()).map(([category, categoryEntries]) => ({
    category,
    entries: categoryEntries,
  }));
};

export const slugifyCategory = (category: ComponentCategoryType): string => {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};
