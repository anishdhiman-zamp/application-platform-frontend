import React, { FC, memo } from 'react';
import { SIZE_TYPES } from 'types/common/components';
import { InputFieldProps } from 'types/common/components/input/input.types';
import { defaultFn } from 'types/commonTypes';
import InputTag from 'components/common/atoms/inputTag';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const sizeClassName = {
  //TODO: Update other classes once design component is ready
  [SIZE_TYPES.XLARGE]: {
    inputClassBySize: 'tw-h-[60px] tw-py-6 tw-pl-16 tw-pr-[58px]',
    inputClassWithoutIcons: 'tw-h-[60px] tw-px-4 tw-py-4.5',
    inputClassWithoutLeadingIcon: 'tw-h-[60px] tw-py-6 tw-pl-4.5 tw-pr-[58px]',
    inputClassWithoutTrailingIcon: 'tw-h-[60px] tw-py-6 tw-pl-16 tw-pr-4.5',
    leadingIconClassBySize: 'tw-left-6 tw-w-6 tw-h-6',
    trailingIconClassBySize: 'tw-right-6 tw-w-6 tw-h-6',
    inputFontClassName: 'f-28-400',
  },
  [SIZE_TYPES.LARGE]: {
    inputClassBySize: 'tw-h-[60px] tw-py-6 tw-pl-16 tw-pr-[58px]',
    inputClassWithoutIcons: 'tw-h-[60px] tw-px-4 tw-py-4.5',
    inputClassWithoutLeadingIcon: 'tw-h-[60px] tw-py-6 tw-pl-4.5 tw-pr-[58px]',
    inputClassWithoutTrailingIcon: 'tw-h-[60px] tw-py-6 tw-pl-16 tw-pr-4.5',
    leadingIconClassBySize: 'tw-left-6 tw-w-6 tw-h-6',
    trailingIconClassBySize: 'tw-right-6 tw-w-6 tw-h-6',
    inputFontClassName: 'f-24-300',
  },
  [SIZE_TYPES.MEDIUM]: {
    inputClassBySize: 'tw-h-[51px] tw-py-4 tw-pl-[60px] tw-pr-[54px]',
    inputClassWithoutIcons: 'tw-h-[51px] tw-py-[14px] tw-px-2.5 ',
    inputClassWithoutLeadingIcon: 'tw-h-[51px] tw-py-4 tw-pl-2.5 tw-pr-[54px]',
    inputClassWithoutTrailingIcon: 'tw-h-[51px] tw-py-4 tw-pl-[60px] tw-pr-2.5',
    leadingIconClassBySize: 'tw-left-6 tw-w-5 tw-h-5',
    trailingIconClassBySize: 'tw-right-6 tw-w-5 tw-h-5',
    inputFontClassName: 'f-18-300 ',
  },
  [SIZE_TYPES.SMALL]: {
    inputClassBySize: 'tw-h-[42px] tw-py-3 tw-pl-14 tw-pr-[50px]',
    inputClassWithoutIcons: 'tw-h-[42px] tw-py-3 tw-px-2',
    inputClassWithoutLeadingIcon: 'tw-h-[42px] tw-py-3 tw-pl-2 tw-pr-[50px]',
    inputClassWithoutTrailingIcon: 'tw-h-[42px] tw-py-3 tw-pl-14 tw-pr-2',
    leadingIconClassBySize: 'tw-left-6 tw-w-4 tw-h-4',
    trailingIconClassBySize: 'tw-right-6 tw-w-4 tw-h-4',
    inputFontClassName: 'f-15-300 ',
  },
  [SIZE_TYPES.XSMALL]: {
    inputClassBySize: 'tw-h-9 tw-py-1.5 tw-pl-2 tw-pr-[30px]',
    inputClassWithoutIcons: 'tw-h-9 tw-py-2.5 tw-px-2',
    inputClassWithoutLeadingIcon: 'tw-h-9 tw-py-1.5 tw-pl-1 tw-pr-[30px]',
    inputClassWithoutTrailingIcon: 'tw-h-9 tw-py-2 tw-pl-6 tw-pr-2',
    leadingIconClassBySize: 'tw-left-2 tw-w-3 tw-h-3',
    trailingIconClassBySize: 'tw-right-2 tw-w-3 tw-h-3',
    inputFontClassName: 'f-13-300',
  },
};

const InputField: FC<InputFieldProps> = ({
  size = SIZE_TYPES.LARGE,
  leadingIconClassName = 'tw-absolute tw-flex tw-justify-center tw-items-center',
  trailingIconClassName = 'tw-absolute tw-flex tw-justify-center tw-items-center',
  inputFieldWrapperClassName = 'tw-flex tw-items-center tw-relative ',
  handleLeadingAction = defaultFn,
  handleTrailingAction = defaultFn,
  leadingIconProps = {},
  trailingIconProps = {},
  leadingNode = null,
  ...rest
}) => {
  const {
    inputClassBySize,
    inputClassWithoutIcons,
    inputClassWithoutLeadingIcon,
    inputClassWithoutTrailingIcon,
    leadingIconClassBySize,
    trailingIconClassBySize,
  } = sizeClassName[size];
  const inputSizeClassName =
    leadingIconProps.id && trailingIconProps.id
      ? inputClassBySize
      : leadingIconProps.id
        ? inputClassWithoutTrailingIcon
        : trailingIconProps.id
          ? inputClassWithoutLeadingIcon
          : inputClassWithoutIcons;
  const leadingIconSizeClass = `${leadingIconClassName} ${leadingIconClassBySize}`;
  const trailingIconSizeClass = `${trailingIconClassName} ${trailingIconClassBySize}`;

  return (
    <div className={inputFieldWrapperClassName}>
      {leadingIconProps?.id && leadingIconProps?.iconCategory && (
        <div className={leadingIconSizeClass} role='button' onClick={handleLeadingAction}>
          <SvgSpriteLoader
            id={leadingIconProps?.id}
            iconCategory={leadingIconProps?.iconCategory}
            {...leadingIconProps}
          />
        </div>
      )}

      {leadingNode}

      <InputTag
        inputSizeClassName={inputSizeClassName}
        inputFontClassName={sizeClassName[size].inputFontClassName}
        {...rest}
      />

      {trailingIconProps?.id && trailingIconProps?.iconCategory && (
        <div className={trailingIconSizeClass} role='button' onClick={handleTrailingAction}>
          <SvgSpriteLoader
            id={trailingIconProps?.id}
            iconCategory={trailingIconProps?.iconCategory}
            {...trailingIconProps}
          />
        </div>
      )}
    </div>
  );
};

export default memo(InputField);
