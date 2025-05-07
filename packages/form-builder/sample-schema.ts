import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';

import { FormSchema } from './types';

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
      title: 'Account Information',
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
  ],
  fields: {
    account_holder_address_line_1: {
      id: 'account_holder_address_line_1',
      type: 'text',
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
      type: 'text',
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
      type: 'text',
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
      type: 'select',
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
      type: 'text',
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
      type: 'text',
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
                    value: '^[0-9]{5}(-[0-9]{4})?$',
                    message: 'Please enter a valid US ZIP code',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    account_holder_state: {
      id: 'account_holder_state',
      type: 'select',
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
    },
    recipient_account_bank_name: {
      id: 'recipient_account_bank_name',
      type: 'text',
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
      type: 'select',
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
      type: 'select',
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
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account currency is required',
          },
        },
        {
          type: 'enums',
          config: {
            values: ['USD', 'EUR'],
            message: 'Currency must be either USD or EUR',
          },
        },
      ],
    },
    recipient_account_number: {
      id: 'recipient_account_number',
      type: 'text',
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
      type: 'select',
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
      type: 'select',
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
      type: 'text',
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
      type: 'text',
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
                    value: '^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$',
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
      type: 'text',
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
      type: 'text',
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
      type: 'text',
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
      type: 'select',
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
      type: 'text',
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
      type: 'select',
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
      type: 'text',
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
      type: 'text',
      label: 'Recipient Name',
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
    recipient_state: {
      id: 'recipient_state',
      type: 'select',
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
    transfer_type: {
      id: 'transfer_type',
      type: 'select',
      label: 'Transfer Type',
      options: [
        {
          label: 'SWIFT',
          value: 'SWIFT',
        },
        {
          label: 'RTP',
          value: 'RTP',
        },
        {
          label: 'WIRE',
          value: 'WIRE',
        },
      ],
      validations: [
        {
          type: 'required',
          config: {
            message: 'Transfer type is required',
          },
        },
        {
          type: 'enums',
          config: {
            values: ['SWIFT', 'RTP', 'WIRE'],
            message: 'Invalid transfer type',
          },
        },
      ],
    },
  },
};
