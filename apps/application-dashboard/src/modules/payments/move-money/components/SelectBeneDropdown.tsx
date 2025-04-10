import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import MoveMoneyTemplateListCard from 'modules/payments/move-money/components/MoveMoneyTemplateListCard';
import RecipientCard from 'modules/payments/move-money/components/RecipientCard';
import { RECIPIENT_LIST, TEMPLATES } from 'modules/payments/move-money/move-money.dummy';
import { MOVE_MONEY_PAYMENT_TYPE_OPTIONS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_PAYMENT_TYPE, MOVE_MONEY_TYPE, TemplateDetailsType } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES, TAB_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import Input from 'components/common/input';
import { Tabs } from 'components/common/tabs/Tabs';
import CommonWrapper from 'components/commonWrapper';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  onSelect: (recipient: MenuItem | TemplateDetailsType, isTemplate?: boolean) => void;
  shouldReset?: boolean;
  label?: string;
  showTemplate?: boolean;
  setCreateTemplateType?: (type: MOVE_MONEY_TYPE | null) => void;
  templateDetails?: TemplateDetailsType | null;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({
  autoFocus,
  onSelect,
  shouldReset = false,
  label,
  showTemplate = true,
  setCreateTemplateType,
  templateDetails,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState(templateDetails?.name || '');
  const [selectedRecipient, setSelectedRecipient] = useState<MenuItem | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState<MenuItem>(MOVE_MONEY_PAYMENT_TYPE_OPTIONS[0]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { counterParties, templates } = useMemo(() => {
    if (isSearchActive) {
      const counterParties = RECIPIENT_LIST.filter((val) =>
        val?.label?.toLowerCase()?.includes(searchValue?.toLowerCase()),
      );
      const templates = TEMPLATES.filter((val) => val?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()));

      return { counterParties, templates };
    }

    return { counterParties: RECIPIENT_LIST, templates: TEMPLATES };
  }, [isSearchActive, searchValue]);
  const dropdownHeight = useMemo(() => {
    if (!isShowMenu) return 0;
    if (
      currentTab.value === MOVE_MONEY_PAYMENT_TYPE.RECIPIENT &&
      counterParties?.length > 0 &&
      counterParties?.length <= 8
    )
      return 32 * counterParties?.length + 123;
    if (currentTab.value === MOVE_MONEY_PAYMENT_TYPE.TEMPLATES && templates?.length > 0 && templates?.length <= 8)
      return 32 * templates?.length + 123;

    return 394;
  }, [isShowMenu, counterParties, templates, currentTab]);

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

  const handleTemplateSelect = (template: TemplateDetailsType) => {
    setSearchValue(template.name);
    setSelectedRecipient({ label: template.name, value: template.id });
    onSelect(template, true);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const onSearchBlur = () => {
    setIsSearchActive(false);
    setIsShowMenu(false);
  };

  useEffect(() => {
    if (templateDetails) {
      handleTemplateSelect(templateDetails);
    }
  }, [templateDetails]);

  const getDropdownBody = () => {
    switch (currentTab.value) {
      case MOVE_MONEY_PAYMENT_TYPE.RECIPIENT: {
        return (
          <div className='p-1 flex-1'>
            <div className='max-h-[270px] overflow-y-auto'>
              <CommonWrapper
                isNoData={counterParties?.length === 0}
                noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No recipients found</div>}
              >
                {counterParties.map((recipient, index) => (
                  <RecipientCard
                    key={`${recipient.value}_${index}`}
                    recipient={recipient}
                    handleRecipientSelect={handleRecipientSelect}
                  />
                ))}
              </CommonWrapper>
            </div>
          </div>
        );
      }
      case MOVE_MONEY_PAYMENT_TYPE.TEMPLATES: {
        return (
          <div className='flex flex-col gap-0.5 p-1 flex-1'>
            <CommonWrapper
              isNoData={templates?.length === 0}
              noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No templates found</div>}
            >
              {templates.map((template) => (
                <MoveMoneyTemplateListCard key={template.id} template={template} onSelect={handleTemplateSelect} />
              ))}
            </CommonWrapper>
          </div>
        );
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
    <div>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div
        className={cn('rounded-md border border-GRAY_500 bg-white shadow-selectAccountDropdown', {
          'border-GRAY_400 overflow-hidden': !isShowMenu,
          'border-GRAY_500': isShowMenu,
        })}
        ref={containerRef}
      >
        <div className='flex items-center gap-1.5 pr-3 w-full cursor-pointer'>
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
          className='transition-all duration-200 flex flex-col'
        >
          {showTemplate && (
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
          )}
          {getDropdownBody()}
          <div className='border-t border-GRAY_400 p-1 '>
            <div className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center hover:bg-GRAY_100 cursor-pointer rounded-md'>
              <SvgSpriteLoader size={12} id='plus' />
              New recipient
            </div>
            <div
              className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center cursor-pointer hover:bg-GRAY_100 rounded-md'
              onClick={() => setCreateTemplateType?.(MOVE_MONEY_TYPE.SINGLE_TRANSFER)}
            >
              <SvgSpriteLoader size={12} id='plus' />
              Create template
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectBeneDropdown;
