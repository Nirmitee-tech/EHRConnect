import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const boxVariants = cva(
  '',
  {
    variants: {
      display: {
        block: 'block',
        inline: 'inline',
        'inline-block': 'inline-block',
        flex: 'flex',
        'inline-flex': 'inline-flex',
        grid: 'grid',
        'inline-grid': 'inline-grid',
        hidden: 'hidden',
      },
      position: {
        static: 'static',
        relative: 'relative',
        absolute: 'absolute',
        fixed: 'fixed',
        sticky: 'sticky',
      },
      overflow: {
        visible: 'overflow-visible',
        hidden: 'overflow-hidden',
        scroll: 'overflow-scroll',
        auto: 'overflow-auto',
        'x-hidden': 'overflow-x-hidden',
        'y-hidden': 'overflow-y-hidden',
        'x-scroll': 'overflow-x-scroll',
        'y-scroll': 'overflow-y-scroll',
        'x-auto': 'overflow-x-auto',
        'y-auto': 'overflow-y-auto',
      },
      padding: {
        none: 'p-0',
        xs: 'p-1',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-12',
      },
      paddingX: {
        none: 'px-0',
        xs: 'px-1',
        sm: 'px-2',
        md: 'px-4',
        lg: 'px-6',
        xl: 'px-8',
        '2xl': 'px-12',
      },
      paddingY: {
        none: 'py-0',
        xs: 'py-1',
        sm: 'py-2',
        md: 'py-4',
        lg: 'py-6',
        xl: 'py-8',
        '2xl': 'py-12',
      },
      margin: {
        none: 'm-0',
        xs: 'm-1',
        sm: 'm-2',
        md: 'm-4',
        lg: 'm-6',
        xl: 'm-8',
        '2xl': 'm-12',
        auto: 'm-auto',
      },
      marginX: {
        none: 'mx-0',
        xs: 'mx-1',
        sm: 'mx-2',
        md: 'mx-4',
        lg: 'mx-6',
        xl: 'mx-8',
        '2xl': 'mx-12',
        auto: 'mx-auto',
      },
      marginY: {
        none: 'my-0',
        xs: 'my-1',
        sm: 'my-2',
        md: 'my-4',
        lg: 'my-6',
        xl: 'my-8',
        '2xl': 'my-12',
        auto: 'my-auto',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        screen: 'w-screen',
        min: 'w-min',
        max: 'w-max',
        fit: 'w-fit',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '2/3': 'w-2/3',
        '1/4': 'w-1/4',
        '3/4': 'w-3/4',
      },
      height: {
        auto: 'h-auto',
        full: 'h-full',
        screen: 'h-screen',
        min: 'h-min',
        max: 'h-max',
        fit: 'h-fit',
        '1/2': 'h-1/2',
        '1/3': 'h-1/3',
        '2/3': 'h-2/3',
        '1/4': 'h-1/4',
        '3/4': 'h-3/4',
      },
      background: {
        none: '',
        background: 'bg-background',
        muted: 'bg-muted',
        card: 'bg-card',
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        accent: 'bg-accent',
        destructive: 'bg-destructive',
        medical: 'bg-blue-50',
        clinical: 'bg-green-50',
        administrative: 'bg-purple-50',
      },
      border: {
        none: '',
        default: 'border',
        top: 'border-t',
        right: 'border-r',
        bottom: 'border-b',
        left: 'border-l',
        x: 'border-x',
        y: 'border-y',
      },
      borderRadius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
      },
      textAlign: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      display: 'block',
      position: 'static',
      overflow: 'visible',
    },
  }
);

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({
    className,
    as: Component = 'div',
    display,
    position,
    overflow,
    padding,
    paddingX,
    paddingY,
    margin,
    marginX,
    marginY,
    width,
    height,
    background,
    border,
    borderRadius,
    shadow,
    textAlign,
    children,
    ...props
  }, ref) => {
    return (
      <Component
        className={cn(
          boxVariants({
            display,
            position,
            overflow,
            padding,
            paddingX,
            paddingY,
            margin,
            marginX,
            marginY,
            width,
            height,
            background,
            border,
            borderRadius,
            shadow,
            textAlign,
          }),
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

export { Box, boxVariants };