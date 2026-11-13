const WEEK_START = 1;
const LABELED_WEEKDAYS: readonly number[] = [1, 3, 5];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const HEAT_LEVELS = [0, 1, 2, 3, 4] as const;
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

type HeatLevel = (typeof HEAT_LEVELS)[number];

declare const localDateBrand: unique symbol;
type LocalDate = string & { readonly [localDateBrand]: true };

export type ReviewInstant = {
  readonly userVerseId: number;
  readonly reviewedAt: Date;
};

export type MonthLabel = {
  readonly name: string;
  readonly weekIndex: number;
};

type WeekdayGutter = readonly [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

type DayCell = {
  readonly date: LocalDate;
  readonly level: HeatLevel;
  readonly tooltip: string;
};

type Week = readonly [DayCell, DayCell, DayCell, DayCell, DayCell, DayCell, DayCell];
type DateWeek = readonly [
  LocalDate,
  LocalDate,
  LocalDate,
  LocalDate,
  LocalDate,
  LocalDate,
  LocalDate,
];

export type ReviewYear = {
  readonly weekdayLabels: WeekdayGutter;
  readonly months: readonly MonthLabel[];
  readonly weeks: readonly Week[];
  readonly legend: typeof HEAT_LEVELS;
};

export type ReviewYearQuery = {
  readonly start: Date;
  readonly end: Date;
  build(rows: readonly ReviewInstant[]): ReviewYear;
};

// Constructing the formatter is also how the zone is validated, so callers hold one proven zone.
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

function minusOneYear(date: LocalDate): LocalDate {
  const { year, month, day } = partsOf(date);
  const previous = year - 1;
  return localDateFromParts(previous, month, Math.min(day, daysInMonth(previous, month)));
}

function utcDay(date: LocalDate): Date {
  const { year, month, day } = partsOf(date);
  return new Date(Date.UTC(year, month - 1, day));
}

// A calendar date's weekday is the same in every zone, so UTC does the weekday math.
function weekdayRow(date: LocalDate): number {
  const { year, month, day } = partsOf(date);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() - WEEK_START + 7) % 7;
}

function asWeek<T>(slots: readonly T[]): readonly [T, T, T, T, T, T, T] {
  if (slots.length !== 7) {
    throw new Error(`A week needs 7 slots, got ${slots.length}`);
  }
  return [slots[0], slots[1], slots[2], slots[3], slots[4], slots[5], slots[6]];
}

// Monday of the week containing the local date one year ago, through Sunday of the current week.
function weeksOfPastYear(today: LocalDate): readonly DateWeek[] {
  const opened = minusOneYear(today);
  const monday = addDays(opened, -weekdayRow(opened));
  const sunday = addDays(today, 6 - weekdayRow(today));

  const slots: LocalDate[] = [];
  for (let date = monday; date <= sunday; date = addDays(date, 1)) {
    slots.push(date);
  }
  if (slots.length === 0 || slots.length % 7 !== 0) {
    throw new Error(`Past year is not a whole number of weeks: ${slots.length} days`);
  }

  const weeks: DateWeek[] = [];
  for (let index = 0; index < slots.length; index += 7) {
    weeks.push(asWeek(slots.slice(index, index + 7)));
  }
  return weeks;
}

function heatLevel(count: number, max: number): HeatLevel {
  const filled = HEAT_LEVELS.length - 1;
  if (count <= 0 || max <= 0) {
    return HEAT_LEVELS[0];
  }
  return HEAT_LEVELS[Math.min(filled, Math.max(1, Math.ceil((count / max) * filled)))];
}

function dayTooltip(date: LocalDate, count: number): string {
  const { year, month, day } = partsOf(date);
  const when = `${MONTHS[month - 1]} ${day}, ${year}`;
  if (count === 0) {
    return `No verses on ${when}`;
  }
  if (count === 1) {
    return `1 verse on ${when}`;
  }
  return `${count} verses on ${when}`;
}

function weekdayGutter(): WeekdayGutter {
  return asWeek(
    [0, 1, 2, 3, 4, 5, 6].map((row) => {
      const weekday = (WEEK_START + row) % 7;
      return LABELED_WEEKDAYS.includes(weekday) ? WEEKDAY_SHORT[weekday] : null;
    }),
  );
}

function monthLabels(weeks: readonly DateWeek[]): readonly MonthLabel[] {
  const labels: MonthLabel[] = [];
  let seen = '';
  weeks.forEach((week, weekIndex) => {
    for (const date of week) {
      const { year, month } = partsOf(date);
      const key = `${year}-${month}`;
      if (key === seen) {
        continue;
      }
      seen = key;
      labels.push({ name: MONTHS[month - 1], weekIndex });
    }
  });
  // The opening month is dropped when the next one begins in this column or the next,
  // where the two names would sit on top of each other.
  if (labels.length >= 2 && labels[1].weekIndex - labels[0].weekIndex < 2) {
    return labels.slice(1);
  }
  return labels;
}

export function reviewYearQuery(timeZoneInput: string, now: Date): ReviewYearQuery {
  const formatter = localDateFormatter(timeZoneInput);
  const skeleton = weeksOfPastYear(localDateFromInstant(now, formatter));
  const first = skeleton[0][0];
  const last = skeleton[skeleton.length - 1][6];

  return {
    // Two UTC days of slack on each side holds every zone's version of the first and last local day.
    // `build` keeps the exact days, which keeps a local-midnight solver out of this module.
    start: utcDay(addDays(first, -2)),
    end: utcDay(addDays(last, 2)),

    build(rows) {
      const versesByDate = new Map<string, Set<number>>();
      for (const row of rows) {
        const date = localDateFromInstant(row.reviewedAt, formatter);
        if (date < first || date > last) {
          continue;
        }
        const verses = versesByDate.get(date) ?? new Set<number>();
        verses.add(row.userVerseId);
        versesByDate.set(date, verses);
      }

      let max = 0;
      for (const verses of versesByDate.values()) {
        max = Math.max(max, verses.size);
      }

      const weeks = skeleton.map((week) =>
        asWeek(
          week.map((date): DayCell => {
            const count = versesByDate.get(date)?.size ?? 0;
            return {
              date,
              level: heatLevel(count, max),
              tooltip: dayTooltip(date, count),
            };
          }),
        ),
      );

      return {
        weekdayLabels: weekdayGutter(),
        months: monthLabels(skeleton),
        weeks,
        legend: HEAT_LEVELS,
      };
    },
  };
}
