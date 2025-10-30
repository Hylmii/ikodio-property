
/**
 * Format date to Indonesian readable format
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "1 Nov 2025")
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format date to time (HH:MM)
 */
export function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Format date to full format (1 Nov 2025, 14:30)
 */
export function formatDateTime(dateString: string | Date): string {
  return `${formatDate(dateString)}, ${formatTime(dateString)}`;
}