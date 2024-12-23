import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Label } from '@/components/ui/label';
import { VariantProps } from 'class-variance-authority';

export default {
    title: 'Components/Label',
    component: Label,
  } as Meta;

  const Template: StoryFn<VariantProps<typeof Label>> = (args) => <Label {...args} />;

  export const Default = Template.bind({});
  Default.args = {
    htmlFor: 'email',
    children: 'Your email address'
  };