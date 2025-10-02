import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const textAreaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
        danger: 'border-danger focus-visible:ring-danger',
      },
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        md: 'min-h-[80px] px-3 py-2 text-sm',
        lg: 'min-h-[100px] px-4 py-3 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resize: 'vertical',
    },
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariants> {
  label?: string;
  description?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    className,
    variant,
    size,
    resize,
    label,
    description,
    error,
    maxLength,
    showCharCount,
    autoResize = false,
    disabled,
    required,
    value,
    defaultValue,
    onChange,
    ...props
  }, ref) => {
    const id = React.useId();
    const [charCount, setCharCount] = React.useState(0);
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Handle character count
    React.useEffect(() => {
      const currentValue = value || defaultValue || '';
      setCharCount(String(currentValue).length);
    }, [value, defaultValue]);

    // Handle auto-resize
    const handleResize = React.useCallback(() => {
      if (autoResize && textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      
      // Update character count
      setCharCount(newValue.length);
      
      // Handle auto-resize
      if (autoResize) {
        handleResize();
      }
      
      // Call parent onChange
      onChange?.(event);
    };

    // Set up ref forwarding
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textAreaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Initialize auto-resize on mount
    React.useEffect(() => {
      if (autoResize) {
        handleResize();
      }
    }, [handleResize, autoResize]);

    const isOverLimit = maxLength ? charCount > maxLength : false;

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

        {/* TextArea */}
        <textarea
          className={cn(
            textAreaVariants({
              variant: error || isOverLimit ? 'danger' : variant,
              size,
              resize: autoResize ? 'none' : resize,
              className,
            })
          )}
          ref={setRefs}
          id={id}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-describedby={
            error ? `${id}-error` : description ? `${id}-description` : undefined
          }
          aria-invalid={!!error || isOverLimit}
          style={autoResize ? { overflow: 'hidden' } : undefined}
          {...props}
        />

        {/* Character Count & Error */}
        <div className="flex justify-between items-start">
          <div>
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
            {isOverLimit && !error && (
              <p
                className="text-xs text-danger"
                role="alert"
                aria-live="polite"
              >
                Character limit exceeded
              </p>
            )}
          </div>

          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <div className={cn(
              'text-xs',
              isOverLimit ? 'text-danger' : 'text-muted-foreground',
              disabled ? 'opacity-50' : ''
            )}>
              {maxLength ? `${charCount}/${maxLength}` : `${charCount} characters`}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea, textAreaVariants };