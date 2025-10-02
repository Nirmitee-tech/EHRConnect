import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const avatarVariants = cva(
  'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
      variant: {
        default: 'bg-muted',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        danger: 'bg-danger text-danger-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const avatarImageVariants = cva(
  'aspect-square h-full w-full'
);

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full font-medium',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
  badge?: React.ReactNode;
  role?: 'doctor' | 'nurse' | 'patient' | 'admin' | 'therapist' | 'technician';
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({
  className,
  size,
  variant,
  src,
  alt,
  fallback,
  name,
  status,
  showStatus = false,
  badge,
  role,
  ...props
}, ref) => {
  // Generate fallback from name if not provided
  const generateFallback = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayFallback = fallback || (name ? generateFallback(name) : '?');
  const displayAlt = alt || name || 'Avatar';

  // Role-specific styling
  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'doctor':
        return 'primary';
      case 'nurse':
        return 'success';
      case 'patient':
        return 'default';
      case 'admin':
        return 'warning';
      case 'therapist':
        return 'primary';
      case 'technician':
        return 'default';
      default:
        return variant;
    }
  };

  const finalVariant = role ? getRoleVariant(role) : variant;

  // Status indicator styling
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'offline':
        return 'bg-muted-foreground';
      case 'busy':
        return 'bg-danger';
      case 'away':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  // Status indicator size based on avatar size
  const getStatusSize = (size?: string) => {
    switch (size) {
      case 'xs':
        return 'h-2 w-2';
      case 'sm':
        return 'h-2 w-2';
      case 'md':
        return 'h-3 w-3';
      case 'lg':
        return 'h-3 w-3';
      case 'xl':
        return 'h-4 w-4';
      case '2xl':
        return 'h-5 w-5';
      default:
        return 'h-3 w-3';
    }
  };

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, variant: finalVariant }), className)}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={displayAlt}
            className={avatarImageVariants()}
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(avatarFallbackVariants({ size }))}
        >
          {displayFallback}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {/* Status Indicator */}
      {showStatus && status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            getStatusColor(status),
            getStatusSize(size)
          )}
          title={`Status: ${status}`}
        />
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1">
          {badge}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar, avatarVariants, avatarImageVariants, avatarFallbackVariants };