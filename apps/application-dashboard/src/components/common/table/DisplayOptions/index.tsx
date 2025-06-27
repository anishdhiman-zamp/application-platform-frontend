import { FC, RefObject, useRef, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { AgGridReact } from 'ag-grid-react';
import { useOnClickOutside } from 'hooks';
import { COLORS } from '@/constants/colors';
import type { MapAny } from '@/types/commonTypes';
import ColumnListing from 'components/common/table/DisplayOptions/ColumnListing';
import GroupBy from 'components/common/table/DisplayOptions/GroupBy';
import { DisplayOptionsList } from 'components/common/table/table.constants';
import { DISPLAY_OPTIONS } from 'components/common/table/table.types';

type DisplayOptionsProps = {
  tableRef: RefObject<AgGridReact | null>;
  datasetId: string;
  isGroupByDisabled?: boolean;
};

const DisplayOptions: FC<DisplayOptionsProps> = ({ tableRef, datasetId, isGroupByDisabled = false }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isColumnListingOpen, setIsColumnListingOpen] = useState(false);
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);
  // TODO: Implement fx later
  // const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  // const [currency, setCurrency] = useState<string>('');

  useOnClickOutside(menuRef, () => {
    setIsOpen(false);
    setIsColumnListingOpen(false);
    setIsGroupByOpen(false);
    // TODO: Implement fx later
    // setIsCurrencyOpen(false);
  });

  const handleClick = (id: DISPLAY_OPTIONS) => {
    setIsOpen(false);
    switch (id) {
      case DISPLAY_OPTIONS.COLUMNS:
        setIsColumnListingOpen(true);
        break;
      case DISPLAY_OPTIONS.GROUP_BY:
        setIsGroupByOpen(true);
        break;
      case DISPLAY_OPTIONS.CURRENCY:
        // TODO: Implement fx later
        // setIsCurrencyOpen(true);
        break;
    }
  };

  const handleCloseColumnListing = () => {
    setIsColumnListingOpen(false);
    setIsOpen(true);
  };

  const handleCloseGroupBy = () => {
    setIsGroupByOpen(false);
    setIsOpen(true);
  };

  return (
    <div className='relative z-100' ref={menuRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className='flex items-center gap-1 ring-0! ring-offset-0! select-none focus-visible:outline-hidden'
            size='small'
            variant='outline'
          >
            <SvgSpriteLoader id='settings-04' color={COLORS.GRAY_900} size={12} />
            Display
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='z-9999 max-h-[300px] min-w-[180px]! overflow-y-auto' sideOffset={5}>
          {DisplayOptionsList.filter((option) => !isGroupByDisabled || option.id !== DISPLAY_OPTIONS.GROUP_BY).map(
            (option: MapAny) => (
              <DropdownMenuItem
                key={option?.id}
                onClick={() => handleClick(option?.id)}
                className='hover:!bg-GRAY_50 text-GRAY_1000 f-12-500 cursor-default rounded px-2.5 py-2'
              >
                <div className='flex w-full cursor-pointer items-center gap-1.5'>
                  <SvgSpriteLoader id={option?.iconId} size={12} />
                  <div>{option?.label}</div>
                </div>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isColumnListingOpen && (
        <ColumnListing tableRef={tableRef} onClose={handleCloseColumnListing} datasetId={datasetId} />
      )}
      {isGroupByOpen && <GroupBy onClose={handleCloseGroupBy} tableRef={tableRef} />}
    </div>
  );
};

export default DisplayOptions;
