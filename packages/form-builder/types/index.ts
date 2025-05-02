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

export interface SelectOption {
  id?: string;
  label: string;
  richLabel?: React.ReactNode;
  value: string | boolean | { type: string; id: string };
  icon?: React.ReactNode;
  displayValue?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  name?: string;
  validations?: Validation[];
  validation_dependencies?: ValidationDependency[];
  options?: SelectOption[];
  data_source?: DataSource;
}

export interface FormSection {
  id: string;
  title: string;
  fields?: string[];
  sections?: FormSection[];
}

export interface FormSchema {
  Id: string;
  Type: string;
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
  validations: z.array(validationSchema).optional(),
  data_source: dataSourceSchema.optional(),
});

export const formSectionSchema: z.ZodType<FormSection> = z.object({
  id: z.string(),
  title: z.string(),
  fields: z.array(z.string()).optional(),
  sections: z.lazy(() => z.array(formSectionSchema)).optional(),
});

export const formSchemaSchema = z.object({
  Id: z.string(),
  Type: z.string(),
  sections: z.array(formSectionSchema),
  fields: z.record(formFieldSchema),
});
