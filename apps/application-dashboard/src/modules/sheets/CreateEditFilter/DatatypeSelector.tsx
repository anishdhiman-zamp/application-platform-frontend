import { FC } from 'react';
import { Select } from '@zamp-platform/ui';
import { DatatypeOptions } from 'modules/sheets/CreateEditFilter/constants';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { DataType } from 'modules/sheets/CreateEditFilter/types';
import { filtersContextActions, useFiltersContextStore } from '@/components/filter/filters.context';

const DatatypeSelector: FC = () => {
  const { formData, setFormData } = useCreateEditFilterContext();
  const { dispatch } = useFiltersContextStore();

  const handleDatatypeChange = (value: string) => {
    setFormData({ ...formData, datatype: value as DataType, columnAndDatasetList: [] });
    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: {
        filtersConfig: [],
      },
    });
    dispatch({
      type: filtersContextActions.RESET_ALL_FILTERS,
    });
  };

  return (
    <Select
      options={DatatypeOptions}
      label='Datatype'
      variant='small'
      value={formData.datatype}
      onValueChange={(value) => handleDatatypeChange(value as string)}
      className='border-y p-5'
      labelClassName='mb-2.5 f-13-500'
      side='left'
      sideOffset={30}
    />
  );
};

export default DatatypeSelector;
