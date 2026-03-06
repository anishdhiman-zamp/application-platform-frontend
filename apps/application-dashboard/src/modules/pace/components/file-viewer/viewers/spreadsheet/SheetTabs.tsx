import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

interface SheetTabsProps {
  sheetNames: string[];
  activeSheet: string;
  onSheetChange: (name: string) => void;
}

const SheetTabs = ({ sheetNames, activeSheet, onSheetChange }: SheetTabsProps) => {
  if (sheetNames?.length <= 1) return null;

  return (
    <div className='border-GRAY_400 flex items-stretch border-r'>
      {sheetNames.map((name) => {
        const isActive = activeSheet === name;

        return (
          <Button
            key={name}
            variant='ghost'
            size='xxsmall'
            onClick={() => onSheetChange(name)}
            className={cn(
              'f-12-450 relative h-auto rounded-none px-4 py-2',
              isActive ? 'text-GRAY_1000' : 'text-GRAY_700 hover:text-GRAY_900',
            )}
          >
            {name}
            {isActive && <span className='bg-GRAY_1000 absolute bottom-0 left-0 h-0.5 w-full' />}
          </Button>
        );
      })}
    </div>
  );
};

export default SheetTabs;
