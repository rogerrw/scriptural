import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Badge, BadgeProps } from '@/components/ui/badge';

export default {
    title: 'Components/Badge',
    component: Badge,
    argTypes: {
      variant: {
        control: {
          type: 'select',
          options: ['primary', 'secondary', 'danger'],
        },
      },
    },
  } as Meta;

const Template: StoryFn<BadgeProps> = (args) => <Badge {...args} />;

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
  children: 'Default',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Secondary',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  children: 'Outline',
};

export const Destructive = Template.bind({});
Destructive.args = {
  variant: 'destructive',
  children: 'Destructive',
};

