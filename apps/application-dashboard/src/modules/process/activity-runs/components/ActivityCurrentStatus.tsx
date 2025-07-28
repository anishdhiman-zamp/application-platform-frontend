import { DATE_FORMATS } from '@zamp-platform/utils';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { snakeCaseToSentenceCase } from 'utils/common';
import { VALUE_FORMAT_TYPE } from '@/components/common/table/table.types';
import { getFormattedDate } from '@/modules/data/data.utils';
import ArtifactPill from '@/modules/process/activity-runs/components/ArtifactPill';
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
  const artifactsData = data?.artifacts_metadata;

  const message = value?.message;

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-2'>
        <TabStatusIcon
          status={data.status as ACTIVITY_RUN_STATUS}
          fillColor={STATUS_ICON_COLOR_MAPPING[data.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor}
          strokeColor={STATUS_ICON_COLOR_MAPPING[data.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.strokeColor}
        />
        <span className='bg-GRAY_400 h-px w-2 rounded-full' />
        <p className='f-13-500 text-GRAY_950 max-w-[400px] truncate'>{snakeCaseToSentenceCase(message)}</p>
      </div>
      <div className='flex items-center gap-2'>
        <p className='f-13-450 text-GRAY_900'>
          {getFormattedDate(
            { type: VALUE_FORMAT_TYPE.DATE_TIME, value: DATE_FORMATS.DD_MMM },
            data?.activity_updated_at ?? data?.updated_at,
          )}
        </p>
        <ArtifactPill
          count={artifactsData?.length ?? 0}
          artifacts={artifactsData}
          status={data?.status as ACTIVITY_RUN_STATUS}
          activityId={data?.id}
          isDisabled={artifactsData?.length === 0}
        />
      </div>
    </div>
  );
};

export default ActivityCurrentStatus;
