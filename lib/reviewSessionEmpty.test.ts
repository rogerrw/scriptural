import assert from 'node:assert/strict';
import test from 'node:test';
import {
  emptyReviewSession,
  type EmptyReviewSession,
  type ReviewSessionCandidate,
  type ReviewSessionRequest,
} from './reviewSession.ts';

const NOW = new Date('2026-11-16T15:00:00-08:00');

function verse(nextReviewAt: string | null, setNames: readonly string[] = []): ReviewSessionCandidate {
  return { nextReviewAt: nextReviewAt === null ? null : new Date(nextReviewAt), setNames };
}

function emptyScreen(
  verses: readonly ReviewSessionCandidate[],
  request: Extract<ReviewSessionRequest, { kind: 'due' | 'set' }>,
): EmptyReviewSession {
  return emptyReviewSession({ verses, request, now: NOW, timeZone: 'America/Los_Angeles' });
}

function nextDue(screen: EmptyReviewSession): string | null {
  if (screen.status !== 'nothing-due') {
    assert.fail(`Expected "Nothing is due.", got ${screen.status}.`);
  }
  return screen.soonestDue;
}

test('no saved verses sends Daily Review to the no-verses screen', () => {
  assert.deepEqual(emptyScreen([], { kind: 'due' }), { status: 'no-verses' });
});

test('no saved verses sends a set URL to the no-verses screen', () => {
  assert.deepEqual(emptyScreen([], { kind: 'set', setName: 'Hope' }), { status: 'no-verses' });
});

test('Daily Review reports the soonest due time across every set in my timezone', () => {
  const screen = emptyScreen(
    [verse('2026-11-18T00:00:00-08:00', ['Hope']), verse('2026-11-17T00:00:00-08:00', ['Faith'])],
    { kind: 'due' },
  );
  assert.match(String(nextDue(screen)), /^Nov 17, 2026, 12:00\sAM$/);
});

test("a set with nothing due reports its own soonest time, not another set's", () => {
  const screen = emptyScreen(
    [verse('2026-11-18T00:00:00-08:00', ['Hope']), verse('2026-11-17T00:00:00-08:00', ['Faith'])],
    { kind: 'set', setName: 'Hope' },
  );
  assert.match(String(nextDue(screen)), /^Nov 18, 2026, 12:00\sAM$/);
});

test('an empty set says nothing is due and reports no time while other verses remain', () => {
  const screen = emptyScreen([verse('2026-11-17T00:00:00-08:00', ['Faith'])], {
    kind: 'set',
    setName: 'Hope',
  });
  assert.equal(nextDue(screen), null);
});

test('a past due time is not reported as the next one', () => {
  const screen = emptyScreen(
    [verse('2026-11-15T00:00:00-08:00', ['Hope']), verse(null, ['Hope'])],
    {
      kind: 'set',
      setName: 'Hope',
    },
  );
  assert.equal(nextDue(screen), null);
});
