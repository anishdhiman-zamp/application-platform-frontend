# Form Builder

A powerful, schema-driven form builder package built with React Hook Form, featuring dynamic field rendering, conditional visibility, validation dependencies, and animated transitions.

## Features

- 🎯 **Schema-Driven** - Define forms using JSON schema
- 🔄 **Dynamic Fields** - Conditional show/hide based on other field values
- ✅ **Validation Dependencies** - Apply different validations based on form state
- 🎨 **Animated Transitions** - Smooth animations using Framer Motion (with disable option)
- 📝 **Multiple Field Types** - Text, Select, Radio, Header Text, and more
- 🔌 **Data Source Integration** - Fetch options from APIs dynamically
- 🎛️ **Flexible Layout** - Grid-based layout with configurable column spans
- ⚡ **Animation Control** - Enable, disable, or customize animations via `animationConfig` prop

## Installation

```bash
npm install @zamp-platform/form-builder
```

## Quick Start

```tsx
import { FormBuilder, FormBuilderRef } from '@zamp-platform/form-builder';
import { useRef } from 'react';

const MyForm = () => {
  const formRef = useRef<FormBuilderRef>(null);

  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <>
      <FormBuilder ref={formRef} schema={mySchema} onSubmit={handleSubmit} />
      <button onClick={() => formRef.current?.submit()}>Submit</button>
    </>
  );
};
```

## Schema Structure

```typescript
interface FormSchema {
  id: string;
  type: string;
  sections: OuterFormSection[];
  fields: Record<string, FormField>;
}
```

### Example Schema

```typescript
const schema: FormSchema = {
  id: 'my-form',
  type: 'example',
  sections: [
    {
      id: 'section_1',
      title: 'Personal Information',
      sections: [
        {
          id: 'basic_info',
          title: 'Basic Info',
          layout: [
            [{ col_span: 8, field: 'full_name' }],
            [
              { col_span: 4, field: 'country' },
              { col_span: 4, field: 'state' },
            ],
          ],
        },
      ],
    },
  ],
  fields: {
    full_name: {
      id: 'full_name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      validations: [{ type: 'required', config: { message: 'Name is required' } }],
    },
    // ... more fields
  },
};
```

---

## Field Types

### 1. Text Field (`text`)

Standard text input for single-line text entry.

```typescript
{
  id: 'email',
  type: 'text',
  label: 'Email Address',
  placeholder: 'Enter your email',
  validations: [
    { type: 'required', config: { message: 'Email is required' } },
    {
      type: 'regex',
      config: {
        value: '^[a-zA-Z0-9+_\\-.]+@[a-zA-Z0-9_\\-.]+\\.[a-zA-Z]{2,}$',
        message: 'Please enter a valid email',
      },
    },
  ],
}
```

### 2. Header Text Field (`header-text`)

Large text input styled as a header, useful for titles or prominent fields.

```typescript
{
  id: 'recipient_name',
  type: 'header-text',
  placeholder: 'Recipient Name',
  validations: [
    { type: 'required', config: { message: 'Name is required' } },
    { type: 'maxLength', config: { value: 100, message: 'Max 100 characters' } },
  ],
}
```

### 3. Select Field (`select`)

Dropdown selection with support for static options or dynamic data fetching.

#### Static Options

```typescript
{
  id: 'currency',
  type: 'select',
  label: 'Currency',
  options: [
    { label: 'USD', value: 'USD', icon: { type: 'sprite', category: 'fiat', id: 'USD' } },
    { label: 'EUR', value: 'EUR', icon: { type: 'sprite', category: 'fiat', id: 'EUR' } },
  ],
  validations: [
    { type: 'required', config: { message: 'Currency is required' } },
  ],
}
```

#### Dynamic Options with Data Source

```typescript
{
  id: 'country',
  type: 'select',
  label: 'Country',
  data_source: {
    endpoint: 'v1/forms/countries',
    method: 'GET',
    params: { form_type: 'recipient' },
    body: null,
  },
  validations: [
    { type: 'required', config: { message: 'Country is required' } },
  ],
}
```

#### Dependent Data Source (Cascading Selects)

