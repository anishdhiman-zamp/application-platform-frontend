import type { FormSchema, FormSection, OuterFormSection } from '@zamp-platform/form-builder';
import { normalize } from '@zamp-platform/utils';
import { IntegrationAuth } from 'modules/integrations/types/integrations.types';
import { FORM_SCHEMA_TYPE } from '@/modules/integrations/constants/integrations.constant';

/**
 * Injects email alias prefix and default value into email-alias type fields
 * This function modifies the form schema to include prefix and default_value
 * for email-alias type fields, following the structure in email-forwarding.json
 *
 * @param fields - The fields object from IntegrationAuth
 * @param prefix - Optional prefix to inject into email-alias fields (e.g., "org-")
 * @param defaultValue - Optional default value to inject into email-alias fields
 * @returns Modified fields object with injected values
 */
const injectEmailAliasConfig = (
  fields: IntegrationAuth['fields'],
  orgName?: string,
  processName?: string,
): IntegrationAuth['fields'] => {
  if (!fields || !orgName) {
    return fields;
  }

  const modifiedFields: IntegrationAuth['fields'] = { ...fields };
  const defaultValue = processName
    ? normalize(processName) +
      '-' +
      Array.from({ length: 4 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('')
    : '';
  const prefix = orgName ? `${normalize(orgName)}-` : '';

  // Find and update email-alias type fields
  Object.keys(modifiedFields).forEach((fieldKey) => {
    const field = modifiedFields[fieldKey];

    if (field && field.type === 'email-alias') {
      modifiedFields[fieldKey] = {
        ...field,
        ...(!!prefix && { prefix: prefix }),
        ...(!!defaultValue && { default_value: defaultValue }),
      };
    }
  });

  return modifiedFields;
};

export const generateFormSections = (
  id: string,
  authContent: IntegrationAuth,
  orgName?: string,
  processName?: string,
): FormSchema => {
  if (!authContent?.fields) {
    return {
      id,
      type: FORM_SCHEMA_TYPE.CONNECTION,
      sections: [],
      fields: {},
    };
  }

  // Inject email alias configuration into fields
  const fieldsWithConfig = injectEmailAliasConfig(authContent.fields, orgName, processName);

  // Create layout array with col_span: 8 for each field key
  const layout: FormSection['layout'] = Object.keys(fieldsWithConfig).map((fieldKey) => [
    {
      field: fieldKey,
      col_span: 8,
    },
  ]);

  // Create one section object inside the sections array
  const innerSection: FormSection = {
    id: 'form_fields',
    title: '',
    layout,
  };

  const outerSection: OuterFormSection = {
    id: 'form_section',
    title: '',
    sections: [innerSection],
  };

  // Return complete FormSchema
  return {
    id,
    type: FORM_SCHEMA_TYPE.CONNECTION,
    sections: [outerSection],
    fields: fieldsWithConfig,
  };
};
