import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_BANK } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import Input from 'components/common/input';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  accountsList: AccountDetailsType[];
  onAccountSelect?: (val: AccountDetailsType) => void;
  accountDetails?: AccountDetailsType;
  shouldReset?: boolean;
  label?: string;
  hasSubtitle?: boolean;
  disabled?: boolean;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({
  autoFocus,
  accountsList = [],
  onAccountSelect,
  accountDetails,
  shouldReset = false,
  label,
  hasSubtitle = false,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState('');
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(true);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
  };

  const handleAccountSelect = (account: AccountDetailsType) => {
    setSearchValue(account.account_name);
    onAccountSelect?.(account);
    setIsShowMenu(false);
    setIsSearchActive(false);
    console.log('handleAccountSelect');
  };

  const filteredAccounts = useMemo(() => {
    if (isSearchActive) {
      return accountsList.filter((val) => val?.account_name?.toLowerCase()?.includes(searchValue?.toLowerCase()));
    }

    return accountsList;
  }, [isSearchActive, searchValue]);

  const dropdownHeight = useMemo(() => {
    if (disabled) return 0;

    if (isShowMenu) {
      const beneficiaryHeight = (hasSubtitle ? 52 : 36) * filteredAccounts?.length;

      return filteredAccounts?.length > 0 && filteredAccounts?.length <= 6 ? beneficiaryHeight : 225;
    }

    return 0;
  }, [isShowMenu, filteredAccounts, disabled]);

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

  return (
    <div>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div
        className={cn('rounded-md border border-GRAY_500 bg-white overflow-hidden cursor-pointer', {
          'border-GRAY_400': !isShowMenu,
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
          className='transition-all duration-200 overflow-y-auto'
        >
          <div className='p-1'>
            {filteredAccounts.map((account, index) => (
              <AccountWithLogo
                key={`${account.account_number}_${index}`}
                className='hover:bg-GRAY_100 rounded-md !p-2.5'
                name={`${snakeCaseToSentenceCase(account.account_name)}   ${MASK_DOTS}  ${account.account_number.slice(-4)}`}
                onClick={() => handleAccountSelect(account)}
                logo={DEFAULT_BANK}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectBeneDropdown;
