import * as React from 'react';
import { format } from 'date-fns';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Button } from '../Button/Button';

const datePickerVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof datePickerVariants> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  name?: string;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({
    className,
    variant,
    size,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select a date',
    label,
    description,
    error,
    required,
    disabled,
    min,
    max,
    name,
    ...props
  }, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
      value ?? defaultValue
    );
    const [isOpen, setIsOpen] = React.useState(false);

    const currentDate = value ?? selectedDate;

    const handleDateChange = (date: Date | undefined) => {
      if (value === undefined) {
        setSelectedDate(date);
      }
      onChange?.(date);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue) {
        const date = new Date(inputValue);
        if (!isNaN(date.getTime())) {
          handleDateChange(date);
        }
      } else {
        handleDateChange(undefined);
      }
    };

    const formatDate = (date: Date) => {
      return format(date, 'yyyy-MM-dd');
    };

    const id = React.useId();

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
      }
    }, [value]);

    return (
      <div className="space-y-2" ref={ref} {...props}>
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
          <p className={cn(
            'text-xs text-muted-foreground',
            disabled ? 'opacity-50' : ''
          )}>
            {description}
          </p>
        )}

        {/* Date Input */}
        <div className="relative">
          <input
            id={id}
            type="date"
            name={name}
            value={currentDate ? formatDate(currentDate) : ''}
            onChange={handleInputChange}
            disabled={disabled}
            min={min ? formatDate(min) : undefined}
            max={max ? formatDate(max) : undefined}
            required={required}
            className={cn(
              datePickerVariants({ 
                variant: error ? 'danger' : variant, 
                size, 
                className 
              })
            )}
            aria-describedby={
              error ? `${id}-error` : description ? `${id}-description` : undefined
            }
            aria-invalid={!!error}
          />

          {/* Calendar Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
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

DatePicker.displayName = 'DatePicker';

export { DatePicker, datePickerVariants };