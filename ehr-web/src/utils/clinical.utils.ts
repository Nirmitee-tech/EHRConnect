/**
 * Get vital status class
 */
export function getVitalStatusClass(isAbnormal: boolean): string {
  return isAbnormal
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200 bg-white';
}

/**
 * Get vital status badge
 */
export function getVitalStatusBadge(isAbnormal: boolean): string {
  return isAbnormal
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} at ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } catch {
    return '-';
  }
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    finished: 'bg-green-50 text-green-700 border-green-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    stopped: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-red-50 text-red-700 border-red-200',
    low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return statusMap[status.toLowerCase()] || statusMap.default;
}
