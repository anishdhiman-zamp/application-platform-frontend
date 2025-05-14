import CustomiseDatasetAccess from 'modules/shareResource/CustomiseDatasetAccess';
import CustomisePaymentsAccess from 'modules/shareResource/CustomisePaymentsAccess';
import { ResourceType } from 'modules/shareResource/shareResource.types';
import { defaultFnType } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';

type CustomiseAccessProps = {
  resourceType: ResourceType;
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
  fgacFilters?: FilterModelType;
  onSave: defaultFnType;
  isSaving?: boolean;
};

const CustomiseAccess = ({
  resourceType,
  isOpen,
  onClose,
  datasetId,
  fgacFilters,
  onSave,
  isSaving = false,
}: CustomiseAccessProps) => {
  switch (resourceType) {
    case ResourceType.DATASET:
      return (
        <CustomiseDatasetAccess
          isOpen={isOpen}
          onClose={onClose}
          datasetId={datasetId}
          fgacFilters={fgacFilters}
          onSave={onSave}
          isSaving={isSaving}
        />
      );
    case ResourceType.PAYMENTS:
      return (
        <CustomisePaymentsAccess
          isOpen={isOpen}
          onClose={onClose}
          fgacFilters={fgacFilters}
          onSave={onSave}
          isSaving={isSaving}
        />
      );
    default:
      return null;
  }
};

export default CustomiseAccess;
