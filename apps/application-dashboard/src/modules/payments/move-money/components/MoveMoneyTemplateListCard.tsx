import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { inter } from '@/constants/common.constants';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { cn } from '@/utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type MoveMoneyTemplateListCardProps = {
  template: TemplateDetailsType;
  onSelect: (template: TemplateDetailsType) => void;
  className?: string;
};

const MoveMoneyTemplateListCard = forwardRef<HTMLDivElement, MoveMoneyTemplateListCardProps>(
  ({ template, onSelect, className }, ref) => {
    const [isHover, setIsHover] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const sourceAccount = template?.details?.[0]?.source_account;
    const destinationAccount = template?.details?.[0]?.destination_account;

    useEffect(() => {
      if (isHover && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();

        setTooltipPosition({
          top: rect.top + window.scrollY,
          left: rect.right + window.scrollX + 20, // 8px offset from the element
        });
      }
    }, [isHover]);

    return (
      <div
        ref={ref}
        onClick={() => onSelect(template)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={cn(
          'flex items-center gap-1.5 text-GRAY_900 px-2.5 py-2 rounded-md hover:bg-GRAY_100 cursor-pointer',
          className,
        )}
      >
        <SvgSpriteLoader id='file-06' size={14} />
        <div className='f-12-500 text-GRAY_950 grow'>{template?.name}</div>
        <SvgSpriteLoader id='send-03' size={14} />
        {isHover &&
          createPortal(
            <div
              className={cn('fixed z-50 bg-white border border-GRAY_400 rounded-md p-2.5 shadow-lg', inter.className)}
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
              }}
            >
              <div className='flex flex-col gap-3 min-w-[185px]'>
                <div>
                  <div className='f-11-400 text-GRAY_700 mb-0.5'>Source Account</div>
                  <div className='f-12-500 text-GRAY_950'>{`${sourceAccount?.account_name}  ${MASK_DOTS} ${sourceAccount?.account_number.slice(-4)}`}</div>
                </div>
                <div>
                  <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient</div>
                  <div className='f-12-500 text-GRAY_950'>{destinationAccount?.account_name}</div>
                </div>
                <div>
                  <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient Account</div>
                  <div className='f-12-500 text-GRAY_950'>{`${destinationAccount?.account_name}  ${MASK_DOTS} ${destinationAccount?.account_number.slice(-4)}`}</div>
                </div>
                <div className='f-11-400 text-GRAY_800 pt-1.5 border-t border-GRAY_400'>
                  Created by {template?.created_by}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

MoveMoneyTemplateListCard.displayName = 'MoveMoneyTemplateListCard';

export default MoveMoneyTemplateListCard;
