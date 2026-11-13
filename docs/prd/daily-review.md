# Daily review

This document is a reference for the intended behavior of **Daily Review**. The Gherkin stories are in [daily-review.feature](daily-review.feature). Open questions are not requirements. [Recall](recall.md) changes how the verse is shown. [Honest doors](honest-doors.md) changes where sign-in lands. [Your verses only](your-verses-only.md) changes who a write belongs to.

## Current behavior

`app/(protected)/review/page.tsx` is a typing drill. The passage on first paint is Psalm 119:105 in ESV. The form loads a different passage from `GET /api/fetch_verse`. The full text stays on screen. **Save Verse** stores the form reference through `saveVerses`, which takes a `userId` from the browser.

A finished attempt calls `recordAttempt`. The summary shows the grade, the error count, the speed, the characters per minute for this translation, the mastery, and the overall speed. **Next** clears that summary and mounts the same passage again.

`recordAttempt` inserts one `ReviewSession` for that attempt. The home page counts those rows and labels the count "Completed review sessions". The home page also counts saved verses that have at least one review, and labels that count "Practiced verses".

The **Review** button on a verse set has no handler (`VerseSetContent`). A verse card does not open **Daily Review**.

`UserVerse` has no due date. Nothing selects a next passage from saved verses.

## Requirements

**R1.** **Daily Review** loads a sitting for the signed-in person. The sitting contains that person's due verses. A verse is due when `nextReviewAt` is null or when `nextReviewAt` is at or before the current time.

**R2.** `nextReviewAt` is a timestamp on `UserVerse`. A new saved verse has a null `nextReviewAt`, so the verse is due.

**R3.** The sitting orders due verses in three passes. Unseen verses come first. An unseen verse has no `UserVerseReview`. The remaining verses follow, lowest mastery first. Mastery is the max `grade` already stored for that `UserVerse`. Verses with the same mastery follow, earliest `nextReviewAt` first. Null `nextReviewAt` sorts before any timestamp.

**R4.** The same `UserVerse` appears once in a sitting, even when two sets contain that verse.

**R5.** **Daily Review** in the header opens the due verses, at most `reviewLimit` of them, in the order from R3.

**R6.** **Review** on a verse set opens the due verses in that set, at most `reviewLimit` of them, in the order from R3.

**R7.** The passage text stays visible for the whole attempt. [Recall](recall.md) is the document that hides the text.

**R8.** The attempt still finishes through `recordAttempt`. The summary keeps the fields the review page shows today.

**R9.** **Next** on the summary loads the next verse in the sitting. **Next** on the last verse ends the sitting.

**R10.** The end screen shows the number of verses finished in the sitting, the average grade for the sitting, and the words per minute across those verses. That speed is the sitting's speed. It is separate from the account-wide overall speed on an attempt summary. An expandable control lists each finished verse with its grade, its difficulty, and its words per minute.

**R11.** A verse the person finishes leaves the sitting. The verse does not return in that sitting, including when the new `nextReviewAt` is still in the past.

**R12.** Finishing a verse sets `nextReviewAt` from the mastery tier. The tier is `difficultyFor` in `lib/typing.ts`, applied to the grade just stored. The delays are below.

| Tier | Best grade | Next review |
| --- | --- | --- |
| 0 | No prior grade, or under 20 | The current time |
| 1 | 20 to 39 | 1 day later |
| 2 | 40 to 59 | 2 days later |
| 3 | 60 to 79 | 4 days later |
| 4 | 80 to 99 | 7 days later |
| 5 | 100 | 14 days later |

Tier 0 stores the current time. The next load treats that verse as due. R11 still keeps the verse out of the sitting that just finished it. A delay of 1 day or more is due at midnight in the account timezone, that many midnights after the finish. A finish on Monday with a 1-day delay is due at Tuesday 00:00 in that zone.

**R13.** One open `ReviewSession` is the sitting. Each finished attempt in that sitting is a `UserVerseReview` on that session. A second sitting creates a new `ReviewSession`.

**R14.** Reloading **Daily Review** resumes the open sitting when one exists. Verses already reviewed in that session stay out of the remaining list. **Daily Review** creates a sitting only when the person has no open sitting.

**R15.** An open sitting has no end time. The end screen sets `endedAt` on that `ReviewSession`.

**R16.** The home count "Completed review sessions" counts sessions with `endedAt` set. The home count "Practiced verses" still counts saved verses with at least one review.

**R17.** A person with no saved verses sees "You have no saved verses." and a link to **Search for a verse**. A person whose verses are all in the future sees "Nothing is due." and the soonest due time in the account timezone.

**R18.** A failed verse lookup on the old form is removed. The sitting does not ask the person to type a book, a chapter, or a verse number.

**R19.** The account stores `reviewLimit`, an integer, default 10. **Account settings** has a **Review** section. That section edits `reviewLimit`. Profile, Email, Password, Notifications, and Appearance stay unavailable.

**R20.** The account stores `timezone` as an IANA name. The first sign-in sets `timezone` from the browser. The **Review** section can change it.

**R21.** The keyboard control on a verse card inside a set starts a sitting at that verse. The sitting then continues down that set, in list order, through the verses after the chosen one. The sitting stops at `reviewLimit` verses. Verses earlier in the list are not included. The due filter from R1 does not apply to this sitting.

## Out of scope

Hiding the passage, skip, email delivery, and charts beyond the two home counts are out of scope. Community, experience points, and more translations are out of scope. Profile, Email, Password, Notifications, and Appearance stay out of scope.

## Decided

Unseen verses come first. A finished verse stays out of the sitting that finished it. The delay uses the grade just stored, and the table in R12 is the schedule. Reload continues the same `ReviewSession`. The header opens due verses up to `reviewLimit`. A set's **Review** button opens due verses in that set, with the same cap. The card keyboard walks the rest of that set's list. ESV and KJV of one reference are two verses. "Completed review sessions" counts finished sittings. The end screen speed is the sitting's speed. Due times for delays of 1 day or more fall at local midnight.
