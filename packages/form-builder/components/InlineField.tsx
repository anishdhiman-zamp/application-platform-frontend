import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useDisplayDependencies } from '../hooks/useDisplayDependencies';
import {
  FieldType,
  FormField as FormFieldType,
  InlineFieldConfig,
  InlineFieldDisplayMode,
  InlineFieldShowWhen,
} from '../types';
import { HeaderTextField } from './HeaderTextField';
import { RadioField } from './RadioField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface InlineFieldProps {
  inlineConfig: InlineFieldConfig;
  schemaFields: Record<string, FormFieldType>;
  isSelected: boolean;
  className?: string;
}

export const InlineField: React.FC<InlineFieldProps> = ({ inlineConfig, schemaFields, isSelected, className }) => {
  const { field: fieldId, display_mode, show_when = InlineFieldShowWhen.SELECTED } = inlineConfig;

  const fieldDefinition = schemaFields[fieldId];
  const { shouldShow: shouldShowFromDependencies, fieldConfig } = useDisplayDependencies(fieldDefinition);

  if (!fieldDefinition) {
    return null;
  }

  const shouldBeVisible =
    show_when === InlineFieldShowWhen.ALWAYS || (show_when === InlineFieldShowWhen.SELECTED && isSelected);
  const isVisible = shouldBeVisible && shouldShowFromDependencies;

  if (!isVisible) {
    return null;
  }

  const mergedField = {
    ...fieldDefinition,
    ...fieldConfig,
  };

  const getContainerClass = (): string => {
    switch (display_mode) {
      case InlineFieldDisplayMode.REPLACE:
        return 'flex-1';
      case InlineFieldDisplayMode.BELOW:
        return 'mt-2 ml-6';
      case InlineFieldDisplayMode.AFTER:
        return 'ml-2 flex-1';
      default:
        return '';
    }
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={getContainerClass()}
      >
        {renderField()}
      </motion.div>
    </AnimatePresence>
  );
};
