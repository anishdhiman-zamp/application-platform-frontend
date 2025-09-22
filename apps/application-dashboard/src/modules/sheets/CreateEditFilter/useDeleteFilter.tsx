import { useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { useParams } from 'next/navigation';
import { useDeleteSheetFilterConfigMutation } from '@/apis/pages';
import { defaultFnType, MapAny } from '@/types/commonTypes';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDeleteFilter = (onClose: defaultFnType) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);

  const { formData } = useCreateEditFilterContext();

  const [deleteSheetFilterConfig, { isLoading }] = useDeleteSheetFilterConfigMutation();

  const handleDeleteFilter = () => {
    const sheetFiltersLS: MapAny = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID) || '{}');
    const selectedFiltersLS: MapAny = sheetFiltersLS[params?.sheetId as string]?.selectedFiltersInUI;
    const allSelectedFiltersLS: MapAny = sheetFiltersLS[params?.sheetId as string]?.allSelectedFilters;

    if (selectedFiltersLS && Object.hasOwn(selectedFiltersLS, formData?.id as string)) {
      delete selectedFiltersLS[formData?.id as string];
    }
    if (allSelectedFiltersLS && Object.hasOwn(allSelectedFiltersLS, formData?.id as string)) {
      delete allSelectedFiltersLS[formData?.id as string];
    }

    const newSheetFiltersLS: MapAny = {
      ...sheetFiltersLS,
      [params?.sheetId as string]: {
        selectedFiltersInUI: selectedFiltersLS,
        allSelectedFilters: allSelectedFiltersLS,
      },
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID, JSON.stringify(newSheetFiltersLS));

    deleteSheetFilterConfig({
      pageId: params?.pageId as string,
      sheetId: params?.sheetId as string,
      filterId: formData?.id ?? '',
    })
      .unwrap()
      .then(() => {
        toast.success(`${formData?.name} filter deleted successfully`);
        setIsOpen(false);
        onClose();
      })
      .catch(() => {
        toast.error(`Failed to delete ${formData?.name} filter`);
      });
  };

  return { isOpen, setIsOpen, handleDeleteFilter, isLoading, formData };
};

export default useDeleteFilter;
