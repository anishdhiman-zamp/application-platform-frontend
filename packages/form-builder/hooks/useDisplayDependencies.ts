import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FieldConfig, FormField, FormValues } from '../types';
import { evaluateExpression } from '../utils/expressionEvaluator';

interface DisplayDependencyResult {
  shouldShow: boolean;
  fieldConfig: FieldConfig | null;
}

export const useDisplayDependencies = (field: FormField): DisplayDependencyResult => {
  const { setValue, watch } = useFormContext();
  const [shouldShow, setShouldShow] = useState(true);
  const [fieldConfig, setFieldConfig] = useState<FieldConfig | null>(null);

  useEffect(() => {
    if (!field.display_dependencies?.length) {
      setShouldShow(true);
      setFieldConfig(null);
      return;
    }

    const checkDependencies = () => {
      const valuesToWatch = field.display_dependencies![0].fields.reduce((acc, fieldName) => {
        acc[fieldName] = watch(fieldName);
        return acc;
      }, {} as FormValues);

      // Check if all dependent fields are present in form data and if not, hide the field
      const hasAllDependentFields = field.display_dependencies![0].fields.every((field) => field in valuesToWatch);
      if (!hasAllDependentFields) {
        setShouldShow(false);
        setFieldConfig(null);
        return;
      }

      // Evaluate each dependency's expressions
      for (const dependency of field.display_dependencies!) {
        for (const expression of dependency.expressions) {
          if (evaluateExpression(expression.expression, valuesToWatch)) {
            setFieldConfig(expression.config);
            // If should_show is explicitly false, keep the field hidden but populate the value
            if (expression.config.should_show === false) {
              setShouldShow(false);
              // Set the default value in the form even when hidden
              if (expression.config.default_value !== undefined) {
                setValue(field.id, expression.config.default_value, { shouldValidate: true });
              }
            } else {
              setShouldShow(true);
            }
            return;
          }
        }
      }

      setShouldShow(false);
      setFieldConfig(null);
    };

    // Initial check
    checkDependencies();

    // Subscribe to changes in dependent fields
    const subscription = watch((value, { name }) => {
      if (field.display_dependencies![0].fields.includes(name!)) {
        checkDependencies();
      }
    });

    return () => subscription.unsubscribe();
  }, [field.display_dependencies, watch, setValue, field.id]);

  return { shouldShow, fieldConfig };
};
