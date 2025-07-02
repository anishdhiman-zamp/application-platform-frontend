import { useMemo } from 'react';
import type { CompletedField } from 'modules/process/artifacts/context/completedFields.context';
import type { MissingFieldsConfigType } from '@/modules/process/process.types';

export const useFieldCounts = (
  completedFields: Record<string, CompletedField[]>,
  missingFields: MissingFieldsConfigType,
) => {
  const { required: completedRequiredFieldsCount, optional: completedOptionalFieldsCount } = useMemo(() => {
    let required = 0;
    let optional = 0;

    Object.values(completedFields).forEach((fields) => {
      for (const field of fields) {
        if (field.isRequired) required += 1;
        else optional += 1;
      }
    });

    return { required, optional };
  }, [completedFields]);

  const { required: missingRequiredFieldsCount, optional: missingOptionalFieldsCount } = useMemo(() => {
    let required = 0;
    let optional = 0;

    Object.values(missingFields).forEach((fieldGroup) => {
      const cells = fieldGroup?.cells ?? [];

      for (const cell of cells) {
        if (cell.is_required) required += 1;
        else optional += 1;
      }
    });

    return { required, optional };
  }, [missingFields]);

  return {
    completedRequiredFieldsCount,
    completedOptionalFieldsCount,
    missingRequiredFieldsCount,
    missingOptionalFieldsCount,
  };
};
