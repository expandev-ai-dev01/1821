import { clsx } from 'clsx';
import type { LoadingSpinnerProps } from './types';

/**
 * @component LoadingSpinner
 * @summary Loading spinner component for async operations.
 * @domain core
 * @type ui-component
 * @category feedback
 */
export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
};
