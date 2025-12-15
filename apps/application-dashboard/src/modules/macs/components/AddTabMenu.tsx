'use client';

import { useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { CornerDownLeft, FileBarChart, FileText, LayoutDashboard, Plus, Search } from 'lucide-react';
import { MOCK_RECENT_ITEMS } from '@/modules/macs/constants';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RecentItem, Tab } from '@/modules/macs/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  LayoutDashboard,
  FileBarChart,
};

const AddTabMenu = () => {
  const { addTab } = useMacsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_RECENT_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectItem = (item: RecentItem) => {
    const tab: Tab = {
      id: item.id,
      title: item.title,
      type: item.type,
      icon: item.icon,
    };

    addTab(tab);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-gray-600 hover:text-gray-900'>
          <Plus size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-[320px] rounded-xl border border-gray-700 bg-gray-900 p-0 shadow-xl'>
        <div className='p-3'>
          <div className='relative'>
            <Search size={16} className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-500' />
            <Input
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='border-gray-700 bg-gray-800 pl-9 text-white placeholder:text-gray-500'
              autoFocus
            />
          </div>
        </div>

        <div className='border-t border-gray-700 px-3 py-2'>
          <div className='f-11-500 mb-2 text-gray-500'>Recently visited</div>
          <div className='flex flex-col gap-1'>
            {filteredItems.map((item) => {
              const Icon = item.icon ? ICON_MAP[item.icon] : FileText;

              return (
                <button
                  key={item.id}
                  className='flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-gray-800'
                  onClick={() => handleSelectItem(item)}
                >
                  <div className='flex items-center gap-2'>
                    {Icon && <Icon size={16} className='text-gray-400' />}
                    <span className='f-13-450 text-white'>{item.title}</span>
                  </div>
                  <CornerDownLeft size={14} className='text-gray-500' />
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className='f-13-450 py-4 text-center text-gray-500'>No items found</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddTabMenu;
