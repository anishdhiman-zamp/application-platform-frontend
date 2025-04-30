import React from 'react';

import { FormField as FormFieldType } from '../types';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

interface FormFieldProps {
  field: FormFieldType;
  name: string;
}

export const FormField: React.FC<FormFieldProps> = ({ field, name }) => {
  switch (field.type) {
    case 'text':
      return <TextField field={field} name={name} />;
    case 'select':
      return <SelectField field={field} name={name} />;
    default:
      return null;
  }
};
