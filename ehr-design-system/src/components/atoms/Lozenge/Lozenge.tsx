import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

const lozengeVariants = cva(
  'inline-flex items-center gap-1 font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
        info: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        subtle: 'bg-muted text-muted-foreground hover:bg-muted/80',
      },
      size: {
        xs: 'h-5 px-2 text-xs',
        sm: 'h-6 px-2.5 text-xs',
        md: 'h-7 px-3 text-sm',
        lg: 'h-8 px-3.5 text-sm',
        xl: 'h-9 px-4 text-base',
      },
      shape: {
        rounded: 'rounded-full',
        square: 'rounded-md',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
);

export interface LozengeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof lozengeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
  pulse?: boolean;
}

const Lozenge = React.forwardRef<HTMLButtonElement, LozengeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    asChild = false,
    icon,
    removable = false,
    onRemove,
    dot = false,
    pulse = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'span';
    
    const pulseClass = pulse ? 'animate-pulse' : '';
    
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (removable || onClick) {
        onClick?.(e);
      }
    };
    
    const isInteractive = removable || onClick || asChild;
    const ComponentTag = isInteractive ? 'button' : 'span';
    
    if (asChild) {
      return (
        <Slot
          className={cn(lozengeVariants({ variant, size, shape }), pulseClass, className)}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <ComponentTag
        className={cn(lozengeVariants({ variant, size, shape }), pulseClass, className)}
        ref={ref as any}
        onClick={isInteractive ? handleClick : undefined}
        {...props}
      >
        {dot && (
          <span 
            className={cn(
              'w-2 h-2 rounded-full',
              variant === 'default' && 'bg-secondary-foreground',
              variant === 'primary' && 'bg-primary-foreground',
              variant === 'success' && 'bg-success-foreground',
              variant === 'warning' && 'bg-warning-foreground',
              variant === 'danger' && 'bg-danger-foreground',
              variant === 'info' && 'bg-white',
              variant === 'outline' && 'bg-foreground',
              variant === 'subtle' && 'bg-muted-foreground',
            )}
          />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'flex-shrink-0 ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none',
              size === 'xs' && 'w-3 h-3',
              size === 'sm' && 'w-3.5 h-3.5',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-4.5 h-4.5',
              size === 'xl' && 'w-5 h-5',
            )}
          >
            <X className="w-full h-full" />
            <span className="sr-only">Remove</span>
          </button>
        )}
      </ComponentTag>
    );
  }
);
Lozenge.displayName = 'Lozenge';

export { Lozenge, lozengeVariants };