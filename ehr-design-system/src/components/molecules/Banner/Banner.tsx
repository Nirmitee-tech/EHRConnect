import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

const bannerVariants = cva(
  'relative flex items-start gap-3 rounded-lg border p-4 transition-all',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        primary: 'border-primary/20 bg-primary/10 text-primary-foreground',
        success: 'border-success/20 bg-success/10 text-success-foreground',
        warning: 'border-warning/20 bg-warning/10 text-warning-foreground',
        danger: 'border-danger/20 bg-danger/10 text-danger-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-800',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-5 text-lg',
      },
      appearance: {
        filled: '',
        outlined: 'bg-background',
        subtle: 'border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      appearance: 'filled',
    },
  }
);

const bannerIconVariants = cva(
  'flex-shrink-0 mt-0.5',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        info: 'text-blue-600',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode | boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }>;
  persistent?: boolean;
}

const getDefaultIcon = (variant: string, size: string) => {
  const iconClass = bannerIconVariants({ variant: variant as any, size: size as any });
  
  switch (variant) {
    case 'success':
      return <CheckCircle2 className={iconClass} />;
    case 'warning':
      return <AlertTriangle className={iconClass} />;
    case 'danger':
      return <AlertCircle className={iconClass} />;
    case 'info':
      return <Info className={iconClass} />;
    default:
      return <Info className={iconClass} />;
  }
};

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({
    className,
    variant,
    size,
    appearance,
    title,
    description,
    icon,
    dismissible = false,
    onDismiss,
    actions,
    persistent = false,
    children,
    ...props
  }, ref) => {
    const [dismissed, setDismissed] = React.useState(false);

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    if (dismissed && !persistent) {
      return null;
    }

    const showIcon = icon !== false;
    const iconElement = icon === true || icon === undefined 
      ? getDefaultIcon(variant || 'default', size || 'md')
      : icon;

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ variant, size, appearance }), className)}
        role="banner"
        {...props}
      >
        {showIcon && iconElement && (
          <div>{iconElement}</div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn(
              'font-semibold mb-1',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg'
            )}>
              {title}
            </h4>
          )}
          
          {description && (
            <p className={cn(
              'text-sm opacity-90 mb-0',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base'
            )}>
              {description}
            </p>
          )}
          
          {children && (
            <div className={cn(
              title || description ? 'mt-2' : '',
              size === 'sm' && 'text-sm'
            )}>
              {children}
            </div>
          )}
          
          {actions && actions.length > 0 && (
            <div className={cn(
              'flex flex-wrap gap-2',
              (title || description || children) && 'mt-3'
            )}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size={action.size || 'sm'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-shrink-0 h-auto p-1 hover:bg-black/10 dark:hover:bg-white/10',
              size === 'sm' && 'p-0.5'
            )}
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X className={cn(
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5'
            )} />
          </Button>
        )}
      </div>
    );
  }
);

Banner.displayName = 'Banner';

export { Banner, bannerVariants };