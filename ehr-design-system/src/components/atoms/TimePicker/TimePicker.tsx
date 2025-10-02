import * as React from 'react';
import { format } from 'date-fns';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const timePickerVariants = cva(
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

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof timePickerVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string | undefined) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: number;
  format24Hour?: boolean;
  name?: string;
}

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({
    className,
    variant,
    size,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select time',
    label,
    description,
    error,
    required,
    disabled,
    min,
    max,
    step = 1,
    format24Hour = false,
    name,
    ...props
  }, ref) => {
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(
      value ?? defaultValue
    );

    const currentTime = value ?? selectedTime;

    const handleTimeChange = (time: string | undefined) => {
      if (value === undefined) {
        setSelectedTime(time);
      }
      onChange?.(time);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      handleTimeChange(inputValue || undefined);
    };

    const formatTimeDisplay = (timeString: string) => {
      if (!timeString) return '';
      
      if (format24Hour) {
        return timeString;
      }
      
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      
      return `${hour12}:${minutes} ${ampm}`;
    };

    const generateTimeOptions = () => {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += step) {
          const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const displayValue = formatTimeDisplay(timeValue);
          options.push({ value: timeValue, display: displayValue });
        }
      }
      return options;
    };

    const id = React.useId();

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedTime(value);
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

        {/* Time Input */}
        <div className="relative">
          <input
            id={id}
            type="time"
            name={name}
            value={currentTime || ''}
            onChange={handleInputChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            required={required}
            className={cn(
              timePickerVariants({ 
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

          {/* Clock Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
        </div>

        {/* Display formatted time for 12-hour format */}
        {currentTime && !format24Hour && (
          <div className="text-xs text-muted-foreground">
            Display: {formatTimeDisplay(currentTime)}
          </div>
        )}

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

TimePicker.displayName = 'TimePicker';

export { TimePicker, timePickerVariants };