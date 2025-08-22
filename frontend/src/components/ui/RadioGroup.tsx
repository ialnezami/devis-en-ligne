import React, { Fragment } from 'react';
import { RadioGroup as HeadlessRadioGroup, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const radioVariants = cva(
  'relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
        error: 'bg-white dark:bg-gray-800 border border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
        success: 'bg-white dark:bg-gray-800 border border-green-500 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
        warning: 'bg-white dark:bg-gray-800 border border-yellow-500 dark:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        default: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
        xl: 'px-6 py-5 text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const radioOptionVariants = cva(
  'flex w-full items-center justify-between',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends VariantProps<typeof radioVariants> {
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  description,
  disabled = false,
  size = 'default',
  variant = 'default',
  className,
}) => {
  const finalVariant = error ? 'error' : variant;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <HeadlessRadioGroup value={value} onChange={onChange} disabled={disabled}>
        <div className="space-y-2">
          {options.map((option) => (
            <HeadlessRadioGroup.Option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={({ active, checked }) =>
                cn(
                  radioVariants({ variant: finalVariant, size }),
                  active && 'ring-2 ring-orange-500 ring-offset-2',
                  checked && 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-400',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  'transition-all duration-200'
                )
              }
            >
              {({ checked }) => (
                <div className={cn(radioOptionVariants({ size }))}>
                  <div className="flex items-center">
                    <div className="text-sm">
                      <HeadlessRadioGroup.Label
                        as="p"
                        className={cn(
                          'font-medium',
                          checked
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        {option.label}
                      </HeadlessRadioGroup.Label>
                      {option.description && (
                        <HeadlessRadioGroup.Description
                          as="span"
                          className={cn(
                            'inline-block',
                            checked
                              ? 'text-orange-700 dark:text-orange-200'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {option.description}
                        </HeadlessRadioGroup.Description>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {checked && (
                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </HeadlessRadioGroup.Option>
          ))}
        </div>
      </HeadlessRadioGroup>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {description && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default RadioGroup;
