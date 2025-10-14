/**
 * Shared types for the DEADLINE application
 */

// Re-export all artifact types from the dedicated file to avoid duplication
export * from './artifacts';

// Environment color mappings for UI consistency
export const ENV_COLORS = {
  DEV: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
  },
  STAGING: {
    bg: "bg-yellow-100 dark:bg-yellow-950/30",
    text: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  PROD: {
    bg: "bg-red-100 dark:bg-red-950/30",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-200 dark:border-red-800",
  },
} as const;

// Environment display names
export const ENV_LABELS = {
  DEV: "Development",
  STAGING: "Staging",
  PROD: "Production",
} as const;
