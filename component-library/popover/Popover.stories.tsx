import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { PopoverAnchorProps, PopoverContentProps, PopoverProps, PopoverTriggerProps } from '@radix-ui/react-popover';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/component-library/popover';
import { Button } from '@/component-library/button';

export default {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    open: {control: 'boolean'},
    defaultOpen: {control: 'boolean'},
    align: {control: 'select', options: ['start', 'end', 'center']},
    asChild: {control: 'boolean'},
    onOpenChange: {action: 'open'},
    modal: {control: 'boolean'},
  },
} as Meta;

const Template: StoryFn<PopoverProps & PopoverTriggerProps & PopoverAnchorProps & PopoverContentProps> = (args) => (
  <Popover {...args}>
    <PopoverTrigger asChild>
      <Button>{args.children}</Button>
    </PopoverTrigger>
    <PopoverContent className="w-full" align={args.align}>
      <div className="grid">
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