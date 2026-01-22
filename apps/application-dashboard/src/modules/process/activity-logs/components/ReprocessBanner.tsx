import { FC } from 'react';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { RefreshCcw } from 'lucide-react';
import type { ReprocessingEventType } from '@/types/api/processApi.types';
import { ensureUTCTimestamp } from '@/utils/common';

interface ReprocessBannerProps {
  reprocessingEvent: ReprocessingEventType;
}

const ReprocessBanner: FC<ReprocessBannerProps> = ({ reprocessingEvent }) => {
  return (
    <div className='f-13-450 bg-BG_GRAY_2 border-GRAY_400 mb-10 flex w-full items-center justify-center gap-2 border-y p-4 text-gray-900'>
      <RefreshCcw size={12} />
      Task was rerun at {format(new Date(ensureUTCTimestamp(reprocessingEvent.created_at)), DATE_FORMATS.HH_MM_A)} to
      apply relevant KB changes. Reverted earlier actions where possible.
    </div>
  );
};

export default ReprocessBanner;
