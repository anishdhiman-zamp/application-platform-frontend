import { ChangeEvent, FC, memo } from 'react';
import { cn } from 'utils/common';

export type TextareaPropsType = {
  id: string;
  name?: string;
  tooltip?: string;
  label?: string;
  value?: any;
  type?: string;
  placeHolder?: string;
  className?: string;
  error?: string;
  maxLength?: number;
  isDisabled?: boolean;
  style?: React.CSSProperties;
  onChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (evt: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (evt: React.FocusEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  errBorderClassName?: string;
  errClassName?: string;
  textAreaStyle?: string;
  textAreaRef?: React.RefObject<HTMLTextAreaElement>;
  tabIndex?: number;
};

const Textarea: FC<TextareaPropsType> = ({
  id,
  name,
  value,
  placeHolder = 'Type here',
  className,
  textAreaStyle = 'h-[116px] p-4 text-TEXT_GRAY_1 disabled:opacity-60  focus:outline-0',
  onChange,
  autoFocus = false,
  error,
  errBorderClassName,
  tabIndex = 0,
  textAreaRef,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
  };

  return (
    <div className='w-full'>
      <textarea
        tabIndex={tabIndex}
        id={id}
        name={name}
        className={cn(
          `placeholder:text-BORDER_6 placeholder:tracking-[0.03em] w-full outline-none border border-GRAY_400 rounded-md`,
          className,
          textAreaStyle,
          error ? errBorderClassName || 'border-ERROR_RED' : 'border-BORDER_7 border-b-BORDER_6',
        )}
        placeholder={placeHolder}
        onChange={handleChange}
        value={value}
        ref={textAreaRef}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default memo(Textarea);
