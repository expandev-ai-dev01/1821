import { clsx, type ClassValue } from 'clsx';

/**
 * @utility cn
 * @summary Utility function to merge Tailwind CSS classes safely.
 * @domain core
 * @type utility-function
 * @category styling
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
