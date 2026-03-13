import { FC, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { MenuItem } from 'types/common/components';
import { preventAutoFocus } from '@/utils/common';

interface TabsOverflowMenuProps {
  overflowTabs: MenuItem[];
  handleTabSelect: (tab: MenuItem, isFromOverflow?: boolean) => void;
}

const TabsOverflowMenu: FC<TabsOverflowMenuProps> = ({ overflowTabs, handleTabSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (overflowTabs.length === 0) {
    return null;
  }

  const handleItemClick = (tab: MenuItem) => {
    handleTabSelect(tab, true); // Pass isFromOverflow flag as true
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size='medium' variant='ghost' data-testid='tabs-overflow-menu-trigger'>
          <span className='f-13-400 text-gray-500'>+{overflowTabs.length} more</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={20} onCloseAutoFocus={preventAutoFocus}>
        {overflowTabs.map((tab) => (
          <DropdownMenuItem
            key={tab.value}
            onClick={() => handleItemClick(tab)}
            className='hover:bg-accent hover:text-accent-GRAY_1000 rounded'
            data-testid={`${tab.value}-tabs-overflow-menu-item`}
          >
            <span className='truncate'>{tab.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TabsOverflowMenu;
