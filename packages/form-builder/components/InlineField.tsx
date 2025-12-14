import React from 'react';

import { useDisplayDependencies } from '../hooks/useDisplayDependencies';
import { FieldType, FormField as FormFieldType, InlineFieldConfig } from '../types';
import { HeaderTextField } from './HeaderTextField';
import { RadioField } from './RadioField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface InlineFieldProps {
  inlineConfig: InlineFieldConfig;
  schemaFields: Record<string, FormFieldType>;
  className?: string;
}

export const InlineField: React.FC<InlineFieldProps> = ({ inlineConfig, schemaFields, className }) => {
  const { field: fieldId } = inlineConfig;

  const fieldDefinition = schemaFields[fieldId];
  const { shouldShow: shouldShowFromDependencies, fieldConfig } = useDisplayDependencies(fieldDefinition);

  if (!fieldDefinition) {
    return null;
  }

  if (!shouldShowFromDependencies) {
    return null;
  }

  const mergedField = {
    ...fieldDefinition,
    ...fieldConfig,
  };

  const renderField = (): React.ReactNode => {
    const fieldProps = {
      field: mergedField,
      name: fieldId,
      className: className,
    };

    switch (mergedField.type) {
      case FieldType.HEADER_TEXT:
        return <HeaderTextField {...fieldProps} />;
      case FieldType.TEXT:
        return <TextField {...fieldProps} />;
      case FieldType.SELECT:
        return <SelectField {...fieldProps} />;
      case FieldType.RADIO:
        return <RadioField {...fieldProps} />;
      default:
        return null;
    }
  };

  return <div className='flex-1'>{renderField()}</div>;
};
