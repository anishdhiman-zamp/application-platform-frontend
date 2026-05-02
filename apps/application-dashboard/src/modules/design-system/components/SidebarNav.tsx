'use client';

import { cn } from '@zamp-platform/ui/utils';
import type { CategoryGroupType } from 'modules/design-system/types/design-system.types';
import { slugifyCategory } from 'modules/design-system/utils/design-system.utils';

interface SidebarNavProps {
  groups: CategoryGroupType[];
  activeCategory?: string;
}

const SidebarNav = ({ groups, activeCategory }: SidebarNavProps) => {
  if (!groups?.length) return null;

  return (
    <nav className='flex flex-col gap-1 py-4'>
      <div className='text-GRAY_700 px-3 pb-2 text-[11px] font-medium tracking-wide uppercase'>Categories</div>
      {groups.map((group) => {
        const slug = slugifyCategory(group.category);
        const isActive = activeCategory === slug;

        return (
          <a
            key={slug}
            href={`#${slug}`}
            className={cn(
              'text-GRAY_900 hover:bg-GRAY_100 flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
              isActive && 'bg-GRAY_100 font-medium',
            )}
          >
            <span>{group.category}</span>
            <span className='text-GRAY_500 text-xs'>{group.entries.length}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
