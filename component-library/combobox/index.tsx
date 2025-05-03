'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/component-library/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/component-library/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/component-library/popover';
import { PopoverProps } from '@radix-ui/react-popover';

export function Combobox({
  options,
  onChange = () => {},
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  noOptionsPlaceholder = 'No results found',
  value,
  ...args
}: PopoverProps & {
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  value?: string;
  noOptionsPlaceholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen} {...args}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-[200px] justify-between dark:bg-background"
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 border-none" />
          <CommandList className="overflow-y-auto">
            <CommandEmpty>{noOptionsPlaceholder}</CommandEmpty>
            <CommandGroup className="max-h-[200px]">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setSelectedValue(currentValue === selectedValue ? '' : currentValue);
                    setOpen(false);
                    onChange(currentValue);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn('ml-auto', value === option.value ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
