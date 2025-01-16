import React, { FC } from 'react';
import { COLORS } from 'constants/colors';
import { MenuOptionProps } from 'types/common/components/dropdown/dropdown.types';
import { defaultFn } from 'types/commonTypes';
import { CheckBox } from 'components/common/Checkbox';
import { Radio } from 'components/common/Radio';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const leadingIconClassBySize = 'tw-w-6 tw-h-6';
const leadingIconClass = 'tw-flex tw-justify-center tw-items-center tw-mr-4';
const leadingIconSizeClass = `${leadingIconClass} ${leadingIconClassBySize}`;
const selectedIconClass = 'tw-ml-auto';

export const MenuOption: FC<MenuOptionProps> = ({
  innerProps = {},
  isSelected = false,
  label,
  isMulti = false,
  data,
  spriteSelectedIcon = '',
  selectedIcon = null,
  containerClass = 'hover:tw-bg-BASE_SECONDARY first:tw-rounded-t-[10px] last:tw-rounded-b-[10px]',
  contentWrapper = 'tw-pl-2 tw-py-3 tw-w-full',
  wrapperClass = 'tw-p-2 tw-h-16 tw-flex tw-items-center',
  spriteSelectedIconColor = COLORS.GREEN_SECONDARY,
  onClick = defaultFn,
  labelOverrideClassName = 'f-16-400',
  checkboxClassName = 'tw-pr-[33px] tw-pl-[15px] tw-h-12',
  checkboxDisplayContainerClassName = 'tw-top-[15px] tw-left-[15px]',
  disabled = false,
  isRadio = false,
  radioWrapperStyle = '',
  radioDefaultStyle = '',
  radioSelectedStyle = '',
  radioStyle = '',
}) => (
  <div
    onClick={disabled ? undefined : onClick}
    className={containerClass}
    data-testid={`menu-option-container-${innerProps.id}`}
  >
    <div className={`${wrapperClass}`} data-testid={`menu-option-wrapper-${innerProps.id}`}>
      {isMulti && (
        <CheckBox
          checked={isSelected}
          onPress={defaultFn}
          id={innerProps.id}
          className={checkboxClassName}
          displayContainerClassName={checkboxDisplayContainerClassName}
          disabled={disabled}
        />
      )}
      {isRadio && (
        <Radio
          checked={isSelected}
          onSelect={defaultFn}
          id={innerProps.id}
          wrapperStyle={radioWrapperStyle}
          radioDefaultStyle={radioDefaultStyle}
          radioSelectedStyle={radioSelectedStyle}
          radioStyle={radioStyle}
        />
      )}
      <div
        className={`${contentWrapper} ${isMulti ? '' : 'tw-pl-4 tw-py-4'} tw-flex tw-items-center`}
        data-testid={`menu-option-content-${innerProps.id}`}
      >
        {data?.spriteIcon && (
          <div className={leadingIconSizeClass} data-testid={`menu-option-leading-icon-wrapper-${innerProps.id}`}>
            <SvgSpriteLoader id={data.spriteIcon} />
          </div>
        )}
        {data?.icon ?? null}
        {typeof label === 'string' ? (
          <span className={`tw-text-TEXT_PRIMARY ${labelOverrideClassName}`} id={`menu-option-${innerProps.id}`}>
            {label}
          </span>
        ) : (
          label
        )}
      </div>
      {!isMulti && spriteSelectedIcon && isSelected && (
        <div
          className={`${leadingIconSizeClass} ${selectedIconClass}`}
          data-testid={`menu-option-selected-icon-wrapper-${innerProps.id}`}
        >
          <SvgSpriteLoader id={spriteSelectedIcon} color={spriteSelectedIconColor} />
        </div>
      )}
      {!isMulti && isSelected && selectedIcon}
    </div>
  </div>
);
