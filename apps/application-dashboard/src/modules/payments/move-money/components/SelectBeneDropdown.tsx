import { ChangeEvent, FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import MoveMoneyTemplateListCard from 'modules/payments/move-money/components/MoveMoneyTemplateListCard';
import RecipientCard from 'modules/payments/move-money/components/RecipientCard';
import { TEMPLATES } from 'modules/payments/move-money/move-money.dummy';
import { MOVE_MONEY_PAYMENT_TYPE_OPTIONS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_PAYMENT_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES, TAB_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { RecipientDetailsType, TemplateDetailsType } from '@/types/api/paymentApi.types';
import Input from 'components/common/input';
import { Tabs } from 'components/common/tabs/Tabs';
import CommonWrapper from 'components/commonWrapper';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  onSelect: (recipient: RecipientDetailsType) => void;
  shouldReset?: boolean;
  label?: string;
  showTemplate?: boolean;
  isLoading?: boolean;
  defaultSelectedRecipient?: RecipientDetailsType | null;
  templateDetails?: TemplateDetailsType | null;
  recipientList?: RecipientDetailsType[];
  disabled?: boolean;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({
  autoFocus,
  onSelect,
  shouldReset = false,
  label,
  showTemplate = false,
  templateDetails,
  recipientList,
  isLoading = false,
  defaultSelectedRecipient,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const recipientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const templateRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { contact_id } = router.query;
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(templateDetails?.name || '');
  const [selectedRecipient, setSelectedRecipient] = useState<MenuItem | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState<MenuItem>({
    label: 'Recipients',
    value: MOVE_MONEY_PAYMENT_TYPE.RECIPIENT,
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { counterParties, templates } = useMemo(() => {
    if (isSearchActive) {
      const counterParties = recipientList?.filter(
        (recipient) => recipient?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()) ?? [],
      );
      const templates = TEMPLATES.filter((val) => val?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()));

      return { counterParties: counterParties ?? [], templates: templates ?? [] };
    }

    return { counterParties: recipientList ?? [], templates: TEMPLATES };
  }, [isSearchActive, searchValue, recipientList]);

  const dropdownHeight = useMemo(() => {
    if (!isShowMenu) return 0;
    if (currentTab.value === MOVE_MONEY_PAYMENT_TYPE.RECIPIENT && counterParties?.length <= 8) {
      if (counterParties?.length === 0) return 92;

      return 32 * counterParties?.length + 10;
    }
    if (
      showTemplate &&
      currentTab.value === MOVE_MONEY_PAYMENT_TYPE.TEMPLATES &&
      templates?.length > 0 &&
      templates?.length <= 8
    )
      return 32 * templates?.length + 123;

    return 364;
  }, [isShowMenu, counterParties, templates, currentTab]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
  };

  const handleTabSelect = (option?: MenuItem) => {
    if (option) setCurrentTab(option);
  };

  const handleRecipientSelect = (recipient: RecipientDetailsType) => {
    setSearchValue(recipient?.name);
    setSelectedRecipient({ label: recipient?.name, value: recipient?.id });
    onSelect(recipient);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const handleTemplateSelect = (template: TemplateDetailsType) => {
    setSearchValue(template?.name);
    setSelectedRecipient({ label: template?.name, value: template?.id });
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const onSearchBlur = () => {
    setIsSearchActive(false);
    setIsShowMenu(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const keyEvent = e.key;
    const currentList = currentTab.value === MOVE_MONEY_PAYMENT_TYPE.RECIPIENT ? counterParties : templates;
    const currentRefs = currentTab.value === MOVE_MONEY_PAYMENT_TYPE.RECIPIENT ? recipientRefs : templateRefs;

    if (keyEvent === KEYBOARD_KEYS.TAB) return;

    if (keyEvent === KEYBOARD_KEYS.ARROW_DOWN || keyEvent === KEYBOARD_KEYS.ARROW_UP) {
      e.preventDefault();
      setIsShowMenu(true);

      if (currentList.length === 0) return;

      if (hoveredIndex === null || hoveredIndex >= currentList.length) {
        const newIndex = keyEvent === KEYBOARD_KEYS.ARROW_DOWN ? 0 : currentList.length - 1;

        setHoveredIndex(newIndex);
        currentRefs.current[newIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        setHoveredIndex((prev) => {
          if (prev === null) return keyEvent === KEYBOARD_KEYS.ARROW_DOWN ? 0 : currentList.length - 1;
          const newIndex =
            keyEvent === KEYBOARD_KEYS.ARROW_DOWN
              ? prev !== currentList.length - 1
                ? prev + 1
                : prev
              : prev !== 0
                ? prev - 1
                : prev;
          const finalIndex = newIndex < 0 ? currentList.length - 1 : newIndex >= currentList.length ? 0 : newIndex;

          currentRefs.current[finalIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

          return finalIndex;
        });
      }
    } else if (keyEvent === KEYBOARD_KEYS.ENTER && hoveredIndex !== null && currentList[hoveredIndex]) {
      e.preventDefault();
      if (currentTab.value === MOVE_MONEY_PAYMENT_TYPE.RECIPIENT) {
        handleRecipientSelect(currentList[hoveredIndex] as RecipientDetailsType);
      } else {
        handleTemplateSelect(currentList[hoveredIndex] as TemplateDetailsType);
      }
    } else if (keyEvent === KEYBOARD_KEYS.ESCAPE) {
      setIsShowMenu(false);
      setHoveredIndex(null);
    }
  };

  useEffect(() => {
    if (templateDetails) {
      handleTemplateSelect(templateDetails);
    }
  }, [templateDetails]);

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
      setIsSearchActive(true);
      setIsShowMenu(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (defaultSelectedRecipient) {
      handleRecipientSelect(defaultSelectedRecipient);
    } else {
      setIsSearchActive(false);
      setIsShowMenu(true);
      setSelectedRecipient(null);
      setSearchValue('');
    }
  }, [defaultSelectedRecipient]);

  const getDropdownBody = () => {
    switch (currentTab.value) {
      case MOVE_MONEY_PAYMENT_TYPE.RECIPIENT: {
        return (
          <div className='p-1 flex-1'>
            <div className='max-h-[320px] overflow-y-auto'>
              <CommonWrapper
                isNoData={counterParties?.length === 0}
                noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No recipients found</div>}
              >
                {counterParties.map((recipient, index) => (
                  <RecipientCard
                    key={`${recipient.id}_${index}`}
                    ref={(el) => {
                      recipientRefs.current[index] = el;
                    }}
                    className={cn({
                      'bg-GRAY_100': hoveredIndex === index,
                    })}
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
              {templates?.map((template, index) => (
                <MoveMoneyTemplateListCard
                  key={`${template?.id}_${index}`}
                  ref={(el) => {
                    templateRefs.current[index] = el;
                  }}
                  className={cn({
                    'bg-GRAY_100': hoveredIndex === index,
                  })}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
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
      setSelectedRecipient(null);
    }
  }, [shouldReset]);

  if (isLoading) {
    return (
      <div>
        {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
        <div className='rounded-md border border-GRAY_500 bg-white p-2'>
          <SkeletonElement className='w-full h-6' />
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div
        className={cn('rounded-md border border-GRAY_500 bg-white', {
          'border-GRAY_400 overflow-hidden': !isShowMenu,
          'border-GRAY_500 shadow-selectAccountDropdown': isShowMenu,
          '!bg-BACKGROUND_GRAY_2 cursor-not-allowed pointer-events-none': disabled,
        })}
        ref={containerRef}
      >
        <div className='flex items-center gap-1.5 pr-3 w-full cursor-pointer'>
          <Input
            tabIndex={0}
            id='ADD_ACCOUNT_SEARCH_BANK'
            onFocus={() => !disabled && setIsShowMenu(true)}
            size={SIZE_TYPES.MEDIUM}
            inputRef={inputRef}
            autoFocus={autoFocus}
            value={isSearchActive ? searchValue : selectedRecipient?.label}
            disabled={!!contact_id}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            focusClassNames=''
            className='f-13-450 grow'
            placeholder='Search recipient or template'
            inputFontClassName={cn('f-13-450', {
              '!bg-BACKGROUND_GRAY_2': disabled,
            })}
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
          {showTemplate && (
            <div className='border-t border-GRAY_400 p-1 '>
              <div className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center hover:bg-GRAY_100 cursor-pointer rounded-md'>
                <SvgSpriteLoader size={12} id='plus' />
                New recipient
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectBeneDropdown;
