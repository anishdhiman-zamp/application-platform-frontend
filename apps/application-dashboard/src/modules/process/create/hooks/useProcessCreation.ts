import { useCallback, useState } from 'react';
import { ProcessCreationErrors, ProcessCreationFormData } from '@/modules/process/create/types';

export const useProcessCreation = () => {
  const [formData, setFormData] = useState<ProcessCreationFormData>({
    processName: '',
    selectedAudiences: [],
  });

  const [errors, setErrors] = useState<ProcessCreationErrors>({});

  const updateProcessName = useCallback(
    (name: string) => {
      setFormData((prev) => ({ ...prev, processName: name }));
      // Clear error when user starts typing
      if (errors.processName) {
        setErrors((prev) => ({ ...prev, processName: undefined }));
      }
    },
    [errors.processName],
  );

  const updateSelectedAudiences = useCallback((audiences: typeof formData.selectedAudiences) => {
    setFormData((prev) => ({ ...prev, selectedAudiences: audiences }));
  }, []);

  // const updateSelectedRole = useCallback((role: string) => {
  //   setFormData((prev) => ({ ...prev, selectedRole: role }));
  // }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ProcessCreationErrors = {};

    if (!formData.processName.trim()) {
      newErrors.processName = 'Process name is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData.processName]);

  const handleStartBuilding = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // Placeholder for API integration
    // TODO: Add process creation API call here
    console.log('Process creation data:', {
      processName: formData.processName.trim(),
      selectedAudiences: formData.selectedAudiences,
    });

    // TODO: Navigate to process detail page after creation
    // router.push(getProcessRouteById(processId));
  }, [formData, validateForm]);

  return {
    formData,
    errors,
    updateProcessName,
    updateSelectedAudiences,
    validateForm,
    handleStartBuilding,
  };
};
