# 001: Set and card reviews take over the open Daily Review

**Severity:** High
**Area:** `/review`, `actions/loadReviewSession.ts`, `actions/recordAttempt.ts`
**PRD:** [Daily review](../prd/daily-review.md) R5, R9, R11, R13, R14, R16

## Summary

Every kind of review (header **Daily Review**, a set's **Review**, a verse card's keyboard control) shares "the latest open `ReviewSession`". A set or card review started while a planned Daily Review is open runs inside that planned session and ends it. In the other direction, a set review left unfinished stops header **Daily Review** from building its plan.

## Scenario A: a set review ends a Daily Review that is not finished

1. Save two verses and put both in a set "Hope". Set the review limit to 4.
2. Choose header **Daily Review**. A planned session with 4 attempts is created (1 of 4 on screen).
3. Without typing, open "Hope" and choose **Review**. It shows the 2 due verses (1 of 2).
4. Type both verses and choose **Next** on the last one. The end screen shows "2 verses finished".
5. Choose header **Daily Review** again.

**Expected:** The Daily Review keeps its 2 planned attempts that were never typed (R11). It ends only after **Next** on its last verse (R9, R15). Step 5 resumes at 3 of 4 (R14).

**Actual:** At step 4 the planned Daily Review gets `endedAt`, with 2 planned attempts never typed. Step 5 starts a new plan at 1 of 4. Home "Completed review sessions" goes up by one, and because the ended session is `planned`, the home streak marks the day as a finished Daily Review.

```
FAIL  A: finishing a set review leaves the Daily Review session open  -- daily endedAt=2026-11-26T06:31:28.468Z with 2 planned attempts never typed
FAIL  A: Daily Review afterwards resumes the remaining 2 planned attempts  -- 2 sessions; page: John 1:1 ESV (1 of 4)
```

The card keyboard control (`/review?setId=…&startId=…`) takes the same path and behaves the same way.

## Scenario B: an unfinished set review blocks the Daily Review plan

1. Save three verses, two of them in "Hope". Set the review limit to 4.
2. Open "Hope", choose **Review**, finish one verse, then leave without choosing **Next**.
3. Choose header **Daily Review**.

**Expected:** A planned session of exactly 4 attempts with difficulty tiers (R5). The set review is not a Daily Review.

**Actual:** No planned session is created. The page shows the old unplanned list of due verses ("1 of 2"). The header keeps doing this until the set review is finished. When that list is finished, the session is not `planned`, so the streak does not count it.

```
FAIL  E2: Daily Review builds exactly reviewLimit (4) attempts after an abandoned set review  -- John 1:1 ESV (1 of 2); planned sessions=0, planned rows=0
```

## Cause

- `loadReviewSession` calls `openReviewSession` with the latest session of any kind. For `set` and `card` requests it reuses that session's id, so `ReviewSession` ends it through `endReviewSession(sessionId)` on the set's end screen.
- `recordAttempt` looks for a pending planned row for the verse (`reviewSession: { endedAt: null, planned: true }`) before it creates a new row. A set attempt on a verse that is also in the Daily Review plan therefore uses up that planned row.
- For a `due` request, a plan is generated only when `!reviewSession.resumed`. An open set session counts as resumed but is not `planned`, so the code falls through to `dueVerses`.

## Notes

The PRD says "One open `ReviewSession` is the current review session" (R13) but does not say what a set or card review does while a Daily Review is open. Whatever rule is chosen, a set review must not end a Daily Review that still has attempts left, and the header must still build its R5 plan.
