import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'full' | string;
  className?: string;
}

export function Dropdown({ 
  trigger, 
  items, 
  align = 'left', 
  width = 'auto',
  className 
}: DropdownProps) {
  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <div>
        <Menu.Button className="inline-flex w-full justify-center items-center">
          {trigger}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-10 mt-2 rounded-md bg-popover shadow-lg ring-1 ring-border ring-opacity-5 focus:outline-none',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            width === 'full' ? 'w-full' : width === 'auto' ? 'w-56' : width
          )}
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={index} className="border-t border-border my-1" />;
              }

              return (
                <Menu.Item key={index} disabled={item.disabled}>
                  {({ active }) => {
                    const baseClasses = clsx(
                      'flex items-center w-full px-4 py-2 text-sm',
                      active && !item.disabled
                        ? 'bg-accent text-accent-foreground'
                        : 'text-popover-foreground',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    );

                    if (item.href) {
                      return (
                        <a
                          href={item.href}
                          className={baseClasses}
                          onClick={item.onClick}
                        >
                          {item.icon && (
                            <span className="mr-3 h-4 w-4">{item.icon}</span>
                          )}
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <button
                        className={baseClasses}
                        onClick={item.onClick}
                        disabled={item.disabled}
                      >
                        {item.icon && (
                          <span className="mr-3 h-4 w-4">{item.icon}</span>
                        )}
                        {item.label}
                      </button>
                    );
                  }}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Predefined dropdown button with chevron
interface DropdownButtonProps extends DropdownProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function DropdownButton({ 
  children, 
  items, 
  variant = 'outline',
  size = 'md',
  ...props 
}: DropdownButtonProps) {
  const buttonClasses = clsx(
    'btn inline-flex items-center gap-2',
    variant === 'default' && 'btn-primary',
    variant === 'outline' && 'btn-outline',
    variant === 'ghost' && 'btn-ghost',
    size === 'sm' && 'btn-sm',
    size === 'md' && 'btn-md',
    size === 'lg' && 'btn-lg'
  );

  return (
    <Dropdown
      trigger={
        <div className={buttonClasses}>
          {children}
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      }
      items={items}
      {...props}
    />
  );
}

export default Dropdown;
