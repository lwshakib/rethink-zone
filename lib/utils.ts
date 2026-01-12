/**
 * This utility file provides helper functions for managing class names.
 * It combines 'clsx' (for conditional class toggling) with 'tailwind-merge' (for resolving conflicts).
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 'cn' (Class Name) helper.
 * Takes multiple class inputs (strings, objects, arrays) and returns a merged string 
 * where Tailwind conflicts are resolved efficiently.
 * 
 * Example: cn('px-2 py-1', isError && 'text-red-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
