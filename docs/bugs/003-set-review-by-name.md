# 003: Review on a set includes verses from other sets with the same name

**Severity:** Medium
**Area:** `app/(protected)/verse_sets/[id]/VerseSetContent.tsx`, `lib/dueVerses.ts`
**PRD:** [Daily review](../prd/daily-review.md) R6

## Summary

The set **Review** link is `/review?set=<name>`, and `selectDueReviewSession` filters by `setNames.includes(name)`. Set names are not unique, so two sets with the same name are reviewed as one set.

## Steps

1. Create two sets both named "Hope". Put John 1:1 in the first and John 1:2 in the second.
2. Open the first "Hope" and choose **Review**.

**Expected:** Only the due verses in that set (R6): John 1:1 (1 of 1).

**Actual:** Both verses (1 of 2).

```
FAIL  E1: Review on first "Hope" set only includes its own verse  -- John 1:1 ESV (1 of 2) (URL ?set=Hope)
```

The "Nothing is due." soonest time in `emptyReviewSession` filters by name the same way. The card keyboard control already passes `setId`, so the set button can be keyed by id too.
