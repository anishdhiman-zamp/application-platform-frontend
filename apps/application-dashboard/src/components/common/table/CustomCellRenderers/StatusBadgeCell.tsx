import { PAYMENT_STATUS_TYPES } from '@/modules/payments/payments.types';
import { cn } from '@/utils/common';

type StatusBadgeCellProps = {
  value: string;
};

const badgeStyles = {
  [PAYMENT_STATUS_TYPES.BLOCKED]: 'bg-RED_100 text-RED_800',
  [PAYMENT_STATUS_TYPES.FAILED]: 'bg-RED_100 text-RED_800',
  [PAYMENT_STATUS_TYPES.PENDING]: 'bg-ORANGE_100 text-ORANGE_800',
  [PAYMENT_STATUS_TYPES.SUCCEEDED]: 'bg-GREEN_100 text-GREEN_800',
  [PAYMENT_STATUS_TYPES.SENT_TO_BANK]: 'bg-BLUE_100 text-BLUE_800',
  [PAYMENT_STATUS_TYPES.APPROVAL_PENDING]: 'bg-ORANGE_100 text-ORANGE_800',
  [PAYMENT_STATUS_TYPES.REJECTED]: 'bg-RED_100 text-RED_800',
};

const StatusBadgeCell = ({ value }: StatusBadgeCellProps) => {
  return (
    <div
      className={cn(
        'f-11-500 inline-flex rounded-md px-1.5 py-1 capitalize',
        badgeStyles[value as keyof typeof badgeStyles],
      )}
    >
      {value}
    </div>
  );
};

export default StatusBadgeCell;
