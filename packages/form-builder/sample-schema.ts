import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';

import { FieldType, FormSchema, InlineFieldDisplayMode, InlineFieldShowWhen } from './types';

export const schema: FormSchema = {
  id: 'recipient-with-account',
  type: 'recipient',
  sections: [
    {
      id: 'recipient_personal_information',
      title: '',
      sections: [
        {
          id: 'recipient_personal_details',
          title: 'Personal Information',
          layout: [
            [
              {
                col_span: 8,
                field: 'recipient_name',
              },
            ],
          ],
        },
        {
          id: 'recipient_contact_details',
          title: 'Contact Details',
          layout: [
            [
              {
                col_span: 8,
                field: 'recipient_email',
              },
            ],
            [
              {
                col_span: 2,
                field: 'recipient_contact_country_code',
              },
              {
                col_span: 6,
                field: 'recipient_contact_number',
              },
            ],
          ],
        },
        {
          id: 'recipient_address_details',
          title: 'Address Details',
          layout: [
            [
              {
                col_span: 8,
                field: 'recipient_address_line_1',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_address_line_2',
              },
            ],
            [
              {
                col_span: 4,
                field: 'recipient_country_code',
              },
              {
                col_span: 4,
                field: 'recipient_state',
              },
            ],
            [
              {
                col_span: 4,
                field: 'recipient_city',
              },
              {
                col_span: 4,
                field: 'recipient_postal_code',
              },
            ],
          ],
        },
      ],
    },
    {
      id: 'recipient_account_information',
      title: '',
      sections: [
        {
          id: 'account_details',
          title: 'Account Details',
          layout: [
            [
              {
                col_span: 4,
                field: 'recipient_account_currency',
              },
              {
                col_span: 4,
                field: 'recipient_account_country_code',
              },
            ],
            [
              {
                col_span: 8,
                field: 'transfer_type',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_bank_name',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_number',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_type_1',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_1',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_type_2',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_2',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_3',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_3',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_4',
              },
            ],
            [
              {
                col_span: 8,
                field: 'recipient_account_routing_code_value_4',
              },
            ],
          ],
        },
        {
          id: 'account_holder_details',
          title: 'Account Holder Details',
          layout: [
            [
              {
                col_span: 8,
                field: 'account_holder_name',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_country',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_state',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_city',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_postal_code',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_address_line_1',
              },
            ],
            [
              {
                col_span: 8,
                field: 'account_holder_address_line_2',
              },
            ],
          ],
        },
      ],
    },
    {
      id: 'recipient_preferences',
      title: '',
      sections: [
        {
          id: 'transfer_preferences',
          title: 'Transfer Preferences',
          layout: [
            [
              {
                col_span: 8,
                field: 'transfer_frequency',
              },
            ],
            [
              {
                col_span: 8,
                field: 'notification_preference',
              },
            ],
            [
              {
                col_span: 8,
                field: 'additional_notes',
              },
            ],
          ],
        },
      ],
    },
  ],
  fields: {
    account_holder_address_line_1: {
      id: 'account_holder_address_line_1',
      type: FieldType.TEXT,
      label: 'Account Holder Address Line 1',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Address is required for US accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder Address Line 1',
              },
            },
          ],
        },
      ],
      validations: [
        {
          type: 'maxLength',
          config: {
            value: 35,
            message: 'Address must not exceed 35 characters',
          },
        },
      ],
    },
    account_holder_address_line_2: {
      id: 'account_holder_address_line_2',
      type: FieldType.TEXT,
      label: 'Account Holder Address Line 2',
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder Address Line 2',
              },
            },
          ],
        },
      ],
      validations: [
        {
          type: 'maxLength',
          config: {
            value: 35,
            message: 'Address Line 2 must not exceed 35 characters',
          },
        },
      ],
    },
    account_holder_city: {
      id: 'account_holder_city',
      type: FieldType.TEXT,
      label: 'Account Holder City',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'City is required for US accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder City',
              },
            },
          ],
        },
      ],
      validations: [
        {
          type: 'regex',
          config: {
            value: '^[a-zA-Z0-9 .,-]{1,50}$',
            message: 'Please enter a valid city name',
          },
        },
      ],
    },
    account_holder_country: {
      id: 'account_holder_country',
      type: FieldType.SELECT,
      label: 'Account Holder Country',
      data_source: {
        endpoint: 'v1/forms/countries',
        method: 'GET',
        params: {
          form_type: 'recipient',
        },
        body: null,
      },
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Country is required for US accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder Country',
              },
            },
          ],
        },
      ],
    },
    account_holder_name: {
      id: 'account_holder_name',
      type: FieldType.TEXT,
      label: 'Account Holder Name',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account holder name is required',
          },
        },
        {
          type: 'minLength',
          config: {
            value: 1,
            message: 'Account holder name must be at least 1 character',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 100,
            message: 'Account holder name must not exceed 100 characters',
          },
        },
      ],
    },
    account_holder_postal_code: {
      id: 'account_holder_postal_code',
      type: FieldType.TEXT,
      label: 'Account Holder Postal Code',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Postal code is required for US accounts',
                  },
                },
                {
                  type: 'regex',
                  config: {
                    value: '^[0-9]{5,9}$',
                    message: 'Please enter a valid US ZIP code',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder Postal Code',
              },
            },
          ],
        },
      ],
    },
    account_holder_state: {
      id: 'account_holder_state',
      type: FieldType.SELECT,
      label: 'Account Holder State',
      data_source: {
        endpoint: 'v1/forms/states',
        method: 'GET',
        params: {
          country_code: '${account_holder_country}',
        },
        body: null,
        triggers: [
          {
            field: 'account_holder_country',
          },
        ],
      },
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'State is required for US accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'Account Holder State',
              },
            },
          ],
        },
      ],
    },
    recipient_account_bank_name: {
      id: 'recipient_account_bank_name',
      type: FieldType.TEXT,
      label: 'Bank Name',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Bank name is required',
          },
        },
        {
          type: 'regex',
          config: {
            value: '^[a-zA-Z0-9 .,-]{1,100}$',
            message: 'Please enter a valid bank name',
          },
        },
      ],
    },
    recipient_account_country_code: {
      id: 'recipient_account_country_code',
      type: FieldType.SELECT,
      label: 'Account Country',
      data_source: {
        endpoint: 'v1/forms/countries',
        method: 'GET',
        params: {
          form_type: 'recipient',
        },
        body: {},
      },
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account country is required',
          },
        },
      ],
    },
    recipient_account_currency: {
      id: 'recipient_account_currency',
      type: FieldType.SELECT,
      label: 'Account Currency',
      options: [
        {
          icon: {
            category: ICON_SPRITE_TYPES.FIAT_CURRENCIES,
            id: 'USD',
            type: 'sprite',
          },
          label: 'USD',
          value: 'USD',
        },
        {
          icon: {
            category: ICON_SPRITE_TYPES.FIAT_CURRENCIES,
            id: 'EUR',
            type: 'sprite',
          },
          label: 'EUR',
          value: 'EUR',
        },
        {
          label: 'Other Currency',
          value: 'other',
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account currency is required',
          },
        },
      ],
    },
    recipient_account_number: {
      id: 'recipient_account_number',
      type: FieldType.TEXT,
      label: 'Account Number',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'regex',
                  config: {
                    value: '^[0-9]{4,17}$',
                    message: 'US account numbers must be 4-17 digits',
                  },
                },
              ],
            },
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'regex',
                  config: {
                    value: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$',
                    message: 'Please enter a valid IBAN format',
                  },
                },
              ],
            },
          ],
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account number is required',
          },
        },
      ],
    },
    recipient_account_routing_code_type_1: {
      id: 'recipient_account_routing_code_type_1',
      type: FieldType.SELECT,
      label: '',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Routing code type is required for US accounts',
                  },
                },
                {
                  type: 'enums',
                  config: {
                    values: ['ABA'],
                    message: 'Routing code type must be ABA for US accounts',
                  },
                },
              ],
            },
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL', 'GB'],
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Routing code type is required for EU accounts',
                  },
                },
                {
                  type: 'enums',
                  config: {
                    values: ['IBAN'],
                    message: 'Routing code type must be IBAN for EU accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: 'ABA',
                should_show: false,
                label: '',
              },
            },
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: 'IBAN',
                should_show: false,
                label: '',
              },
            },
          ],
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Routing code type is required',
          },
        },
      ],
    },
    recipient_account_routing_code_type_2: {
      id: 'recipient_account_routing_code_type_2',
      type: FieldType.SELECT,
      label: '',
      validation_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Second routing code type is required for EU accounts',
                  },
                },
                {
                  type: 'enums',
                  config: {
                    values: ['BIC'],
                    message: 'Second routing code type must be BIC for EU accounts',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: 'BIC',
                should_show: false,
                label: '',
              },
            },
          ],
        },
      ],
    },
    recipient_account_routing_code_value_1: {
      id: 'recipient_account_routing_code_value_1',
      type: FieldType.TEXT,
      label: '',
      validation_dependencies: [
        {
          fields: ['recipient_account_routing_code_type_1'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_routing_code_type_1',
                    operator: 'eq',
                    value: 'ABA',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'regex',
                  config: {
                    value: '^[0-9]{9}$',
                    message: 'ABA routing number must be 9 digits',
                  },
                },
              ],
            },
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_routing_code_type_1',
                    operator: 'eq',
                    value: 'IBAN',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'regex',
                  config: {
                    value: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$',
                    message: 'Please enter a valid IBAN format',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'eq',
                    value: 'US',
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'ABA',
              },
            },
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'IBAN',
              },
            },
          ],
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Routing code value is required',
          },
        },
      ],
    },
    recipient_account_routing_code_value_2: {
      id: 'recipient_account_routing_code_value_2',
      type: FieldType.TEXT,
      label: 'Routing Code Value 2',
      validation_dependencies: [
        {
          fields: ['recipient_account_routing_code_type_2'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_routing_code_type_2',
                    operator: 'eq',
                    value: 'BIC',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'BIC code is required for EU countries',
                  },
                },
                {
                  type: 'regex',
                  config: {
                    value: '^[A-Z0-9]{8,11}$',
                    message: 'Please enter a valid BIC/SWIFT code',
                  },
                },
              ],
            },
          ],
        },
      ],
      display_dependencies: [
        {
          fields: ['recipient_account_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_account_country_code',
                    operator: 'in',
                    value: ['DE', 'FR', 'ES', 'IT', 'NL'],
                    conditions: null,
                  },
                ],
              },
              config: {
                default_value: '',
                should_show: true,
                label: 'BIC',
              },
            },
          ],
        },
      ],
    },
    recipient_address_line_1: {
      id: 'recipient_address_line_1',
      type: FieldType.TEXT,
      label: 'Address Line 1',
      validations: [
        {
          type: 'maxLength',
          config: {
            value: 35,
            message: 'Address Line 1 must not exceed 35 characters',
          },
        },
      ],
    },
    recipient_address_line_2: {
      id: 'recipient_address_line_2',
      type: FieldType.TEXT,
      label: 'Address Line 2',
      validations: [
        {
          type: 'maxLength',
          config: {
            value: 35,
            message: 'Address Line 2 must not exceed 35 characters',
          },
        },
      ],
    },
    recipient_city: {
      id: 'recipient_city',
      type: FieldType.TEXT,
      label: 'City',
      validations: [
        {
          type: 'regex',
          config: {
            value: '^[a-zA-Z0-9 .,-]{1,50}$',
            message: 'Please enter a valid city name',
          },
        },
      ],
    },
    recipient_contact_country_code: {
      id: 'recipient_contact_country_code',
      type: FieldType.SELECT,
      label: 'Contact Country Code',
      data_source: {
        endpoint: 'v1/forms/contact-codes',
        method: 'GET',
        params: null,
        body: null,
      },
    },
    recipient_contact_number: {
      id: 'recipient_contact_number',
      type: FieldType.TEXT,
      label: 'Contact Number',
      validation_dependencies: [
        {
          fields: ['recipient_contact_country_code'],
          expressions: [
            {
              expression: {
                logical_operator: 'AND',
                conditions: [
                  {
                    logical_operator: null,
                    field: 'recipient_contact_country_code',
                    operator: 'neq',
                    value: '',
                    conditions: null,
                  },
                ],
              },
              validations: [
                {
                  type: 'required',
                  config: {
                    message: 'Contact number is required when country code is provided',
                  },
                },
              ],
            },
          ],
        },
      ],
      validations: [
        {
          type: 'regex',
          config: {
            value: '^[0-9]{5,15}$',
            message: 'Contact number must be 5-15 digits',
          },
        },
      ],
    },
    recipient_country_code: {
      id: 'recipient_country_code',
      type: FieldType.SELECT,
      label: 'Country',
      data_source: {
        endpoint: 'v1/forms/countries',
        method: 'GET',
        params: null,
        body: null,
      },
    },
    recipient_email: {
      id: 'recipient_email',
      type: FieldType.TEXT,
      label: 'Recipient Email',
      validations: [
        {
          type: 'regex',
          config: {
            value: '(^([a-zA-Z0-9+_\\-.]+)@([a-zA-Z0-9_\\-.]+)\\.([a-zA-Z]{2,63})$)|(^$)',
            message: 'Please enter a valid email address',
          },
        },
      ],
    },
    recipient_name: {
      id: 'recipient_name',
      type: FieldType.HEADER_TEXT,
      placeholder: 'Recipient Name',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Name is required',
          },
        },
        {
          type: 'minLength',
          config: {
            value: 1,
            message: 'Name must be at least 1 character',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 100,
            message: 'Name must not exceed 100 characters',
          },
        },
      ],
    },
    recipient_postal_code: {
      id: 'recipient_postal_code',
      type: FieldType.TEXT,
      label: 'Postal Code',
      validations: [
        {
          type: 'regex',
          config: {
            value: '^[0-9]{5,9}$',
            message: 'Please enter a valid postal code',
          },
        },
      ],
    },
    recipient_state: {
      id: 'recipient_state',
      type: FieldType.SELECT,
      label: 'State/Province',
      data_source: {
        endpoint: 'v1/forms/states',
        method: 'GET',
        params: {
          country_code: '${recipient_country_code}',
        },
        body: null,
        triggers: [
          {
            field: 'recipient_country_code',
          },
        ],
      },
    },

    custom_frequency: {
      id: 'custom_frequency',
      type: FieldType.TEXT,
      label: 'Custom Frequency',
      placeholder: 'Enter custom frequency (e.g., Bi-weekly)',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Please specify your custom frequency',
          },
        },
      ],
    },
    additional_notes_text: {
      id: 'additional_notes_text',
      type: FieldType.TEXT,
      label: 'Note',
      placeholder: 'Add a note',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Please enter your requirements',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 500,
            message: 'Note must not exceed 500 characters',
          },
        },
      ],
    },

    transfer_frequency: {
      id: 'transfer_frequency',
      type: FieldType.RADIO,
      label: 'How often do you plan to send transfers?',
      options: [
        { label: 'One-time transfer', value: 'one_time' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        {
          label: 'Other',
          value: 'other',
          inline_field: {
            field: 'custom_frequency',
            display_mode: InlineFieldDisplayMode.BELOW,
            show_when: InlineFieldShowWhen.SELECTED,
          },
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Please select a transfer frequency',
          },
        },
      ],
    },
    notification_preference: {
      id: 'notification_preference',
      type: FieldType.RADIO,
      label: 'How would you like to be notified?',
      options: [
        { label: 'Email only', value: 'email' },
        { label: 'SMS only', value: 'sms' },
        { label: 'Both Email and SMS', value: 'both' },
        { label: 'No notifications', value: 'none' },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Please select a notification preference',
          },
        },
      ],
    },
    additional_notes: {
      id: 'additional_notes',
      type: FieldType.RADIO,
      label: 'Do you have any special requirements?',
      options: [
        { label: 'No special requirements', value: 'none' },
        { label: 'Urgent transfer needed', value: 'urgent' },
        { label: 'Recurring schedule', value: 'recurring' },
        {
          label: 'Add a note',
          value: 'other',
          inline_field: {
            field: 'additional_notes_text',
            display_mode: InlineFieldDisplayMode.REPLACE,
            show_when: InlineFieldShowWhen.SELECTED,
          },
        },
      ],
    },
  },
};
