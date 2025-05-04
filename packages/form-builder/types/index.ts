import { z } from 'zod';

export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'regex'
  | 'enums'
  | 'contact-country-code'
  | 'country-code'
  | 'country-state';

export interface ValidationConfig {
  message: string;
  value?: number | string;
  values?: string[];
  params?: Record<string, string>;
}

export interface Validation {
  type: ValidationType;
  config: ValidationConfig;
}

export interface DataSource {
  endpoint: string;
  method: 'GET' | 'POST';
  params?: Record<string, string>;
  body?: Record<string, any>;
  triggers?: Array<{
    field: string;
  }>;
  valueFormatter?: (value: any) => SelectOption[];
  useCustomHook?: (...args: any[]) => any;
}

export interface Condition {
  logical_operator: '' | 'AND' | 'OR' | null;
  field: string;
  operator: 'in' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string | string[];
  conditions?: [] | Condition[] | null;
}

export interface Expression {
  logical_operator: 'AND' | 'OR';
  conditions: [] | Condition[];
}

export interface ValidationDependency {
  fields: string[];
  expressions: Array<{
    expression: Expression;
    validations: Validation[];
  }>;
}

export type FieldType = 'text' | 'select' | 'input' | 'multi-select';

export type SelectOptionValue = string | boolean | { type: string; id: string };
export interface SelectOption {
  id?: string;
  label: string;
  richLabel?: React.ReactNode;
  value: SelectOptionValue;
  icon?: React.ReactNode;
  displayValue?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  name?: string;
  validations?: Validation[];
  validation_dependencies?: ValidationDependency[];
  options?: SelectOption[];
  data_source?: DataSource;
}

export interface FormSection {
  id: string;
  title?: string;
  sections?: FormSection[];
  layout: Array<Array<{ field: string; colSpan: number }>>;
}

export interface FormSchema {
  id: string;
  type: string;
  sections: FormSection[];
  fields: Record<string, FormField>;
}

export type FormValues = Record<string, any>;

// Zod schemas for runtime validation
export const validationConfigSchema = z.object({
  message: z.string(),
  value: z.number().optional(),
  params: z.record(z.string()).optional(),
});

export const validationSchema = z.object({
  type: z.enum(['required', 'minLength', 'regex', 'contact-country-code', 'country-code', 'country-state']),
  config: validationConfigSchema,
});

export const dataSourceSchema = z.object({
  endpoint: z.string(),
  method: z.enum(['GET', 'POST']),
  params: z.record(z.string()),
  body: z.record(z.any()),
  triggers: z.array(z.object({ field: z.string() })).optional(),
});

export const formFieldSchema = z.object({
  type: z.enum(['text', 'select']),
  label: z.string(),
  name: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  validations: z.array(validationSchema).optional(),
  data_source: dataSourceSchema.optional(),
});

export const formSectionSchema: z.ZodType<FormSection> = z.object({
  id: z.string(),
  title: z.string(),
  sections: z.lazy(() => z.array(formSectionSchema)).optional(),
  layout: z.array(
    z.array(
      z.object({
        field: z.string(),
        colSpan: z.number(),
      }),
    ),
  ),
});

export const formSchemaSchema = z.object({
  Id: z.string(),
  Type: z.string(),
  sections: z.array(formSectionSchema),
  fields: z.record(formFieldSchema),
});
