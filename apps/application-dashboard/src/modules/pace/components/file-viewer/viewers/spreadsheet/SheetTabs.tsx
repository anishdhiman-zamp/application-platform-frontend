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
    <div className='border-GRAY_400 flex gap-1 border-r px-3 py-2'>
      {sheetNames.map((name) => (
        <Button
          key={name}
          variant='ghost'
          size='xxsmall'
          onClick={() => onSheetChange(name)}
          className={cn(
            'f-12-450',
            activeSheet === name ? 'bg-GRAY_300 text-GRAY_1000' : 'text-GRAY_700 hover:bg-GRAY_200 hover:text-GRAY_900',
          )}
        >
          {name}
        </Button>
      ))}
    </div>
  );
};

export default SheetTabs;
