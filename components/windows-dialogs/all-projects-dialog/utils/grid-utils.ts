/**
 * Determines grid column classes based on item count
 * @param itemCount - Number of items to display
 * @returns Tailwind CSS grid column classes
 */
export function getGridClasses(itemCount: number): string {
  if (itemCount === 0) return "grid-cols-1";
  return "grid-cols-1 md:grid-cols-2";
}

/**
 * Gets priority color classes for badges
 * @param priority - Task priority level
 * @returns Tailwind CSS color classes
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-600 dark:text-red-400";
    case "medium":
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    case "low":
      return "bg-green-500/20 text-green-600 dark:text-green-400";
    default:
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
  }
}
