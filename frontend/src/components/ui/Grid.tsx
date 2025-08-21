import React from 'react';
import clsx from 'clsx';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  responsive,
  className,
  children,
  ...props
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const responsiveClasses = responsive ? {
    sm: responsive.sm ? `sm:grid-cols-${responsive.sm}` : '',
    md: responsive.md ? `md:grid-cols-${responsive.md}` : '',
    lg: responsive.lg ? `lg:grid-cols-${responsive.lg}` : '',
    xl: responsive.xl ? `xl:grid-cols-${responsive.xl}` : '',
  } : {};

  return (
    <div
      className={clsx(
        'grid',
        colClasses[cols],
        gapClasses[gap],
        Object.values(responsiveClasses).filter(Boolean),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
  };
}

const GridItem: React.FC<GridItemProps> = ({
  span = 1,
  responsive,
  className,
  children,
  ...props
}) => {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    12: 'col-span-12',
    full: 'col-span-full',
  };

  const responsiveSpanClasses = responsive ? {
    sm: responsive.sm ? `sm:col-span-${responsive.sm === 'full' ? 'full' : responsive.sm}` : '',
    md: responsive.md ? `md:col-span-${responsive.md === 'full' ? 'full' : responsive.md}` : '',
    lg: responsive.lg ? `lg:col-span-${responsive.lg === 'full' ? 'full' : responsive.lg}` : '',
    xl: responsive.xl ? `xl:col-span-${responsive.xl === 'full' ? 'full' : responsive.xl}` : '',
  } : {};

  return (
    <div
      className={clsx(
        spanClasses[span],
        Object.values(responsiveSpanClasses).filter(Boolean),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Container component for consistent max widths and centering
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
  };

  return (
    <div
      className={clsx(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Flex utilities
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align,
  justify,
  gap = 'none',
  wrap = false,
  className,
  children,
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignClasses = align ? {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align] : '';

  const justifyClasses = justify ? {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify] : '';

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={clsx(
        'flex',
        directionClasses[direction],
        alignClasses,
        justifyClasses,
        gapClasses[gap],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Grid, GridItem, Container, Flex };
