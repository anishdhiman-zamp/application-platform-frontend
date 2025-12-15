import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useDisplayDependencies } from '../hooks/useDisplayDependencies';
import { useFormAnimation } from '../hooks/useFormAnimation';
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

export const FormField: React.FC<FormFieldProps> = ({ field, name, className, animated, inlineFields }) => {
  const { shouldShow, fieldConfig } = useDisplayDependencies(field);
  const { fieldAnimation } = useFormAnimation(animated);

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
        initial={fieldAnimation.initial}
        animate={fieldAnimation.animate}
        exit={fieldAnimation.exit}
        transition={fieldAnimation.transition}
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
