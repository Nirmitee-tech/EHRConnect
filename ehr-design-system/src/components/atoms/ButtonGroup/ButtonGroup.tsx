import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const buttonGroupVariants = cva(
  'inline-flex',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
      spacing: {
        none: '',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-3',
        lg: 'gap-4',
      },
      connected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        connected: true,
        className: '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px',
      },
      {
        orientation: 'vertical',
        connected: true,
        className: '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      spacing: 'none',
      connected: true,
    },
  }
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  children: React.ReactNode;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, spacing, connected, children, ...props }, ref) => {
    return (
      <div
        className={cn(buttonGroupVariants({ orientation, spacing, connected, className }))}
        role="group"
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup, buttonGroupVariants };