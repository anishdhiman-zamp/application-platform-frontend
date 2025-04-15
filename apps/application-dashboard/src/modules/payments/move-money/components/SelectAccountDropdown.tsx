import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { DEFAULT_BANK } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import MoveMoneyTemplateListCard from 'modules/payments/move-money/components/MoveMoneyTemplateListCard';
import { MASK_DOTS, MOVE_MONEY_PAYMENT_TYPE_OPTIONS } from 'modules/payments/payments.constant';
import { AccountDetailsType, MOVE_MONEY_PAYMENT_TYPE, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES } from 'types/common/components';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
// import { Tabs } from '@/components/common/tabs/Tabs';
import CommonWrapper from '@/components/commonWrapper';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
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

  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState('');
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(true);
  const [currentTab, setCurrentTab] = useState<MenuItem>(MOVE_MONEY_PAYMENT_TYPE_OPTIONS[0]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
  };

  const handleAccountSelect = (account: AccountDetailsType) => {
    setSearchValue(account?.account_name);
    onAccountSelect?.(account);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const handleTemplateSelect = (template: TemplateDetailsType) => {
    setSearchValue(template.name);
    onTemplateSelect?.(template);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const { filteredAccounts, templates } = useMemo(() => {
    if (isSearchActive) {
      const filteredAccounts = accountsList.filter((val) =>
        val?.account_name?.toLowerCase()?.includes(searchValue?.toLowerCase()),
      );
      const templates = templateList.filter((val) => val?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()));

      return { filteredAccounts, templates };
    }

    return { filteredAccounts: accountsList, templates: templateList };
  }, [isSearchActive, searchValue, accountsList, templateList]);

  const dropdownHeight = useMemo(() => {
    if (!isShowMenu) return 0;
    if (
      currentTab.value === MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS &&
      filteredAccounts?.length > 0 &&
      filteredAccounts?.length <= 8
    )
      return 36 * filteredAccounts?.length + 82;
    if (currentTab.value === MOVE_MONEY_PAYMENT_TYPE.TEMPLATES && templates?.length > 0 && templates?.length <= 8)
      return 31 * templates?.length + 84;

    return 390;
  }, [isShowMenu, filteredAccounts, templates, currentTab]);

  const onSearchBlur = () => {
    setIsSearchActive(false);
    setIsShowMenu(false);
  };

  useOnClickOutside(containerRef, onSearchBlur);

  const onSearchFocus = () => {
    setIsShowMenu(true);
  };

  const onClickSelectedAccount = () => {
    setSearchValue('');
    setIsSearchActive(true);
    setIsShowMenu(true);
  };

  const handleTabSelect = (option?: string) => {
    if (option) setCurrentTab({ value: option, label: option });
  };

  useEffect(() => {
    if (shouldReset) {
      setSearchValue('');
      setIsShowMenu(false);
    }
  }, [shouldReset]);

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
      setIsSearchActive(true);
      setIsShowMenu(true);
    }
  }, [autoFocus]);

  if (isLoading) {
    return (
      <>
        {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
        <div className='rounded-md border border-GRAY_500 bg-white p-2'>
          <SkeletonElement className='w-full h-6' />
        </div>
      </>
    );
  }

  const getDropdownBody = () => {
    switch (currentTab.value) {
      case MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS: {
        return (
          <div className='p-1 flex-1 overflow-y-auto'>
            {filteredAccounts.map((account, index) => (
              <AccountWithLogo
                key={`${account?.account_number}_${index}`}
                className='hover:bg-GRAY_100 rounded-md !p-2.5'
                name={`${snakeCaseToSentenceCase(account?.account_name)}   ${MASK_DOTS}  ${account?.account_number_last_four_characters}`}
                onClick={() => handleAccountSelect(account)}
                logo={DEFAULT_BANK}
              />
            ))}
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
              {templates.map((template) => (
                <MoveMoneyTemplateListCard key={template.id} template={template} onSelect={handleTemplateSelect} />
              ))}
            </CommonWrapper>
          </div>
        );
      }
    }
  };

  return (
    <div>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div
        className={cn('rounded-md border border-GRAY_500 bg-white cursor-pointer', {
          'border-GRAY_400 overflow-y-hidden overflow-x-visible': !isShowMenu,
          'border-GRAY_500': isShowMenu,
          '!cursor-not-allowed bg-GRAY_100': disabled,
        })}
        ref={containerRef}
      >
        {!disabled && (!accountDetails?.account_name || isSearchActive) ? (
          <div className='flex items-center gap-1.5 px-3'>
            <Input
              tabIndex={0}
              inputRef={inputRef}
              id='ADD_ACCOUNT_SEARCH_BANK'
              onFocus={onSearchFocus}
              size={SIZE_TYPES.MEDIUM}
              autoFocus={autoFocus}
              value={isSearchActive ? searchValue : accountDetails?.account_name}
              disabled={!!contact_id || disabled}
              onChange={handleSearch}
              className='f-13-450 grow'
              focusClassNames='!px-0'
              placeholder='Search account name, number'
            />
            <DropdownToggle isShowMenu={isShowMenu} setIsShowMenu={setIsShowMenu} />
          </div>
        ) : (
          <AccountWithLogo
            className={cn('rounded-md !p-2.5', {
              'bg-BACKGROUND_GRAY_2': disabled,
            })}
            name={snakeCaseToSentenceCase(accountDetails?.account_name ?? '')}
            onClick={!disabled ? onClickSelectedAccount : undefined}
            logo={DEFAULT_BANK}
            subtitle={accountDetails?.account_name}
          />
        )}
        <div
          style={{
            height: dropdownHeight,
          }}
          className='transition-all duration-200 flex flex-col'
        >
          {showTemplate && (
            <div className='px pt-3'>
              <Tabs onValueChange={handleTabSelect} className='' defaultValue={currentTab.value as string}>
                <div className='px-3'>
                  <TabsList className='grid w-full grid-cols-2'>
                    {MOVE_MONEY_PAYMENT_TYPE_OPTIONS.map((tab, idx) => (
                      <TabsTrigger key={idx} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <TabsContent className='max-h-[314px] overflow-y-scroll' value={currentTab.value as string}>
                  {getDropdownBody()}
                </TabsContent>
              </Tabs>
            </div>
          )}
          <div className='border-t border-GRAY_400 px-1'>
            <div
              className='flex px-2.5 gap-1.5 f-12-500 py-2 items-center cursor-pointer rounded-md'
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
