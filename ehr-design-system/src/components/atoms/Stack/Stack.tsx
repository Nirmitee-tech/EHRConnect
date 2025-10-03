import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        column: 'flex-col',
        'column-reverse': 'flex-col-reverse',
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
      },
      spacing: {
        none: '',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
      divider: {
        true: '[&>*:not(:last-child)]:after:bg-border',
        false: '',
      },
    },
    compoundVariants: [
      {
        direction: 'column',
        divider: true,
        class: '[&>*:not(:last-child)]:after:content-[""] [&>*:not(:last-child)]:after:block [&>*:not(:last-child)]:after:h-px [&>*:not(:last-child)]:after:w-full [&>*:not(:last-child)]:after:bg-border [&>*:not(:last-child)]:after:my-2',
      },
      {
        direction: 'column-reverse',
        divider: true,
        class: '[&>*:not(:last-child)]:after:content-[""] [&>*:not(:last-child)]:after:block [&>*:not(:last-child)]:after:h-px [&>*:not(:last-child)]:after:w-full [&>*:not(:last-child)]:after:bg-border [&>*:not(:last-child)]:after:my-2',
      },
      {
        direction: 'row',
        divider: true,
        class: '[&>*:not(:last-child)]:after:content-[""] [&>*:not(:last-child)]:after:block [&>*:not(:last-child)]:after:w-px [&>*:not(:last-child)]:after:h-full [&>*:not(:last-child)]:after:bg-border [&>*:not(:last-child)]:after:mx-2',
      },
      {
        direction: 'row-reverse',
        divider: true,
        class: '[&>*:not(:last-child)]:after:content-[""] [&>*:not(:last-child)]:after:block [&>*:not(:last-child)]:after:w-px [&>*:not(:last-child)]:after:h-full [&>*:not(:last-child)]:after:bg-border [&>*:not(:last-child)]:after:mx-2',
      },
    ],
    defaultVariants: {
      direction: 'column',
      spacing: 'md',
      align: 'stretch',
      justify: 'start',
      wrap: 'nowrap',
      divider: false,
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({
    className,
    as: Component = 'div',
    direction,
    spacing,
    align,
    justify,
    wrap,
    divider,
    children,
    ...props
  }, ref) => {
    return (
      <Component
        className={cn(
          stackVariants({
            direction,
            spacing,
            align,
            justify,
            wrap,
            divider,
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

Stack.displayName = 'Stack';

// Convenience components
export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack {...props} direction="column" ref={ref} />
);
VStack.displayName = 'VStack';

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack {...props} direction="row" ref={ref} />
);
HStack.displayName = 'HStack';

export { Stack, stackVariants };