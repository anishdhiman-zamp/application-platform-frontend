import { Label } from '@zamp-platform/ui';
import { motion } from 'framer-motion';
import React, { useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DEFAULT_NESTED_ANIMATION, DEFAULT_SECTION_ANIMATION, DEFAULT_STAGGER_CHILDREN } from '../constants';
import { FormSchema } from '../types';
import { transformFormData } from '../utils/formDataTransform';
import { createCustomResolver } from '../utils/validation';
import { FormSection } from './FormSection';

interface FormBuilderProps {
  schema: FormSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  formId?: string;
  animated?: boolean;
}

export interface FormBuilderRef {
  submit: () => void;
}

export const FormBuilder = ({
  ref,
  schema,
  onSubmit,
  formId,
  animated = true,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    const transformedData = transformFormData(schema, data);
    onSubmit(transformedData);
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      methods.handleSubmit(handleSubmit, (err) => {
        console.log('Error:', err);
      })();
    },
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className={`main-form ${formId} flex flex-col gap-5 pb-5`}>
        {schema.sections.map((section, index) => (
          <motion.div
            key={section.id || index}
            initial={animated ? DEFAULT_SECTION_ANIMATION.initial : undefined}
            animate={animated ? DEFAULT_SECTION_ANIMATION.animate : undefined}
            transition={{
              ...DEFAULT_SECTION_ANIMATION.transition,
              delay: animated ? index * DEFAULT_STAGGER_CHILDREN : 0,
            }}
            className='form-section flex flex-col'
          >
            <Label>{section.title}</Label>
            {section.sections && (
              <motion.div
                className='nested-sections flex flex-col gap-5'
                initial={animated ? DEFAULT_NESTED_ANIMATION.initial : undefined}
                animate={animated ? DEFAULT_NESTED_ANIMATION.animate : undefined}
                transition={DEFAULT_NESTED_ANIMATION.transition}
              >
                {section.sections.map((nestedSection) => (
                  <FormSection
                    key={nestedSection.id}
                    section={nestedSection}
                    fields={schema.fields}
                    animated={animated}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </form>
    </FormProvider>
  );
};
