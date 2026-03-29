import { type FC, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntegrationCardContentProps {
  logo: string;
  displayName: string;
  description: string;
  showArrow?: boolean;
}

const IntegrationCardContentV2: FC<IntegrationCardContentProps> = ({
  logo,
  displayName,
  description,
  showArrow = true,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2'>
          <div className='relative flex h-6 w-6 flex-shrink-0 items-center justify-center'>
            {imgError || !logo ? (
              <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex h-full w-full items-center justify-center rounded'>
                {displayName?.charAt(0)?.toUpperCase()}
              </div>
            ) : (
              <img src={logo} alt={displayName} className='object-contain' onError={() => setImgError(true)} />
            )}
          </div>
          <span className='f-14-550 text-GRAY_1000'>{displayName}</span>
        </div>
        {showArrow && (
          <ArrowRight
            size={14}
            className='text-GRAY_700 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100'
          />
        )}
      </div>
      <p className='f-12-450 text-GRAY_700 line-clamp-3'>{description}</p>
    </div>
  );
};

export default IntegrationCardContentV2;
