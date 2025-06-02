import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { TEMPLATE_STATUS_TYPES } from 'modules/payments/payments.types';
import TemplateApprovalCard from 'modules/payments/templates/components/TemplateApprovalCard';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { defaultFnType } from '@/types/commonTypes';
import { cn } from '@/utils/common';
interface TemplateCardProps {
  template: TemplateDetailsType;
  onSendClick?: defaultFnType;
  onTemplateClick?: defaultFnType;
}

const TemplateCard: FC<TemplateCardProps> = ({ onSendClick, template, onTemplateClick }) => {
  const source = template?.details[0]?.source_account;
  const destination = template?.details[0]?.destination_account;
  const isApprovalPending =
    template?.status === TEMPLATE_STATUS_TYPES.DRAFTED || template?.status === TEMPLATE_STATUS_TYPES.PENDING;

  const handleSendClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSendClick?.();
  };

  return (
    <div
      className={cn(
        'pivot relative flex items-center gap-3 px-1.5 py-2.5 rounded-md  transition-all duration-200 bg-white',
        {
          'cursor-pointer hover:bg-GRAY_50': !!onTemplateClick,
        },
      )}
      onClick={onTemplateClick}
    >
      <div className='w-6 h-6 flex items-center justify-center bg-BLUE_200 rounded-full'>
        <SvgSpriteLoader id='file-06' size={14} />
      </div>
      <div className='grow'>
        <div className='f-13-500 mb-1'>{template?.name}</div>
        <div className='f-12-400 inline-flex divide-x gap-2 divide-GRAY_400 overflow-hidden border border-GRAY_400 rounded-[4px]'>
          {source &&
            destination &&
            [source, destination].map((item, index) => (
              <div
                key={index}
                className={cn('flex items-center gap-2 py-1 px-1.5 divide-x  border-GRAY_400', {
                  'border-l': index !== 0,
                })}
              >
                <div className='f-11-400 text-GRAY_700 whitespace-nowrap text-ellipsis overflow-hidden max-w-[100px]'>
                  {index === 0 ? 'Source' : 'Recipient'}
                </div>
                <div className='f-11-450  whitespace-nowrap flex items-center'>
                  <div className='text-ellipsis overflow-hidden max-w-[60px] mr-1'>{item?.account_name}</div>
                  <div>{`${MASK_DOTS} ${item?.masked_account_number}`}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {!!onSendClick &&
        (isApprovalPending ? (
          <TemplateApprovalCard
            canApprove={template?.can_approve}
            approvalId={template?.approval_id || ''}
            onViewAllApprovals={onTemplateClick}
          />
        ) : (
          <SvgSpriteLoader id='send-03' className='z-10' onClick={handleSendClick} size={14} />
        ))}
    </div>
  );
};

export default TemplateCard;
