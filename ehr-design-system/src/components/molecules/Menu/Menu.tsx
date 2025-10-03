import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Check, ChevronRight, Circle, ChevronDown, MoreHorizontal } from 'lucide-react';

const menuVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'border-border bg-popover text-popover-foreground',
        medical: 'border-blue-200 bg-blue-50 text-blue-900',
        clinical: 'border-green-200 bg-green-50 text-green-900',
        administrative: 'border-purple-200 bg-purple-50 text-purple-900',
        destructive: 'border-red-200 bg-red-50 text-red-900',
      },
      size: {
        sm: 'min-w-[6rem] text-xs',
        md: 'min-w-[8rem] text-sm',
        lg: 'min-w-[12rem] text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const menuItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        medical: 'hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800',
        clinical: 'hover:bg-green-100 hover:text-green-800 focus:bg-green-100 focus:text-green-800',
        administrative: 'hover:bg-purple-100 hover:text-purple-800 focus:bg-purple-100 focus:text-purple-800',
        destructive: 'text-red-600 hover:bg-red-100 hover:text-red-800 focus:bg-red-100 focus:text-red-800',
      },
      inset: {
        true: 'pl-8',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inset: false,
    },
  }
);

const menuLabelVariants = cva(
  'px-2 py-1.5 text-sm font-semibold',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        medical: 'text-blue-800',
        clinical: 'text-green-800',
        administrative: 'text-purple-800',
        destructive: 'text-red-800',
      },
      inset: {
        true: 'pl-8',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inset: false,
    },
  }
);

const menuSeparatorVariants = cva(
  '-mx-1 my-1 h-px bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        medical: 'bg-blue-200',
        clinical: 'bg-green-200',
        administrative: 'bg-purple-200',
        destructive: 'bg-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const menuShortcutVariants = cva(
  'ml-auto text-xs tracking-widest opacity-60',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        medical: 'text-blue-600',
        clinical: 'text-green-600',
        administrative: 'text-purple-600',
        destructive: 'text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface MenuProps extends VariantProps<typeof menuVariants> {
  children: React.ReactNode;
  className?: string;
}

export interface MenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export interface MenuItemProps extends VariantProps<typeof menuItemVariants> {
  children: React.ReactNode;
  className?: string;
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  shortcut?: string;
  icon?: React.ReactNode;
}

export interface MenuLabelProps extends VariantProps<typeof menuLabelVariants> {
  children: React.ReactNode;
  className?: string;
}

export interface MenuSeparatorProps extends VariantProps<typeof menuSeparatorVariants> {
  className?: string;
}

export interface MenuShortcutProps extends VariantProps<typeof menuShortcutVariants> {
  children: React.ReactNode;
  className?: string;
}

export interface MenuSubProps {
  children: React.ReactNode;
}

export interface MenuSubTriggerProps extends VariantProps<typeof menuItemVariants> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface MenuSubContentProps extends VariantProps<typeof menuVariants> {
  children: React.ReactNode;
  className?: string;
}

export interface MenuCheckboxItemProps extends VariantProps<typeof menuItemVariants> {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  shortcut?: string;
  icon?: React.ReactNode;
}

export interface MenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface MenuRadioItemProps extends VariantProps<typeof menuItemVariants> {
  children: React.ReactNode;
  className?: string;
  value: string;
  disabled?: boolean;
  shortcut?: string;
  icon?: React.ReactNode;
}

const Menu = DropdownMenuPrimitive.Root;

const MenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  MenuTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
));
MenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

const MenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  MenuProps
>(({ className, variant, size, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(menuVariants({ variant, size }), className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
MenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const MenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  MenuItemProps
>(({ className, variant, inset, children, shortcut, icon, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(menuItemVariants({ variant, inset }), className)}
    {...props}
  >
    {icon && (
      <span className="mr-2 h-4 w-4 flex-shrink-0">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-4 w-4'
        })}
      </span>
    )}
    <span className="flex-1">{children}</span>
    {shortcut && (
      <MenuShortcut variant={variant}>{shortcut}</MenuShortcut>
    )}
  </DropdownMenuPrimitive.Item>
));
MenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const MenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  MenuCheckboxItemProps
>(({ className, variant, inset, children, checked, shortcut, icon, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(menuItemVariants({ variant, inset }), className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {icon && (
      <span className="mr-2 h-4 w-4 flex-shrink-0 ml-6">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-4 w-4'
        })}
      </span>
    )}
    <span className="flex-1 pl-6">{children}</span>
    {shortcut && (
      <MenuShortcut variant={variant}>{shortcut}</MenuShortcut>
    )}
  </DropdownMenuPrimitive.CheckboxItem>
));
MenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const MenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const MenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  MenuRadioItemProps
>(({ className, variant, inset, children, shortcut, icon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(menuItemVariants({ variant, inset }), className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {icon && (
      <span className="mr-2 h-4 w-4 flex-shrink-0 ml-6">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-4 w-4'
        })}
      </span>
    )}
    <span className="flex-1 pl-6">{children}</span>
    {shortcut && (
      <MenuShortcut variant={variant}>{shortcut}</MenuShortcut>
    )}
  </DropdownMenuPrimitive.RadioItem>
));
MenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const MenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  MenuLabelProps
>(({ className, variant, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(menuLabelVariants({ variant, inset }), className)}
    {...props}
  />
));
MenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const MenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  MenuSeparatorProps
>(({ className, variant, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(menuSeparatorVariants({ variant }), className)}
    {...props}
  />
));
MenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const MenuShortcut = React.forwardRef<HTMLSpanElement, MenuShortcutProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(menuShortcutVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
MenuShortcut.displayName = 'MenuShortcut';

const MenuSub = DropdownMenuPrimitive.Sub;

const MenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  MenuSubTriggerProps
>(({ className, variant, inset, children, icon, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(menuItemVariants({ variant, inset }), 'focus:bg-accent data-[state=open]:bg-accent', className)}
    {...props}
  >
    {icon && (
      <span className="mr-2 h-4 w-4 flex-shrink-0">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-4 w-4'
        })}
      </span>
    )}
    <span className="flex-1">{children}</span>
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
MenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const MenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  MenuSubContentProps
>(({ className, variant, size, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      menuVariants({ variant, size }),
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
MenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  menuVariants,
  menuItemVariants,
  menuLabelVariants,
  menuSeparatorVariants,
  menuShortcutVariants,
};