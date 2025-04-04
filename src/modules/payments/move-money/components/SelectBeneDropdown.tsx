import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import RecipientCard from 'modules/payments/move-money/components/RecipientCard';
import { RECIPIENT_LIST } from 'modules/payments/move-money/move-money.dummy';
import { MOVE_MONEY_PAYMENT_TYPE_OPTIONS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_PAYMENT_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES, TAB_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import Input from 'components/common/input';
import { Tabs } from 'components/common/tabs/Tabs';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  onSelect: (recipient: MenuItem) => void;
  shouldReset?: boolean;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({ autoFocus, onSelect, shouldReset = false }) => {
  const counterParties = RECIPIENT_LIST;
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<MenuItem | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState<MenuItem>(MOVE_MONEY_PAYMENT_TYPE_OPTIONS[0]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const filterData = useMemo(
    () =>
      isSearchActive
        ? counterParties.filter((val) => val?.label?.toLowerCase()?.includes(searchValue?.toLowerCase()))
        : counterParties,
    [isSearchActive, searchValue],
  );
  const dropdownHeight = useMemo(() => {
    if (!isShowMenu) return 0;
    if (filterData?.length > 0 && filterData?.length <= 8) return 32 * filterData?.length + 123;

    return 394;
  }, [isShowMenu, filterData]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
  };

  const handleTabSelect = (option?: MenuItem) => {
    if (option) setCurrentTab(option);
  };

  const handleRecipientSelect = (recipient: MenuItem) => {
    setSearchValue(recipient.label);
    setSelectedRecipient(recipient);
    onSelect(recipient);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const onSearchBlur = () => {
    setIsSearchActive(false);
    setIsShowMenu(false);
  };

  const getDropdownBody = () => {
    switch (currentTab.value) {
      case MOVE_MONEY_PAYMENT_TYPE.RECIPIENT: {
        return (
          <div className='p-1'>
            <div className='max-h-[270px] overflow-y-auto'>
              {filterData.map((recipient, index) => (
                <RecipientCard
                  key={`${recipient.value}_${index}`}
                  recipient={recipient}
                  handleRecipientSelect={handleRecipientSelect}
                />
              ))}
            </div>
          </div>
        );
      }
      case MOVE_MONEY_PAYMENT_TYPE.TEMPLATES: {
        return <div>TEMPLATES</div>;
      }
    }
  };

  useOnClickOutside(containerRef, onSearchBlur);

  useEffect(() => {
    if (shouldReset) {
      setSearchValue('');
      setIsShowMenu(true);
    }
  }, [shouldReset]);

  return (
    <div
      className={cn('rounded-md border border-GRAY_500 bg-white overflow-hidden shadow-selectAccountDropdown', {
        'border-GRAY_400': !isShowMenu,
        'border-GRAY_500': isShowMenu,
      })}
      ref={containerRef}
    >
      <div className='flex items-center gap-1.5 pr-3 w-full'>
        <Input
          tabIndex={0}
          id='ADD_ACCOUNT_SEARCH_BANK'
          onFocus={() => setIsShowMenu(true)}
          size={SIZE_TYPES.MEDIUM}
          autoFocus={autoFocus}
          value={isSearchActive ? searchValue : selectedRecipient?.label}
          disabled={!!contact_id}
          onChange={handleSearch}
          focusClassNames=''
          placeholder='Search recipient or template'
          inputWrapperClassName='tw-w-full'
        />

        <DropdownToggle isShowMenu={isShowMenu} setIsShowMenu={setIsShowMenu} />
      </div>
      <div
        style={{
          height: dropdownHeight,
        }}
        className='transition-all duration-200'
      >
        <div className='px-3 pt-3'>
          <Tabs
            list={MOVE_MONEY_PAYMENT_TYPE_OPTIONS}
            onSelect={handleTabSelect}
            wrapperStyle='border-white !w-auto'
            tabItemWrapperStyle='!w-auto'
            id='ACCOUNTS_TABS'
            scrollWrapperClassName='pb-0'
            type={TAB_TYPES.OUTLINE}
          />
        </div>
        {getDropdownBody()}
        <div className='border-t border-GRAY_400 p-1 '>
          <div className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center hover:bg-GRAY_100 cursor-pointer rounded-md'>
            <SvgSpriteLoader size={12} id='plus' />
            New recipient
          </div>
          <div className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center cursor-pointer hover:bg-GRAY_100 rounded-md'>
            <SvgSpriteLoader size={12} id='plus' />
            Create template
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectBeneDropdown;
