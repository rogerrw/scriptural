# 004: A verse that does not exist crashes the lookup; Search shows the previous verse

**Severity:** Medium
**Area:** `actions/fetchVerse.ts`, `app/(protected)/search/page.tsx`, `app/(protected)/verse_sets/[id]/AddVerseDialog.tsx`
**PRD:** [Honest doors](../prd/honest-doors.md) R6

## Summary

When the chapter exists but the verse does not (for example John 1:99), `fetchVerse` throws a `TypeError` instead of returning nothing. Neither caller handles the rejection.

## Steps on Search

1. Open **Search**. Choose John, chapter 1, verse 1. The card shows "In the beginning was the Word."
2. Change the verse to 99.

**Expected:** No card, or a message that the verse does not exist.

**Actual:** The card title changes to "John 1:99 ESV", but it keeps John 1:1's text. The Next.js dev overlay reports an unhandled rejection.

```
FAIL  search nonexistent John 1:99 does not show John 1:1 text under 1:99  -- card reads "John 1:99" with John 1:1 text
[browser] ⨯ unhandledRejection: TypeError: Cannot read properties of undefined (reading 'id')
    at fetchVerse (actions/fetchVerse.ts:26:29)
```

## Steps in Add Verse

1. Open a set, choose **Add Verses**, and enter John 1:99.

**Actual:** **Add Verse** stays disabled and the dialog shows nothing. The person cannot tell why. Honest doors R6 expects a failed add to stay open and show the error.

## Cause

```ts
const verseObj = await model.findOne({ id: `${book}_${chapter}` }, { verses: { $elemMatch: { id: … } } });
if (!verseObj) throw new Error('This verse could not be found.');
const verseTranslations = verseObj.verses[0]; // undefined when the verse is missing
return { id: verseTranslations.id, … };        // TypeError
```

- A missing chapter throws on purpose. A missing verse throws by accident.
- `fetchOrCreateUserVerse` checks `if (!verseText)` and returns "This verse does not exist in the Bible.", but that branch never runs because `fetchVerse` throws instead of returning a falsy value.
- On Search, the `useEffect` has no `.catch` and never clears `fetchedVerse`, so the old text stays on screen.
