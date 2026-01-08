import { CSSProperties, FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from 'utils/common';

type CopiedTooltipProps = {
  style?: CSSProperties;
  show: boolean;
  className?: string;
  buttonId?: string;
  wrapperOverrideClassName?: string;
};

const CopiedTooltip: FC<CopiedTooltipProps> = ({
  show = false,
  className = '',
  buttonId = 'COPY_CONTENT_BUTTON',
  wrapperOverrideClassName = 'rounded-[5px]! py-1! px-6! h-6! top-14',
}) =>
  show && (
    <Button className={cn('absolute flex', wrapperOverrideClassName, className)} testId={buttonId}>
      <div className='f-12-300 flex'>
        <SvgSpriteLoader id='check' className='mr-1 min-w-[15px]' width={15} height={15} />
        Copied!
      </div>
    </Button>
  );

export default CopiedTooltip;
