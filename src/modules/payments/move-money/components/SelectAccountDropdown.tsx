import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_BANK } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { snakeCaseToSentenceCase } from 'utils/common';
import Input from 'components/common/input';

type SelectBeneDropdownProps = {
  autoFocus?: boolean;
  accountsList: AccountDetailsType[];
  onAccountSelect: (val: AccountDetailsType) => void;
  accountDetails: AccountDetailsType;
  shouldReset?: boolean;
  label?: string;
  hasSubtitle?: boolean;
};

const SelectBeneDropdown: FC<SelectBeneDropdownProps> = ({
  autoFocus,
  accountsList = [],
  onAccountSelect,
  accountDetails,
  shouldReset = false,
  label,
  hasSubtitle = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { contact_id } = router.query;

  const [searchValue, setSearchValue] = useState('');
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(true);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event?.target?.value);
    setIsSearchActive(true);
  };

  const handleRecipientSelect = (recipient: AccountDetailsType) => {
    setSearchValue(recipient.account_name);
    onAccountSelect(recipient);
    setIsShowMenu(false);
    setIsSearchActive(false);
  };

  const filterData = useMemo(() => {
    if (isSearchActive) {
      return accountsList.filter((val) => val?.account_name?.toLowerCase()?.includes(searchValue?.toLowerCase()));
    }

    return accountsList;
  }, [isSearchActive, searchValue]);
  const dropdownHeight = useMemo(() => {
    if (isShowMenu) {
      const beneficiaryHeight = (hasSubtitle ? 52 : 36) * filterData?.length;

      return filterData?.length > 0 && filterData?.length <= 6 ? beneficiaryHeight : 225;
    }

    return 0;
  }, [isShowMenu, filterData]);

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

  return (
    <div>
      {label && <div className='text-GRAY_900 f-12-500 mb-2'>{label}</div>}
      <div className='rounded-md border border-GRAY_500 bg-white overflow-hidden' ref={containerRef}>
        {!accountDetails?.account_name || isSearchActive ? (
          <div className='flex items-center gap-1.5 px-3'>
            <Input
              tabIndex={0}
              id='ADD_ACCOUNT_SEARCH_BANK'
              onFocus={onSearchFocus}
              size={SIZE_TYPES.MEDIUM}
              autoFocus={autoFocus}
              value={isSearchActive ? searchValue : accountDetails?.account_name}
              disabled={!!contact_id}
              onChange={handleSearch}
              className='f-13-450 grow'
              inputFontClassName='focus:!shadow-none border-none !px-3 placeholder:text-base focus:!border-none bg-white placeholder:!text-GRAY_500 placeholder:text-xs !px-0 w-full'
              placeholder='Search account name, number'
              inputWrapperClassName='tw-w-full'
            />
            <DropdownToggle isShowMenu={isShowMenu} setIsShowMenu={setIsShowMenu} />
          </div>
        ) : (
          <AccountWithLogo
            className='rounded-md !p-2.5'
            name={snakeCaseToSentenceCase(accountDetails?.account_name)}
            onClick={onClickSelectedAccount}
            logo={DEFAULT_BANK}
            subtitle={accountDetails?.account_balance}
          />
        )}
        <div
          style={{
            height: dropdownHeight,
          }}
          className='transition-all duration-200 overflow-y-auto'
        >
          <div className='p-1'>
            {filterData.map((recipient, index) => (
              <AccountWithLogo
                key={`${recipient.account_number}_${index}`}
                className='hover:bg-GRAY_100 rounded-md !p-2.5'
                name={snakeCaseToSentenceCase(recipient.account_name)}
                onClick={() => handleRecipientSelect(recipient)}
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
