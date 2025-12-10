import { Label } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import React, { useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useFormAnimation } from '../hooks/useFormAnimation';
import { FormBuilderAnimationConfig, FormBuilderClassNames, FormSchema } from '../types';
import { FormBuilderConfigProvider } from '../utils/classNamesContext';
import { createCustomResolver } from '../utils/validation';
import { FormSection } from './FormSection';

interface FormBuilderProps {
  schema: FormSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  classNames?: FormBuilderClassNames;
  animationConfig?: FormBuilderAnimationConfig;
}

export interface FormBuilderRef {
  submit: () => void;
}

export const FormBuilder = ({
  ref,
  schema,
  onSubmit,
  classNames,
  animationConfig,
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

  const { sectionAnimation, nestedAnimation, getStaggerDelay } = useFormAnimation(animationConfig);

  return (
    <FormBuilderConfigProvider classNames={classNames} animationConfig={animationConfig}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className={cn('flex flex-col gap-5 pb-5', classNames?.form)}>
          {schema.sections.map((section, index) => (
            <motion.div
              key={section.id || index}
              initial={sectionAnimation.initial}
              animate={sectionAnimation.animate}
              transition={{
                ...sectionAnimation.transition,
                delay: getStaggerDelay(index),
              }}
              className={cn('form-section flex flex-col', classNames?.section)}
            >
              <Label className={classNames?.sectionTitle}>{section.title}</Label>
              {section.sections && (
                <motion.div
                  className='nested-sections flex flex-col gap-5'
                  initial={nestedAnimation.initial}
                  animate={nestedAnimation.animate}
                  transition={nestedAnimation.transition}
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
    </FormBuilderConfigProvider>
  );
};
