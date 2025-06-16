import { Label } from '@zamp-platform/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { FormSchema } from '../types';
import { createCustomResolver } from '../utils/validation';
import { FormSection } from './FormSection';

interface FormBuilderProps {
  schema: FormSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
}

export interface FormBuilderRef {
  submit: () => void;
}

export const FormBuilder = ({
  ref,
  schema,
  onSubmit,
}: FormBuilderProps & {
  ref: React.RefObject<FormBuilderRef | null>;
}) => {
  // Build defaultValues from schema.fields
  const defaultValues = Object.fromEntries(
    Object.entries(schema.fields).map(([key, field]) => [key, field.default_value]),
  );

  const methods = useForm({
    resolver: createCustomResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      methods.handleSubmit(onSubmit, (err) => {
        console.log('Error:', err);
      })();
    },
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-5 pb-5'>
        {schema.sections.map((section, index) => (
          <motion.div
            key={section.id || index}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: index * 0.15,
            }}
            className='form-section flex flex-col'
          >
            <Label>{section.title}</Label>
            {section.sections && (
              <motion.div
                className='nested-sections flex flex-col gap-5'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.1,
                }}
              >
                {section.sections.map((nestedSection) => (
                  <FormSection key={nestedSection.id} section={nestedSection} fields={schema.fields} />
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </form>
    </FormProvider>
  );
};
