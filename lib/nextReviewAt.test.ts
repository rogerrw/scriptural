import assert from 'node:assert/strict';
import test from 'node:test';
import { nextReviewAt } from './nextReviewAt.ts';

const NOW = new Date('2026-11-16T15:00:00-08:00');
const TIME_ZONE = 'America/Los_Angeles';

const EXAMPLES: readonly (readonly [number, string])[] = [
  [0, '2026-11-16T15:00:00-08:00'],
  [19, '2026-11-16T15:00:00-08:00'],
  [20, '2026-11-17T00:00:00-08:00'],
  [39, '2026-11-17T00:00:00-08:00'],
  [40, '2026-11-18T00:00:00-08:00'],
  [59, '2026-11-18T00:00:00-08:00'],
  [60, '2026-11-20T00:00:00-08:00'],
  [79, '2026-11-20T00:00:00-08:00'],
  [80, '2026-11-23T00:00:00-08:00'],
  [99, '2026-11-23T00:00:00-08:00'],
  [100, '2026-11-30T00:00:00-08:00'],
];

for (const [grade, due] of EXAMPLES) {
  test(`grade ${grade} is next due at ${due} in America/Los_Angeles`, () => {
    const actual = nextReviewAt({ grade, now: NOW, timeZone: TIME_ZONE });
    assert.equal(actual.toISOString(), new Date(due).toISOString());
  });
}
