import assert from 'node:assert/strict';
import test from 'node:test';
import { selectCardReviewSession, selectDueReviewSession, type CardVerse, type DueVerse } from './dueVerses.ts';

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

function card(
  overrides: Partial<CardVerse> & Pick<CardVerse, 'id' | 'reference' | 'listIndex'>,
): CardVerse {
  return {
    translation: 'ESV',
    nextReviewAt: null,
    ...overrides,
  };
}

function dueReviewSession(
  verses: readonly DueVerse[],
  options: {
    readonly reviewLimit?: number;
    readonly setName?: string;
    readonly finishedVerseIds?: readonly number[];
  } = {},
): readonly DueVerse[] {
  return selectDueReviewSession({
    verses,
    userId: ME,
    now: NOW,
    reviewLimit: 10,
    ...options,
  });
}

function references(verses: readonly { readonly reference: string }[]): string[] {
  return verses.map((item) => item.reference);
}

function labels(
  verses: readonly { readonly reference: string; readonly translation: string }[],
): string[] {
  return verses.map((item) => `${item.reference} ${item.translation}`);
}

function hopeCards(): CardVerse[] {
  return [
    card({
      id: 4,
      reference: 'John 1:4',
      listIndex: 3,
      nextReviewAt: new Date('2026-11-14T00:00:00-08:00'),
    }),
    card({ id: 1, reference: 'John 1:1', listIndex: 0, nextReviewAt: null }),
    card({
      id: 3,
      reference: 'John 1:3',
      listIndex: 2,
      nextReviewAt: new Date('2026-11-17T00:00:00-08:00'),
    }),
    card({
      id: 2,
      reference: 'John 1:2',
      listIndex: 1,
      nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
    }),
  ];
}

test('a saved verse with no due time is due', () => {
  const saved = verse({
    id: 1,
    reference: 'John 3:16',
    translation: 'ESV',
    nextReviewAt: null,
    reviewCount: 0,
    mastery: null,
  });
  assert.deepEqual(labels(dueReviewSession([saved])), ['John 3:16 ESV']);
});

test('a verse due in the future is left out', () => {
  const later = verse({
    id: 1,
    reference: 'John 3:16',
    translation: 'ESV',
    nextReviewAt: new Date('2026-11-17T00:00:00-08:00'),
  });
  assert.deepEqual(dueReviewSession([later]), []);
});

test("another person's due verse is left out", () => {
  const mine = verse({ id: 1, reference: 'Psalm 23:1', nextReviewAt: null });
  const theirs = verse({
    id: 2,
    reference: 'John 3:16',
    translation: 'ESV',
    userId: 'someone-else',
    nextReviewAt: null,
  });
  assert.deepEqual(
    dueReviewSession([theirs, mine]).map((item) => item.id),
    [mine.id],
  );
});

test('unseen verses come before reviewed verses', () => {
  const reviewed = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const unseen = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 0,
    mastery: null,
    nextReviewAt: null,
  });
  assert.deepEqual(references(dueReviewSession([reviewed, unseen])), ['John 1:1', 'John 1:2']);
});

test('an unseen verse comes before a reviewed verse with lower mastery', () => {
  const reviewed = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 0,
    nextReviewAt: null,
  });
  const unseen = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 0,
    mastery: 90,
    nextReviewAt: null,
  });
  assert.deepEqual(references(dueReviewSession([reviewed, unseen])), ['John 1:1', 'John 1:2']);
});

test('lower mastery comes before higher mastery', () => {
  const higher = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 1,
    mastery: 90,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const lower = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  assert.deepEqual(references(dueReviewSession([higher, lower])), ['John 1:2', 'John 1:1']);
});

test('the same mastery is ordered by the earliest due time', () => {
  const later = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const earlier = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-14T00:00:00-08:00'),
  });
  assert.deepEqual(references(dueReviewSession([later, earlier])), ['John 1:2', 'John 1:1']);
});

test('a missing due time comes before a timestamp at the same mastery', () => {
  const stamped = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const missing = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: null,
  });
  assert.deepEqual(references(dueReviewSession([stamped, missing])), ['John 1:2', 'John 1:1']);
});

