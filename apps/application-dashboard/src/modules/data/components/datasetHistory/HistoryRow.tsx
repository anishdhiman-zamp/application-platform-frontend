import React, { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { FileHistoryDataType } from 'modules/data/components/importDataset/importData.types';
import { formattedDate, maskString } from 'modules/data/components/importDataset/importData.utils';
import { LOADER_STATUS } from 'modules/data/data.types';
import { getUserNameFromEmail } from 'utils/common';
import StatusIndicator from 'components/common/StatusIndicator';

interface IHistoryRowProps {
  historyItem: FileHistoryDataType;
}

const HistoryRow: FC<IHistoryRowProps> = ({ historyItem }) => {
  const uploadInfo = `${formattedDate(historyItem?.file_upload_created_at)} by ${getUserNameFromEmail(historyItem?.uploaded_by_user?.email)}`;

  return (
    <div className='border-GRAY_400 flex w-full flex-col flex-wrap items-start justify-start border-b py-3.5'>
      <div className='flex w-full items-center justify-between'>
        <div className='bg-GRAY_100 flex w-fit justify-start rounded-md px-2 py-1.5'>
          <SvgSpriteLoader id='file-06' width={14} height={14} color={COLORS.GRAY_1000} />
          <span className='f-12-400 text-GRAY_1000 ml-1.5'>{maskString(historyItem?.file_name, 8, 8, 16)}</span>
        </div>
        <StatusIndicator status={historyItem?.status as LOADER_STATUS} />
      </div>
      <span className='f-10-400 text-GRAY_700 mt-1'>{uploadInfo}</span>
    </div>
  );
};

export default HistoryRow;
