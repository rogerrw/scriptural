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
} from '../components/ui/command';

export default {
    title: 'Components/Command',
    component: Command,
} as Meta;

interface CustomCommand {
    inputPlaceHolder: string;
    children: React.ReactNode;
}

const Template: StoryFn<CustomCommand> = (args) => 
        <Command>
            <CommandInput placeholder={args.inputPlaceHolder}/>
            <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
            <CommandItem>
                One
            </CommandItem>
            <CommandItem>
                Two
            </CommandItem>                        
            <CommandItem>
                Three
            </CommandItem>                        
            <CommandItem>
                Four
            </CommandItem>                        
            <CommandItem>
                Five
            </CommandItem>                        
            </CommandGroup>
            </CommandList>
        </Command>
export const Default = Template.bind({});
Default.args = {
    inputPlaceHolder: 'Search section'
}