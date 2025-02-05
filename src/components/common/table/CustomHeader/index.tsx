import { useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import AddTag from 'modules/data/AddTag';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny } from 'types/commonTypes';
import { ICON_POSITION_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { MenuWrapper } from 'components/common/MenuWrapper';
import { CustomHeaderMenuOptions } from 'components/common/table/CustomHeader/customHeader.constants';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { useFiltersContextStore } from 'components/filter/filters.context';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const CustomHeader = (props: MapAny) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    state: { selectedFilters },
  } = useFiltersContextStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRulesListingSideDrawerOpen, setIsRulesListingSideDrawerOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);

  const columnId = props.column.colId;
  const filtersCount = selectedFilters ? Object.keys(selectedFilters)?.length : 0;

  const handleMenuOptionClick = (option: CustomHeaderMenuOptionTypes) => {
    switch (option) {
      case CustomHeaderMenuOptionTypes.RULES:
        setIsRulesListingSideDrawerOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.ADD_TAG:
        setIsMenuOpen(false);
        setIsAddTagOpen(true);
        break;
    }
  };

  const handleAddTagClose = () => {
    setIsMenuOpen(true);
    setIsAddTagOpen(false);
  };

  return (
    <>
      <div>
        <div
          className='w-full h-full flex-1 hover:bg-GRAY_100 cursor-pointer flex items-center justify-between -mx-4 px-4'
          onClick={() => setIsMenuOpen((prev) => !prev)}
          ref={menuRef}
        >
          <div>{props.column.colId}</div>
          <SvgSpriteLoader id='chevron-down' iconCategory={ICON_SPRITE_TYPES.ARROWS} width={12} height={12} />
        </div>
        {isMenuOpen && (
          <MenuWrapper
            id='custom-header-menu'
            className='!fixed mt-6 w-52 p-1'
            childrenWrapperClassName='!overflow-auto'
          >
            {CustomHeaderMenuOptions.map((option) => (
              <div
                key={option.value}
                className='flex items-center gap-1.5 px-2.5 py-2 hover:bg-GRAY_100 cursor-pointer rounded-md'
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOptionClick(option.value);
                }}
              >
                <SvgSpriteLoader id={option.iconId} iconCategory={option.iconCategory} width={12} height={12} />
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
          </MenuWrapper>
        )}
        {isAddTagOpen && (
          <MenuWrapper
            id='add-tag-menu'
            className='!fixed mt-6 w-[300px] p-1'
            childrenWrapperClassName='!overflow-visible w-[300px]'
          >
            <AddTag
              tagList={props.options}
              datasetId={props.datasetId}
              handleSuccessfullUpdate={props.handleSuccessfullUpdate}
              column={columnId}
              onClose={handleAddTagClose}
            />
          </MenuWrapper>
        )}
      </div>
      {isRulesListingSideDrawerOpen && (
        <RulesListingSideDrawer
          column={columnId}
          onClose={() => setIsRulesListingSideDrawerOpen(false)}
          datasetId={props.datasetId}
        />
      )}
    </>
  );
};

export default CustomHeader;
