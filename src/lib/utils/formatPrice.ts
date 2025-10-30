
/**
 * Format number to Indonesian Rupiah currency
 * @param price - Price in number
 * @returns Formatted price (e.g., "Rp 500.000")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format price without "Rp" prefix
 */
export function formatPriceNumber(price: number): string {
  return new Intl.NumberFormat('id-ID').format(price);
}

/**
 * Parse formatted price back to number
 */
export function parsePrice(formattedPrice: string): number {
  return parseInt(formattedPrice.replace(/\D/g, ''), 10) || 0;
}