import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Radio, radioVariants } from '../../atoms/Radio';

const radioGroupVariants = cva(
  'grid gap-2',
  {
    variants: {
      orientation: {
        vertical: 'grid-cols-1',
        horizontal: 'grid-flow-col auto-cols-max gap-6',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'orientation'>,
    VariantProps<typeof radioGroupVariants>,
    VariantProps<typeof radioVariants> {
  options: RadioGroupOption[];
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  name?: string;
}

const RadioGroupComponent = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({
  className,
  orientation,
  size,
  options,
  label,
  description,
  error,
  required,
  name,
  ...props
}, ref) => {
  const id = React.useId();

  return (
    <div className="space-y-3">
      {/* Group Label */}
      {label && (
        <div className="space-y-1">
          <label
            className={cn(
              'text-sm font-medium text-foreground',
              error ? 'text-danger' : '',
              props.disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
          {description && (
            <p
              className={cn(
                'text-xs text-muted-foreground',
                props.disabled ? 'opacity-50' : ''
              )}
              id={`${id}-description`}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Radio Group */}
      <RadioGroupPrimitive.Root
        className={cn(radioGroupVariants({ orientation }), className)}
        ref={ref}
        name={name}
        aria-describedby={
          error ? `${id}-error` : description ? `${id}-description` : undefined
        }
        aria-invalid={!!error}
        {...props}
      >
        {options.map((option, index) => (
          <Radio
            key={option.value}
            value={option.value}
            disabled={option.disabled || props.disabled}
            variant={option.variant}
            size={size}
            label={option.label}
            description={option.description}
          />
        ))}
      </RadioGroupPrimitive.Root>

      {/* Error Message */}
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

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={props.value || ''}
        />
      )}
    </div>
  );
});

RadioGroupComponent.displayName = 'RadioGroup';

export { RadioGroupComponent as RadioGroup, radioGroupVariants };