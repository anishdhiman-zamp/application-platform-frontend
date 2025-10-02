import { useEffect, useMemo, useState } from 'react';
import { ComboboxOption } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { useSearchParams } from 'next/navigation';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import { PAGE_SIZE } from '@/components/common/table/table.constants';
import { useAppSelector } from '@/hooks/toolkit';
import useUpdateDatasetIds from '@/hooks/useUpdateDatasetIds';
import { checkIsObjectEmpty } from '@/utils/common';

const useDatasetSelector = () => {
  const searchParams = useSearchParams();
  const updateDatasetIds = useUpdateDatasetIds();

  const filterId = searchParams?.get('filterId');
  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';
  const selectedDatasetIds = useAppSelector((state) => state.sheetFilters.selectedDatasetIds);

  const [isDatasetSelectorOpen, setIsDatasetSelectorOpen] = useState(false);

  const { datasetIdAndWidgetsMapping, setFormData, formData, setDatasetOptions, datasetOptions } =
    useCreateEditFilterContext();

  const { data: datasetListing } = useGetDatasetListingQuery(
    {
      page: 1,
      pageSize: PAGE_SIZE,
    },
    { refetchOnMountOrArgChange: false },
  );

  const selectedDatasets = useMemo(() => {
    return formData.columnAndDatasetList.map((item) => item.datasetId);
  }, [formData.columnAndDatasetList]);

  const handleSelectDataset = (selectedOption: ComboboxOption) => {
    setFormData({
      columnAndDatasetList: [
        ...formData.columnAndDatasetList,
        { datasetId: selectedOption.value as string, columns: [] },
      ],
    });
    const datasetIdSet = new Set([...selectedDatasetIds, selectedOption.value as string]);

    updateDatasetIds(Array.from(datasetIdSet));

    setIsDatasetSelectorOpen(false);
  };

  useEffect(() => {
    if (!datasetListing?.datasets?.length || checkIsObjectEmpty(datasetIdAndWidgetsMapping)) return;

    const sheetDatasets = Object.keys(datasetIdAndWidgetsMapping);

    setDatasetOptions(
      datasetListing?.datasets
        ?.filter((dataset) => sheetDatasets.includes(dataset.id))
        .map((dataset) => ({
          label: dataset.title,
          value: dataset.id,
          icon: <SvgSpriteLoader id='coins-stacked-04' className='mr-2' />,
        })) ?? [],
    );
  }, [datasetListing, datasetIdAndWidgetsMapping, setDatasetOptions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (datasetOptions.length > 0 && !filterId && isFilterOpen && selectedDatasets.length === 0) {
        setIsDatasetSelectorOpen(true);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [datasetOptions, filterId, isFilterOpen, selectedDatasets]);

  return {
    isDatasetSelectorOpen,
    setIsDatasetSelectorOpen,
    handleSelectDataset,
    datasetOptions,
    selectedDatasets,
  };
};

export default useDatasetSelector;
