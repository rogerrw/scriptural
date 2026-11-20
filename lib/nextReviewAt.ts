import { TZDate } from '@date-fns/tz';
import { addDays, startOfDay } from 'date-fns';

const DELAY_DAYS_BY_TIER = [0, 1, 2, 4, 7, 14] as const;

function tierFor(grade: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const step = Math.floor(grade / 20);
  return Math.min(5, Math.max(0, step)) as 0 | 1 | 2 | 3 | 4 | 5;
}

function timeZone(name: string): string {
  if (Number.isNaN(new TZDate(0, name).getTime())) {
    throw new Error('Invalid time zone');
  }
  return name;
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

  const zone = timeZone(input.timeZone);
  const due = startOfDay(addDays(new TZDate(input.now, zone), delayDays));
  return new Date(due.getTime());
}
