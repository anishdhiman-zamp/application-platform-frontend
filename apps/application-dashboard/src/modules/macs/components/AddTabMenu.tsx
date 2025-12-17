'use client';

import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTrigger, Input } from '@zamp-platform/ui';
import { CornerDownLeft, FileBarChart, FileText, LayoutDashboard, Plus } from 'lucide-react';
import { MOCK_RECENT_ITEMS } from '@/modules/macs/constants';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RecentItem, Tab, TabType } from '@/modules/macs/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  LayoutDashboard,
  FileBarChart,
};

const AddTabMenu = () => {
  const { addTab, isAddTabMenuOpen, setIsAddTabMenuOpen } = useMacsContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_RECENT_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectItem = (item: RecentItem) => {
    const tab: Tab = {
      id: item.id,
      title: item.title,
      type: item.type as TabType,
      icon: item.icon,
    };

    addTab(tab);
    setIsAddTabMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={isAddTabMenuOpen} onOpenChange={setIsAddTabMenuOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' className='h-6 w-6 text-gray-600 hover:text-gray-900'>
          <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[500px] rounded-2xl border border-gray-800 bg-gray-950 p-0 shadow-2xl'>
        <div className='py-4'>
          <div className='flex items-center gap-3'>
            <div className='h-6 w-1 rounded-full bg-blue-700' />
            <Input
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='placeholder:text-GRAY_700 f-16-450 border-none bg-transparent text-white focus-visible:ring-0'
              autoFocus
            />
          </div>
        </div>

        <div className='pb-4'>
          <div className='text-GRAY_700 f-13-450 mb-3 px-6'>Recently visited</div>
          <div className='flex max-h-[300px] flex-col gap-2 overflow-y-auto'>
            {filteredItems.map((item) => {
              const Icon = item.icon ? ICON_MAP[item.icon] : FileText;

              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  className='group flex h-auto w-full items-center justify-between rounded-none px-6 py-3 text-left hover:bg-gray-800/50'
                  onClick={() => handleSelectItem(item)}
                >
                  <div className='flex items-center gap-1'>
                    {Icon && <Icon size={14} className='text-GRAY_700' />}
                    <span className='f-13-500 text-white'>{item.title}</span>
                  </div>
                  <div className='rounded-lg border border-gray-700 p-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
                    <CornerDownLeft size={14} className='text-GRAY_700' />
                  </div>
                </Button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className='f-13-450 text-GRAY_700 py-4 text-center'>No items found</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTabMenu;
