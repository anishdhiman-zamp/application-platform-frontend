import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { Button, Input } from '@zamp-platform/ui';
import { EnterIcon } from 'modules/onboarding/components/EnterIcon';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { type defaultFnType } from '@/types/commonTypes';

export interface OnboardingInputStepInterface {
  children: ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: defaultFnType;
  disabled?: boolean;
  error?: string | null;
  feedback?: ReactNode;
  autoFocus?: boolean;
}

export const OnboardingInputStep = ({
  children,
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  disabled,
  error,
  feedback,
  autoFocus = true,
}: OnboardingInputStepInterface) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_KEYS.ENTER || disabled) return;

      // Don't submit if a popover/dialog is open (e.g. avatar picker)
      if (document.querySelector('[data-radix-popper-content-wrapper]') || document.querySelector('[role="dialog"]'))
        return;

      e.preventDefault();
      onSubmit();
    },
    [disabled, onSubmit],
  );

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <div className='w-full max-w-130'>
      <div className='mb-5'>{children}</div>

      <div className='mb-6'>
        <label className='text-GRAY_700 mb-0.5 block text-xs font-normal'>{label}</label>
        <div className='flex items-end gap-3'>
          <Input
            ref={(node) => {
              inputRef.current = node;
            }}
            type='text'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            wrapperClassName='flex-1'
            className='!font-funnel-display text-GRAY_1000 !placeholder:text-GRAY_400 !h-auto !rounded-none !border-none !bg-transparent !p-0 !text-5xl !leading-[1.4] shadow-none !outline-none focus:border-transparent focus:ring-0'
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={onSubmit}
            disabled={disabled}
            className='mb-4 h-auto w-auto shrink-0 p-0 hover:bg-transparent hover:opacity-70 active:scale-90 disabled:pointer-events-none disabled:opacity-40'
          >
            <EnterIcon />
          </Button>
        </div>
        {error && <p className='text-RED_600 mt-2 text-sm'>{error}</p>}
        {feedback}
      </div>
    </div>
  );
};
