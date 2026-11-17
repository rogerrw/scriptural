const FALLBACK_TIME_ZONE = 'UTC';

export const REVIEW_LIMIT_MIN = 1;
export const REVIEW_LIMIT_MAX = 50;

export function isTimeZone(name: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

export function accountTimeZone(stored: string | null): string {
  return stored !== null && isTimeZone(stored) ? stored : FALLBACK_TIME_ZONE;
}
