import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        col: 'flex-col',
        'col-reverse': 'flex-col-reverse',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
      justify: {
        normal: 'justify-normal',
        start: 'justify-start',
        end: 'justify-end',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
        stretch: 'justify-stretch',
      },
      align: {
        start: 'items-start',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      alignContent: {
        normal: 'content-normal',
        start: 'content-start',
        end: 'content-end',
        center: 'content-center',
        between: 'content-between',
        around: 'content-around',
        evenly: 'content-evenly',
        baseline: 'content-baseline',
        stretch: 'content-stretch',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
      gapX: {
        none: 'gap-x-0',
        xs: 'gap-x-1',
        sm: 'gap-x-2',
        md: 'gap-x-4',
        lg: 'gap-x-6',
        xl: 'gap-x-8',
        '2xl': 'gap-x-12',
      },
      gapY: {
        none: 'gap-y-0',
        xs: 'gap-y-1',
        sm: 'gap-y-2',
        md: 'gap-y-4',
        lg: 'gap-y-6',
        xl: 'gap-y-8',
        '2xl': 'gap-y-12',
      },
      grow: {
        0: 'flex-grow-0',
        1: 'flex-grow',
      },
      shrink: {
        0: 'flex-shrink-0',
        1: 'flex-shrink',
      },
      basis: {
        0: 'flex-basis-0',
        1: 'flex-basis-1',
        auto: 'flex-basis-auto',
        px: 'flex-basis-px',
        full: 'flex-basis-full',
        '1/2': 'flex-basis-1/2',
        '1/3': 'flex-basis-1/3',
        '2/3': 'flex-basis-2/3',
        '1/4': 'flex-basis-1/4',
        '2/4': 'flex-basis-2/4',
        '3/4': 'flex-basis-3/4',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      justify: 'start',
      align: 'stretch',
      gap: 'none',
    },
  }
);

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({
    className,
    as: Component = 'div',
    direction,
    wrap,
    justify,
    align,
    alignContent,
    gap,
    gapX,
    gapY,
    grow,
    shrink,
    basis,
    children,
    ...props
  }, ref) => {
    return (
      <Component
        className={cn(
          flexVariants({
            direction,
            wrap,
            justify,
            align,
            alignContent,
            gap,
            gapX,
            gapY,
            grow,
            shrink,
            basis,
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

Flex.displayName = 'Flex';

// Flex item component
export interface FlexItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children?: React.ReactNode;
  flex?: string | number;
  grow?: 0 | 1;
  shrink?: 0 | 1;
  basis?: 'auto' | 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4' | string;
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  order?: number;
}

const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  ({
    className,
    as: Component = 'div',
    children,
    flex,
    grow,
    shrink,
    basis,
    alignSelf,
    order,
    style,
    ...props
  }, ref) => {
    const flexItemClasses = cn(
      grow === 1 && 'flex-grow',
      grow === 0 && 'flex-grow-0',
      shrink === 1 && 'flex-shrink',
      shrink === 0 && 'flex-shrink-0',
      basis === 'auto' && 'flex-basis-auto',
      basis === 'full' && 'flex-basis-full',
      basis === '1/2' && 'flex-basis-1/2',
      basis === '1/3' && 'flex-basis-1/3',
      basis === '2/3' && 'flex-basis-2/3',
      basis === '1/4' && 'flex-basis-1/4',
      basis === '3/4' && 'flex-basis-3/4',
      alignSelf === 'start' && 'self-start',
      alignSelf === 'end' && 'self-end',
      alignSelf === 'center' && 'self-center',
      alignSelf === 'baseline' && 'self-baseline',
      alignSelf === 'stretch' && 'self-stretch',
      alignSelf === 'auto' && 'self-auto',
      className
    );

    const flexItemStyle = {
      ...(flex !== undefined && { flex }),
      ...(order !== undefined && { order }),
      ...style,
    };

    return (
      <Component
        className={flexItemClasses}
        style={flexItemStyle}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

FlexItem.displayName = 'FlexItem';

export { Flex, FlexItem, flexVariants };