```typescript
{
  id: 'state',
  type: 'select',
  label: 'State/Province',
  data_source: {
    endpoint: 'v1/forms/states',
    method: 'GET',
    params: {
      country_code: '${country}', // Interpolates value from 'country' field
    },
    body: null,
    triggers: [
      { field: 'country' }, // Re-fetches when 'country' changes
    ],
  },
}
```

### 4. Radio Field (`radio`)

Radio button group for single selection from visible options.

```typescript
{
  id: 'notification_preference',
  type: 'radio',
  label: 'How would you like to be notified?',
  options: [
    { label: 'Email only', value: 'email' },
    { label: 'SMS only', value: 'sms' },
    { label: 'Both Email and SMS', value: 'both' },
    { label: 'No notifications', value: 'none' },
  ],
  validations: [
    { type: 'required', config: { message: 'Please select a preference' } },
  ],
}
```

**Form Value Output:**

```typescript
{
  notification_preference: 'email';
}
```

---

## Animation Control (`animationConfig`)

Control or disable animations. Useful for forms that should appear instantly without transitions.

### FormBuilderAnimationConfig Interface

```typescript
interface FormBuilderAnimationConfig {
  /** Disable all animations */
  disabled?: boolean;
  /** Section animation config */
  section?: {
    initial?: AnimationTargetConfig;
    animate?: AnimationTargetConfig;
    exit?: AnimationTargetConfig;
    transition?: {
      duration?: number;
      delay?: number;
      ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'backIn' | 'backOut';
      staggerChildren?: number;
    };
  };
  /** Field animation config */
  field?: {
    initial?: AnimationTargetConfig;
    animate?: AnimationTargetConfig;
    exit?: AnimationTargetConfig;
    transition?: {
      duration?: number;
      delay?: number;
      ease?: string;
    };
  };
}

interface AnimationTargetConfig {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  height?: number | string;
}
```

### Disable All Animations

```tsx
import { FormBuilder, FormBuilderAnimationConfig } from '@zamp-platform/form-builder';

const animationConfig: FormBuilderAnimationConfig = {
  disabled: true,
};

<FormBuilder schema={mySchema} onSubmit={handleSubmit} animationConfig={animationConfig} />;
```

### Custom Animations

```tsx
const animationConfig: FormBuilderAnimationConfig = {
  section: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  field: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
};

<FormBuilder schema={mySchema} onSubmit={handleSubmit} animationConfig={animationConfig} />;
```

---

## Validation Types

| Type                   | Description                     | Config                                       |
| ---------------------- | ------------------------------- | -------------------------------------------- |
| `required`             | Field must have a value         | `{ message: string }`                        |
| `minLength`            | Minimum character length        | `{ value: number, message: string }`         |
| `maxLength`            | Maximum character length        | `{ value: number, message: string }`         |
| `regex`                | Pattern matching                | `{ value: string (regex), message: string }` |
| `enums`                | Value must be in allowed list   | `{ values: string[], message: string }`      |
| `contact-country-code` | Contact country code validation | `{ message: string }`                        |
| `country-code`         | Country code validation         | `{ message: string }`                        |
| `country-state`        | State validation                | `{ message: string }`                        |

### Validation Example

```typescript
validations: [
  { type: 'required', config: { message: 'This field is required' } },
  { type: 'minLength', config: { value: 2, message: 'Minimum 2 characters' } },
  { type: 'maxLength', config: { value: 100, message: 'Maximum 100 characters' } },
  {
    type: 'regex',
    config: {
      value: '^[0-9]{9}$',
      message: 'Must be exactly 9 digits',
    },
  },
];
```

---

## Advanced Features

### Display Dependencies (Conditional Visibility)

Show or hide fields based on other field values.

```typescript
{
  id: 'us_tax_id',
  type: 'text',
  label: 'US Tax ID',
  display_dependencies: [
    {
      fields: ['country'],
      expressions: [
        {
          expression: {
            logical_operator: 'AND',
            conditions: [
              {
                field: 'country',
                operator: 'eq',
                value: 'US',
                logical_operator: null,
                conditions: null,
              },
            ],
          },
          config: {
            should_show: true,
            label: 'US Tax ID (SSN/EIN)',
          },
        },
      ],
    },
  ],
}
```

### Hidden Fields with Auto-Population

Set field values automatically without showing the field:

