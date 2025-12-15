import type { FormSchema } from '@zamp-platform/form-builder';

export const connectionSchema: FormSchema = {
  id: 'connection-config',
  type: 'connection',
  sections: [
    {
      id: 'connection_details',
      title: '',
      sections: [
        {
          id: 'connection_information',
          title: '',
          layout: [
            [
              {
                col_span: 8,
                field: 'connection_name',
              },
            ],
            [
              {
                col_span: 8,
                field: 'user_name',
              },
            ],
            [
              {
                col_span: 8,
                field: 'host_address',
              },
            ],
            [
              {
                col_span: 8,
                field: 'port',
              },
            ],
            [
              {
                col_span: 8,
                field: 'authentication',
              },
            ],
          ],
        },
      ],
    },
  ],
  fields: {
    connection_name: {
      id: 'connection_name',
      type: 'text',
      label: 'Connection Name',
      default_value: '',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Connection name is required',
          },
        },
        {
          type: 'minLength',
          config: {
            value: 1,
            message: 'Connection name must be at least 1 character',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 100,
            message: 'Connection name must not exceed 100 characters',
          },
        },
      ],
    },
    user_name: {
      id: 'user_name',
      type: 'text',
      label: 'User Name',
      default_value: '',
      validations: [
        {
          type: 'required',
          config: {
            message: 'User name is required',
          },
        },
        {
          type: 'minLength',
          config: {
            value: 1,
            message: 'User name must be at least 1 character',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 255,
            message: 'User name must not exceed 255 characters',
          },
        },
      ],
    },
    host_address: {
      id: 'host_address',
      type: 'text',
      label: 'Host Address',
      default_value: '',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Host address is required',
          },
        },
        {
          type: 'regex',
          config: {
            value:
              '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$',
            message: 'Please enter a valid hostname or IP address',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 255,
            message: 'Host address must not exceed 255 characters',
          },
        },
      ],
    },
    port: {
      id: 'port',
      type: 'text',
      label: 'Port',
      default_value: '',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Port is required',
          },
        },
        {
          type: 'regex',
          config: {
            value:
              '^([1-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$',
            message: 'Port must be a number between 1 and 65535',
          },
        },
      ],
    },
    authentication: {
      id: 'authentication',
      type: 'text',
      label: 'Authentication',
      default_value: '',
      validations: [
        {
          type: 'required',
          config: {
            message: 'Authentication is required',
          },
        },
        {
          type: 'minLength',
          config: {
            value: 1,
            message: 'Authentication must be at least 1 character',
          },
        },
        {
          type: 'maxLength',
          config: {
            value: 500,
            message: 'Authentication must not exceed 500 characters',
          },
        },
      ],
    },
  },
};
