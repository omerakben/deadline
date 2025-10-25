import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged and deduplicated class string
 *
 * @example
 * cn("px-4 py-2", "bg-blue-500") // "px-4 py-2 bg-blue-500"
 * cn("px-4", { "py-2": true, "bg-red-500": false }) // "px-4 py-2"
 * cn("px-4 px-2") // "px-2" (tailwind-merge deduplicates)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
