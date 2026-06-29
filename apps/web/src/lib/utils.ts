import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely, handling conflicts correctly.
 * Use this for all conditional class construction.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
