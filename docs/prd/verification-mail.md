# Verification mail

This document is a reference for password signup once a confirmation message is real. The Gherkin stories are in [verification-mail.feature](verification-mail.feature). [Honest doors](honest-doors.md) is the prerequisite. This document replaces R1 and R2 of that document after it lands. R3 and R4 stay.

## Current behavior

Honest doors has landed. This document starts from that behavior.

`register` returns the error "Email signup is unavailable." and does not create a user. `login` returns that error when the user has a password and `emailVerified` is null. That path does not write a verification token. Google sign-in sets `emailVerified` in the `linkAccount` event in `auth.ts`. No page reads a verification token. `/auth/verify` is not in `publicRoutes` or `authRoutes`, so `proxy.ts` sends a signed-out visitor to `/auth/signin`.

## Requirements

**R1.** `register` creates a password user when no user has that email. The register form stays on the page. The person is not signed in.

**R2.** On that success path, one `VerificationRequest` remains for the email only after the confirmation message is accepted. `emailVerified` stays null. The token expires one hour after it is written. `register` returns "Confirmation email sent!" The form shows that string through `FormSuccess`.

**R3.** When the send is rejected, `register` leaves no user and no verification token for that email. It returns "Could not send the confirmation email." The form shows that string through `FormError`. The person can submit the register form again.

**R4.** When any user already has the email, verified or unverified, `register` returns "Email already in use". It sends nothing and writes no token. When the email is new and the username is already taken, `register` returns "Username already in use". It sends nothing and writes no token.

**R5.** `login` checks the password before it reads `emailVerified`. A wrong password returns "Invalid credentials" through `FormError`. It sends nothing and writes no token. An unverified password user with the wrong password gets that same error.

**R6.** A right password with `emailVerified` set signs in as it does today. No confirmation message is sent.

**R7.** A right password with `emailVerified` null and an unexpired `VerificationRequest` sends nothing. That row stays, including its expiry. `login` returns "Confirmation email sent!" through `FormSuccess`. The person is not signed in.

**R8.** A right password with `emailVerified` null and no unexpired `VerificationRequest` sends a new message. This includes an expired row, and an unverified password user left with no token. The success string in R2 is returned only after the send is accepted. The person is not signed in. One unexpired token remains, and the previous token is gone.

**R9.** When that send is rejected, the user remains, and no verification token remains for that email. `login` returns "Could not send the confirmation email." The person is not signed in.

**R10.** `sendVerificationEmail` in `lib/mail.ts` is the only sender. `register`, `login`, and the expired-link action call it. The message is from `Scriptural <noreply@scriptural.app>`. The subject is "Confirm your email". The body contains the link `/auth/verify?token=` followed by the token. The sent body puts the request origin in front of that path. Tests and local development record the message and do not call Resend. The local server process prints the link. Production sends that message through Resend. `RESEND_API_KEY` is the production credential.

**R11.** `/auth/verify` is in `publicRoutes` and is not in `authRoutes`. A signed-in person and a signed-out person both reach the page. `proxy.ts` does not redirect this path to `/`.

**R12.** The page reads the `token` query parameter. A GET does not send a message.

**R13.** A GET for a valid unexpired token sets `emailVerified` to the current time and deletes that `VerificationRequest`. The page shows "Email confirmed! You may now log in" and a **Log in** button that opens `/auth/signin`. It does not show "Confirm email". The GET does not sign the person in. An existing session stays signed in.

**R14.** A second open of that token shows "This link is not valid." The page shows neither button.

**R15.** A GET for an expired token shows "This link has expired." and a button labeled "Send a new confirmation email".

**R16.** Submitting that button sends a new message to the email on the expired row. After the send is accepted, the page shows "Confirmation email sent!", the expired token is gone, and one new one-hour token exists. When the send is rejected, the page shows "Could not send the confirmation email.", the expired row remains, and no unexpired token exists. The user remains.

**R17.** A missing token, an unknown token, or a token already deleted shows "This link is not valid." That page shows neither button. Nothing is sent and nothing is written.

**R18.** Google sign-in is unchanged. It sends no confirmation message. Honest doors R3 and R4 stay.

## Out of scope

Password reset stays out of scope. Adding a password to a Google account stays out of scope. Profile, Email, Password, Notifications, and Appearance stay unavailable. The product does not edit the from address. A send limit beyond the one-hour token stays out of scope. Two-factor authentication stays out of scope.

## Decided

Register deletes the new account when the send is rejected, so the form on screen can be submitted again. Any existing email gets "Email already in use" and no message. Sign-in checks the password first. An unexpired token is left alone, and sign-in still shows "Confirmation email sent!" because that message is already in the inbox. A valid link confirms the email when the page opens and does not sign the person in. The page shows "Email confirmed! You may now log in" and a **Log in** button. Expired and unknown links are different content on the same path. The from address is `Scriptural <noreply@scriptural.app>`.

A rejected send never leaves an unexpired token behind. A rejected sign-in send leaves no token, because the person can submit the sign-in form again. A rejected send from the expired link keeps the expired row, because that row is the only copy of the email address.

The **Log in** button is the label in R13. "Send a new confirmation email" is the label in R15.
