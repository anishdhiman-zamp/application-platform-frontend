import { forwardRef, useImperativeHandle, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { OTP_LENGTH } from 'modules/login/login.constants';

export type OtpInputHandle = {
  focusFirst: () => void;
};

type Props = {
  digits: string[];
  isError: boolean;
  isBusy: boolean;
  onDigitsReplace: (digits: string[]) => void;
  onClearMessage?: () => void;
  onSubmit?: () => void;
};

export const OtpInput = forwardRef<OtpInputHandle, Props>(
  ({ digits, isError, isBusy, onDigitsReplace, onClearMessage, onSubmit }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focusFirst: () => {
        const input = containerRef.current?.querySelector('input');

        input?.focus();
      },
    }));

    const value = digits.join('');

    const handleChange = (newValue: string) => {
      const cleaned = newValue.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
      const newDigits = Array(OTP_LENGTH)
        .fill('')
        .map((_, i) => cleaned[i] || '');

      onDigitsReplace(newDigits);
      onClearMessage?.();
    };

    const handleComplete = () => {
      onSubmit?.();
    };

    return (
      <div ref={containerRef} className='mb-7 flex justify-center'>
        <InputOTP
          maxLength={OTP_LENGTH}
          value={value}
          onChange={handleChange}
          onComplete={handleComplete}
          disabled={isBusy}
        >
          <InputOTPGroup className='gap-2.5'>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={cn(
                  'bg-BG_WHITE h-14 w-12 rounded-xl border text-center text-[22px] font-semibold caret-transparent outline-none',
                  isError
                    ? 'border-RED_600 data-[active=true]:border-RED_600 shadow-[0_0_0_3px_rgba(220,38,38,0.08)] data-[active=true]:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]'
                    : digits[index]
                      ? 'border-black/18 data-[active=true]:border-black/30 data-[active=true]:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]'
                      : 'border-black/10 data-[active=true]:border-black/30 data-[active=true]:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]',
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
    );
  },
);

OtpInput.displayName = 'OtpInput';
