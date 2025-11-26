import { FC } from 'react';
import CustomiseAccessHeader from 'modules/shareResource/CustomiseAccessHeader';
import { FilterConfigType } from '@/components/filter/filter.types';
import FullScreenPopup from '@/components/FullScreenPopup';
import { defaultFnType, MapAny } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';
import AccountsList from '@/unused/modules/payments/AccountsList';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

type CustomisePaymentsAccessProps = {
  isOpen: boolean;
  onClose?: defaultFnType;
  fgacFilters?: FilterModelType;
  isSaving?: boolean;
  onSave?: defaultFnType;
};

const CustomisePaymentsAccess: FC<CustomisePaymentsAccessProps> = ({
  isOpen,
  onClose,
  fgacFilters,
  isSaving = false,
  onSave,
}) => {
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
      className='bg-BG_GRAY_1 z-1201 overflow-visible'
      hideHeader
      childrenClassName='overflow-visible'
    >
      <CustomiseAccessHeader onCancel={handleCancel} onSave={onSave} datasetTitle='Accounts' isSaving={isSaving} />
      <div className='h-[calc(100vh-130px)]'>
        <AccountsList
          updateFiltersInParent={handleUpdateFiltersInParent}
          updateFilterConfigInParent={handleUpdateFilterConfigInParent}
          parentSelectedFilters={selectedFilters}
          fgacFilters={fgacFilters}
          gridStyle={{ width: '100%', height: 'calc(100vh - 186px)' }}
        />
      </div>
    </FullScreenPopup>
  );
};

export default CustomisePaymentsAccess;
