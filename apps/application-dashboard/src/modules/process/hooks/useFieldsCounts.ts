import { useMemo } from 'react';
import type { FieldRequirementType, MissingFieldsConfigType } from 'modules/process/process.types';

export const useFieldCounts = (
  completedFields: Record<string, Record<string, FieldRequirementType[]>>,
  missingFields: MissingFieldsConfigType,
  activityId?: string,
) => {
  const { required: completedRequiredFieldsCount, optional: completedOptionalFieldsCount } = useMemo(() => {
    let required = 0;
    let optional = 0;

    // If activityId is provided, only count fields for that activity
    const fieldsToProcess = activityId
      ? Object.values(completedFields[activityId] || {})
      : Object.values(completedFields).flatMap((activityFields) => Object.values(activityFields));

    fieldsToProcess.forEach((fields) => {
      for (const field of fields) {
        if (field.isRequired) required += 1;
        else optional += 1;
      }
    });

    return { required, optional };
  }, [completedFields, activityId]);

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
