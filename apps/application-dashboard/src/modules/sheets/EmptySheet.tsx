import { Button } from '@zamp-platform/ui';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { SHEET_EMPTY_STATE } from '@/constants/icons';
import { defaultFnType } from '@/types/commonTypes';

interface EmptySheetProps {
  onAddWidget: defaultFnType;
}

const EmptySheet = ({ onAddWidget }: EmptySheetProps) => {
  const params = useParams();
  const pageId = params?.pageId as string;
  const sheetId = params?.sheetId as string;

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <Image
        src={SHEET_EMPTY_STATE}
        alt='Empty sheet'
        width={264}
        height={266}
        data-testid={`${sheetId}-empty-sheet-image`}
        unoptimized
      />
      <PermissionGuard resourceType={ResourceType.PAGE} resourceId={pageId} privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}>
        <Button
          size='large'
          variant='secondary'
          onClick={onAddWidget}
          data-testid={`${sheetId}-empty-sheet-add-widget-btn`}
        >
          Add a widget
        </Button>
      </PermissionGuard>
    </div>
  );
};

export default EmptySheet;
