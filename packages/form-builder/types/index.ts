/* eslint-disable @typescript-eslint/no-explicit-any */

import { SelectOption as BaseSelectOption } from '@zamp-platform/ui';
import { z } from 'zod';

export interface InlineFieldConfig {
  field: string;
}

export interface ExtendedSelectOption extends BaseSelectOption {
  inline_field?: InlineFieldConfig;
}

export type RadioOption = ExtendedSelectOption;
export type SelectOption = ExtendedSelectOption;

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
  params?: null | Record<string, string>;
  body?: null | Record<string, any>;
  triggers?: Array<{
    field: string;
  }>;
  valueFormatter?: (value: any) => SelectOption[];
  useCustomHook?: (...args: any[]) => any;
}

export interface Condition {
  field: string;
  operator: 'in' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string | string[];
  conditions?: [] | Condition[] | null;
  logical_operator?: 'AND' | 'OR' | null;
}

export interface Expression {
  logical_operator: '' | 'AND' | 'OR' | null;
  conditions: null | [] | Condition[];
}

export interface ValidationDependency {
  fields: string[];
  expressions: Array<{
    expression: Expression;
    validations: Validation[];
  }>;
}

export interface FieldConfig {
  default_value?: string;
  label?: string;
  should_show?: boolean;
  placeholder?: string;
  options?: SelectOption[];
}

export interface DisplayDependency {
  fields: string[];
  expressions: Array<{ expression: Expression; config: FieldConfig }>;
}

export enum FieldType {
  TEXT = 'text',
  SELECT = 'select',
  INPUT = 'input',
  MULTI_SELECT = 'multi-select',
  HEADER_TEXT = 'header-text',
  RADIO = 'radio',
  EMAIL_ALIAS = 'email-alias',
}

export type SelectOptionValue = string | boolean | { type: string; id: string };

export interface FormField {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  default_value?: any;
  name?: string;
  validations?: Validation[];
  validation_dependencies?: ValidationDependency[];
  options?: SelectOption[] | RadioOption[];
  data_source?: DataSource;
  display_dependencies?: DisplayDependency[];
}

export interface FormSection {
  id: string;
  title?: string;
  layout: Array<Array<FormSectionLayout>>;
}

export interface FormSectionLayout {
  field: string;
  col_span: number;
}

export interface OuterFormSection {
  id: string;
  title?: string;
  sections?: FormSection[];
}

export interface FormSchema {
  id: string;
  type: string;
  sections: OuterFormSection[];
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
  type: z.nativeEnum(FieldType),
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
        col_span: z.number(),
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
