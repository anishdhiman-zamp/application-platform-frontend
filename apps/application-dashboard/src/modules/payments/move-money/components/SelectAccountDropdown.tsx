import { ChangeEvent, FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_BANK } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import MoveMoneyTemplateListCard from 'modules/payments/move-money/components/MoveMoneyTemplateListCard';
import { MASK_DOTS, MOVE_MONEY_PAYMENT_TYPE_OPTIONS } from 'modules/payments/payments.constant';
import { AccountDetailsType, MOVE_MONEY_PAYMENT_TYPE, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import TabsV2 from '@/components/common/tabs/TabsV2';
import CommonWrapper from '@/components/commonWrapper';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import Input from 'components/common/input';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  templateList?: TemplateDetailsType[];
  accountsList: AccountDetailsType[];
  onAccountSelect?: (val: AccountDetailsType) => void;
  onTemplateSelect?: (val: TemplateDetailsType) => void;
  accountDetails?: AccountDetailsType;
  shouldReset?: boolean;
  label?: string;
  hasSubtitle?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  showTemplate?: boolean;
  setCreateTemplateType?: (type: MOVE_MONEY_TYPE | null) => void;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({
  autoFocus,
  accountsList = [],
  templateList = [],
  onAccountSelect,
  onTemplateSelect,
  accountDetails,
  shouldReset = false,
  label,
  disabled = false,
  isLoading = false,
  showTemplate = false,
  setCreateTemplateType,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const accountRefs = useRef<(HTMLDivElement | null)[]>([]);
  const templateRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState('');
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>(MOVE_MONEY_PAYMENT_TYPE_OPTIONS[0].value);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const accountName = useMemo(() => {
    return `${snakeCaseToSentenceCase(accountDetails?.account_name ?? '')} ${MASK_DOTS} ${accountDetails?.masked_account_number}`;
  }, [accountDetails]);

  const isInputEnabled = useMemo(() => {
    return !disabled && (!accountDetails?.account_name || showSearch);
  }, [disabled, accountDetails?.account_name, showSearch]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
    setShowSearch(true);
  };

  const handleAccountSelect = (account: AccountDetailsType) => {
    setSearchValue(account?.account_name);
    onAccountSelect?.(account);
    setIsShowMenu(false);
    setIsSearchActive(false);
    setShowSearch(false);
  };

  const handleTemplateSelect = (template: TemplateDetailsType) => {
    setSearchValue(template?.name);
    onTemplateSelect?.(template);
    setIsShowMenu(false);
    setIsSearchActive(false);
    setShowSearch(false);
  };

  const { filteredAccounts, templates } = useMemo(() => {
    if (isSearchActive) {
      const filteredAccounts = accountsList.filter((val) =>
        val?.account_name?.toLowerCase()?.includes(searchValue?.toLowerCase()),
      );
      const templates = templateList?.filter((val) => val?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()));

      return { filteredAccounts, templates };
    }

    return { filteredAccounts: accountsList, templates: templateList };
  }, [isSearchActive, showSearch, searchValue, accountsList, templateList]);

  const dropdownHeight = useMemo(() => {
    if (!isShowMenu) return 0;
    if (
      (currentTab === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS && filteredAccounts?.length === 0) ||
      (currentTab === MOVE_MONEY_PAYMENT_TYPE.TEMPLATES && templates?.length === 0)
    )
      return 120;
    if (
      currentTab === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS &&
      filteredAccounts?.length > 0 &&
      filteredAccounts?.length <= 8
    )
      return 36 * filteredAccounts?.length + (showTemplate ? 82 : 16);
    if (currentTab === MOVE_MONEY_PAYMENT_TYPE.TEMPLATES && templates?.length > 0 && templates?.length <= 8)
      return 31 * templates?.length + 84;

    return showTemplate ? 390 : 334;
  }, [isShowMenu, filteredAccounts, templates, currentTab]);

  const onSearchBlur = () => {
    setIsSearchActive(false);
    setIsShowMenu(false);
    setShowSearch(false);
  };

  useOnClickOutside(containerRef, onSearchBlur);

  const onSearchFocus = () => {
    setIsShowMenu(true);
    setIsSearchActive(true);
    setShowSearch(true);
    inputRef.current?.focus();
  };

  const onFocus = () => {
    setIsShowMenu(true);
    setIsSearchActive(false);
    setShowSearch(true);
    inputRef.current?.focus();
  };

  const onClickSelectedAccount = () => {
    setSearchValue('');
    setIsSearchActive(false);
    setIsShowMenu(true);
    setShowSearch(true);
  };

  const handleTabSelect = (option?: string) => {
    if (option) {
      setCurrentTab(option);
      setHoveredIndex(0);
    }
  };

  useEffect(() => {
    if (shouldReset) {
      setSearchValue('');
      setIsShowMenu(false);
    }
  }, [shouldReset]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const keyEvent = e.key;
    const currentList = currentTab === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS ? filteredAccounts : templates;
    const currentRefs = currentTab === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS ? accountRefs : templateRefs;

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
      if (currentTab === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS) {
        handleAccountSelect(currentList[hoveredIndex] as AccountDetailsType);
      } else {
        handleTemplateSelect(currentList[hoveredIndex] as TemplateDetailsType);
      }
    } else if (keyEvent === KEYBOARD_KEYS.ESCAPE) {
      setIsShowMenu(false);
      setHoveredIndex(null);
    }
  };

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
      setIsSearchActive(false);
      setIsShowMenu(true);
      setShowSearch(true);
    }
  }, [autoFocus]);

  if (isLoading) {
    return (
      <>
        {label && <div className={cn('text-GRAY_900 f-12-500', showTemplate ? 'mb-2' : 'mb-0')}>{label}</div>}
        <div className='rounded-md border border-GRAY_500 bg-white p-2'>
          <SkeletonElement className='w-full h-6' />
        </div>
      </>
    );
  }

  const getDropdownBody = () => {
    switch (currentTab) {
      case MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS: {
        return (
          <div className='p-1 flex-1 overflow-y-auto'>
            <CommonWrapper
              isNoData={filteredAccounts?.length === 0}
              noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No accounts found</div>}
            >
              {filteredAccounts.map((account, index) => (
                <div key={`${account?.account_number}_${index}`} onMouseEnter={() => setHoveredIndex(index)}>
                  <AccountWithLogo
                    className={cn('hover:bg-GRAY_100 rounded-md !p-2.5', {
                      'bg-GRAY_100': hoveredIndex === index,
                    })}
                    tabIndex={-1}
                    name={`${snakeCaseToSentenceCase(account?.account_name)}  ${MASK_DOTS}  ${account?.masked_account_number}`}
                    onClick={() => handleAccountSelect(account)}
                    logo={DEFAULT_BANK}
                  />
                </div>
              ))}
            </CommonWrapper>
          </div>
        );
      }
      case MOVE_MONEY_PAYMENT_TYPE.TEMPLATES: {
        return (
          <div className='flex flex-col gap-0.5 p-1 flex-1 max-w-[298px]'>
            <CommonWrapper
              isNoData={templates?.length === 0}
              noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No templates found</div>}
            >
              {templates?.map((template, index) => (
                <div key={template?.id} onMouseEnter={() => setHoveredIndex(index)}>
                  <MoveMoneyTemplateListCard
                    ref={(el) => {
                      templateRefs.current[index] = el;
                    }}
                    template={template}
                    onSelect={handleTemplateSelect}
                    className={cn({
                      'bg-GRAY_100': hoveredIndex === index,
                    })}
                  />
                </div>
              ))}
            </CommonWrapper>
          </div>
        );
      }
    }
  };

  return (
    <div onFocus={onFocus}>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div
        className={cn('rounded-md border border-GRAY_500 bg-white cursor-pointer outline-none', {
          'border-GRAY_400 overflow-y-hidden overflow-x-visible': !isShowMenu,
          'border-GRAY_500': isShowMenu,
          '!cursor-not-allowed bg-GRAY_100': disabled,
        })}
        ref={containerRef}
      >
        {isInputEnabled ? (
          <div className='flex items-center gap-1.5 px-3'>
            <Input
              tabIndex={0}
              inputRef={inputRef}
              id='ADD_ACCOUNT_SEARCH_BANK'
              onFocus={onSearchFocus}
              size={SIZE_TYPES.MEDIUM}
              autoFocus={autoFocus}
              value={showSearch ? searchValue : accountDetails?.account_name}
              disabled={!!contact_id || disabled}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className='f-13-450 grow'
              focusClassNames='!px-0'
              placeholder='Search account name, number'
            />
            <DropdownToggle isShowMenu={isShowMenu} setIsShowMenu={setIsShowMenu} />
          </div>
        ) : (
          <div onFocus={onFocus}>
            <AccountWithLogo
              className={cn('rounded-md !p-2.5', {
                'bg-BACKGROUND_GRAY_2': disabled,
              })}
              name={accountName}
              onClick={!disabled ? onClickSelectedAccount : undefined}
              logo={DEFAULT_BANK}
              subtitle={accountDetails?.account_name}
            />
          </div>
        )}
        <div
          style={{
            height: dropdownHeight,
          }}
          tabIndex={-1}
          className={cn('transition-all duration-200 flex flex-col', {
            'opacity-0 pointer-events-none': !isShowMenu,
          })}
        >
          {
            <div className={cn('px', { 'pt-3': showTemplate })}>
              <TabsV2
                tabsList={MOVE_MONEY_PAYMENT_TYPE_OPTIONS}
                currentTab={currentTab}
                onValueChange={handleTabSelect}
                contentClassName='max-h-[314px] overflow-y-scroll f-12-450'
                listClassName='grid w-full grid-cols-2 w-[calc(100%-16px)] mx-auto'
                triggerClassName='f-12-450'
                hideTabs={!showTemplate}
                tabIndex={-1}
              >
                {getDropdownBody()}
              </TabsV2>
            </div>
          }
          {showTemplate && (
            <div className='border-t border-GRAY_400 px-1'>
              <div
                className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center cursor-pointer rounded-md'
                onClick={() => setCreateTemplateType?.(MOVE_MONEY_TYPE.SINGLE_TRANSFER)}
              >
                <SvgSpriteLoader size={12} id='plus' />
                Create template
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectBeneDropdown;
