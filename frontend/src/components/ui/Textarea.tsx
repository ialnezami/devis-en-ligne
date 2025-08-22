import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 dark:border-gray-600 focus-visible:ring-orange-500',
        error: 'border-red-500 dark:border-red-400 focus-visible:ring-red-500',
        success: 'border-green-500 dark:border-green-400 focus-visible:ring-green-500',
        warning: 'border-yellow-500 dark:border-yellow-400 focus-visible:ring-yellow-500',
      },
      size: {
        sm: 'px-2 py-1 text-sm min-h-[60px]',
        default: 'px-3 py-2 text-base min-h-[80px]',
        lg: 'px-4 py-3 text-lg min-h-[100px]',
        xl: 'px-5 py-4 text-xl min-h-[120px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, description, leftIcon, rightIcon, ...props }, ref) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <textarea
            className={cn(
              textareaVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {description && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
export default Textarea;
