import { useMemo } from 'react';
import { generateAvatarSvg } from '@/modules/setup-workspace/utils/avatarGenerator';

interface ProvisioningScreenProps {
  takingLonger: boolean;
  userName: string;
}

export const ProvisioningScreen = ({ takingLonger, userName }: ProvisioningScreenProps) => {
  const avatarSvg = useMemo(() => generateAvatarSvg(userName), [userName]);

  return (
    <div className='flex w-full max-w-[520px] flex-col'>
      <div
        className='mb-10 h-[63px] w-[63px] [&>svg]:h-full [&>svg]:w-full'
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
      <h2
        className='text-GRAY_1000 mb-3 whitespace-nowrap'
        style={{
          fontSize: 36,
          lineHeight: 1.3,
          fontFamily: "'Funnel Display', serif",
          fontWeight: 300,
        }}
      >
        {takingLonger ? 'Taking a bit longer than usual\u2026' : 'Getting things ready\u2026'}
      </h2>
      <p className='text-GRAY_700 text-sm' style={{ lineHeight: 1.6 }}>
        {takingLonger ? (
          <>
            We&rsquo;ll drop you an email once it&rsquo;s done.
            <br />
            Feel free to close this tab.
          </>
        ) : (
          <>Just a moment. You&rsquo;ll be in shortly.</>
        )}
      </p>
    </div>
  );
};
