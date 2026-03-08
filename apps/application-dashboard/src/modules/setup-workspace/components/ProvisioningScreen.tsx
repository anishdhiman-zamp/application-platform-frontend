import { PixelFaceLoader } from 'modules/setup-workspace/components/PixelFaceLoader';

interface ProvisioningScreenProps {
  takingLonger: boolean;
}

export const ProvisioningScreen = ({ takingLonger }: ProvisioningScreenProps) => (
  <div className='flex w-full max-w-[520px] flex-col'>
    <div className='mb-10'>
      <PixelFaceLoader />
    </div>
    <h2
      className='mb-3'
      style={{
        fontSize: 48,
        lineHeight: 1.3,
        fontFamily: "'Funnel Display', serif",
        color: '#1a1a1a',
        fontWeight: 300,
      }}
    >
      {takingLonger ? 'Taking a bit longer than usual\u2026' : 'Getting things ready\u2026'}
    </h2>
    <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
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
