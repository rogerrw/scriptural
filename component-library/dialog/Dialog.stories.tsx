import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/component-library/dialog';
import { Button } from '@/component-library/button';
import { Label } from '@/component-library/label';
import { Input } from '@/component-library/input';

export default {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    children: 'default'
  },
  argTypes: {
    children: {
      description: 'The content of the dialog. Should be wrapped with `DialogTitle`.',
      control: 'select',
      options: ['default', 'profile']
    },
    onOpenChange: {action: 'open'},
  }
} as Meta;

enum DialogType {
  DEFAULT = 'default',
  PROFILE = 'profile'
}
interface CustomDialog extends React.ComponentProps<typeof Dialog> {
  buttonText: string;
  children: DialogType;

}

const Dialogs = {
  [DialogType.DEFAULT]: (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
          <div>
            <p className="grid gap-4 py-4 ">This is some dialog content.</p>
          </div>
      </DialogHeader>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  ),
  [DialogType.PROFILE]: (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <Input id="username" defaultValue="@peduarte" className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  )

}
function updateDialogContent(type: DialogType): React.ReactNode {
  return Dialogs[type];
}
const Template: StoryFn<CustomDialog> = ({ buttonText, children, ...args }) => (
  <Dialog {...args}>
    <DialogTrigger asChild>
      <Button variant="outline">{buttonText}</Button>
    </DialogTrigger>
    {updateDialogContent(children)}
  </Dialog>
);

export const Default = Template.bind({});
Default.args = {
  buttonText: 'Open Dialog',
};
