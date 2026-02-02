import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Prevent auto focus on popover trigger element after popover close
 * @param e
 */
export const preventAutoFocus = (e: Event) => {
  e.preventDefault();
};
