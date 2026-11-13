# Acceptance stories for docs/prd/daily-review.md
# Hiding the passage, sign-in landing, and verse ownership belong to other documents.

Feature: Daily review
  A signed-in person practices saved verses in a sitting.
  One sitting is one ReviewSession.
  A first attempt shows the passage. A later attempt is specified in recall.feature.

  Background:
    Given I am signed in
    And my review limit is 10
    And my timezone is "America/Los_Angeles"
    And the current time is "2026-11-16T15:00:00-08:00"

  Rule: Open the verses that are due
    As a signed-in person
    I want Daily Review to open my due verses
    So that the sitting is the verses that need practice

    Scenario: A new saved verse is due
      Given I have saved "John 3:16" ESV with no due time
      When I open Daily Review
      Then the sitting includes "John 3:16" ESV

    Scenario: A verse due in the future is left out
      Given I have saved "John 3:16" ESV due at "2026-11-17T00:00:00-08:00"
      When I open Daily Review
      Then the sitting does not include "John 3:16" ESV

    Scenario: Another person's verse is left out
      Given another person has a due verse "John 3:16" ESV
      When I open Daily Review
      Then the sitting does not include that verse

    Scenario: Unseen verses come before reviewed verses
      Given I have these due verses:
        | reference   | translation | reviews | mastery | due                          |
        | John 1:1    | ESV         | 0       |         |                              |
        | John 1:2    | ESV         | 1       | 40      | 2026-11-15T00:00:00-08:00    |
      When I open Daily Review
      Then the sitting order is:
        | reference |
        | John 1:1  |
        | John 1:2  |

    Scenario: Lower mastery comes before higher mastery
      Given I have these due verses:
        | reference | translation | reviews | mastery | due                       |
        | John 1:1  | ESV         | 1       | 90      | 2026-11-15T00:00:00-08:00 |
        | John 1:2  | ESV         | 1       | 40      | 2026-11-15T00:00:00-08:00 |
      When I open Daily Review
      Then the sitting order is:
        | reference |
        | John 1:2  |
        | John 1:1  |

    Scenario: The same mastery is ordered by the earliest due time
      Given I have these due verses:
        | reference | translation | reviews | mastery | due                       |
        | John 1:1  | ESV         | 1       | 40      | 2026-11-15T00:00:00-08:00 |
        | John 1:2  | ESV         | 1       | 40      | 2026-11-14T00:00:00-08:00 |
      When I open Daily Review
      Then the sitting order is:
        | reference |
        | John 1:2  |
        | John 1:1  |

    Scenario: A missing due time comes before a timestamp at the same mastery
      Given I have these due verses:
        | reference | translation | reviews | mastery | due                       |
        | John 1:1  | ESV         | 1       | 40      | 2026-11-15T00:00:00-08:00 |
        | John 1:2  | ESV         | 1       | 40      |                           |
      When I open Daily Review
      Then the sitting order is:
        | reference |
        | John 1:2  |
        | John 1:1  |

    Scenario: A verse in two sets appears once
      Given "John 3:16" ESV is due and belongs to "Hope" and "Faith"
      When I open Daily Review
      Then the sitting includes "John 3:16" ESV once

    Scenario: Two translations of one reference are two verses
      Given "John 3:16" ESV is due
      And "John 3:16" KJV is due
      When I open Daily Review
      Then the sitting includes "John 3:16" ESV
      And the sitting includes "John 3:16" KJV

    Scenario: The sitting stops at my review limit
      Given my review limit is 2
      And I have 3 due verses in due order "John 1:1", "John 1:2", "John 1:3"
      When I open Daily Review
      Then the sitting order is:
        | reference |
        | John 1:1  |
        | John 1:2  |

    Scenario: A first attempt shows the passage
      Given "John 3:16" ESV has no prior review
      And "John 3:16" ESV is the first verse in the sitting
      When the attempt starts
      Then I see the full passage for the whole attempt

    Scenario: Daily Review does not ask for a reference
      When I open Daily Review
      Then I see no book field
      And I see no chapter field
      And I see no verse field

  Rule: Open a set's due verses
    As a signed-in person
    I want a set's Review button to open that set
    So that I can practice one list

    Scenario: Review on a set includes only that set's due verses
      Given "Hope" contains due verse "John 3:16" ESV
      And "Hope" contains "Romans 8:28" ESV due at "2026-11-17T00:00:00-08:00"
      And "Faith" contains due verse "Psalm 23:1" ESV
      When I choose Review on "Hope"
      Then the sitting includes "John 3:16" ESV
      And the sitting does not include "Romans 8:28" ESV
      And the sitting does not include "Psalm 23:1" ESV

    Scenario: A set sitting stops at my review limit
      Given my review limit is 1
      And "Hope" contains due verses in due order "John 1:1", "John 1:2"
      When I choose Review on "Hope"
      Then the sitting order is:
        | reference |
        | John 1:1  |

  Rule: Continue down a set from a verse card
    As a signed-in person
    I want the keyboard control on a verse card to continue down that set
    So that I can start at the verse I chose

    Scenario: The sitting starts at the chosen verse and takes the later ones
      Given "Hope" lists "John 1:1", "John 1:2", "John 1:3", "John 1:4" in that order
      And "John 1:3" is not due
      When I choose the keyboard control on "John 1:2" in "Hope"
      Then the sitting order is:
        | reference |
        | John 1:2  |
        | John 1:3  |
        | John 1:4  |

    Scenario: A card sitting stops at my review limit
      Given my review limit is 2
      And "Hope" lists "John 1:1", "John 1:2", "John 1:3", "John 1:4" in that order
      When I choose the keyboard control on "John 1:2" in "Hope"
      Then the sitting order is:
        | reference |
        | John 1:2  |
        | John 1:3  |

  Rule: Finish a verse and move through the sitting
    As a signed-in person
    I want the next verse after I finish one
    So that one sitting walks the list I opened

    Scenario: The summary shows the result of the attempt
      Given "John 3:16" ESV is the current verse
      When I finish the attempt
      Then I see the grade
      And I see the error count
      And I see the speed in characters per minute
      And I see the words per minute
      And I see the characters per minute for this translation
      And I see the mastery
      And I see the account-wide overall speed

    Scenario: Next loads the following verse
      Given the sitting order is "John 1:1", then "John 1:2"
      And I have finished "John 1:1"
      When I choose Next
      Then the current verse is "John 1:2"

    Scenario: Next on the last verse ends the sitting
      Given "John 1:1" is the last verse in the sitting
      And I have finished "John 1:1"
      When I choose Next
      Then I see the end screen
      And the ReviewSession has an end time

    Scenario: A finished verse does not return in this sitting
      Given the sitting order is "John 1:1", then "John 1:2"
      When I finish "John 1:1" with grade 0
      Then the remaining sitting is "John 1:2"
      And "John 1:1" is already due again

  Rule: Set the next due time from the grade just stored
    As a signed-in person
    I want the grade I just earned to set the next due time
    So that a stronger pass waits longer

    Scenario Outline: The stored grade picks the delay
      Given my timezone is "America/Los_Angeles"
      And the current time is "2026-11-16T15:00:00-08:00"
      When I finish a due verse with grade <grade>
      Then that verse is next due at "<due>"

      Examples:
        | grade | due                       |
        | 0     | 2026-11-16T15:00:00-08:00 |
        | 19    | 2026-11-16T15:00:00-08:00 |
        | 20    | 2026-11-17T00:00:00-08:00 |
        | 39    | 2026-11-17T00:00:00-08:00 |
        | 40    | 2026-11-18T00:00:00-08:00 |
        | 59    | 2026-11-18T00:00:00-08:00 |
        | 60    | 2026-11-20T00:00:00-08:00 |
        | 79    | 2026-11-20T00:00:00-08:00 |
        | 80    | 2026-11-23T00:00:00-08:00 |
        | 99    | 2026-11-23T00:00:00-08:00 |
        | 100   | 2026-11-30T00:00:00-08:00 |

  Rule: Keep one review session for the sitting
    As a signed-in person
    I want the sitting to stay one review session
    So that a reload brings me back to the same visit

    Scenario: Finished attempts belong to the open session
      Given I have no open ReviewSession
      When I finish two verses in one sitting
      Then both attempts belong to the same new ReviewSession

    Scenario: Reload continues the open session
      Given I have finished "John 1:1" in an open ReviewSession
      And "John 1:2" is still remaining
      When I open Daily Review again
      Then I am in that same ReviewSession
      And the current verse is "John 1:2"

    Scenario: A finished sitting is not resumed
      Given my latest ReviewSession has an end time
      When I open Daily Review
      Then I am in a new ReviewSession

  Rule: Show what the sitting covered
    As a signed-in person
    I want a summary when the sitting ends
    So that I can see how the visit went

    Scenario: The end screen summarizes the sitting
      Given I finished "John 1:1" with grade 80, difficulty 4, and 30 words per minute
      And I finished "John 1:2" with grade 100, difficulty 5, and 50 words per minute
      And the sitting speed is 40 words per minute
      And the account-wide overall speed is 70 words per minute
      When I reach the end screen
      Then I see 2 verses finished
      And I see an average grade of 90
      And I see 40 words per minute for the sitting
      And I do not see 70 words per minute as the sitting speed
      When I expand the verse list
      Then I see "John 1:1" with grade 80, difficulty 4, and 30 words per minute
      And I see "John 1:2" with grade 100, difficulty 5, and 50 words per minute

  Rule: Count finished sittings and practiced verses at home
    As a signed-in person
    I want the home counts to follow finished practice
    So that an open sitting does not look complete

    Scenario: An open sitting does not increase the completed count
      Given I have finished one verse in an open ReviewSession
      When I open the home page
      Then "Completed review sessions" is unchanged

    Scenario: The end screen increases the completed count
      Given "Completed review sessions" is 3
      When I reach the end screen
      Then "Completed review sessions" is 4

    Scenario: The first review of a verse increases the practiced count
      Given "Practiced verses" is 2
      And "John 3:16" ESV has no reviews
      When I finish "John 3:16" ESV
      Then "Practiced verses" is 3

    Scenario: Another review of the same verse does not increase the practiced count
      Given "John 3:16" ESV already has a review
      And "Practiced verses" is 3
      When I finish "John 3:16" ESV
      Then "Practiced verses" is 3

  Rule: Tell me when there is nothing to practice
    As a signed-in person
    I want a clear empty sitting
    So that I know whether to add a verse or wait

    Scenario: No saved verses
      Given I have no saved verses
      When I open Daily Review
      Then I see "You have no saved verses."
      And I see a link to "Search for a verse"

    Scenario: Every verse is due later
      Given "John 3:16" ESV is due at "2026-11-17T00:00:00-08:00"
      And that is my soonest due time
      When I open Daily Review
      Then I see "Nothing is due."
      And I see the soonest due time in "America/Los_Angeles"

  Rule: Choose how many verses and which midnight
    As a signed-in person
    I want the sitting length and the timezone on Account settings
    So that Daily Review follows my own limit and my own day

    Scenario: A new account reviews 10 verses
      Given I have just signed in
      Then my review limit is 10

    Scenario: The Review section edits the sitting length
      Given I open Account settings
      When I set the review limit to 5 in Review
      Then my review limit is 5

    Scenario: The other account sections stay unavailable
      When I open Account settings
      Then Profile says "This setting is not available yet."
      And Email says "This setting is not available yet."
      And Password says "This setting is not available yet."
      And Notifications says "This setting is not available yet."
      And Appearance says "This setting is not available yet."

    Scenario: The first sign-in stores the browser timezone
      Given I am signing in for the first time
      And the browser timezone is "America/Chicago"
      When the sign-in completes
      Then my timezone is "America/Chicago"

    Scenario: The Review section can change the timezone
      Given I open Account settings
      When I set the timezone to "America/New_York" in Review
      Then my timezone is "America/New_York"
      And a 1-day delay is due at the next midnight in "America/New_York"
