import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const textFieldVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
        danger: 'border-danger focus-visible:ring-danger',
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof textFieldVariants> {
  label?: string;
  description?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    variant,
    size,
    type = 'text',
    label,
    description,
    error,
    startIcon,
    endIcon,
    startAdornment,
    endAdornment,
    disabled,
    required,
    ...props
  }, ref) => {
    const id = React.useId();
    const hasStartContent = startIcon || startAdornment;
    const hasEndContent = endIcon || endAdornment;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-foreground',
              error ? 'text-danger' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        {/* Description */}
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

        {/* Input Container */}
        <div className="relative">
          {/* Start Content */}
          {hasStartContent && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground">
              {startIcon && <div className="w-4 h-4">{startIcon}</div>}
              {startAdornment && <span className="text-sm">{startAdornment}</span>}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            className={cn(
              textFieldVariants({
                variant: error ? 'danger' : variant,
                size,
                className,
              }),
              hasStartContent && 'pl-10',
              hasEndContent && 'pr-10'
            )}
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-describedby={
              error ? `${id}-error` : description ? `${id}-description` : undefined
            }
            aria-invalid={!!error}
            {...props}
          />

          {/* End Content */}
          {hasEndContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground">
              {endAdornment && <span className="text-sm">{endAdornment}</span>}
              {endIcon && <div className="w-4 h-4">{endIcon}</div>}
            </div>
          )}
        </div>

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
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField, textFieldVariants };