import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const headingVariants = cva(
  'font-semibold text-foreground tracking-tight',
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
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
      },
      level: {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-semibold',
        h3: 'text-2xl font-semibold',
        h4: 'text-xl font-semibold',
        h5: 'text-lg font-medium',
        h6: 'text-base font-medium',
      },
      spacing: {
        none: 'm-0',
        xs: 'mb-1',
        sm: 'mb-2',
        md: 'mb-4',
        lg: 'mb-6',
        xl: 'mb-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      level: 'h2',
      spacing: 'md',
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  asChild?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className, 
    variant, 
    size, 
    level, 
    spacing, 
    asChild = false, 
    as,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : (as || level || 'h2');
    
    // Override size if level is specified to maintain semantic hierarchy
    const effectiveSize = level && !size ? undefined : size;
    
    return (
      <Comp
        className={cn(headingVariants({ variant, size: effectiveSize, level, spacing }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';

export { Heading, headingVariants };