```typescript
{
  id: 'routing_code_type',
  type: 'select',
  label: '',
  display_dependencies: [
    {
      fields: ['country'],
      expressions: [
        {
          expression: {
            logical_operator: 'AND',
            conditions: [
              { field: 'country', operator: 'eq', value: 'US', logical_operator: null, conditions: null },
            ],
          },
          config: {
            should_show: false, // Hidden but value is set
            default_value: 'ABA',
          },
        },
      ],
    },
  ],
}
```

### Validation Dependencies (Conditional Validation)

Apply different validations based on form state.

```typescript
{
  id: 'account_number',
  type: 'text',
  label: 'Account Number',
  validation_dependencies: [
    {
      fields: ['country'],
      expressions: [
        {
          expression: {
            logical_operator: 'AND',
            conditions: [
              { field: 'country', operator: 'eq', value: 'US', logical_operator: null, conditions: null },
            ],
          },
          validations: [
            {
              type: 'regex',
              config: { value: '^[0-9]{4,17}$', message: 'US accounts: 4-17 digits' },
            },
          ],
        },
        {
          expression: {
            logical_operator: 'AND',
            conditions: [
              { field: 'country', operator: 'in', value: ['DE', 'FR', 'ES'], logical_operator: null, conditions: null },
            ],
          },
          validations: [
            {
              type: 'regex',
              config: { value: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$', message: 'Please enter valid IBAN' },
            },
          ],
        },
      ],
    },
  ],
}
```

### Condition Operators

| Operator | Description           | Example                                   |
| -------- | --------------------- | ----------------------------------------- |
| `eq`     | Equals                | `{ operator: 'eq', value: 'US' }`         |
| `neq`    | Not equals            | `{ operator: 'neq', value: '' }`          |
| `in`     | Value in array        | `{ operator: 'in', value: ['US', 'CA'] }` |
| `gt`     | Greater than          | `{ operator: 'gt', value: '10' }`         |
| `gte`    | Greater than or equal | `{ operator: 'gte', value: '0' }`         |
| `lt`     | Less than             | `{ operator: 'lt', value: '100' }`        |
| `lte`    | Less than or equal    | `{ operator: 'lte', value: '50' }`        |

---

## Layout System

The layout uses a 12-column grid system. Each field specifies its `col_span`:

```typescript
layout: [
  // Row 1: Full width field
  [{ col_span: 8, field: 'full_name' }],

  // Row 2: Two fields side by side
  [
    { col_span: 4, field: 'first_name' },
    { col_span: 4, field: 'last_name' },
  ],

  // Row 3: Three fields
  [
    { col_span: 2, field: 'country_code' },
    { col_span: 3, field: 'area_code' },
    { col_span: 3, field: 'phone_number' },
  ],
];
```

---

## API Reference

### FormBuilder Props

| Prop              | Type                              | Description                          |
| ----------------- | --------------------------------- | ------------------------------------ |
| `schema`          | `FormSchema`                      | The form schema definition           |
| `onSubmit`        | `(data: any) => void`             | Callback when form is submitted      |
| `ref`             | `React.RefObject<FormBuilderRef>` | Ref to access form methods           |
| `animationConfig` | `FormBuilderAnimationConfig`      | Animation configuration (or disable) |

### FormBuilderRef Methods

| Method     | Description                      |
| ---------- | -------------------------------- |
| `submit()` | Programmatically submit the form |

---

## Exports

```typescript
// Components
export { FormBuilder, FormBuilderRef } from './components/FormBuilder';

// Types
export {
  FormSchema,
  FormField,
  FormSection,
  FieldType,
  Validation,
  ValidationType,
  ValidationConfig,
  ValidationDependency,
  DisplayDependency,
  DataSource,
  RadioOption,
  SelectOption,
  Condition,
  Expression,
  FormBuilderAnimationConfig,
  AnimationTargetConfig,
  AnimationTransitionConfig,
} from './types';

// Utilities
export { validateField, createCustomResolver } from './utils/validation';
export { fetchDataSource } from './utils/dataSource';

// Sample Schema
export { schema } from './sample-schema';
```

---

## Dependencies

- `react-hook-form` - Form state management
- `framer-motion` / `motion` - Animations
- `@zamp-platform/ui` - UI components (Input, Select, Radio, Label, etc.)
- `zod` - Runtime schema validation
