# Acceptance stories for docs/prd/honest-doors.md
# The Review section of Account settings belongs to daily-review.feature.
# Ownership of a verse write belongs to your-verses-only.feature.

Feature: Honest doors
  Email signup does not pretend to send mail.
  Google sign-in lands on the home page.
  Adding a verse updates the set list.

  Rule: Keep email signup from creating an account
    As a visitor
    I want the register form to say email signup is unavailable
    So that the form does not promise a confirmation mail

    Scenario: Submit creates no account
      When I submit the register form with a new email, name, and password
      Then I see the error "Email signup is unavailable."
      And no user exists for that email
      And no verification token exists for that email
      And I do not see "Confirmation email sent!"

  Rule: Refuse an unverified password
    As a person with an unverified password
    I want sign-in to say email signup is unavailable
    So that a new token is not written for mail that is never sent

    Scenario: An unverified password does not sign in
      Given "ada@example.com" is a password user
      And "ada@example.com" has no emailVerified
      And "ada@example.com" has no verification token
      When I submit the sign-in form for "ada@example.com"
      Then I see the error "Email signup is unavailable."
      And I am not signed in
      And "ada@example.com" has no verification token
      And I do not see "Confirmation email sent!"

  Rule: Land Google sign-in on the home page
    As a person with a Google account
    I want Google sign-in to open the home page
    So that I reach the counts I already have

    Scenario: Google sign-in opens the home page
      When I sign in with Google
      Then I am signed in
      And I am on "/"
      And I see "Practiced verses"
      And I see "Completed review sessions"

  Rule: Show a new verse card as soon as the add succeeds
    As a signed-in person
    I want the set page to show a verse I just added
    So that I do not have to reload the page

    Scenario: A successful add closes the dialog and shows the card
      Given I am on verse set "Hope"
      When I add "John 3:16" ESV
      Then the add dialog closes
      And I see a card for "John 3:16" ESV
      And I see no toast

    Scenario: A failed add stays in the dialog
      Given I am on verse set "Hope"
      And the add fails with "Verse set not found"
      When I add "John 3:16" ESV
      Then the add dialog stays open
      And I see "Verse set not found"
      And I see no toast
      And "Hope" has no card for "John 3:16" ESV
