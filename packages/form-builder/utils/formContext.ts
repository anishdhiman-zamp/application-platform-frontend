import { useFormContext } from 'react-hook-form';

export const useFormFieldValue = (fieldName: string) => {
  const { watch } = useFormContext();
  return watch(fieldName);
};

export const processTemplateVariables = (template: string, fieldValues: Record<string, any>) => {
  if (!template.startsWith('${') || !template.endsWith('}')) {
    return template;
  }

  const fieldName = template.slice(2, -1);
  return fieldValues[fieldName] || '';
};
