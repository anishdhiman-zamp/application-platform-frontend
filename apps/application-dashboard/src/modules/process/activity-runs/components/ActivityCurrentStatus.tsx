import { TooltipV2 } from '@zamp-platform/ui';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { ensureUTCTimestamp } from 'utils/common';
import TabStatusIcon from '@/modules/process/common/TabStatusIcon';
import type { MapAny } from '@/types/commonTypes';

type ActivityCurrentStatusProps = {
  value: {
    message: string;
    sender_type: string;
  };
  data: MapAny;
};

const ActivityCurrentStatus = ({ value, data }: ActivityCurrentStatusProps) => {
  const message = value?.message;

  const getFormattedDate = (timestamp: string) => {
    if (!timestamp) return '';

    return format(new Date(ensureUTCTimestamp(timestamp)), DATE_FORMATS.DD_MMM);
  };

  return (
    <div className='flex w-full items-center justify-between gap-x-2'>
      <div className='flex min-w-0 items-center gap-2'>
        <TabStatusIcon
          status={data.status as ACTIVITY_RUN_STATUS}
          fillColor={STATUS_ICON_COLOR_MAPPING[data.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor}
          strokeColor={STATUS_ICON_COLOR_MAPPING[data.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor}
        />
        <span className='bg-GRAY_400 h-px w-2 shrink-0 rounded-full' />
        <TooltipV2 tooltipBody={message} asChildTrigger tooltipClassName='max-w-[600px]' showOnlyWhenTruncated>
          <p className='f-13-500 text-GRAY_950 min-w-0 flex-1 truncate'>{message}</p>
        </TooltipV2>
      </div>
      <div className='flex items-center gap-2'>
        <p className='f-13-450 text-GRAY_900'>{getFormattedDate(data?.activity_updated_at ?? data?.updated_at)}</p>
      </div>
    </div>
  );
};

export default ActivityCurrentStatus;
