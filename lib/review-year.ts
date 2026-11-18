import { TZDate } from '@date-fns/tz';
import { addDays, format, getDay } from 'date-fns';

const WEEK_START = 1;
const WEEKS_SHOWN = 53;
const LABELED_WEEKDAYS: readonly number[] = [1, 3, 5];
const HEAT_LEVELS = [0, 1, 2, 3, 4] as const;

type HeatLevel = (typeof HEAT_LEVELS)[number];

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
  readonly date: string;
  readonly level: HeatLevel;
  readonly tooltip: string;
};

type Week = readonly [DayCell, DayCell, DayCell, DayCell, DayCell, DayCell, DayCell];
type DateWeek = readonly [TZDate, TZDate, TZDate, TZDate, TZDate, TZDate, TZDate];

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

function dateKey(day: TZDate): string {
  return format(day, 'yyyy-MM-dd');
}

// Monday is the first row, so Sunday lands on the last.
function weekdayRow(day: TZDate): number {
  return (getDay(day) - WEEK_START + 7) % 7;
}

function asWeek<T>(slots: readonly T[]): readonly [T, T, T, T, T, T, T] {
  if (slots.length !== 7) {
    throw new Error(`A week needs 7 slots, got ${slots.length}`);
  }
  return [slots[0], slots[1], slots[2], slots[3], slots[4], slots[5], slots[6]];
}

// Fifty-three Monday-Sunday weeks, through Sunday of the current week.
function weeksOfPastYear(today: TZDate): readonly DateWeek[] {
  const sunday = addDays(today, 6 - weekdayRow(today));
  const monday = addDays(sunday, -(WEEKS_SHOWN * 7 - 1));

  const slots: TZDate[] = [];
  for (let index = 0; index < WEEKS_SHOWN * 7; index += 1) {
    slots.push(addDays(monday, index));
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

function dayTooltip(day: TZDate, count: number): string {
  const when = format(day, 'MMM d, yyyy');
  if (count === 0) {
    return `No verses on ${when}`;
  }
  if (count === 1) {
    return `1 verse on ${when}`;
  }
  return `${count} verses on ${when}`;
}

function weekdayGutter(): WeekdayGutter {
  const monday = new TZDate(2024, 0, 1, 'UTC');
  return asWeek(
    [0, 1, 2, 3, 4, 5, 6].map((row) => {
      const weekday = (WEEK_START + row) % 7;
      return LABELED_WEEKDAYS.includes(weekday) ? format(addDays(monday, row), 'EEE') : null;
    }),
  );
}

function monthLabels(weeks: readonly DateWeek[]): readonly MonthLabel[] {
  const labels: MonthLabel[] = [];
  let seen = '';
  weeks.forEach((week, weekIndex) => {
    for (const day of week) {
      const key = format(day, 'yyyy-M');
      if (key === seen) {
        continue;
      }
      seen = key;
      labels.push({ name: format(day, 'MMM'), weekIndex });
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
  const zone = timeZone(timeZoneInput);
  const skeleton = weeksOfPastYear(localDay(now, zone));
  const first = skeleton[0][0];
  const last = skeleton[skeleton.length - 1][6];
  const firstKey = dateKey(first);
  const lastKey = dateKey(last);

  return {
    // Two UTC days of slack on each side holds every zone's version of the first and last local day.
    // `build` keeps the exact days, which keeps a local-midnight solver out of this module.
    start: utcMidnight(addDays(first, -2)),
    end: utcMidnight(addDays(last, 2)),

    build(rows) {
      const versesByDate = new Map<string, Set<number>>();
      for (const row of rows) {
        const date = dateKey(localDay(row.reviewedAt, zone));
        if (date < firstKey || date > lastKey) {
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
          week.map((day): DayCell => {
            const date = dateKey(day);
            const count = versesByDate.get(date)?.size ?? 0;
            return {
              date,
              level: heatLevel(count, max),
              tooltip: dayTooltip(day, count),
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
