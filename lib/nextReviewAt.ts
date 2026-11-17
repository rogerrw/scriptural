const DELAY_DAYS_BY_TIER = [0, 1, 2, 4, 7, 14] as const;

function tierFor(grade: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const step = Math.floor(grade / 20);
  return Math.min(5, Math.max(0, step)) as 0 | 1 | 2 | 3 | 4 | 5;
}

type ZonedParts = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
};

function zoneFormatter(timeZone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      calendar: 'gregory',
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  } catch {
    throw new Error('Invalid time zone');
  }
}

function zonedParts(instant: Date, formatter: Intl.DateTimeFormat): ZonedParts {
  const parts = formatter.formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error(`Formatted instant has no ${type}`);
    }
    return Number(part.value);
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

function offsetMs(instant: Date, formatter: Intl.DateTimeFormat): number {
  const parts = zonedParts(instant, formatter);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

export function nextReviewAt(input: {
  readonly grade: number;
  readonly now: Date;
  readonly timeZone: string;
}): Date {
  const delayDays = DELAY_DAYS_BY_TIER[tierFor(input.grade)];
  if (delayDays === 0) {
    return input.now;
  }

  const formatter = zoneFormatter(input.timeZone);
  const today = zonedParts(input.now, formatter);
  const midnightAsUtc = Date.UTC(today.year, today.month - 1, today.day + delayDays);
  const guess = new Date(midnightAsUtc - offsetMs(input.now, formatter));
  return new Date(midnightAsUtc - offsetMs(guess, formatter));
}
