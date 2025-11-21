import { LocationType } from '@zamp-platform/chat';
import type { AgColumn } from 'ag-grid-community';
import { useParams } from 'next/navigation';
import ChatbotWrapper from '@/modules/chatbot';
import CommentButton from '@/modules/chatbot/CommentButton';
import { MapAny } from '@/types/commonTypes';

interface ChatbotWrapperProps {
  children: React.ReactNode;
  data: MapAny;
  column: AgColumn<any>;
  datasetId?: string;
}

const ChatbotCellWrapper = ({ children, data, column, datasetId }: ChatbotWrapperProps) => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;
  const columnId = column?.getColId?.() as string;

  return (
    <div className='group flex items-center justify-between'>
      {children}
      <ChatbotWrapper
        annotationLocation={{
          type: LocationType.DATASET_FIELD,
          data: {
            process_id: processId,
            activity_run_id: activityRunId,
            dataset_id: datasetId ?? '',
            dataset_row_id: data?.id,
            dataset_field_id: columnId,
          },
        }}
      >
        <CommentButton />
      </ChatbotWrapper>
    </div>
  );
};

export default ChatbotCellWrapper;
