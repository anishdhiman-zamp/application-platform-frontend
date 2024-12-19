import React from 'react';
import { SIZE } from 'constants/common.constants';
import { defaultFnType } from 'types/commonTypes';

const INPUT_SIZE_CLASSNAME = {
  [SIZE.SMALL]: 'h-8 text-base font-normal',
  [SIZE.MEDIUM]: 'h-10 text-base font-normal',
  [SIZE.LARGE]: 'h-12 text-base font-normal',
};

const errorClassName = 'border-red-700 !shadow-red-100';

type InputProps = {
  testId: string;
  label?: string;
  error?: string;
  size?: SIZE.SMALL | SIZE.MEDIUM | SIZE.LARGE;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
  required?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  tPlaceholder?: string | React.ReactNode; // Add a prop for the right label
  labelClassName?: string;
  inputClassName?: string;
  onClick?: defaultFnType;
};

const Input: React.FC<InputProps> = ({
  testId,
  label,
  error,
  type,
  placeholder,
  disabled,
  onChange,
  name,
  value = '',
  size = SIZE.MEDIUM,
  className = '',
  required,
  inputRef,
  tPlaceholder,
  labelClassName = '',
  inputClassName = '',
  onClick,
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {!!label && <span className={`text-xs font-medium text-grey-900 px-1.5 ${labelClassName}`}>{label}</span>}
      <div className='relative w-full'>
        <input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onClick={onClick}
          name={name}
          value={value}
          required={required}
          data-testid={testId}
          className={`w-full border border-grey-200 rounded-md text-black px-3 outline-none focus:shadow-inputOutline focus:border-grey-600 caret-blue-700 ${INPUT_SIZE_CLASSNAME[size]} ${error ? errorClassName : ''} ${disabled ? 'bg-grey-100' : ''} pr-1 ${inputClassName}`} // Added padding for the label
        />
        {!!tPlaceholder && (
          <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-grey-900'>
            {tPlaceholder}
          </span>
        )}
      </div>
      {!!error && <span className='text-11 font-normal text-red-700 px-1.5'>{error}</span>}
    </div>
  );
};

export default Input;
