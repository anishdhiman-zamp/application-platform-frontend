import { FC } from 'react';
import AccountsList from 'modules/payments/AccountsList';
import CustomiseAccessHeader from 'modules/shareResource/CustomiseAccessHeader';
import { FilterConfigType } from '@/components/filter/filter.types';
import FullScreenPopup from '@/components/FullScreenPopup';
import { defaultFnType, MapAny } from '@/types/commonTypes';
import { FilterModelType } from '@/types/components/table.type';
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
      className='z-1201 bg-BG_GRAY_1 overflow-visible'
      hideHeader
      childrenClassName='overflow-visible'
    >
      <CustomiseAccessHeader onCancel={handleCancel} onSave={onSave} datasetTitle='Accounts' isSaving={isSaving} />
      <AccountsList
        updateFiltersInParent={handleUpdateFiltersInParent}
        updateFilterConfigInParent={handleUpdateFilterConfigInParent}
        parentSelectedFilters={selectedFilters}
        fgacFilters={fgacFilters}
      />
    </FullScreenPopup>
  );
};

export default CustomisePaymentsAccess;