test('one UserVerse in two sets appears once', () => {
  const hope = verse({
    id: 7,
    reference: 'John 3:16',
    translation: 'ESV',
    nextReviewAt: null,
    setNames: ['Hope'],
  });
  const faith = verse({
    id: 7,
    reference: 'John 3:16',
    translation: 'ESV',
    nextReviewAt: null,
    setNames: ['Faith'],
  });
  const reviewSession = dueReviewSession([hope, faith]);
  assert.equal(reviewSession.length, 1);
  assert.equal(reviewSession[0].id, 7);
  assert.equal(reviewSession[0].reference, 'John 3:16');
  assert.equal(reviewSession[0].translation, 'ESV');
});

test('ESV and KJV of one reference are two verses', () => {
  const esv = verse({ id: 1, reference: 'John 3:16', translation: 'ESV', nextReviewAt: null });
  const kjv = verse({ id: 2, reference: 'John 3:16', translation: 'KJV', nextReviewAt: null });
  assert.deepEqual(labels(dueReviewSession([esv, kjv])).sort(), ['John 3:16 ESV', 'John 3:16 KJV']);
});

test('the review session stops at the review limit', () => {
  const third = verse({
    id: 3,
    reference: 'John 1:3',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const first = verse({
    id: 1,
    reference: 'John 1:1',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-13T00:00:00-08:00'),
  });
  const second = verse({
    id: 2,
    reference: 'John 1:2',
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-14T00:00:00-08:00'),
  });
  assert.deepEqual(references(dueReviewSession([third, first, second], { reviewLimit: 2 })), [
    'John 1:1',
    'John 1:2',
  ]);
});

test('a finished verse stays out of this review session when grade 0 makes it due again', () => {
  const dueAgain = new Date('2026-11-16T15:00:00-08:00');
  const finished = verse({
    id: 1,
    reference: 'John 1:1',
    nextReviewAt: dueAgain,
    reviewCount: 1,
    mastery: 0,
  });
  const next = verse({
    id: 2,
    reference: 'John 1:2',
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  assert.deepEqual(references(dueReviewSession([finished, next], { finishedVerseIds: [finished.id] })), [
    'John 1:2',
  ]);
  assert.deepEqual(references(dueReviewSession([finished])), ['John 1:1']);
});

test("a set review includes only that set's due verses", () => {
  const hopeDue = verse({
    id: 1,
    reference: 'John 3:16',
    translation: 'ESV',
    nextReviewAt: null,
    setNames: ['Hope'],
  });
  const hopeLater = verse({
    id: 2,
    reference: 'Romans 8:28',
    translation: 'ESV',
    nextReviewAt: new Date('2026-11-17T00:00:00-08:00'),
    setNames: ['Hope'],
  });
  const faithDue = verse({
    id: 3,
    reference: 'Psalm 23:1',
    translation: 'ESV',
    nextReviewAt: null,
    setNames: ['Faith'],
  });
  assert.deepEqual(labels(dueReviewSession([faithDue, hopeLater, hopeDue], { setName: 'Hope' })), [
    'John 3:16 ESV',
  ]);
});

test('a set review session stops at the review limit', () => {
  const second = verse({
    id: 2,
    reference: 'John 1:2',
    setNames: ['Hope'],
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-15T00:00:00-08:00'),
  });
  const first = verse({
    id: 1,
    reference: 'John 1:1',
    setNames: ['Hope'],
    reviewCount: 1,
    mastery: 40,
    nextReviewAt: new Date('2026-11-14T00:00:00-08:00'),
  });
  assert.deepEqual(
    references(dueReviewSession([second, first], { reviewLimit: 1, setName: 'Hope' })),
    ['John 1:1'],
  );
});

test('the keyboard path starts at the chosen verse and continues down the set', () => {
  assert.deepEqual(
    references(selectCardReviewSession({ verses: hopeCards(), startId: 2, reviewLimit: 10 })),
    ['John 1:2', 'John 1:3', 'John 1:4'],
  );
});

test('a card review session stops at the review limit', () => {
  assert.deepEqual(
    references(selectCardReviewSession({ verses: hopeCards(), startId: 2, reviewLimit: 2 })),
    ['John 1:2', 'John 1:3'],
  );
});
