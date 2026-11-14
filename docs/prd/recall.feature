# Acceptance stories for docs/prd/recall.md
# The review session, the due time, and the grade formula belong to daily-review.feature.

Feature: Recall
  Daily Review shows a passage in learn mode or recall mode.
  Learn mode is a verse with no review. Recall mode is a verse with a review.
  Search, verse sets, and the home page keep the passage visible.

  Background:
    Given I am signed in
    And the passage for "John 3:16" ESV starts with "For"

  Rule: Show a new verse in full
    As a signed-in person
    I want the first attempt to show the passage
    So that I can learn a verse before I recall it

    Scenario: A verse with no review is learn mode
      Given "John 3:16" ESV has no review
      When I start that verse in Daily Review
      Then I see the full passage
      And I do not see Reveal

  Rule: Hide a verse I have already reviewed
    As a signed-in person
    I want a later attempt to start hidden
    So that I have to recall the passage

    Scenario: A reviewed verse starts with no length cue
      Given "John 3:16" ESV has a review
      When I start that verse in Daily Review
      Then I do not see the passage
      And I do not see how many characters the passage has
      And I see Reveal

    Scenario: A second translation stays in learn mode
      Given "John 3:16" ESV has a review
      And "John 3:16" KJV has no review
      When I start "John 3:16" KJV in Daily Review
      Then I see the full passage
      And I do not see Reveal

    Scenario: A typed match shows the typed glyph
      Given "John 3:16" ESV has a review
      And I have started that verse in Daily Review
      When I type "F"
      Then I see "F"

    Scenario: A typed mismatch hides the correct character
      Given "John 3:16" ESV has a review
      And I have started that verse in Daily Review
      When I type "X"
      Then I see "X" in red with a strikethrough
      And I do not see "F"

  Rule: Reveal the passage and keep the attempt
    As a signed-in person
    I want Reveal to show the whole passage
    So that I can finish an attempt I am stuck on

    Scenario: Reveal shows the passage for the rest of the attempt
      Given "John 3:16" ESV has a review
      And I have started that verse in Daily Review
      When I choose Reveal
      Then I see the full passage
      And I cannot hide the passage again
      When I type the next character
      Then the attempt is still in progress

    Scenario: Reveal uses the same grade and still moves the due time
      Given "John 3:16" ESV has a review
      And I reveal the passage
      When I finish the attempt with grade 20
      Then the attempt is stored by recordAttempt
      And the grade equals the grade for the same keystrokes without Reveal
      And the verse is next due at the next midnight in my timezone

    Scenario: The summary shows the full passage
      Given I have finished a verse in recall mode
      When the summary opens
      Then I see the full passage

    Scenario: A learn-mode summary shows the full passage
      Given I have finished a verse in learn mode
      When the summary opens
      Then I see the full passage

  Rule: Leave the other pages visible
    As a signed-in person
    I want search, verse sets, and home to show the passage
    So that recall stays on Daily Review

    Scenario: Search shows the passage
      When I find "John 3:16" ESV on Search
      Then I see the full passage
      And I do not see Reveal

    Scenario: A verse set shows the passage
      Given "Hope" contains "John 3:16" ESV
      And that verse has a review
      When I open "Hope"
      Then the card shows the full passage
      And I do not see Reveal

    Scenario: The home page has no hidden passage
      When I open the home page
      Then I see no verse typer
      And I see no Reveal
