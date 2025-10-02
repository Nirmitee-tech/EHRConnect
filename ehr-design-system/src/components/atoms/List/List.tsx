import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const listVariants = cva(
  '',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        muted: 'text-muted-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      spacing: {
        none: 'space-y-0',
        xs: 'space-y-1',
        sm: 'space-y-2',
        md: 'space-y-3',
        lg: 'space-y-4',
      },
      marker: {
        none: '',
        disc: 'list-disc',
        decimal: 'list-decimal',
        square: 'list-square',
        circle: 'list-circle',
      },
      position: {
        inside: 'list-inside',
        outside: 'list-outside',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      spacing: 'sm',
      marker: 'disc',
      position: 'inside',
    },
  }
);

const listItemVariants = cva(
  'flex items-start',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        muted: 'text-muted-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ListProps
  extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement>,
    VariantProps<typeof listVariants> {
  asChild?: boolean;
  ordered?: boolean;
  indent?: boolean;
}

export interface ListItemProps
  extends React.LiHTMLAttributes<HTMLLIElement>,
    VariantProps<typeof listItemVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  bullet?: React.ReactNode;
  interactive?: boolean;
}

const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing, 
    marker,
    position,
    asChild = false, 
    ordered = false,
    indent = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : ordered ? 'ol' : 'ul';
    
    const indentClass = indent ? 'ml-4' : '';
    
    return (
      <Comp
        className={cn(
          listVariants({ variant, size, spacing, marker, position }),
          indentClass,
          className
        )}
        ref={ref as any}
        {...props}
      />
    );
  }
);
List.displayName = 'List';

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ 
    className, 
    variant, 
    size,
    asChild = false,
    icon,
    bullet,
    interactive = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'li';
    
    const interactiveClasses = interactive 
      ? 'cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors' 
      : '';
    
    if (icon || bullet) {
      return (
        <Comp
          className={cn(
            listItemVariants({ variant, size }),
            interactiveClasses,
            'gap-2',
            className
          )}
          ref={ref}
          {...props}
        >
          {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
          {bullet && <span className="flex-shrink-0 mt-0.5">{bullet}</span>}
          <span className="flex-1">{children}</span>
        </Comp>
      );
    }
    
    return (
      <Comp
        className={cn(
          listItemVariants({ variant, size }),
          interactiveClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
ListItem.displayName = 'ListItem';

export { List, ListItem, listVariants, listItemVariants };