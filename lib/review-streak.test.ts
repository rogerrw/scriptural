import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewStreakQuery, type CompletedReview } from './review-streak.ts';

const NOON_PACIFIC = new Date('2026-11-16T20:00:00.000Z');

function finished(daily: boolean, instant: string): CompletedReview {
  return { daily, endedAt: new Date(instant) };
}

test('an unusable time zone is rejected', () => {
  assert.throws(() => reviewStreakQuery('Not/AZone', new Date()), {
    name: 'Error',
    message: 'Invalid time zone',
  });
  assert.throws(() => reviewStreakQuery('', new Date()), {
    name: 'Error',
    message: 'Invalid time zone',
  });
});

test('the last seven local days end today, oldest first', () => {
  const query = reviewStreakQuery('America/Los_Angeles', NOON_PACIFIC);
  const { days } = query.build([]);

  assert.equal(days.length, 7);
  assert.deepEqual(
    days.map((day) => day.date),
    [
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
    ],
  );
  assert.deepEqual(
    days.map((day) => day.weekday),
    ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
  );
  assert.equal(days[0].label, 'Nov 10, 2026');
  assert.equal(days[6].label, 'Nov 16, 2026');
  assert.equal(
    days.every((day) => day.completed),
    false,
  );
  assert.equal(query.start.toISOString(), '2026-11-08T00:00:00.000Z');
  assert.equal(query.end.toISOString(), '2026-11-18T00:00:00.000Z');
});

test('a finished daily review marks that local day', () => {
  const query = reviewStreakQuery('America/Los_Angeles', NOON_PACIFIC);
  const { days } = query.build([
    finished(true, '2026-11-16T18:00:00.000Z'),
    finished(true, '2026-11-14T20:00:00.000Z'),
    finished(true, '2026-11-14T23:00:00.000Z'),
  ]);

  assert.equal(days.find((day) => day.date === '2026-11-16')?.completed, true);
  assert.equal(days.find((day) => day.date === '2026-11-14')?.completed, true);
  assert.equal(days.find((day) => day.date === '2026-11-15')?.completed, false);
});

test('a finished review that is not the daily review does not mark the day', () => {
  const query = reviewStreakQuery('America/Los_Angeles', NOON_PACIFIC);
  const { days } = query.build([finished(false, '2026-11-16T18:00:00.000Z')]);

  assert.equal(
    days.every((day) => !day.completed),
    true,
  );
});

test('a daily review just before local midnight counts on the previous local day', () => {
  const query = reviewStreakQuery('America/Los_Angeles', new Date('2026-11-17T20:00:00.000Z'));
  const { days } = query.build([finished(true, '2026-11-17T07:30:00.000Z')]);

  assert.equal(days[0].date, '2026-11-11');
  assert.equal(days[6].date, '2026-11-17');
  assert.equal(days.find((day) => day.date === '2026-11-16')?.completed, true);
  assert.equal(days.find((day) => day.date === '2026-11-17')?.completed, false);
});

test('a daily review just after local midnight counts on the new local day', () => {
  const query = reviewStreakQuery('America/Los_Angeles', new Date('2026-11-17T20:00:00.000Z'));
  const { days } = query.build([
    finished(true, '2026-11-17T08:30:00.000Z'),
    finished(false, '2026-11-17T08:30:00.000Z'),
  ]);

  assert.equal(days.find((day) => day.date === '2026-11-17')?.completed, true);
  assert.equal(days.find((day) => day.date === '2026-11-16')?.completed, false);
});

test('a daily review outside the seven days is left out', () => {
  const query = reviewStreakQuery('America/Los_Angeles', new Date('2026-11-17T20:00:00.000Z'));
  const { days } = query.build([finished(true, '2026-11-11T07:30:00.000Z')]);

  assert.equal(days[0].date, '2026-11-11');
  assert.equal(
    days.every((day) => !day.completed),
    true,
  );
});

test('the same instant lands on different local days either side of the date line', () => {
  const instant = finished(true, '2026-03-01T23:30:00.000Z');
  const now = new Date('2026-03-02T12:00:00.000Z');

  const kiritimati = reviewStreakQuery('Pacific/Kiritimati', now).build([instant]);
  assert.equal(kiritimati.days.find((day) => day.date === '2026-03-02')?.completed, true);
  assert.equal(kiritimati.days.find((day) => day.date === '2026-03-01')?.completed, false);

  const honolulu = reviewStreakQuery('Pacific/Honolulu', now).build([instant]);
  assert.equal(honolulu.days.find((day) => day.date === '2026-03-01')?.completed, true);
  assert.equal(honolulu.days.find((day) => day.date === '2026-03-02')?.completed, false);
});
