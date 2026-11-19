import { TZDate } from '@date-fns/tz';
import { addDays, format } from 'date-fns';

const STREAK_DAYS = 7;

export type CompletedReview = {
  readonly daily: boolean;
  readonly endedAt: Date;
};

export type StreakDay = {
  readonly date: string;
  readonly weekday: string;
  readonly label: string;
  readonly completed: boolean;
};

export type ReviewStreak = {
  readonly days: readonly StreakDay[];
};

export type ReviewStreakQuery = {
  readonly start: Date;
  readonly end: Date;
  build(sessions: readonly CompletedReview[]): ReviewStreak;
};

function timeZone(name: string): string {
  if (Number.isNaN(new TZDate(0, name).getTime())) {
    throw new Error('Invalid time zone');
  }
  return name;
}

function localDay(instant: Date, zone: string): TZDate {
  const zoned = new TZDate(instant, zone);
  return new TZDate(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), zone);
}

function utcMidnight(day: TZDate): Date {
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
}

export function reviewStreakQuery(timeZoneInput: string, now: Date): ReviewStreakQuery {
  const zone = timeZone(timeZoneInput);
  const today = localDay(now, zone);
  const first = addDays(today, -(STREAK_DAYS - 1));

  return {
    // Two UTC days of slack on each side holds every zone's version of the first and last local day.
    start: utcMidnight(addDays(first, -2)),
    end: utcMidnight(addDays(today, 2)),

    build(sessions) {
      const firstKey = format(first, 'yyyy-MM-dd');
      const todayKey = format(today, 'yyyy-MM-dd');
      const completed = new Set<string>();
      for (const session of sessions) {
        if (!session.daily) {
          continue;
        }
        const date = format(localDay(session.endedAt, zone), 'yyyy-MM-dd');
        if (date < firstKey || date > todayKey) {
          continue;
        }
        completed.add(date);
      }

      const days: StreakDay[] = [];
      for (let offset = 0; offset < STREAK_DAYS; offset += 1) {
        const date = addDays(first, offset);
        const key = format(date, 'yyyy-MM-dd');
        days.push({
          date: key,
          weekday: format(date, 'EEE'),
          label: format(date, 'MMM d, yyyy'),
          completed: completed.has(key),
        });
      }

      return { days };
    },
  };
}
