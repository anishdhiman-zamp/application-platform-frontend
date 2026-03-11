import { useMemo } from 'react';
import { generateAvatarSvg } from '@/utils/pixelArtGenerator';

interface ProvisioningScreenProps {
  takingLonger?: boolean;
  hasError?: boolean;
  userName?: string;
}

export const ProvisioningScreen = ({
  takingLonger = false,
  hasError = false,
  userName = '',
}: ProvisioningScreenProps) => {
  const avatarSvg = useMemo(() => generateAvatarSvg(userName), [userName]);

  const heading = hasError
    ? 'Something went wrong setting up your workspace.'
    : takingLonger
      ? 'Taking a bit longer than usual\u2026'
      : 'Getting things ready\u2026';

  const body = hasError ? (
    <>Please try again later.</>
  ) : takingLonger ? (
    <>
      We&rsquo;ll drop you an email once it&rsquo;s done.
      <br />
      Feel free to close this tab.
    </>
  ) : (
    <>Just a moment. You&rsquo;ll be in shortly.</>
  );

  return (
    <div className='flex w-full max-w-[520px] flex-col'>
      <img
        className='mb-10 h-16 w-16'
        src={`data:image/svg+xml,${encodeURIComponent(avatarSvg)}`}
        alt={`${userName}'s avatar`}
      />
      <h2 className='text-GRAY_1000 mb-3 font-[family-name:var(--font-funnel-display)] text-4xl leading-tight font-light whitespace-nowrap'>
        {heading}
      </h2>
      <p className='text-GRAY_700 text-sm leading-relaxed'>{body}</p>
    </div>
  );
};
