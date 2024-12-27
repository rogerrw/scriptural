import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { VariantProps } from 'class-variance-authority';

export default {
  title: 'Components/Input',
  component: Input,
} as Meta;

const Template: StoryFn<VariantProps<typeof Input>> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'email',
  placeholder: 'Email',
};

export const File = Template.bind({});
File.args = {
  type: 'file',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  type: 'email',
  placeholder: 'Email',
};
