'use client';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

interface SafeMediaOptions {
  readonly allowDataUrls?: boolean;
}

// Note: `data:` URLs are permitted here for first-party media rendering (video/image).
// Callers must ensure values originate from trusted sources or have been sanitized upstream.
export const isDataUrlAllowed = (value: string): boolean => {
  const lower = value.toLowerCase();
  return lower.startsWith('data:video/') || lower.startsWith('data:image/');
};

export const getSafeMediaUrl = (
  value?: string | null,
  options: SafeMediaOptions = {}
): string | null => {
  const { allowDataUrls = false } = options;

  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return trimmed;
    }

    if (parsed.protocol === 'data:' && allowDataUrls && isDataUrlAllowed(trimmed)) {
      return trimmed;
    }

    return null;
  } catch {
    return null;
  }
};

const relativeTimeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat !== 'undefined'
    ? new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' })
    : null;

const fallbackDateFormatter =
  typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined'
    ? new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

const formatPlainDate = (date: Date): string => {
  const pad = (value: number): string => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getRelativeTimeLabel = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  if (!relativeTimeFormatter) {
    if (fallbackDateFormatter) {
      return fallbackDateFormatter.format(target);
    }
    return formatPlainDate(target);
  }

  const targetMs = target.getTime();
  const now = Date.now();
  const diff = targetMs - now;
  const absDiff = Math.abs(diff);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absDiff < hour) {
    return relativeTimeFormatter.format(Math.round(diff / minute), 'minute');
  }
  if (absDiff < day) {
    return relativeTimeFormatter.format(Math.round(diff / hour), 'hour');
  }
  if (absDiff < week) {
    return relativeTimeFormatter.format(Math.round(diff / day), 'day');
  }
  if (absDiff < month) {
    return relativeTimeFormatter.format(Math.round(diff / week), 'week');
  }
  if (absDiff < year) {
    return relativeTimeFormatter.format(Math.round(diff / month), 'month');
  }

  return relativeTimeFormatter.format(Math.round(diff / year), 'year');
};

const compactNumberFormatter = new Intl.NumberFormat('es-ES', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export const formatCompactNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return compactNumberFormatter.format(value);
};

