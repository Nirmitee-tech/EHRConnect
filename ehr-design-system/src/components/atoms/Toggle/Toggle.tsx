import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const toggleVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        success: 'data-[state=checked]:bg-success data-[state=unchecked]:bg-input',
        warning: 'data-[state=checked]:bg-warning data-[state=unchecked]:bg-input',
        danger: 'data-[state=checked]:bg-danger data-[state=unchecked]:bg-input',
      },
      size: {
        sm: 'h-4 w-7',
        md: 'h-6 w-11',
        lg: 'h-8 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const toggleThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  label?: string;
  description?: string;
  error?: string;
  labelPosition?: 'left' | 'right';
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(({
  className,
  variant,
  size,
  label,
  description,
  error,
  labelPosition = 'right',
  disabled,
  required,
  ...props
}, ref) => {
  const id = React.useId();

  const toggleElement = (
    <SwitchPrimitive.Root
      className={cn(toggleVariants({ variant, size }), className)}
      ref={ref}
      id={id}
      disabled={disabled}
      aria-describedby={
        error ? `${id}-error` : description ? `${id}-description` : undefined
      }
      aria-invalid={!!error}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(toggleThumbVariants({ size }))} />
    </SwitchPrimitive.Root>
  );

  if (!label && !description && !error) {
    return toggleElement;
  }

  return (
    <div className="space-y-2">
      <div className={cn(
        'flex items-start gap-3',
        labelPosition === 'right' ? 'flex-row' : 'flex-row-reverse justify-end'
      )}>
        {toggleElement}
        
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'text-sm font-medium text-foreground cursor-pointer',
                  error ? 'text-danger' : '',
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                {label}
                {required && <span className="text-danger ml-1">*</span>}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs text-muted-foreground',
                  disabled ? 'opacity-50' : ''
                )}
                id={`${id}-description`}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-xs text-danger"
          id={`${id}-error`}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Toggle.displayName = SwitchPrimitive.Root.displayName;

export { Toggle, toggleVariants, toggleThumbVariants };