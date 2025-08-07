import { FC, useEffect, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { COLORS } from 'constants/colors';
import { useOnClickOutside } from 'hooks';
import { cn } from 'utils/common';
import { AsyncDropdownPropsType } from 'components/asyncDropdown/asyncDropdown.types';
import { KEY_CODES } from 'components/multiSelectInput/multiSelectInput.types';

const AsyncDropdown: FC<AsyncDropdownPropsType> = ({
  onOpen,
  onClose,
  isOpen,
  onDelete,
  onChange,
  options,
  selectedValue,
  showDelete,
  isHoveredDropdown,
  setIsHoveredDropdown,
  wrapperClassName,
  parentWrapperClassName,
  showSelectedIcon,
  selectedOptionClassName,
  isOverflowStyle,
}) => {
  const [dropdownTop, setDropdownTop] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  useOnClickOutside(dropdownRef, onClose);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const rect = buttonRef?.current.getBoundingClientRect();

      setDropdownTop(rect.bottom - 40);
    }
  }, [isOpen, options?.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyEvent = e.key;

      if (keyEvent === KEY_CODES.ESCAPE && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={() => setIsHoveredDropdown && setIsHoveredDropdown(true)}
      onMouseLeave={() => setIsHoveredDropdown && setIsHoveredDropdown(false)}
    >
      <div
        className={cn(
          'f-12-400 flex h-10 cursor-pointer items-center justify-between gap-0 py-3 pl-4',
          parentWrapperClassName,
        )}
        onClick={handleToggleDropdown}
        ref={buttonRef}
      >
        {selectedValue?.label}
        {typeof isHoveredDropdown !== 'undefined' && (
          <div className='ml-1'>
            <SvgSpriteLoader
              id={isOpen ? 'chevron-up' : 'chevron-down'}
              iconCategory={ICON_SPRITE_TYPES.ARROWS}
              width={12}
              height={12}
              color={isHoveredDropdown ? COLORS.GRAY_1000 : COLORS.WHITE}
            />
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className={cn(
            'border-GRAY_50 shadow-table-filter-menu absolute right-0 z-1000 flex max-w-[170px] min-w-max flex-col rounded-md border bg-white p-1',
            wrapperClassName,
          )}
          style={{
            top: `${isOverflowStyle ? dropdownTop : 40}px`,
          }}
        >
          {options.map((role) => (
            <div
              key={role.value}
              className={cn(
                'hover:bg-GRAY_100 flex cursor-pointer flex-col rounded-md py-2 pr-2 pl-2.5',
                role.value === selectedValue?.value && selectedOptionClassName,
              )}
              onClick={() => onChange(role)}
            >
              <span className='f-12-500 text-GRAY_1000 flex items-start justify-between'>
                {role?.label}
                {showSelectedIcon && role?.value === selectedValue?.value && (
                  <SvgSpriteLoader
                    id='check'
                    iconCategory={ICON_SPRITE_TYPES.GENERAL}
                    width={14}
                    height={14}
                    color={COLORS.GRAY_900}
                  />
                )}
              </span>
              {!!role?.desc && <span className='f-10-500 text-GRAY_700 mt-1.5'>{role?.desc}</span>}
            </div>
          ))}
          {showDelete && (
            <span
              className='f-12-500 text-RED_700 border-DIVIDER_GRAY flex cursor-pointer items-center gap-1.5 border-t px-2.5 py-2'
              onClick={onDelete}
            >
              <SvgSpriteLoader
                id='trash-04'
                iconCategory={ICON_SPRITE_TYPES.GENERAL}
                width={12}
                height={12}
                color={COLORS.RED_700}
              />
              Remove
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AsyncDropdown;
