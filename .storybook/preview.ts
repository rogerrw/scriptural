import type { Preview } from '@storybook/react';
import '../app/ui/global.css';

import { withThemeByClassName } from '@storybook/addon-themes';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'dark',
    }),
  ],
};

export default preview;
