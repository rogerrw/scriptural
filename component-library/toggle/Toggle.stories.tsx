import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Toggle } from '@/component-library/toggle';
import { VariantProps } from 'class-variance-authority';

export default {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    onClick: { action: 'clicked' },
    onPressedChange: {action: 'toggled'}
  },
} as Meta;

const Template: StoryFn<VariantProps<typeof Toggle>> = (args) => <Toggle {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: 'Default Button',
  variant: 'default',
  size: 'default',
};

export const Outline = Template.bind({});
Outline.args = {
  children: 'Outline',
  variant: 'outline',
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled',
  pressed: false,
  disabled: true,
};
