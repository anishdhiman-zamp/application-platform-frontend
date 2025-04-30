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
  const methods = useForm({
    resolver: createCustomResolver(schema),
    defaultValues: {},
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      methods.handleSubmit(onSubmit)();
    },
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-5 pb-5'>
        {schema.sections.map((section) => (
          <FormSection key={section.id} section={section} fields={schema.fields} />
        ))}
      </form>
    </FormProvider>
  );
});
