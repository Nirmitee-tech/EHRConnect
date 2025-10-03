import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Label } from '../../atoms/Label/Label';

const meta: Meta<typeof Drawer> = {
  title: 'Design System/Molecules/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A drawer component (also known as sheet or side panel) that slides in from the edge of the screen. Built on top of Radix UI Dialog primitive.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>
              This is a description of the drawer content.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              This is the main content area of the drawer. You can place any content here.
            </p>
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const RightSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Right Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>Right Side Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the right side.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Right drawers are commonly used for forms and detailed views.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Left Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="left">
          <DrawerHeader>
            <DrawerTitle>Left Side Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the left side.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Left drawers are often used for navigation menus.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const TopSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Top Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="top">
          <DrawerHeader>
            <DrawerTitle>Top Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides down from the top.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Top drawers can be useful for notifications or alerts.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const BottomSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Bottom Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>Bottom Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides up from the bottom.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Bottom drawers are commonly used on mobile devices.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Create New Patient</Button>
        </DrawerTrigger>
        <DrawerContent side="right" size="lg">
          <DrawerHeader>
            <DrawerTitle>Add New Patient</DrawerTitle>
            <DrawerDescription>
              Enter patient information to create a new record.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Create Patient</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const LargeSize: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Large Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="right" size="2xl">
          <DrawerHeader>
            <DrawerTitle>Large Drawer (2xl)</DrawerTitle>
            <DrawerDescription>
              This drawer has a larger width for more content.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Large drawers are useful when you need to display more complex content
              or wider forms.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Column 1</Label>
                <Input placeholder="Input 1" />
              </div>
              <div className="space-y-2">
                <Label>Column 2</Label>
                <Input placeholder="Input 2" />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent showClose={false}>
          <DrawerHeader>
            <DrawerTitle>No Close Button</DrawerTitle>
            <DrawerDescription>
              This drawer doesn't have a close button in the corner.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Users must use the buttons in the footer to close this drawer.
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const ScrollableContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Scrollable Drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="right" size="md" className="overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Scrollable Content</DrawerTitle>
            <DrawerDescription>
              This drawer contains a lot of content that requires scrolling.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Label>Field {i + 1}</Label>
                <Input placeholder={`Enter value for field ${i + 1}`} />
              </div>
            ))}
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};
