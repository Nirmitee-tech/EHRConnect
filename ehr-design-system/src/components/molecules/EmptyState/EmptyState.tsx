import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Button } from '../../atoms/Button/Button';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed',
  {
    variants: {
      variant: {
        default: 'border-border bg-background',
        primary: 'border-primary/20 bg-primary/5',
        success: 'border-success/20 bg-success/5',
        warning: 'border-warning/20 bg-warning/5',
        danger: 'border-danger/20 bg-danger/5',
        info: 'border-blue-200 bg-blue-50',
      },
      size: {
        sm: 'p-6 min-h-[200px]',
        md: 'p-8 min-h-[250px]',
        lg: 'p-12 min-h-[300px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const emptyStateIconVariants = cva(
  'mb-4 rounded-full flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
        info: 'bg-blue-100 text-blue-600',
      },
      size: {
        sm: 'w-12 h-12 text-lg',
        md: 'w-16 h-16 text-xl',
        lg: 'w-20 h-20 text-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'outline';
  };
  illustration?: React.ReactNode;
  maxWidth?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      title,
      description,
      action,
      secondaryAction,
      illustration,
      maxWidth = 'max-w-md',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size }), maxWidth, 'mx-auto', className)}
        {...props}
      >
        {illustration && (
          <div className="mb-6 flex justify-center">
            {illustration}
          </div>
        )}
        
        {icon && (
          <div className={cn(emptyStateIconVariants({ variant, size }))}>
            {icon}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                size="sm"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                size="sm"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState, emptyStateVariants };