import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Input } from '@/component-library/input';
import { VariantProps } from 'class-variance-authority';

export default {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    value: {control: 'text'},
    placeholder: {control: 'text'},
    size: {control: 'radio', options: ['small','medium','large'], mapping: {
      'small': 10,
      'medium:': 20,
      'large': 35
    }},
    type: {table: {disable: true}},
    onChange: {action: 'change'},
  }
} as Meta;

const Template: StoryFn<VariantProps<typeof Input>> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'email',
  placeholder: 'Email',
};

export const File = Template.bind({});
File.parameters = {controls: {disable: true}}
File.args = {
  ...Default.args,
  type: 'file',
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};
