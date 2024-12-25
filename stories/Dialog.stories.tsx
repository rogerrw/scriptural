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
 } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
export default {
    title: 'Components/Dialog',
    component: Dialog,
    parameters: {
      title: '',
      description: ''
    },
    argTypes: {
      children: {
        table: {
          disable: true,
        }
      }
    }
} as Meta;

interface CustomDialog extends React.ComponentProps<typeof Dialog> {
  buttonTitle: string;
  children: React.ReactNode;
}

const Template: StoryFn<CustomDialog> = ({buttonTitle, children, ...args}) => 
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">{buttonTitle}</Button>
      </DialogTrigger>
      {children}
    </Dialog>



export const Profile = Template.bind({});
Profile.args = {
    buttonTitle: 'Edit Profile',
    children:
    ( <DialogContent className="sm:max-w-[425px]">      
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
        <Input
          id="name"
          defaultValue="Pedro Duarte"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          defaultValue="@peduarte"
          className="col-span-3"
        />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
    )
}