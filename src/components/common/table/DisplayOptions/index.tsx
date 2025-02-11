import React, { FC, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { MenuWrapper } from 'components/common/MenuWrapper';
import ColumnListing from 'components/common/table/DisplayOptions/ColumnListing';
import DisplayOptionItem from 'components/common/table/DisplayOptions/DisplayOptionItem';
import GroupBy from 'components/common/table/DisplayOptions/GroupBy';
import { DisplayOptionsList } from 'components/common/table/table.constants';
import { DISPLAY_OPTIONS } from 'components/common/table/table.types';

type DisplayOptionsProps = {
  tableRef: React.RefObject<AgGridReact>;
  refetchColumnList: number;
};

const DisplayOptions: FC<DisplayOptionsProps> = ({ tableRef, refetchColumnList }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isColumnListingOpen, setIsColumnListingOpen] = useState(false);
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  useOnClickOutside(menuRef, () => {
    setIsOpen(false);
    setIsColumnListingOpen(false);
    setIsGroupByOpen(false);
  });

  const handleClick = (id: string) => {
    setIsOpen(false);
    if (id === DISPLAY_OPTIONS.COLUMNS) {
      setIsColumnListingOpen(true);
    } else if (id === DISPLAY_OPTIONS.GROUP_BY) {
      setIsGroupByOpen(true);
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
    <div className='relative' ref={menuRef}>
      <Button
        id='display-options'
        onClick={() => setIsOpen(!isOpen)}
        type={BUTTON_TYPES.SECONDARY}
        size={SIZE_TYPES.XSMALL}
        iconPosition={ICON_POSITION_TYPES.LEFT}
        iconProps={{
          id: 'settings-04',
          iconCategory: ICON_SPRITE_TYPES.GENERAL,
        }}
      >
        Display
      </Button>
      {isOpen && (
        <MenuWrapper
          id='display-options'
          className='!absolute z-10 p-1 right-0 mt-1 w-[180px]'
          childrenWrapperClassName='text-GRAY_900 !overflow-y-auto'
        >
          {DisplayOptionsList.map((option) => (
            <DisplayOptionItem key={option.id} {...option} onClick={handleClick} />
          ))}
        </MenuWrapper>
      )}
      {isColumnListingOpen && (
        <ColumnListing tableRef={tableRef} refetchColumnList={refetchColumnList} onClose={handleCloseColumnListing} />
      )}
      {isGroupByOpen && <GroupBy onClose={handleCloseGroupBy} tableRef={tableRef} />}
    </div>
  );
};

export default DisplayOptions;
