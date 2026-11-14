import assert from 'node:assert/strict';
import test from 'node:test';
import { openReviewSession } from './reviewSession.ts';
import { selectDueReviewSession, type DueVerse } from './dueVerses.ts';

const ME = 'me';
const NOW = new Date('2026-11-16T15:00:00-08:00');

function verse(overrides: Partial<DueVerse> & Pick<DueVerse, 'id' | 'reference'>): DueVerse {
  return {
    userId: ME,
    translation: 'ESV',
    nextReviewAt: null,
    reviewCount: 1,
    mastery: 40,
    setNames: [],
    ...overrides,
  };
}

test('no review session starts a new one', () => {
  const started = openReviewSession({ latestSession: null, newSessionId: 'review-session-1' });
  assert.equal(started.resumed, false);
  assert.equal(started.sessionId, 'review-session-1');
  assert.deepEqual(started.finishedVerseIds, []);
});

test('reload keeps the open session and drops verses already finished', () => {
  const again = openReviewSession({
    latestSession: {
      id: 'review-session-1',
      endedAt: null,
      finishedVerseIds: [1],
    },
    newSessionId: 'review-session-2',
  });
  assert.equal(again.resumed, true);
  assert.equal(again.sessionId, 'review-session-1');
  assert.deepEqual(again.finishedVerseIds, [1]);

  const finished = verse({
    id: 1,
    reference: 'John 1:1',
    nextReviewAt: NOW,
    reviewCount: 1,
    mastery: 0,
  });
  const remaining = verse({
    id: 2,
    reference: 'John 1:2',
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const reviewSession = selectDueReviewSession({
    verses: [finished, remaining],
    userId: ME,
    now: NOW,
    reviewLimit: 10,
    finishedVerseIds: again.finishedVerseIds,
  });
  assert.deepEqual(
    reviewSession.map((item) => item.reference),
    ['John 1:2'],
  );
});

test('a ReviewSession with an end time is not resumed', () => {
  const next = openReviewSession({
    latestSession: {
      id: 'review-session-1',
      endedAt: new Date('2026-11-16T16:00:00-08:00'),
      finishedVerseIds: [1, 2],
    },
    newSessionId: 'review-session-2',
  });
  assert.equal(next.resumed, false);
  assert.equal(next.sessionId, 'review-session-2');
  assert.deepEqual(next.finishedVerseIds, []);
});
