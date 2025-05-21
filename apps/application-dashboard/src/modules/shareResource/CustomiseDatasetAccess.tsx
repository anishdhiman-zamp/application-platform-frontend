import { FC, useState } from 'react';
import DatasetById from 'modules/data/Dataset';
import CustomiseAccessHeader from 'modules/shareResource/CustomiseAccessHeader';
import { FilterConfigType } from '@/components/filter/filter.types';
import FullScreenPopup from '@/components/FullScreenPopup';
import { defaultFnType, MapAny } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

type CustomiseDatasetAccessProps = {
  isOpen: boolean;
  onClose?: defaultFnType;
  datasetId: string;
  fgacFilters?: FilterModelType;
  onSave?: defaultFnType;
  isSaving?: boolean;
};

const CustomiseDatasetAccess: FC<CustomiseDatasetAccessProps> = ({
  isOpen,
  onClose,
  datasetId,
  fgacFilters,
  onSave,
  isSaving = false,
}) => {
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const {
    dispatch,
    state: { selectedFilters },
  } = useFiltersContextStore();

  const handleUpdateFiltersInParent = (filters: MapAny) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: filters,
      },
    });
  };

  const handleUpdateFilterConfigInParent = (filtersConfig: FilterConfigType[]) => {
    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: { filtersConfig },
    });
  };

  const handleCancel = () => {
    dispatch({
      type: filtersContextActions.RESET_ALL_FILTERS,
    });
    onClose?.();
  };

  return (
    <FullScreenPopup
      isOpen={isOpen}
      className='z-[1201] bg-BG_GRAY_1 overflow-visible'
      hideHeader
      childrenClassName='overflow-visible'
    >
      <CustomiseAccessHeader onCancel={handleCancel} onSave={onSave} datasetTitle={datasetTitle} isSaving={isSaving} />
      <div className='h-[calc(100vh-130px)]'>
        <DatasetById
          id={datasetId as string}
          isReadOnly
          headerClassName='border-t bg-white'
          gridStyle={{ width: '100%', height: 'calc(100vh - 186px)' }}
          updateDatasetTitleInParent={setDatasetTitle}
          updateFiltersInParent={handleUpdateFiltersInParent}
          updateFilterConfigInParent={handleUpdateFilterConfigInParent}
          parentSelectedFilters={selectedFilters}
          drilldownFilters={fgacFilters}
        />
      </div>
    </FullScreenPopup>
  );
};

export default CustomiseDatasetAccess;
