import { TemplateDetailsType } from '@/deprecated/apis/paymentApi.types';
import { MASK_DOTS } from '@/deprecated/modules/payments/payments.constant';
import { TEMPLATE_STATUS_TYPES } from '@/deprecated/modules/payments/payments.types';
import TemplateApprovalCard from '@/deprecated/modules/payments/templates/components/TemplateApprovalCard';
import { defaultFnType } from '@/types/commonTypes';
import { cn } from '@/utils/common';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { FC } from 'react';
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
        'pivot relative flex items-center gap-3 rounded-md bg-white px-1.5 py-2.5 transition-all duration-200',
        {
          'hover:bg-GRAY_50 cursor-pointer': !!onTemplateClick,
        },
      )}
      onClick={onTemplateClick}
    >
      <div className='bg-BLUE_200 flex h-6 w-6 items-center justify-center rounded-full'>
        <SvgSpriteLoader id='file-06' size={14} />
      </div>
      <div className='grow'>
        <div className='f-13-500 mb-1'>{template?.name}</div>
        <div className='f-12-400 divide-GRAY_400 border-GRAY_400 inline-flex gap-2 divide-x overflow-hidden rounded-sm border'>
          {source &&
            destination &&
            [source, destination].map((item, index) => (
              <div
                key={index}
                className={cn('border-GRAY_400 flex items-center gap-2 divide-x px-1.5 py-1', {
                  'border-l': index !== 0,
                })}
              >
                <div className='f-11-400 text-GRAY_700 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap'>
                  {index === 0 ? 'Source' : 'Recipient'}
                </div>
                <div className='f-11-450 flex items-center whitespace-nowrap'>
                  <div className='mr-1 max-w-[60px] overflow-hidden text-ellipsis'>{item?.account_name}</div>
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
