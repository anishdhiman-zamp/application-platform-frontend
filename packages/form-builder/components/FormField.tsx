import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useDisplayDependencies } from '../hooks/useDisplayDependencies';
import { FormField as FormFieldType } from '../types';
import { HeaderTextField } from './HeaderTextField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface FormFieldProps {
  field: FormFieldType;
  name: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ field, name, className }) => {
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
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        {(() => {
          switch (fieldWithConfig.type) {
            case 'header-text':
              return <HeaderTextField className={className} field={fieldWithConfig} name={name} />;
            case 'text':
              return <TextField className={className} field={fieldWithConfig} name={name} />;
            case 'select':
              return <SelectField className={className} field={fieldWithConfig} name={name} />;
            default:
              return null;
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
};
