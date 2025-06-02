import { forwardRef, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import TooltipV2 from '@/components/common/TooltipV2';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { cn, snakeCaseToSentenceCase } from '@/utils/common';

type MoveMoneyTemplateListCardProps = {
  template: TemplateDetailsType;
  onSelect: (template: TemplateDetailsType) => void;
  className?: string;
};

const MoveMoneyTemplateListCard = forwardRef<HTMLDivElement, MoveMoneyTemplateListCardProps>(
  ({ template, onSelect, className }, ref) => {
    const sourceAccount = template?.details?.[0]?.source_account;
    const destinationAccount = template?.details?.[0]?.destination_account;
    const sourceAccountName = useMemo(() => {
      return `${snakeCaseToSentenceCase(sourceAccount?.account_name ?? '')} ${MASK_DOTS} ${sourceAccount?.account_number.slice(-4)}`;
    }, [sourceAccount]);
    const destinationAccountName = useMemo(() => {
      return `${snakeCaseToSentenceCase(destinationAccount?.account_name ?? '')} ${MASK_DOTS} ${destinationAccount?.account_number.slice(-4)}`;
    }, [destinationAccount]);

    return (
      <TooltipV2
        side={SIDE_OPTIONS.RIGHT}
        key={template?.id}
        className='w-full'
        tooltipClassName='bg-transparent shadow-table-filter-menu bg-white border border-GRAY_400 rounded-md p-2.5 ml-3'
        tooltipBody={
          <div>
            <div className='flex flex-col gap-3 min-w-[185px]'>
              <div>
                <div className='f-11-400 text-GRAY_700 mb-0.5'>Source Account</div>
                <div className='f-12-500 text-GRAY_950'>{sourceAccountName}</div>
              </div>
              <div>
                <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient</div>
                <div className='f-12-500 text-GRAY_950'>{destinationAccount?.account_name}</div>
              </div>
              <div>
                <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient Account</div>
                <div className='f-12-500 text-GRAY_950'>{destinationAccountName}</div>
              </div>
              <div className='f-11-400 text-GRAY_800 pt-1.5 border-t border-GRAY_400'>
                Created by {template?.created_by}
              </div>
            </div>
          </div>
        }
      >
        <div
          ref={ref}
          onClick={() => onSelect(template)}
          className={cn(
            'flex  gap-1.5 text-GRAY_900 px-2.5 py-2 rounded-md hover:bg-GRAY_100 cursor-pointer w-full',
            className,
          )}
        >
          <SvgSpriteLoader id='file-06' size={14} />
          <div className='f-12-500 text-GRAY_950 grow text-left'>{template?.name}</div>
          <SvgSpriteLoader id='send-03' size={14} />
        </div>
      </TooltipV2>
    );
  },
);

MoveMoneyTemplateListCard.displayName = 'MoveMoneyTemplateListCard';

export default MoveMoneyTemplateListCard;
