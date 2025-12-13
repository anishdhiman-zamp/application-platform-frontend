import { Label } from '@zamp-platform/ui';
import React from 'react';

import { FormBuilderAnimationConfig, FormField as FormFieldType, FormSection as FormSectionType } from '../types';
import { FormField } from './FormField';
interface FormSectionProps {
  section: FormSectionType;
  fields: Record<string, FormFieldType>;
  animationConfig?: FormBuilderAnimationConfig;
}

export const FormSection: React.FC<FormSectionProps> = ({ section, fields, animationConfig }) => {
  return (
    <div className='form-section flex flex-col gap-5'>
      <div className='flex flex-col gap-2'>
        <Label>{section.title}</Label>
        <div className='grid'>
          {section.layout.map((row, rowIdx) => (
            <div key={rowIdx} className='flex w-full gap-2'>
              {row.map(({ field, col_span }) =>
                fields[field]?.type ? (
                  <div
                    key={field}
                    style={{
                      flexBasis: `${(col_span / 8) * 100}%`,
                      width: `${(col_span / 8) * 100}%`,
                      maxWidth: `${(col_span / 8) * 100}%`,
                    }}
                    className='flex-1'
                  >
                    <FormField
                      className='mb-2'
                      field={fields[field]}
                      name={field}
                      animationConfig={animationConfig}
                      schemaFields={fields}
                    />
                  </div>
                ) : null,
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
