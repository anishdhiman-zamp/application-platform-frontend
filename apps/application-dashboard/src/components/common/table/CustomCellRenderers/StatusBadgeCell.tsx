import { cn } from '@/utils/common';

type StatusBadgeCellProps = {
  value: string;
};

const badgeStyles = {
  proposed: 'bg-ORANGE_100 text-ORANGE_800',
  failed: 'bg-RED_100 text-RED_800',
  created: 'bg-ORANGE_100 text-ORANGE_800',
  succeeded: 'bg-GREEN_100 text-GREEN_800',
  approved: 'bg-GREEN_100 text-GREEN_800',
  processed: 'bg-GREEN_100 text-GREEN_800',
  partner_queued: 'bg-ORANGE_100 text-ORANGE_800',
  blocked: 'bg-RED_100 text-RED_800',
};

const StatusBadgeCell = ({ value }: StatusBadgeCellProps) => {
  return (
    <div
      className={cn(
        'inline-flex rounded-md f-11-500 px-1.5 py-1 capitalize',
        badgeStyles[value as keyof typeof badgeStyles],
      )}
    >
      {value}
    </div>
  );
};

export default StatusBadgeCell;
