import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Process } from '@/app/(authenticated)/resources';
import { getCreateKnowledgeBaseRouteByProcessId } from '@/constants/routeConfig';
import { ProcessCreationErrors, ProcessCreationFormData } from '@/modules/process/create/types';
import { storeProcessAudiences } from '@/modules/process/create/utils/audience';
import { ProcessStatus } from '@/types/api/processApi.types';

export const useProcessCreation = (createProcess: (data: Partial<Process>) => void) => {
  const router = useRouter();

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

    const processId = crypto.randomUUID();

    if (formData.selectedAudiences.length > 0) {
      storeProcessAudiences(processId, formData.selectedAudiences);
    }

    createProcess({
      process_id: processId,
      display_name: formData.processName.trim(),
      status: ProcessStatus.DRAFT,
    });

    router.push(`${getCreateKnowledgeBaseRouteByProcessId(processId)}?source=process-creation`);
  }, [formData, validateForm, createProcess, router]);

  return {
    formData,
    errors,
    updateProcessName,
    updateSelectedAudiences,
    validateForm,
    handleStartBuilding,
  };
};
