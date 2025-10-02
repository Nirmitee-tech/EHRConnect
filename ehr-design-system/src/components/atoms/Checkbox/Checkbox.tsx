import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      variant: {
        default: 'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        success: 'border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground',
        warning: 'border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground',
        danger: 'border-danger data-[state=checked]:bg-danger data-[state=checked]:text-danger-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const checkboxLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn('h-3 w-3', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const IndeterminateIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn('h-3 w-3', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, variant, label, description, error, indeterminate, ...props }, ref) => {
  const id = React.useId();
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(checkboxVariants({ size, variant, className }))}
          id={id}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            {indeterminate ? <IndeterminateIcon /> : <CheckIcon />}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        
        {label && (
          <label
            htmlFor={id}
            className={cn(
              checkboxLabelVariants({ size }),
              error ? 'text-danger' : 'text-foreground'
            )}
          >
            {label}
          </label>
        )}
      </div>
      
      {description && (
        <p className={cn(
          'text-xs text-muted-foreground ml-6',
          size === 'sm' && 'ml-5',
          size === 'lg' && 'ml-7'
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className={cn(
          'text-xs text-danger ml-6',
          size === 'sm' && 'ml-5',
          size === 'lg' && 'ml-7'
        )}>
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };