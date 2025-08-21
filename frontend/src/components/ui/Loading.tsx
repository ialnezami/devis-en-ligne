import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div
      className={clsx(
        'spinner border-2 border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export function LoadingSkeleton({ 
  className, 
  lines = 1, 
  width = 'w-full', 
  height = 'h-4' 
}: LoadingSkeletonProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'skeleton rounded',
            width,
            height,
            index === lines - 1 && lines > 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

interface LoadingStateProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton?: React.ReactNode;
  spinner?: boolean;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingState({ 
  children, 
  isLoading, 
  skeleton,
  spinner = false,
  spinnerSize = 'md',
  className 
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (spinner) {
    return (
      <div className={clsx('flex items-center justify-center p-8', className)}>
        <LoadingSpinner size={spinnerSize} />
      </div>
    );
  }

  return (
    <div className={className}>
      {skeleton || <LoadingSkeleton lines={3} />}
    </div>
  );
}

// Shimmer effect for loading states
interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div className={clsx('loading-shimmer rounded', className)}>
      {children}
    </div>
  );
}

// Loading overlay for buttons or containers
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  spinnerSize = 'md',
  className 
}: LoadingOverlayProps) {
  return (
    <div className={clsx('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded">
          <LoadingSpinner size={spinnerSize} />
        </div>
      )}
    </div>
  );
}

export default LoadingSpinner;
