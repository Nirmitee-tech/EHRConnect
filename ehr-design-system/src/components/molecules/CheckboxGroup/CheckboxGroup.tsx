import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Checkbox, type CheckboxProps } from '../../atoms/Checkbox/Checkbox';

const checkboxGroupVariants = cva(
  'space-y-2',
  {
    variants: {
      orientation: {
        vertical: 'flex flex-col space-y-2 space-x-0',
        horizontal: 'flex flex-row space-x-4 space-y-0 flex-wrap',
      },
      size: {
        sm: '[&_label]:text-xs',
        md: '[&_label]:text-sm',
        lg: '[&_label]:text-base',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'md',
    },
  }
);

export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  variant?: CheckboxProps['variant'];
}

export interface CheckboxGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof checkboxGroupVariants> {
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ 
    className, 
    orientation, 
    size, 
    options, 
    value, 
    defaultValue = [], 
    onChange, 
    label,
    description,
    error,
    required,
    disabled,
    name,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(
      value ?? defaultValue
    );

    const currentValue = value ?? internalValue;

    const handleChange = React.useCallback((optionValue: string, checked: boolean) => {
      const newValue = checked
        ? [...currentValue, optionValue]
        : currentValue.filter(v => v !== optionValue);

      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [currentValue, onChange, value]);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const groupId = React.useId();

    return (
      <div className="space-y-3" ref={ref} {...props}>
        {/* Group Label */}
        {label && (
          <div>
            <label 
              className={cn(
                'text-sm font-medium text-foreground',
                error ? 'text-danger' : '',
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
              id={`${groupId}-label`}
            >
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </label>
            
            {description && (
              <p className={cn(
                'text-xs text-muted-foreground mt-1',
                disabled ? 'opacity-50' : ''
              )}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Options */}
        <div 
          className={cn(checkboxGroupVariants({ orientation, size, className }))}
          role="group"
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-describedby={error ? `${groupId}-error` : undefined}
          aria-required={required}
          aria-invalid={!!error}
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              description={option.description}
              checked={currentValue.includes(option.value)}
              onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
              disabled={disabled || option.disabled}
              variant={error ? 'danger' : option.variant}
              size={size}
              name={name}
              value={option.value}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p 
            className="text-xs text-danger"
            id={`${groupId}-error`}
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

CheckboxGroup.displayName = 'CheckboxGroup';

export { CheckboxGroup, checkboxGroupVariants };