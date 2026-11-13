# Your verses only

This document is a reference for which user a verse write and a verse read belong to. The Gherkin stories are in [your-verses-only.feature](your-verses-only.feature). `deleteVerseFromSet` already follows the rule below. This document extends that rule to the other verse paths.

## Current behavior

`recordAttempt` stores the attempt on the signed-in user. `fetchOrCreateUserVerse` creates the saved verse on the signed-in user. `deleteVerseFromSet` deletes a membership only when the set's `userId` is that person.

`saveVerses` stores `userId` from the argument. The review page passes the session id from the browser. `createVerseSet` stores `userId` from the argument. The create dialog passes the session id from the browser.

`addVerseToSet` requires a session, then inserts into the posted `verseSetId` without comparing `verseSet.userId` to the session. `fetchVerseSet` returns any set id, including the verse text. `fetchVerseSets` filters by the `userId` argument and does not read the session.

A second add of the same verse inserts another `VerseSetVerse` row. Nothing rejects the duplicate.

## Requirements

**R1.** `saveVerses` ignores a `userId` argument. The saved row uses the id from `auth()`. A missing session returns "Unauthorized".

**R2.** `createVerseSet` ignores a `userId` argument. The set uses the id from `auth()`. A missing session returns "Unauthorized".

**R3.** `fetchVerseSets` ignores a `userId` argument. The list is the signed-in person's sets. A missing session returns an empty list.

**R4.** `fetchVerseSet` returns "Verse set not found" when the set is missing or when `verseSet.userId` is not the signed-in person. The two cases use that same error.

**R5.** `addVerseToSet` returns "Verse set not found" when the set is missing or when the set belongs to someone else. The action inserts only after that check passes.

**R6.** `addVerseToSet` returns "Already in this set" when the set already has that `UserVerse`. The action does not insert a second membership row.

**R7.** `deleteVerseFromSet` stays as it is. A delete still requires the set owner and still calls `revalidatePath`.

**R8.** The review page and the create dialog stop sending `userId`. The server actions in R1 and R2 are the source of the id. A payload that still includes `userId` is accepted. The field is ignored.

**R9.** `fetchVerse` and `GET /api/fetch_verse` require a signed-in session. A missing session returns "Unauthorized".

## Out of scope

Account deletion and a mailer are out of scope. The first `recordAttempt` for a passage still stores the verse string sent by the browser.

## Decided

Another person's set uses "Verse set not found". A duplicate add returns "Already in this set". A client `userId` is ignored. Verse lookup requires a signed-in session. `fetchVerseSets` with no session returns an empty list. The first stored passage text still comes from the browser.
