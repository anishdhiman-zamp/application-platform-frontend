import React, { FC, memo } from 'react';
import { InputProps } from 'types/common/components/input/input.types';
import InputField from 'components/common/molecules/InputField';
import { Label } from 'components/common/molecules/Label';
import { SupporterInfo } from 'components/common/molecules/SupporterInfo';



const Input: FC<InputProps> = ({
  labelProps = {},
  supporterInfoProps = {},
  inputWrapperClassName = 'tw-w-full ',
  className = 'tw-w-full',
  label = '',
  description = '',
  labelClassName = '',
  labelOverrideClassName = 'f-13-300 tw-text-GRAY_500 tw-mb-1.5 tw-select-none',
  ...rest
}) => (
  <div className={className}>
    {(label || description) && (
      <Label
        titleClassName={`${labelOverrideClassName} ${labelClassName}`}
        title={label}
        description={description}
        {...labelProps}
      />
    )}
    <div className={inputWrapperClassName}>
      <InputField {...rest} />
    </div>

    {supporterInfoProps.showSupportInfo && <SupporterInfo {...supporterInfoProps} />}
  </div>
);

export default memo(Input);
