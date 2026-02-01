import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs-vite';
import '../src/globals.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    themes: {
      default: 'light',
      list: [
        {
          name: 'light',
          class: 'light',
          color: '#ffffff',
        },
        {
          name: 'dark',
          class: 'dark',
          color: '#1a1a1a',
        },
      ],
    },
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light light-mode',
        dark: 'dark dark-mode',
      },
      defaultTheme: 'light',
    }),
  ],

  tags: ['autodocs'],
};

export default preview;
