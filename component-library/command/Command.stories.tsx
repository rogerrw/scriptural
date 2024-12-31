import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/component-library/command';

export default {
  title: 'Components/Command',
  component: Command,
  argTypes: {
    shouldFilter: {control: 'boolean', description: 'Toggle to enable or disable filtering while searching an item'},
    placeholder: {control: 'text', description: 'The placeholder for the search input.'}
  }
} as Meta;

interface CustomCommand {
  children: typeof Command;
  placeholder: string;

}

const Template: StoryFn<CustomCommand> = (args) => (
  <Command {...args}> 
    <CommandInput placeholder={args.placeholder}/>
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem>One</CommandItem>
        <CommandItem>Two</CommandItem>
        <CommandItem>Three</CommandItem>
        <CommandItem>Four</CommandItem>
        <CommandItem>Five</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
export const Default = Template.bind({});
