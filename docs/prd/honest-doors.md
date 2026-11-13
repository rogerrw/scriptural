# Honest doors

This document is a reference for sign-in copy, the post-login destination, and the verse list after an add. The Gherkin stories are in [honest-doors.feature](honest-doors.feature). The sitting itself is [Daily review](daily-review.md).

## Current behavior

`register` in `actions/auth/register.ts` creates a password user, writes a verification token, and returns the success string "Confirmation email sent!". No mail is sent. `emailVerified` stays null.

`login` in `actions/auth/login.ts` returns that same success string when `emailVerified` is null. The password user never reaches `signIn`. Google sign-in sets `emailVerified` in the `linkAccount` event in `auth.ts`.

The sign-in form and the register form both render `FormSuccess` and `FormError`.

`DEFAULT_LOGIN_REDIRECT` in `routes.ts` is `/`. Google sign-in uses that same path. `/` shows "Practiced verses" and "Completed review sessions".

**Add Verse** closes the dialog on success and does not refresh the set page. The new card stays absent until some other navigation reloads the server page. `deleteVerseFromSet` calls `revalidatePath` for the set and checks that the set belongs to the signed-in person.

**Account settings** opens `/account`. Each section renders the section name and the sentence "This setting is not available yet."

## Requirements

**R1.** `register` does not create a user. `register` returns the error "Email signup is unavailable." The register form shows that error through `FormError`.

**R2.** `login` returns the error "Email signup is unavailable." when the user has a password and `emailVerified` is null. `login` does not write a new verification token on that path.

**R3.** Google sign-in is unchanged. A Google account can still sign in.

**R4.** After a successful Google sign-in, the app opens `/`. `DEFAULT_LOGIN_REDIRECT` stays `/`. The Google callback uses that constant.

**R5.** **Add Verse** calls `revalidatePath` for `/verse_sets/<id>` after a successful insert. The set page shows the new card when the dialog closes. The dialog still closes on success.

**R6.** A failed add still leaves the dialog open. The dialog shows the error string the action returned.

## Out of scope

A mailer, a verification page, password reset, and the **Review** button on a verse set are out of scope. The set button belongs to [Daily review](daily-review.md). The **Review** section of **Account settings** belongs to that document too. Profile, Email, Password, Notifications, and Appearance stay unavailable. Ownership checks on create, save, and add belong to [Your verses only](your-verses-only.md).

## Decided

The register form stays. Submit creates no account and shows "Email signup is unavailable." An unverified password user gets that same error and no new token. Existing password users stay unable to sign in. Google sign-in lands on `/`. **Add Verse** refreshes the list, closes the dialog, and shows no toast. A failed add stays inline in the dialog. **Account settings** keeps the unavailable sections. The **Review** section is specified in [Daily review](daily-review.md).
