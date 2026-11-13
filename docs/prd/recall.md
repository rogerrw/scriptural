# Recall

This document is a reference for how **Daily Review** shows a passage. The Gherkin stories are in [recall.feature](recall.feature). It depends on [Daily review](daily-review.md). Open questions are not requirements.

## Current behavior

The only typing screen is `app/(protected)/review/page.tsx`. `VerseTyper` paints the full passage for the whole attempt. A matching character shows the typed glyph. A mismatch shows the typed glyph in red with a strikethrough. The home page does not run the typer. The home page shows two counts.

There is no second mode that hides the passage.

## Requirements

**R1.** A verse with no `UserVerseReview` stays fully visible for the attempt. That attempt is learn mode.

**R2.** A verse with at least one `UserVerseReview` starts hidden. That attempt is recall mode.

**R3.** Hidden means the passage gives no length cue before the person types. Typed characters appear as they are typed. A match shows the typed glyph. A mismatch shows the typed glyph in red with a strikethrough. The correct character stays hidden on a mismatch.

**R4.** **Reveal** shows the full passage for the rest of the attempt. **Reveal** is available only in recall mode. The person cannot hide the passage again in that attempt.

**R5.** A revealed attempt still calls `recordAttempt`. The grade uses the same formula as a hidden attempt. [Daily review](daily-review.md) still moves `nextReviewAt` from that grade.

**R6.** Learn mode has no **Reveal** control.

**R7.** The summary after either mode shows the full passage, as the review page does today.

**R8.** Search, verse sets, and the home page do not gain a hidden mode.

## Out of scope

First-letter hints, word-at-a-time reveal, audio, a separate learn screen, and a change to the grade formula are out of scope.

## Decided

The first attempt stays visible. A later attempt has no length cue. A mismatch shows the wrong glyph and hides the correct character. **Reveal** shows the whole passage, the person keeps typing, and the grade and the due date still move. Recall follows the saved row, so a second translation stays in learn mode until that row has a review.
