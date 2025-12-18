import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { DEFAULT_FIELD_ANIMATION } from '../constants';
import { useDisplayDependencies } from '../hooks/useDisplayDependencies';
import { FormField as FormFieldType } from '../types';
import { HeaderTextField } from './HeaderTextField';
import { RadioField } from './RadioField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface FormFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
  animated?: boolean;
  inlineFields?: Record<string, FormFieldType>;
}

export const FormField: React.FC<FormFieldProps> = ({ field, name, className, animated = true, inlineFields = {} }) => {
  const { shouldShow, fieldConfig } = useDisplayDependencies(field);

  if (!shouldShow) {
    return null;
  }

  const fieldWithConfig = {
    ...field,
    ...fieldConfig,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={animated ? DEFAULT_FIELD_ANIMATION.initial : undefined}
        animate={animated ? DEFAULT_FIELD_ANIMATION.animate : undefined}
        exit={animated ? DEFAULT_FIELD_ANIMATION.exit : undefined}
        transition={animated ? DEFAULT_FIELD_ANIMATION.transition : { duration: 0 }}
      >
        {(() => {
          switch (fieldWithConfig.type) {
            case 'header-text':
              return <HeaderTextField className={className} field={fieldWithConfig} name={name} />;
            case 'text':
              return <TextField className={className} field={fieldWithConfig} name={name} />;
            case 'select':
              return <SelectField className={className} field={fieldWithConfig} name={name} />;
            case 'radio':
              return (
                <RadioField className={className} field={fieldWithConfig} name={name} inlineFields={inlineFields} />
              );
            default:
              return null;
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
};
