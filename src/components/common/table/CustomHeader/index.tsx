import { useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import AddTag from 'modules/data/AddTag';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny } from 'types/commonTypes';
import { ICON_POSITION_TYPES } from 'types/components/button.type';
import { OrderType } from 'types/components/table.type';
import { Button } from 'components/common/button/Button';
import PositionedMenuWrapper from 'components/common/PositionedMenuWrapper';
import { CustomHeaderMenuOptions } from 'components/common/table/CustomHeader/customHeader.constants';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import FilterDropdownMenu from 'components/filter/filterMenu/FilterDropdownMenu';
import { useFiltersContextStore } from 'components/filter/filters.context';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const CustomHeader = (props: MapAny) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const {
    state: { selectedFilters },
  } = useFiltersContextStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const columnId = props.column.colId;
  const filtersCount = selectedFilters ? Object.keys(selectedFilters)?.length : 0;

  const handleMenuOptionClick = (option: CustomHeaderMenuOptionTypes) => {
    switch (option) {
      case CustomHeaderMenuOptionTypes.RULES:
        setIsMenuOpen(false);
        props.handleRulesListingSideDrawerOpen(columnId);
        break;
      case CustomHeaderMenuOptionTypes.ADD_TAG:
        setIsMenuOpen(false);
        setIsAddTagOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.SORT_ASC:
        props.tableRef.current?.api?.applyColumnState({
          state: [{ colId: columnId, sort: OrderType.ASC }],
        });
        break;
      case CustomHeaderMenuOptionTypes.SORT_DESC:
        props.tableRef.current?.api?.applyColumnState({
          state: [{ colId: columnId, sort: OrderType.DESC }],
        });
        break;
      case CustomHeaderMenuOptionTypes.FILTER:
        setIsMenuOpen(false);
        setIsFilterOpen(true);
        break;
    }
  };

  const handleAddTagClose = () => {
    setIsMenuOpen(true);
    setIsAddTagOpen(false);
  };

  // Function to calculate and update menu position
  const updateMenuPosition = () => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + window.scrollY, // Stick below the header
      left: rect.left, // Adjust for AG Grid's horizontal scroll
    });
  };

  // Function to open menu and set position
  const toggleMenu = () => {
    updateMenuPosition();
    setIsMenuOpen((prev) => !prev);
    setIsFilterOpen(false);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  return (
    <>
      <div ref={menuRef} className='w-full h-full -mx-4 flex-1 relative'>
        <div
          className='w-full h-full flex-1 hover:bg-GRAY_100 cursor-pointer flex items-center justify-between px-4 group'
          onClick={toggleMenu}
        >
          <div>{props.column.colId}</div>
          <SvgSpriteLoader
            id='chevron-down'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            width={12}
            height={12}
            className='hidden group-hover:block'
          />
        </div>
        {isMenuOpen && (
          <PositionedMenuWrapper
            id='custom-header-menu'
            className='mt-1 w-52 p-1'
            childrenWrapperClassName='!overflow-auto'
            menuPosition={menuPosition}
          >
            {CustomHeaderMenuOptions.map((option) => (
              <div
                key={option.value}
                className='flex items-center gap-1.5 px-2.5 py-2 hover:bg-GRAY_100 cursor-pointer rounded-md'
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOptionClick(option.value);
                }}
                {...(option.value === CustomHeaderMenuOptionTypes.FILTER && { ref: buttonRef })}
              >
                <SvgSpriteLoader id={option.iconId} width={12} height={12} />
                <div className='f-12-500'>{option.label}</div>
              </div>
            ))}
            <div className='px-2.5 py-3'>
              <Button
                id='add-tag-button'
                iconProps={{ id: 'tag-01', iconCategory: ICON_SPRITE_TYPES.FINANCE_AND_ECOMMERCE }}
                size={SIZE_TYPES.SMALL}
                className='w-full'
                iconPosition={ICON_POSITION_TYPES.LEFT}
                onClick={() => handleMenuOptionClick(CustomHeaderMenuOptionTypes.ADD_TAG)}
              >
                Add Tag
              </Button>
              {!!filtersCount && (
                <div className='f-11-400 text-GRAY_700 mt-1.5'>
                  {Object.keys(selectedFilters)?.length} filters applied
                </div>
              )}
            </div>
          </PositionedMenuWrapper>
        )}
        {isAddTagOpen && (
          <PositionedMenuWrapper
            id='custom-header-add-tag-menu'
            className='mt-1'
            childrenWrapperClassName='!overflow-visible'
            menuPosition={menuPosition}
            onClose={handleAddTagClose}
          >
            <AddTag
              tagList={props.options}
              datasetId={props.datasetId}
              handleSuccessfullUpdate={props.handleSuccessfullUpdate}
              column={columnId}
              onClose={handleAddTagClose}
            />
          </PositionedMenuWrapper>
        )}
        {isFilterOpen && (
          <PositionedMenuWrapper
            id='custom-header-filter-menu'
            className='mt-1 border-none'
            childrenWrapperClassName='!overflow-visible'
            menuPosition={menuPosition}
            onClose={handleFilterClose}
          >
            <FilterDropdownMenu filterKey={columnId} filterType={props.filterType} />
          </PositionedMenuWrapper>
        )}
      </div>
    </>
  );
};

export default CustomHeader;
