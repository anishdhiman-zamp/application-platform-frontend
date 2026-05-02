'use client';

import { useMemo, useState } from 'react';
import { TooltipProvider } from '@zamp-platform/ui';
import CategorySection from 'modules/design-system/components/CategorySection';
import ComponentSearch from 'modules/design-system/components/ComponentSearch';
import SidebarNav from 'modules/design-system/components/SidebarNav';
import { MODULE_COMPONENTS } from 'modules/design-system/constants/moduleComponents';
import { UI_COMPONENTS } from 'modules/design-system/constants/uiComponents';
import { filterEntriesByQuery, groupEntriesByCategory } from 'modules/design-system/utils/design-system.utils';

const DesignSystemPage = () => {
  const [query, setQuery] = useState('');

  const allEntries = useMemo(() => [...UI_COMPONENTS, ...MODULE_COMPONENTS], []);

  const filteredEntries = useMemo(() => filterEntriesByQuery(allEntries, query), [allEntries, query]);

  const groups = useMemo(() => groupEntriesByCategory(filteredEntries), [filteredEntries]);

  return (
    <TooltipProvider>
      <div className='flex h-full w-full'>
        <aside className='border-GRAY_300 sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r px-2 lg:block'>
          <div className='px-3 pt-6 pb-2'>
            <h1 className='text-GRAY_1000 text-base font-semibold'>Design System</h1>
            <p className='text-GRAY_700 mt-1 text-xs'>Component archive — preview and jump to source.</p>
          </div>
          <SidebarNav groups={groups} />
        </aside>

        <main className='flex-1 overflow-y-auto'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8'>
            <ComponentSearch
              value={query}
              onChange={setQuery}
              total={allEntries.length}
              filteredCount={filteredEntries.length}
            />
            {groups.length === 0 ? (
              <div className='border-GRAY_300 text-GRAY_700 flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm'>
                No components match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              groups.map((group) => (
                <CategorySection key={group.category} category={group.category} entries={group.entries} />
              ))
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default DesignSystemPage;
