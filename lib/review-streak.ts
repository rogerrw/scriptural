const STREAK_DAYS = 7;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const DAYS_IN_MONTH: readonly number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

declare const localDateBrand: unique symbol;
type LocalDate = string & { readonly [localDateBrand]: true };

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

function localDateFormatter(timeZoneInput: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneInput,
      calendar: 'gregory',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch {
    throw new Error('Invalid time zone');
  }
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
}

function localDateFromParts(year: number, month: number, day: number): LocalDate {
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`Not a calendar date: ${year}-${month}-${day}`);
  }
  const padded = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${String(year).padStart(4, '0')}-${padded}` as LocalDate;
}

function partsOf(date: LocalDate): { year: number; month: number; day: number } {
  return {
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
    day: Number(date.slice(8, 10)),
  };
}

function localDateFromInstant(instant: Date, formatter: Intl.DateTimeFormat): LocalDate {
  const parts = formatter.formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error(`Formatted date has no ${type}`);
    }
    return Number(part.value);
  };
  return localDateFromParts(read('year'), read('month'), read('day'));
}

function addDays(date: LocalDate, amount: number): LocalDate {
  const { year, month, day } = partsOf(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + amount));
  return localDateFromParts(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

function utcDay(date: LocalDate): Date {
  const { year, month, day } = partsOf(date);
  return new Date(Date.UTC(year, month - 1, day));
}

function dayLabel(date: LocalDate): string {
  const { year, month, day } = partsOf(date);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function weekdayName(date: LocalDate): string {
  const { year, month, day } = partsOf(date);
  return WEEKDAY_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function reviewStreakQuery(timeZoneInput: string, now: Date): ReviewStreakQuery {
  const formatter = localDateFormatter(timeZoneInput);
  const today = localDateFromInstant(now, formatter);
  const first = addDays(today, -(STREAK_DAYS - 1));

  return {
    // Two UTC days of slack on each side holds every zone's version of the first and last local day.
    start: utcDay(addDays(first, -2)),
    end: utcDay(addDays(today, 2)),

    build(sessions) {
      const completed = new Set<string>();
      for (const session of sessions) {
        if (!session.daily) {
          continue;
        }
        const date = localDateFromInstant(session.endedAt, formatter);
        if (date < first || date > today) {
          continue;
        }
        completed.add(date);
      }

      const days: StreakDay[] = [];
      for (let offset = 0; offset < STREAK_DAYS; offset += 1) {
        const date = addDays(first, offset);
        days.push({
          date,
          weekday: weekdayName(date),
          label: dayLabel(date),
          completed: completed.has(date),
        });
      }

      return { days };
    },
  };
}
