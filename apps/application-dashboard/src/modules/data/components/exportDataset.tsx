import { type RefObject, useRef, useState } from 'react';
import { COLORS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import type { AgGridReact } from 'ag-grid-react';
import {
  useLazyGetActionStatusQuery,
  useLazyGetDatasetExportQuery,
  useLazyGetDatasetExportsSignedUrlQuery,
} from 'apis/dataset';
import { useOnClickOutside } from 'hooks';
import usePolling from 'hooks/usePolling';
import LoadingWidthAnimation from 'modules/data/components/LoadingWidthAnimation';
import { prepareExportQuery } from 'modules/data/data.utils';
import { useParams, useRouter } from 'next/navigation';
import { DatasetActionStatusResponseType } from 'types/api/dataset.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import ProgressBar from 'components/common/RingProgress';
import { toast } from 'components/common/toast/Toast';

interface ExportDatasetProps {
  query: string;
  datasetId: string;
  hasFilters: boolean;
  tableRef: RefObject<AgGridReact<any> | null>;
  disable?: boolean;
}

const ExportDataset = ({ query, datasetId, hasFilters, tableRef, disable = false }: ExportDatasetProps) => {
  const router = useRouter();
  const params = useParams();
  const activityId = params?.activityId as string;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { startPolling } = usePolling();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [getDatasetExport] = useLazyGetDatasetExportQuery();
  const [getDatasetExportsSignedUrl] = useLazyGetDatasetExportsSignedUrlQuery();

  const [showExportStatus, setShowExportStatus] = useState(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useOnClickOutside(dropdownRef, () => setShowExportStatus(false));

  const handleDownloadCsvErr = () => {
    setIsPolling(false);
    toast.error('Unable to download CSV. Please try again.');
  };

  const handleSuccessfullyUpdate = (workflowId: string) => {
    setIsPolling(true);
    startPolling({
      fn: () => getActionStatus({ datasetId, params: { action_ids: [workflowId] } }),
      validate: (data: DatasetActionStatusResponseType[]) => {
        return data?.filter((item) => !item.is_completed)?.length === 0;
      },
      interval: 3000,
      maxAttempts: 50,
    })
      .then(() => {
        getDatasetExportsSignedUrl({ datasetId, workflowId })
          .unwrap()
          .then((data) => {
            setIsPolling(false);
            router.push(data?.signed_url);
          });
      })
      .catch(handleDownloadCsvErr);
  };

  const downloadCsv = async () => {
    setShowExportStatus(true);
    const mergedQuery = prepareExportQuery(query, tableRef, activityId);

    if (isPolling) return;

    getDatasetExport({
      datasetId,
      query_config: mergedQuery,
    })
      .unwrap()
      .then((data) => {
        if (data?.workflow_id) {
          handleSuccessfullyUpdate(data?.workflow_id);
        }
      })
      .catch(handleDownloadCsvErr);
  };

  return (
    <div className='relative z-40 h-5.5 w-5.5 cursor-pointer rounded' onClick={downloadCsv}>
      <TooltipV2
        tooltipBody={hasFilters ? 'Export filtered' : 'Export all'}
        className='z-1 h-full w-full'
        side={SIDE_OPTIONS.TOP}
        disabled={isPolling}
      >
        <div
          className={cn(
            'flex h-full w-full cursor-pointer items-center justify-center rounded',
            disable
              ? 'disabled:text-GRAY_300 hover:text-GRAY_300 cursor-not-allowed'
              : 'hover:text-GRAY_100 cursor-pointer',
          )}
        >
          <SvgSpriteLoader id='download-02' width={14} height={14} className='text-GRAY_900' />
          {isPolling && (
            <div className='absolute bottom-px left-[3px]'>
              <LoadingWidthAnimation />
            </div>
          )}
        </div>
      </TooltipV2>
      {isPolling && showExportStatus && (
        <div
          ref={dropdownRef}
          className='f-13-500 text-GRAY_1000 f-12-450 border-0.5 border-GRAY_500 absolute top-7 -right-[86px] z-50 flex h-[55px] w-[308px] items-center gap-3 rounded-[10px] bg-white p-5'
        >
          <ProgressBar
            trackColor={COLORS.GRAY_400}
            indicatorColor={'#22A356'}
            indicatorWidth={2}
            trackWidth={2}
            size={16}
            className='animate-spin'
            progress={20}
          />
          <div className='grow'>Export in progress</div>
          <SvgSpriteLoader
            id='x-close'
            width={16}
            height={16}
            onClick={(e) => {
              e.stopPropagation();
              setShowExportStatus(false);
            }}
            className='text-GRAY_800 hover:text-GRAY_1000'
          />
        </div>
      )}
    </div>
  );
};

export default ExportDataset;
