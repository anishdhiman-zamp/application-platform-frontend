import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from '@zamp-platform/ui';
import { EnterIcon } from 'modules/onboarding/components/EnterIcon';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

type Props = {
  children: ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  error?: string | null;
  feedback?: ReactNode;
  autoFocus?: boolean;
};

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
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Global Enter key listener so submit works even without input focus
  const onSubmitRef = useRef(onSubmit);
  const disabledRef = useRef(disabled);

  onSubmitRef.current = onSubmit;
  disabledRef.current = disabled;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_KEYS.ENTER || disabledRef.current) return;

      // Don't submit if a popover/dialog is open (e.g. avatar picker)
      if (document.querySelector('[data-radix-popper-content-wrapper]') || document.querySelector('[role="dialog"]'))
        return;

      e.preventDefault();
      onSubmitRef.current();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className='w-full max-w-[520px]'>
      <div className='mb-5'>{children}</div>

      <div className='mb-6'>
        <label className='text-GRAY_700 mb-0.5 block text-xs font-normal'>{label}</label>
        <div className='flex items-end gap-3'>
          <input
            ref={inputRef}
            type='text'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className='text-GRAY_1000 flex-1 border-none bg-transparent p-0 font-[family-name:var(--font-funnel-display)] text-5xl leading-[1.4] outline-none'
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
