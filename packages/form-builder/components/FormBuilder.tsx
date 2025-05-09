import { Label } from '@zamp-platform/ui';
import React, { forwardRef, useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { FormSchema } from '../types';
import { createCustomResolver } from '../utils/validation';
import { FormSection } from './FormSection';

interface FormBuilderProps {
  schema: FormSchema;
  onSubmit: (data: any) => void;
}

export interface FormBuilderRef {
  submit: () => void;
}

export const FormBuilder = forwardRef<FormBuilderRef, FormBuilderProps>(({ schema, onSubmit }, ref) => {
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
        {schema.sections.map((section) => (
          <div className='form-section flex flex-col'>
            <Label>{section.title}</Label>
            {section.sections && (
              <div className='nested-sections flex flex-col gap-5'>
                {section.sections.map((nestedSection) => (
                  <FormSection key={nestedSection.id} section={nestedSection} fields={schema.fields} />
                ))}
              </div>
            )}
          </div>
        ))}
      </form>
    </FormProvider>
  );
});
