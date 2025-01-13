import React, { FC, memo } from 'react';
import { InputProps } from 'types/common/components/input/input.types';
import InputField from 'components/common/input/InputField';
import { Label } from 'components/common/Label';
import { SupporterInfo } from 'components/common/SupporterInfo';

const Input: FC<InputProps> = ({
  labelProps = {},
  supporterInfoProps = {},
  inputWrapperClassName = 'w-full ',
  className = 'w-full',
  label = '',
  description = '',
  labelClassName = '',
  labelOverrideClassName = 'f-13-300 text-GRAY_500 mb-1.5 select-none',
  required,
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
