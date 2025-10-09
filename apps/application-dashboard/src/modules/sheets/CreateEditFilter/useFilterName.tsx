import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MINIMUM_FILTER_NAME_WIDTH } from 'modules/sheets/CreateEditFilter/constants';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import useIsEditingBreadcrumbAllowed from '@/hooks/useIsEditingBreadcrumbAllowed';

const useFilterName = () => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const isEditingFilterNameAllowed = useIsEditingBreadcrumbAllowed();

  const [isEditingFilterName, setIsEditingFilterName] = useState(false);
  const [inputWidth, setInputWidth] = useState(MINIMUM_FILTER_NAME_WIDTH);
  const [filterName, setFilterName] = useState<string>();

  const { setFormData, formData } = useCreateEditFilterContext();

  const updateInputWidth = useCallback(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.clientWidth;

      // Added 20px padding to the measured width because of the input padding
      setInputWidth(spanWidth ? spanWidth + 20 : MINIMUM_FILTER_NAME_WIDTH);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
  };

  const handleInputBlur = () => {
    const trimmedName = filterName?.trim();

    setFormData({
      name: trimmedName || formData.name,
    });

    setIsEditingFilterName(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleInputBlur();
    }
  };

  useEffect(() => {
    updateInputWidth();
  }, [filterName, updateInputWidth]);

  useEffect(() => {
    setFilterName(formData.name);
  }, [formData.name]);

  return {
    isEditingFilterNameAllowed,
    isEditingFilterName,
    spanRef,
    filterName,
    handleChange,
    handleInputBlur,
    handleEditKeyDown,
    inputWidth,
    setIsEditingFilterName,
    formData,
  };
};

export default useFilterName;
