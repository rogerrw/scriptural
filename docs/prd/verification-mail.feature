# Acceptance stories for docs/prd/verification-mail.md
# Honest doors is the prerequisite.
# This feature replaces honest doors R1 and R2 after that document lands.
# Password reset, Google password setup, and account settings stay out of scope.

Feature: Verification mail
  A new password account gets a real confirmation message.
  Opening the link confirms the email.
  A wrong password never sends mail.

  Rule: Create an account only when the message is accepted
    As a visitor
    I want a confirmation message when I register
    So that the success text is true

    Scenario: A new account records a confirmation message
      When I submit the register form with "ada@example.com", a name, and a password
      Then I see the success "Confirmation email sent!"
      And I do not see "Email signup is unavailable."
      And I am not signed in
      And a user exists for "ada@example.com"
      And "ada@example.com" has no emailVerified
      And an unexpired verification token exists for "ada@example.com"
      And a confirmation message is recorded for "ada@example.com"
      And that message is from "Scriptural <noreply@scriptural.app>"
      And that message has the subject "Confirm your email"
      And that message links to "/auth/verify?token=" followed by that verification token

    Scenario: A rejected send leaves no account
      Given the confirmation send will be rejected
      When I submit the register form with "ada@example.com", a name, and a password
      Then I see the error "Could not send the confirmation email."
      And I do not see "Confirmation email sent!"
      And no user exists for "ada@example.com"
      And no verification token exists for "ada@example.com"
      And no confirmation message is recorded

  Rule: Keep an existing email from receiving another register message
    As a visitor
    I want register to refuse an email that already has an account
    So that register does not reveal a second path onto that account

    Scenario: An unverified email is already in use
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has an unexpired verification token
      When I submit the register form with "ada@example.com", a name, and a password
      Then I see the error "Email already in use"
      And no confirmation message is recorded
      And the verification token for "ada@example.com" is unchanged

    Scenario: A verified email is already in use
      Given "ada@example.com" is a password user
      And "ada@example.com" has emailVerified set
      When I submit the register form with "ada@example.com", a name, and a password
      Then I see the error "Email already in use"
      And no confirmation message is recorded
      And no verification token exists for "ada@example.com"

  Rule: Check the password before sending
    As a person with a password
    I want a wrong password to change nothing
    So that a guess cannot send mail or replace my link

    Scenario: A wrong password on an unverified account sends nothing
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has no verification token
      When I submit the sign-in form for "ada@example.com" with the wrong password
      Then I see the error "Invalid credentials"
      And I do not see "Confirmation email sent!"
      And I am not signed in
      And no verification token exists for "ada@example.com"
      And no confirmation message is recorded

  Rule: Send from sign-in only when no live link exists
    As a person with an unverified password
    I want sign-in to send a link when I do not already have one
    So that I can confirm without registering again

    Scenario: No token yet, so sign-in sends the message
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has no verification token
      When I submit the sign-in form for "ada@example.com" with the right password
      Then I see the success "Confirmation email sent!"
      And I am not signed in
      And an unexpired verification token exists for "ada@example.com"
      And a confirmation message is recorded for "ada@example.com"
      And that message links to "/auth/verify?token=" followed by that verification token

    Scenario: An expired token is replaced when the send is accepted
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has an expired verification token
      When I submit the sign-in form for "ada@example.com" with the right password
      Then I see the success "Confirmation email sent!"
      And I am not signed in
      And the expired verification token for "ada@example.com" is gone
      And an unexpired verification token exists for "ada@example.com"
      And a confirmation message is recorded for "ada@example.com"

    Scenario: A live token stays, and sign-in does not send again
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has an unexpired verification token
      When I submit the sign-in form for "ada@example.com" with the right password
      Then I see the success "Confirmation email sent!"
      And I am not signed in
      And the verification token for "ada@example.com" is unchanged
      And no confirmation message is recorded

    Scenario: A rejected sign-in send leaves the account and no token
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has no verification token
      And the confirmation send will be rejected
      When I submit the sign-in form for "ada@example.com" with the right password
      Then I see the error "Could not send the confirmation email."
      And I do not see "Confirmation email sent!"
      And I am not signed in
      And a user exists for "ada@example.com"
      And no verification token exists for "ada@example.com"
      And no confirmation message is recorded

    Scenario: A verified password signs in without a message
      Given "ada@example.com" is a password user
      And "ada@example.com" has emailVerified set
      When I submit the sign-in form for "ada@example.com" with the right password
      Then I am signed in
      And no confirmation message is recorded

  Rule: Confirm when the link opens
    As a person who received the confirmation message
    I want the link to confirm my email
    So that I can log in

    Scenario: Opening a valid link confirms and shows log in
      Given "ada@example.com" has an unexpired verification token
      And I am not signed in
      When I open the confirmation link for that token
      Then I see "Email confirmed! You may now log in"
      And I see the button "Log in"
      And I do not see the button "Confirm email"
      And I am not signed in
      And "ada@example.com" has emailVerified set
      And that verification token is gone

    Scenario: A second open finds no token
      Given "ada@example.com" has an unexpired verification token
      When I open the confirmation link for that token
      And I open the confirmation link for that token
      Then I see "This link is not valid."
      And I do not see the button "Log in"
      And "ada@example.com" has emailVerified set

    Scenario: A signed-in person can open the link
      Given I am signed in
      And "ada@example.com" has an unexpired verification token
      When I open the confirmation link for that token
      Then I am on "/auth/verify"
      And I see "Email confirmed! You may now log in"
      And I see the button "Log in"
      And I am still signed in
      And "ada@example.com" has emailVerified set

  Rule: Treat an expired link as a request for a new message
    As a person with an expired link
    I want that page to send a new message
    So that I do not have to remember the email address

    Scenario: Opening an expired link sends nothing
      Given "ada@example.com" has an expired verification token
      When I open the confirmation link for that token
      Then I see "This link has expired."
      And I see the button "Send a new confirmation email"
      And I do not see the button "Confirm email"
      And no confirmation message is recorded
      And that expired verification token exists

    Scenario: The expired button sends a new message
      Given "ada@example.com" has an expired verification token
      When I open the confirmation link for that token
      And I submit "Send a new confirmation email"
      Then I see the success "Confirmation email sent!"
      And that expired verification token is gone
      And an unexpired verification token exists for "ada@example.com"
      And a confirmation message is recorded for "ada@example.com"
      And that message links to "/auth/verify?token=" followed by the unexpired verification token

    Scenario: A rejected send from the expired page keeps the expired token
      Given "ada@example.com" has an expired verification token
      And the confirmation send will be rejected
      When I open the confirmation link for that token
      And I submit "Send a new confirmation email"
      Then I see the error "Could not send the confirmation email."
      And I do not see "Confirmation email sent!"
      And that expired verification token exists
      And no unexpired verification token exists for "ada@example.com"
      And a user exists for "ada@example.com"
      And no confirmation message is recorded

  Rule: Show an unknown link as invalid
    As a person with a bad link
    I want the page to say the link is not valid
    So that I am not offered a button that cannot work

    Scenario: An unknown token shows neither button
      When I open "/auth/verify?token=missing"
      Then I see "This link is not valid."
      And I do not see the button "Confirm email"
      And I do not see the button "Send a new confirmation email"
      And no confirmation message is recorded

  Rule: Leave Google sign-in off this mail path
    As a person with a Google account
    I want Google sign-in to stay as it is
    So that confirming a password email is not part of that path

    Scenario: Google sign-in records no confirmation message
      When I sign in with Google
      Then I am signed in
      And I am on "/"
      And no confirmation message is recorded
