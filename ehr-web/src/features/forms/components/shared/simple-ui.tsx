/**
 * Simple UI Components
 * Self-contained UI components that don't require shadcn/ui
 * Uses Tailwind CSS classes directly
 */

import React from 'react';

// Card Components
export const Card = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// Button Component
export const Button = ({
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  children,
}: {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Label Component
export const Label = ({ htmlFor, className = '', children }: { htmlFor?: string; className?: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium text-gray-700 ${className}`}
  >
    {children}
  </label>
);

// Textarea Component
export const Textarea = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    rows={rows}
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Checkbox Component
export const Checkbox = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    disabled={disabled}
    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  />
);

// Badge Component
export const Badge = ({
  variant = 'default',
  className = '',
  children,
}: {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  children: React.ReactNode;
}) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ScrollArea Component
export const ScrollArea = ({
  style,
  className = '',
  children,
}: {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) => (
  <div style={style} className={`overflow-auto ${className}`}>
    {children}
  </div>
);

// Dialog Components
export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

export const DialogContent = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`relative z-50 bg-white rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

export const DialogHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    {children}
  </div>
);

export const DialogTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <h2 className="text-lg font-semibold text-gray-900">
    {children}
  </h2>
);

// Select Components (simplified)
export const Select = ({
  value,
  onValueChange,
  disabled = false,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  // Extract options from children
  const options = React.Children.toArray(children)
    .filter((child): child is React.ReactElement => React.isValidElement(child))
    .filter(child => child.type === SelectContent)
    .flatMap(content =>
      React.Children.toArray(content.props.children)
        .filter((child): child is React.ReactElement => React.isValidElement(child))
    );

  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options}
    </select>
  );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode; className?: string }) => null;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => null;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

// RadioGroup Components
export const RadioGroup = ({
  value,
  onValueChange,
  disabled = false,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          checked: value === child.props.value,
          onChange: () => onValueChange(child.props.value),
          disabled,
        });
      }
      return child;
    })}
  </div>
);

export const RadioGroupItem = ({
  value,
  id,
  checked,
  onChange,
  disabled,
}: {
  value: string;
  id?: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) => (
  <input
    type="radio"
    id={id}
    value={value}
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  />
);
