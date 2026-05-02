'use client';

import ComponentCard from 'modules/design-system/components/ComponentCard';
import type { ComponentCategoryType, ComponentEntryType } from 'modules/design-system/types/design-system.types';
import { slugifyCategory } from 'modules/design-system/utils/design-system.utils';

interface CategorySectionProps {
  category: ComponentCategoryType;
  entries: ComponentEntryType[];
}

const CategorySection = ({ category, entries }: CategorySectionProps) => {
  if (!entries?.length) return null;

  return (
    <section id={slugifyCategory(category)} className='flex scroll-mt-6 flex-col gap-4'>
      <div className='flex items-baseline gap-2'>
        <h2 className='text-GRAY_1000 text-lg font-semibold'>{category}</h2>
        <span className='text-GRAY_500 text-xs'>{entries.length} components</span>
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {entries.map((entry) => (
          <ComponentCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
