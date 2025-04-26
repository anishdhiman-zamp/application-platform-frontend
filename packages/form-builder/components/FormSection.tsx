import { Label } from '@zamp-platform/ui';
import React from 'react';

import { FormField as FormFieldType, FormSection as FormSectionType } from '../types';
import { FormField } from './FormField';
interface FormSectionProps {
  section: FormSectionType;
  fields: Record<string, FormFieldType>;
}

export const FormSection: React.FC<FormSectionProps> = ({ section, fields }) => {
  return (
    <div className='form-section flex flex-col gap-5'>
      <div className='flex flex-col gap-2'>
        <Label>{section.title}</Label>
        {section.fields && (
          <div className='flex flex-col gap-1.5'>
            {section.fields.map(
              (fieldId) => fields[fieldId]?.type && <FormField key={fieldId} field={fields[fieldId]} name={fieldId} />,
            )}
          </div>
        )}
      </div>
      {section.sections && (
        <div className='nested-sections flex flex-col gap-5'>
          {section.sections.map((nestedSection) => (
            <FormSection key={nestedSection.id} section={nestedSection} fields={fields} />
          ))}
        </div>
      )}
    </div>
  );
};
