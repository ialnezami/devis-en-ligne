import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded border border-gray-300 dark:border-gray-600 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange-600 data-[state=checked]:text-orange-50 data-[state=checked]:border-orange-600',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
        xl: 'h-6 w-6',
      },
      variant: {
        default: 'border-gray-300 dark:border-gray-600 focus-visible:ring-orange-500',
        error: 'border-red-500 dark:border-red-400 focus-visible:ring-red-500',
        success: 'border-green-500 dark:border-green-400 focus-visible:ring-green-500',
        warning: 'border-yellow-500 dark:border-yellow-400 focus-visible:ring-yellow-500',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, variant, label, description, error, ...props }, ref) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <div className="flex items-start space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            className={cn(
              checkboxVariants({ size, variant: finalVariant }),
              'peer',
              className
            )}
            ref={ref}
            {...props}
          />
          <CheckIcon className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-data-[state=checked]:opacity-100" />
        </div>
        
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={props.id}
              className={cn(
                labelVariants({ size }),
                'cursor-pointer select-none text-gray-700 dark:text-gray-300'
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants, labelVariants };
export default Checkbox;
