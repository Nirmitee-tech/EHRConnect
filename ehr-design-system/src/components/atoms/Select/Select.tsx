import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: 'border-input focus:ring-ring',
        success: 'border-success focus:ring-success',
        warning: 'border-warning focus:ring-warning',
        danger: 'border-danger focus:ring-danger',
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

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, variant, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ variant, size, className }))}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Enhanced Dropdown component with label, description, and error handling
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface DropdownProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Root>, 'value' | 'onValueChange'>,
    VariantProps<typeof selectTriggerVariants> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  className?: string;
}

const Dropdown = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  DropdownProps
>(({
  className,
  variant,
  size,
  options,
  placeholder = 'Select an option...',
  label,
  description,
  error,
  required,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  searchable = false,
  clearable = false,
  loading = false,
  ...props
}, ref) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const id = React.useId();

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedOption = options.find(option => option.value === value);

  const handleClear = () => {
    onValueChange?.('');
    setSearchQuery('');
  };

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
        <p className={cn(
          'text-xs text-muted-foreground',
          disabled ? 'opacity-50' : ''
        )}>
          {description}
        </p>
      )}

      {/* Select */}
      <div className="relative">
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled || loading}
          {...props}
        >
          <SelectTrigger
            ref={ref}
            id={id}
            variant={error ? 'danger' : variant}
            size={size}
            className={className}
            aria-describedby={
              error ? `${id}-error` : description ? `${id}-description` : undefined
            }
            aria-invalid={!!error}
          >
            <SelectValue placeholder={placeholder}>
              {selectedOption && (
                <div className="flex items-center gap-2">
                  {selectedOption.variant && selectedOption.variant !== 'default' && (
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        {
                          'bg-success': selectedOption.variant === 'success',
                          'bg-warning': selectedOption.variant === 'warning',
                          'bg-danger': selectedOption.variant === 'danger',
                        }
                      )}
                    />
                  )}
                  <span>{selectedOption.label}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {/* Clear option */}
            {clearable && value && (
              <>
                <SelectItem value="" className="text-muted-foreground italic">
                  Clear selection
                </SelectItem>
                <SelectSeparator />
              </>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    option.variant === 'danger' && 'text-danger',
                    option.variant === 'warning' && 'text-warning',
                    option.variant === 'success' && 'text-success'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {option.variant && option.variant !== 'default' && (
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          {
                            'bg-success': option.variant === 'success',
                            'bg-warning': option.variant === 'warning',
                            'bg-danger': option.variant === 'danger',
                          }
                        )}
                      />
                    )}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Clear button */}
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
            aria-label="Clear selection"
          >
            <X className="h-3 w-3" />
          </button>
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

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ''}
        />
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  Dropdown,
  selectTriggerVariants,
};
