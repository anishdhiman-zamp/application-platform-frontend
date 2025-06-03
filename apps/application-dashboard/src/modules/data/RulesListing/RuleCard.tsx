import { FC, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DATE_FORMATS } from 'constants/date.constants';
import { ICON_SPRITE_TYPES, RULE_ICON } from 'constants/icons';
import { format } from 'date-fns';
import { RULE_ACTIONS } from 'modules/data/RulesListing/ruleListing.constants';
import { RULE_ACTION_TYPES } from 'modules/data/RulesListing/ruleListing.types';
import RuleStatement from 'modules/data/RulesListing/RuleStatement';
import Image from 'next/image';
import { RuleFilters } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn } from 'utils/common';
import { MenuWrapper } from '@/components/common/MenuWrapper';
import TagWithHierarchy from '@/components/common/table/CustomCellEditors/CustomTagEditor/TagWithHierarchy';
import { useOnClickOutside } from '@/hooks';
import { Button } from 'components/common/button/Button';
import { getFilterStatementValues } from 'components/filter/filter.utils';

export type RuleCardProps = {
  filters: RuleFilters;
  value?: string;
  createdOn?: string;
  defaultExpanded?: boolean;
  className?: string;
  id?: string;
  priority?: number;
  onExpand?: (id: string) => void;
  onCollapse?: (id: string) => void;
  onDeleteRuleId?: (ruleId: string) => void;
  labelColor?: string;
};

const RuleCard: FC<RuleCardProps> = ({
  filters,
  value,
  createdOn,
  defaultExpanded = false,
  className,
  onExpand,
  onCollapse,
  id,
  onDeleteRuleId,
  labelColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const filterStatement = getFilterStatementValues(filters);
  const nonExpandedFilterStatement = filterStatement?.slice(0, 1)?.[0];
  const filterStatementLength = filterStatement?.length;

  const handleClickMore = () => {
    setIsExpanded(true);
    onExpand?.(id ?? '');
  };

  const handleClickCollapse = () => {
    setIsExpanded(false);
    onCollapse?.(id ?? '');
  };

  const handleClickMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClickAction = (action: RULE_ACTION_TYPES) => {
    handleClickMenu();
    switch (action) {
      case RULE_ACTION_TYPES.EDIT:
        break;
      case RULE_ACTION_TYPES.DELETE:
        onDeleteRuleId?.(id ?? '');
        break;
    }
  };

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  return (
    <div
      className={cn(
        'rounded-md border bg-white transition-all duration-500',
        isExpanded ? 'border-GRAY_600 h-[300px]' : 'border-GRAY_400 h-[148px]',
        className,
      )}
    >
      <div className='bg-BG_GRAY_2 flex items-center justify-between rounded-t-md px-2.5 py-2'>
        {!!createdOn && (
          <span className='f-12-400 text-GRAY_700'>
            Created on {format(new Date(createdOn), DATE_FORMATS.ddMMMyyyy)}
          </span>
        )}
        <div ref={menuRef}>
          <SvgSpriteLoader
            id='dots-horizontal'
            iconCategory={ICON_SPRITE_TYPES.GENERAL}
            width={14}
            height={14}
            onClick={handleClickMenu}
          />
          {isMenuOpen && (
            <MenuWrapper
              id='rule-actions'
              className='!absolute right-0 z-10 mt-1 w-[180px] p-1'
              childrenWrapperClassName='text-GRAY_900 overflow-y-auto!'
            >
              {RULE_ACTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'text-GRAY_900 hover:text-GRAY_1000 hover:bg-GRAY_100 f-12-500 cursor-pointer rounded-md px-2.5 py-2',
                    option.fontColor,
                  )}
                  onClick={() => handleClickAction(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </MenuWrapper>
          )}
        </div>
      </div>
      <div className='space-y-3 px-2.5 py-3'>
        {!!value && <TagWithHierarchy tag={value} labelColor={labelColor} isReadOnly />}
        <div
          className={cn('f-11-400 flex gap-1.5', {
            'h-[150px] flex-wrap content-start items-start overflow-auto': isExpanded,
            'items-center': !isExpanded,
          })}
          style={{ scrollbarWidth: 'none' }}
        >
          <Image src={RULE_ICON} alt='rule' width={12} height={13} className='max-h-[22px]' />

          {!isExpanded && (
            <>
              <div className='f-11-400 flex w-[300px] items-center gap-1.5 overflow-hidden'>
                <span className='text-GRAY_1000 py-1 pl-1.5 pr-2'>If</span>
                <RuleStatement
                  index={0}
                  filterStatement={nonExpandedFilterStatement}
                  numberOfFilters={filterStatementLength}
                />
              </div>
              <span className='text-GRAY_1000 f-11-400'>...</span>
              <Button
                id='expand-rule'
                type={BUTTON_TYPES.TEXT_NAV}
                onClick={handleClickMore}
                childrenClassName='text-GRAY_1000 underline'
                size={SIZE_TYPES.SMALL}
              >
                +more
              </Button>
            </>
          )}
          {isExpanded && (
            <>
              <span className='text-GRAY_1000 h-fit py-1 pl-1.5 pr-2'>If</span>
              {filterStatement?.map((value, index) => (
                <RuleStatement
                  index={index}
                  filterStatement={value}
                  numberOfFilters={filterStatementLength}
                  key={`filter-statement-${index}`}
                />
              ))}
              <span className='text-GRAY_1000 h-fit py-1 pl-1.5 pr-2'>then apply tag</span>
              <span className='border-BORDER_GRAY_400 h-fit text-nowrap rounded-md border bg-white py-1 pl-1.5 pr-2'>
                {value}
              </span>
            </>
          )}
        </div>
      </div>
      {isExpanded && (
        <Button
          id='collapse-rule'
          type={BUTTON_TYPES.TEXT_NAV}
          onClick={handleClickCollapse}
          childrenClassName='text-GRAY_1000'
          size={SIZE_TYPES.SMALL}
        >
          Show less
        </Button>
      )}
    </div>
  );
};

export default RuleCard;
