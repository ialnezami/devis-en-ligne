import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm',
  {
    variants: {
      size: {
        sm: 'py-1 px-2',
        default: 'py-2 px-3',
        lg: 'py-3 px-4',
        xl: 'py-4 px-5',
      },
      variant: {
        default: 'border border-gray-300 dark:border-gray-600',
        error: 'border border-red-500 dark:border-red-400',
        success: 'border border-green-500 dark:border-green-400',
        warning: 'border border-yellow-500 dark:border-yellow-400',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const optionVariants = cva(
  'relative cursor-default select-none py-2 px-4',
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

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: SelectOption;
  onChange: (value: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  error,
  description,
  leftIcon,
  rightIcon,
  size = 'default',
  variant = 'default',
  className,
}) => {
  const finalVariant = error ? 'error' : variant;

  return (
    <div className="w-full">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              selectVariants({ size, variant: finalVariant }),
              'flex items-center justify-between',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            <div className="flex items-center space-x-2">
              {leftIcon && <span className="text-gray-400">{leftIcon}</span>}
              <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                {value ? value.label : placeholder}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {rightIcon && <span className="text-gray-400">{rightIcon}</span>}
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option, optionIdx) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    cn(
                      optionVariants({ size }),
                      active
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100'
                        : 'text-gray-900 dark:text-gray-100',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                  value={option}
                  disabled={option.disabled}
                >
                  {({ selected, active }) => (
                    <div className="flex items-center justify-between">
                      <span className={selected ? 'font-medium' : 'font-normal'}>
                        {option.label}
                      </span>
                      {selected && (
                        <CheckIcon
                          className={cn(
                            'h-5 w-5',
                            active ? 'text-orange-900 dark:text-orange-100' : 'text-orange-600 dark:text-orange-400'
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {description && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default Select;
