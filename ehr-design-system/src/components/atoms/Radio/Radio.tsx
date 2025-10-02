import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const radioVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        success: 'border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground focus-visible:ring-success',
        warning: 'border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground focus-visible:ring-warning',
        danger: 'border-danger data-[state=checked]:bg-danger data-[state=checked]:text-danger-foreground focus-visible:ring-danger',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const RadioGroup = RadioGroupPrimitive.Root;

export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ className, variant, size, label, description, error, children, id, ...props }, ref) => {
  const radioId = id || React.useId();

  return (
    <div className="flex items-start space-x-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(radioVariants({ variant, size }), className)}
        id={radioId}
        aria-describedby={
          error ? `${radioId}-error` : description ? `${radioId}-description` : undefined
        }
        aria-invalid={!!error}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      
      {(label || description) && (
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error ? 'text-danger' : 'text-foreground'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className="text-xs text-muted-foreground"
              id={`${radioId}-description`}
            >
              {description}
            </p>
          )}
          {error && (
            <p
              className="text-xs text-danger"
              id={`${radioId}-error`}
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}
        </div>
      )}
      
      {children && !label && !description && (
        <div className="grid gap-1.5 leading-none">
          {children}
        </div>
      )}
    </div>
  );
});

Radio.displayName = RadioGroupPrimitive.Item.displayName;

export { Radio, RadioGroup, radioVariants };