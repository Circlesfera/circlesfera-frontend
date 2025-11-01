const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/**
 * Convierte una fecha ISO en un texto relativo legible (ej. "hace 5 min").
 */
export const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const ranges: Array<{ limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { limit: 60, divisor: 1, unit: 'second' },
    { limit: 3600, divisor: 60, unit: 'minute' },
    { limit: 86_400, divisor: 3600, unit: 'hour' },
    { limit: 604_800, divisor: 86_400, unit: 'day' },
    { limit: 2_629_746, divisor: 604_800, unit: 'week' },
    { limit: 31_556_952, divisor: 2_629_746, unit: 'month' }
  ];

  for (const range of ranges) {
    if (Math.abs(diffInSeconds) < range.limit) {
      const value = Math.round(diffInSeconds / range.divisor);
      return rtf.format(value, range.unit);
    }
  }

  const years = Math.round(diffInSeconds / 31_556_952);
  return rtf.format(years, 'year');
};

