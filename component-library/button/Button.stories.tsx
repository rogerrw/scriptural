import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, ButtonProps } from '@/component-library/button';

export default {
  title: 'Components/Button',
  component: Button,
  args: {
    children: "Default",
    size: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'ghost', 'link']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'md', 'lg']
    },
    onClick: { action: 'clicked' },
  },
} as Meta;

const Template: StoryFn<ButtonProps> = (args) => (<Button {...args}/>);


export const Default = Template.bind({});
Default.args = {
  variant: 'default',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Secondary',
};

export const Destructive = Template.bind({});
Destructive.args = {
  variant: 'destructive',
  children: 'Destructive',
};

export const Ghost = Template.bind({});
Ghost.args = {
  variant: 'ghost',
  children: 'Ghost',
};

export const Link = Template.bind({});
Link.args = {
  variant: 'link',
  children: 'Link',
};