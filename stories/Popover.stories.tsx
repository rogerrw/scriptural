import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { PopoverAnchorProps, PopoverContentProps, PopoverProps, PopoverTriggerProps } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';

export default {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    align: {control: 'select', options: ['start', 'end', 'center']},
    asChild: {control: 'boolean'}
  },
  onClick: { action: 'clicked' },
} as Meta;

const Template: StoryFn<PopoverProps & PopoverTriggerProps & PopoverAnchorProps & PopoverContentProps> = (args) => (
  <Popover {...args}>
    <PopoverTrigger asChild>
      <Button>{args.children}</Button>
    </PopoverTrigger>
    <PopoverContent className="w-80" align={args.align}>
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">Popover Content</p>
      </div>
    </PopoverContent>
  </Popover>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Default',
};

export const Opened = Template.bind({});
Opened.args= {
  children: 'Opened',
  defaultOpen: true
}