# Daily review

This document is a reference for the intended behavior of **Daily Review**. The Gherkin stories are in [daily-review.feature](daily-review.feature). Open questions are not requirements. [Recall](recall.md) changes how the verse is shown. [Honest doors](honest-doors.md) changes where sign-in lands. [Your verses only](your-verses-only.md) changes who a write belongs to.

## Current behavior

`app/(protected)/review/page.tsx` is a typing drill. The passage on first paint is Psalm 119:105 in ESV. The form loads a different passage from `GET /api/fetch_verse`. The full text stays on screen. **Save Verse** stores the form reference through `saveVerses`, which takes a `userId` from the browser.

A finished attempt calls `recordAttempt`. The summary shows the grade, the error count, the speed, the characters per minute for this translation, the mastery, and the overall speed. **Next** clears that summary and mounts the same passage again.

`recordAttempt` inserts one `ReviewSession` for that attempt. The home page counts those rows and labels the count "Completed review sessions". The home page also counts saved verses that have at least one review, and labels that count "Practiced verses".

The **Review** button on a verse set has no handler (`VerseSetContent`). A verse card does not open **Daily Review**.

`UserVerse` has no due date. Nothing selects a next passage from saved verses.

## Requirements

**R1.** **Daily Review** loads a review session for the signed-in person. A verse is due when `nextReviewAt` is null or when `nextReviewAt` is at or before the current time. Due verses are chosen first. When fewer verses are due than the session needs, later verses fill the rest.

**R2.** `nextReviewAt` is a timestamp on `UserVerse`. A new saved verse has a null `nextReviewAt`, so the verse is due.

**R3.** Due verses are ordered in three passes. Unseen verses come first. An unseen verse has no completed review (`lastReviewedAt` is null). The remaining verses follow, lowest `highestScore` first. Verses with the same score follow, earliest `nextReviewAt` first. Null `nextReviewAt` sorts before any timestamp.

**R4.** The same `UserVerse` is selected once, even when two sets contain that verse. The session can still schedule that verse for more than one attempt.

**R5.** Header **Daily Review** builds exactly `reviewLimit` attempts. It selects `ceil(reviewLimit / 2)` verses, due verses first in the R3 order, then stored verses that are not due. Those fillers go oldest `lastReviewedAt` first (never reviewed first), then lower `highestScore`, then lower `mostRecentScore`. Each selected verse is scheduled twice, first at `floor(highestScore / 20)` clamped to 0–5, then one tier higher clamped to 5. A missing score starts at tier 0. The attempts run as every first pass, then every second pass. When `reviewLimit` is odd, the last selected verse is scheduled once, at the lower tier. When the person has fewer stored verses than that selection needs, the same verses gain extra passes, difficulty rising by one tier each pass and clamped at 5, until the attempt count is `reviewLimit`. `generateReviewSession` writes those attempts as `UserVerseReview` rows before typing. `reviewedAt` stays null until the attempt is finished. An open planned session is resumed from any browser.

**R6.** **Review** on a verse set opens the due verses in that set, at most `reviewLimit` of them, in the order from R3.

**R7.** The passage text stays visible for the whole attempt. [Recall](recall.md) is the document that hides the text.

**R8.** The attempt still finishes through `recordAttempt`. The summary keeps the fields the review page shows today.

**R9.** **Next** on the summary loads the next verse in the review session. **Next** on the last verse ends the review session.

**R10.** The end screen shows the number of verses finished in the review session, the average grade for the review session, and the words per minute across those verses. That speed is the review session's speed. It is separate from the account-wide overall speed on an attempt summary. An expandable control lists each finished verse with its grade, its difficulty, and its words per minute.

**R11.** Finishing an attempt marks that planned row. It does not add another copy of the verse. Later passes that were already planned stay in the session, including when the new `nextReviewAt` is still in the past.

**R12.** Finishing a verse sets `nextReviewAt` from the mastery tier. The tier is `difficultyFor` in `lib/typing.ts`, applied to the grade just stored. The same finish sets `lastReviewedAt` and `mostRecentScore`, and raises `highestScore` when the new grade is higher. The delays are below.

| Tier | Best grade | Next review |
| --- | --- | --- |
| 0 | No prior grade, or under 20 | The current time |
| 1 | 20 to 39 | 1 day later |
| 2 | 40 to 59 | 2 days later |
| 3 | 60 to 79 | 4 days later |
| 4 | 80 to 99 | 7 days later |
| 5 | 100 | 14 days later |

Tier 0 stores the current time. The next load treats that verse as due. R11 still keeps the verse out of the review session that just finished it. A delay of 1 day or more is due at midnight in the account timezone, that many midnights after the finish. A finish on Monday with a 1-day delay is due at Tuesday 00:00 in that zone.

**R13.** One open `ReviewSession` is the current review session. Header **Daily Review** creates the `UserVerseReview` rows when the session is generated. A row is finished when `reviewedAt` is set. A second review session is created only when the latest session has an end time.

**R14.** Reloading **Daily Review** resumes the open planned session from its rows with no `reviewedAt`, in the order they were created. **Daily Review** generates a session only when the person has no open review session.

**R15.** An open review session has no end time. The end screen sets `endedAt` on that `ReviewSession`.

**R16.** The home count "Completed review sessions" counts sessions with `endedAt` set. The home count "Practiced verses" counts saved verses with at least one review whose `reviewedAt` is set. A planned row that has not been typed does not count.

**R17.** A person with no saved verses sees "You have no saved verses." and a link to **Search for a verse**. Header **Daily Review** still builds a session when every saved verse is due later. A set whose verses are all in the future sees "Nothing is due." and that set's soonest due time.

**R18.** A failed verse lookup on the old form is removed. The review session does not ask the person to type a book, a chapter, or a verse number.

**R19.** The account stores `reviewLimit`, an integer, default 10. **Account settings** has a **Review** section. That section edits `reviewLimit`. Profile, Email, Password, Notifications, and Appearance stay unavailable.

**R20.** The account stores `timezone` as an IANA name. The first sign-in sets `timezone` from the browser. The **Review** section can change it.

**R21.** The keyboard control on a verse card inside a set starts a review session at that verse. The review session then continues down that set, in list order, through the verses after the chosen one. The review session stops at `reviewLimit` verses. Verses earlier in the list are not included. The due filter from R1 does not apply to this review session.

## Out of scope

Hiding the passage, skip, email delivery, and charts beyond the two home counts are out of scope. Community, experience points, and more translations are out of scope. Profile, Email, Password, Notifications, and Appearance stay out of scope.

## Decided

Unseen verses come first. A finished attempt does not add another copy beyond the plan. The delay uses the grade just stored, and the table in R12 is the schedule. Reload continues the same `ReviewSession`. Header **Daily Review** generates exactly `reviewLimit` attempts. A set's **Review** button opens due verses in that set, capped at `reviewLimit`. The card keyboard walks the rest of that set's list. ESV and KJV of one reference are two verses. "Completed review sessions" counts finished review sessions. The end screen speed is the review session's speed. Due times for delays of 1 day or more fall at local midnight.
