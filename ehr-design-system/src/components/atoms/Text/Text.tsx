import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const textVariants = cva(
  'text-foreground',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        muted: 'text-muted-foreground',
        secondary: 'text-secondary-foreground',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      spacing: {
        none: 'm-0',
        xs: 'mb-1',
        sm: 'mb-2',
        md: 'mb-4',
        lg: 'mb-6',
      },
      leading: {
        none: 'leading-none',
        tight: 'leading-tight',
        snug: 'leading-snug',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      weight: 'normal',
      align: 'left',
      spacing: 'sm',
      leading: 'normal',
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'code' | 'pre';
  truncate?: boolean;
  maxLines?: number;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ 
    className, 
    variant, 
    size, 
    weight, 
    align, 
    spacing, 
    leading,
    asChild = false, 
    as = 'p',
    truncate = false,
    maxLines,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : as;
    
    const truncateClasses = truncate 
      ? 'truncate' 
      : maxLines 
        ? `overflow-hidden` 
        : '';
    
    const lineClampClasses = maxLines && !truncate
      ? `line-clamp-${maxLines}`
      : '';
    
    return (
      <Comp
        className={cn(
          textVariants({ variant, size, weight, align, spacing, leading }), 
          truncateClasses,
          lineClampClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text, textVariants };