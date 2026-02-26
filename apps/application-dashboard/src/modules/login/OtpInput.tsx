import { ClipboardEvent, forwardRef, KeyboardEvent, useImperativeHandle, useRef } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { KEYBOARD_KEYS } from 'constants/shortcuts';
import { OTP_LENGTH } from 'modules/login/login.constants';
import { processPastedOtp } from 'modules/login/otp.utils';

const defaultFn = () => {};

export type OtpInputHandle = {
  focusFirst: () => void;
};

type Props = {
  digits: string[];
  isError: boolean;
  isBusy: boolean;
  allFilled: boolean;
  onDigitChange: (index: number, value: string) => void;
  onDigitsReplace: (digits: string[]) => void;
  onClearMessage?: () => void;
  onSubmit?: () => void;
};

export const OtpInput = forwardRef<OtpInputHandle, Props>(
  (
    {
      digits,
      isError,
      isBusy,
      allFilled,
      onDigitChange,
      onDigitsReplace,
      onClearMessage = defaultFn,
      onSubmit = defaultFn,
    },
    ref,
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      focusFirst: () => inputRefs.current[0]?.focus(),
    }));

    const handleInput = (index: number, raw: string) => {
      const val = raw.replace(/[^0-9]/g, '').slice(0, 1);

      onDigitChange(index, val);
      onClearMessage();
      if (val && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.BACKSPACE && !digits[index] && index > 0) {
        onDigitChange(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === KEYBOARD_KEYS.ENTER && allFilled && !isBusy) {
        onSubmit();
      }
    };

    const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const result = processPastedOtp(digits, e.clipboardData.getData('text') || '', index, OTP_LENGTH);

      if (!result) return;

      onDigitsReplace(result.newDigits);
      onClearMessage();
      inputRefs.current[result.nextFocusIndex]?.focus();
    };

    return (
      <div className='mb-7 flex justify-center gap-2.5'>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            value={digit}
            onChange={(e) => handleInput(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={(e) => handlePaste(idx, e)}
            onFocus={(e) => e.target.select()}
            disabled={isBusy}
            className={cn(
              'text-GRAY_1000 h-14 w-12 rounded-xl border bg-white text-center text-[22px] font-semibold caret-transparent transition-all duration-250 outline-none',
              isError
                ? 'border-RED_600 focus:border-RED_600 shadow-[0_0_0_3px_rgba(220,38,38,0.08)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]'
                : digit
                  ? 'border-black/18 focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]'
                  : 'border-black/10 focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]',
            )}
          />
        ))}
      </div>
    );
  },
);

OtpInput.displayName = 'OtpInput';
