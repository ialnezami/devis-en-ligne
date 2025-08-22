import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white shadow-sm hover:bg-primary-700',
        secondary: 'border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'text-foreground',
        success: 'border-transparent bg-success-600 text-white shadow-sm hover:bg-success-700',
        warning: 'border-transparent bg-warning-600 text-white shadow-sm hover:bg-warning-700',
        info: 'border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-base',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, rounded, leftIcon, rightIcon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size, rounded, className }))}
      {...props}
    >
      {leftIcon && <span className="mr-1 flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1 flex-shrink-0">{rightIcon}</span>}
    </div>
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
