import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'default',
  variant = 'ghost',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:scale-105 active:scale-95',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative flex items-center justify-center">
        <SunIcon
          className={cn(
            'h-5 w-5 transition-all duration-300',
            isDark
              ? 'rotate-0 scale-100 text-yellow-500'
              : '-rotate-90 scale-0 text-gray-400'
          )}
        />
        <MoonIcon
          className={cn(
            'absolute h-5 w-5 transition-all duration-300',
            isDark
              ? 'rotate-90 scale-0 text-gray-400'
              : 'rotate-0 scale-100 text-blue-500'
          )}
        />
      </div>
    </Button>
  );
};

export default ThemeToggle;
