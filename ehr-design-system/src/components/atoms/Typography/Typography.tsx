import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      // Headings
      'heading-xxl': 'text-4xl font-medium leading-tight tracking-tight',
      'heading-xl': 'text-3xl font-semibold leading-tight tracking-tight',
      'heading-large': 'text-2xl font-medium leading-tight',
      'heading-medium': 'text-xl font-medium leading-normal',
      'heading-small': 'text-base font-semibold leading-tight',
      'heading-xs': 'text-sm font-semibold leading-none',
      'heading-xxs': 'text-xs font-semibold leading-none tracking-wide',
      
      // Body text
      'body-large': 'text-base font-normal leading-relaxed',
      'body-large-medium': 'text-base font-medium leading-relaxed',
      'body-large-bold': 'text-base font-bold leading-relaxed',
      'body-default': 'text-sm font-normal leading-normal',
      'body-default-medium': 'text-sm font-medium leading-normal',
      'body-default-bold': 'text-sm font-bold leading-normal',
      'body-small': 'text-xs font-normal leading-normal',
      'body-small-medium': 'text-xs font-medium leading-normal',
      'body-small-bold': 'text-xs font-bold leading-normal',
      
      // Medical specific
      'vital': 'text-2xl font-bold leading-tight',
      'vital-label': 'text-xs font-medium leading-none tracking-wide uppercase',
      'dosage': 'text-sm font-semibold leading-normal',
      'patient-id': 'text-base font-bold leading-normal tracking-wider font-mono',
      
      // Code
      'code': 'text-sm font-normal font-mono leading-normal',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      info: 'text-info-600',
      inverse: 'text-white',
      // Medical colors
      'heart-rate': 'text-medical-heartRate',
      'blood-pressure': 'text-medical-bloodPressure',
      'temperature': 'text-medical-temperature',
      'oxygen-sat': 'text-medical-oxygenSat',
      'blood-glucose': 'text-medical-bloodGlucose',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    transform: {
      none: '',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
  },
  defaultVariants: {
    variant: 'body-default',
    color: 'default',
    align: 'left',
    transform: 'none',
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, transform, as = 'p', children, ...props }, ref) => {
    const Component = as as any;
    
    return (
      <Component
        className={cn(typographyVariants({ variant, color, align, transform, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export { Typography, typographyVariants };