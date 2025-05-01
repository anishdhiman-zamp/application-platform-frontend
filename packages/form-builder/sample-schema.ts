import { FormSchema } from './types';

export const schema: FormSchema = {
  Id: 'recipient-accounts-robinhood',
  Type: 'recipient',
  sections: [
    {
      id: 'recipient_personal_information',
      title: 'Personal Information',
      sections: [
        {
          id: 'recipient_personal_details',
          title: 'Personal Information',
          fields: ['recipient_name'],
        },
        {
          id: 'recipient_contact_details',
          title: 'Contact Details',
          fields: ['recipient_contact_country_code', 'recipient_contact_number', 'recipient_email'],
        },
        {
          id: 'recipient_address_details',
          title: 'Address Details',
          fields: [
            'recipient_country_code',
            'recipient_state',
            'recipient_city',
            'recipient_address_line_1',
            'recipient_address_line_2',
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
          fields: [
            'recipient_account_currency',
            'recipient_account_country_code',
            'transfer_type',
            'recipient_account_number',
            'recipient_account_routing_code_type_1',
            'recipient_account_routing_code_value_1',
            'recipient_account_routing_code_type_2',
            'recipient_account_routing_code_value_2',
          ],
        },
        {
          id: 'account_holder_details',
          title: 'Account Holder Details',
          fields: [
            'account_holder_name',
            'account_holder_city',
            'account_holder_country',
            'account_holder_postal_code',
            'account_holder_state',
            'account_holder_address_line_1',
            'account_holder_address_line_2',
          ],
        },
        {
          id: 'bank_details',
          title: 'Bank Details',
          fields: ['recipient_account_bank_name'],
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
      },
      validations: [
        {
          type: 'required',
          config: {
            message: 'Account holder country is required',
          },
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
          label: 'USD',
          value: 'USD',
        },
        {
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
      label: 'Routing Code Type 1',
      options: [
        {
          label: 'ABA',
          value: 'ABA',
        },
        {
          label: 'IBAN',
          value: 'IBAN',
        },
      ],
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
      label: 'Routing Code Type 2',
      options: [
        {
          label: 'BIC',
          value: 'BIC',
        },
        {
          label: 'SWIFT',
          value: 'SWIFT',
        },
        {
          label: 'IBAN',
          value: 'IBAN',
        },
        {
          label: 'ACH',
          value: 'ACH',
        },
      ],
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
    },
    recipient_account_routing_code_value_1: {
      id: 'recipient_account_routing_code_value_1',
      type: 'text',
      label: 'Routing Code Value 1',
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
      label: 'Routing Code Value 2 (BIC/SWIFT)',
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
          label: 'ACH',
          value: 'ACH',
        },
        {
          label: 'WIRE',
          value: 'WIRE',
        },
        {
          label: 'BLOCKCHAIN',
          value: 'BLOCKCHAIN',
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
            values: ['SWIFT', 'RTP', 'ACH', 'WIRE', 'BLOCKCHAIN'],
            message: 'Invalid transfer type',
          },
        },
      ],
    },
  },
};
