# 002: Untyped planned rows reset mastery in set review order

**Severity:** Medium
**Area:** `dueVerses` in `actions/loadReviewSession.ts`
**PRD:** [Daily review](../prd/daily-review.md) R3, R6

## Summary

A set's **Review** orders due verses by mastery (R3). The mastery comes from the verse's reviews sorted `grade desc`, `take: 1`. Postgres sorts NULL first in a descending sort. A planned `UserVerseReview` that has not been typed has `grade = NULL`, so any verse in a planned Daily Review gets mastery `null`, which counts as 0, and moves to the front.

## Steps

1. Save John 1:1 with a finished review graded 90 and John 1:2 with a finished review graded 40. Both are due. Put both in "Faith".
2. Choose **Review** on "Faith". John 1:2 is first, which is correct.
3. Give John 1:1 a planned row that was never typed. This happens whenever John 1:1 is in an open Daily Review, or was left behind by bug [001](001-set-review-ends-daily-review.md).
4. Choose **Review** on "Faith" again.

**Expected:** John 1:2 (mastery 40) comes before John 1:1 (mastery 90).

**Actual:** John 1:1 comes first.

```
PASS  B: baseline set order (no planned rows) lower mastery first  -- John 1:2 ESV (1 of 2)
FAIL  B: untyped planned row does not change set order (lower mastery first)  -- first is John 1:1 (mastery 90 verse jumped ahead)
```

## Cause

```ts
_count: { select: { userVerseReviews: true } },
userVerseReviews: { select: { grade: true }, orderBy: { grade: 'desc' }, take: 1 },
```

- Neither query filters to finished reviews (`reviewedAt: { not: null }`).
- The `_count` has the same problem. A verse whose only review is planned looks seen, not unseen (R3 says unseen means no completed review).
- `UserVerse.highestScore` already holds the value R3 needs.
