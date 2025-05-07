import { forwardRef, KeyboardEvent, ReactNode } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DEFAULT_BANK, ICON_SPRITE_TYPES } from 'constants/icons';
import Image from 'next/image';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { BANK_NAME_ICON_MAPPING } from '@/modules/widgets/Pivot/pivot.constants';

interface AccountWithLogoCardProps {
  name?: string | ReactNode;
  logo?: string;
  subtitle?: string | ReactNode;
  accountNumber?: string;
  onClick?: defaultFnType;
  className?: string;
  subtitleClassName?: string;
  tabIndex?: number;
  currencyCode?: string;
  logoSize?: number;
}

const AccountWithLogo = forwardRef<HTMLDivElement, AccountWithLogoCardProps>(
  (
    {
      name = '',
      logo,
      subtitle = '',
      accountNumber = '',
      className,
      subtitleClassName = '',
      onClick,
      tabIndex = 0,
      currencyCode = '',
      logoSize,
    },
    ref,
  ) => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ENTER) onClick?.();
    };

    const iconSize = logoSize || subtitle ? 24 : 14;

    return (
      <div
        ref={ref}
        onClick={onClick}
        onKeyDown={onKeyPress}
        tabIndex={tabIndex}
        className={cn(
          'outline-0 flex items-center p-3',
          onClick ? 'cursor-pointer hover:bg-BACKGROUND_SECONDARY' : '',
          className,
          subtitle ? 'gap-3' : 'gap-1.5',
        )}
      >
        {(logo || currencyCode) && (
          <div
            className='flex justify-center items-center rounded-full'
            style={{ minWidth: iconSize, width: iconSize, height: iconSize }}
          >
            {!currencyCode ? (
              <Image
                src={BANK_NAME_ICON_MAPPING[logo as keyof typeof BANK_NAME_ICON_MAPPING]?.icon ?? DEFAULT_BANK}
                height={iconSize}
                width={iconSize}
                alt='bank icon'
              />
            ) : (
              <SvgSpriteLoader
                id={currencyCode}
                iconCategory={ICON_SPRITE_TYPES.FIAT_CURRENCIES}
                size={iconSize ?? 32}
              />
            )}
          </div>
        )}
        <div>
          <div className='flex gap-2 f-12-450'>
            {name} {accountNumber}
          </div>
          {!!subtitle && <div className={cn('text-GRAY_800 f-11-400 mt-1', subtitleClassName)}>{subtitle}</div>}
        </div>
      </div>
    );
  },
);

AccountWithLogo.displayName = 'AccountWithLogo';

export default AccountWithLogo;
