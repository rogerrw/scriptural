# Acceptance stories for docs/prd/your-verses-only.md
# The first attempt may still store the verse text sent by the browser.

Feature: Your verses only
  A verse write and a verse read belong to the signed-in person.
  A client-supplied user id is ignored.
  Another person's set looks the same as a missing set.

  Background:
    Given I am signed in as "Ada"
    And another person is "Ben"

  Rule: Save and create for the signed-in person
    As a signed-in person
    I want a save and a new set to use my session
    So that a posted user id cannot write into someone else's account

    Scenario: Save ignores a posted user id
      When I save "John 3:16" ESV with user id "Ben"
      Then the saved verse belongs to "Ada"
      And the saved verse does not belong to "Ben"

    Scenario: Save without a session is unauthorized
      Given I am not signed in
      When I save "John 3:16" ESV
      Then the result is "Unauthorized"
      And no verse is saved

    Scenario: Create set ignores a posted user id
      When I create a verse set named "Hope" with user id "Ben"
      Then "Hope" belongs to "Ada"
      And "Hope" does not belong to "Ben"

    Scenario: Create set without a session is unauthorized
      Given I am not signed in
      When I create a verse set named "Hope"
      Then the result is "Unauthorized"
      And no verse set is created

    Scenario: The first finished attempt stores the browser text
      Given I have no saved "John 3:16" ESV
      When I finish an attempt for "John 3:16" ESV with verse text "For God so loved the world"
      Then the saved verse text is "For God so loved the world"

  Rule: List and open only my sets
    As a signed-in person
    I want set lists and set pages to stay inside my account
    So that another person's verses stay hidden

    Scenario: The set list ignores a posted user id
      Given "Ada" has a verse set "Hope"
      And "Ben" has a verse set "Faith"
      When I list verse sets with user id "Ben"
      Then the list contains "Hope"
      And the list does not contain "Faith"

    Scenario: A set list without a session is empty
      Given I am not signed in
      When I list verse sets
      Then the list is empty

    Scenario: A missing set and another person's set use the same error
      Given no verse set has id "missing"
      And "Faith" belongs to "Ben"
      When I open verse set "missing"
      Then I see "Verse set not found"
      When I open verse set "Faith"
      Then I see "Verse set not found"
      And I do not see the verses in "Faith"
      And I do not see "Forbidden"

  Rule: Add a verse only to my set
    As a signed-in person
    I want an add to stop at someone else's set
    So that a posted set id cannot change their list

    Scenario: An add to someone else's set does not insert
      Given "Faith" belongs to "Ben"
      When I add "John 3:16" ESV to "Faith"
      Then the result is "Verse set not found"
      And "Faith" does not contain "John 3:16" ESV

    Scenario: A second add does not create a second membership
      Given "Hope" belongs to "Ada"
      And "Hope" contains "John 3:16" ESV
      When I add "John 3:16" ESV to "Hope"
      Then the result is "Already in this set"
      And "Hope" contains "John 3:16" ESV once

  Rule: Remove a verse only from my set
    As a signed-in person
    I want remove to stay limited to my sets
    So that the existing delete rule keeps working

    Scenario: Remove drops my verse from the set page
      Given "Hope" belongs to "Ada"
      And "Hope" contains "John 3:16" ESV
      When I remove "John 3:16" ESV from "Hope"
      Then "Hope" does not contain "John 3:16" ESV
      And the "Hope" page does not show that card

    Scenario: Remove does not change someone else's set
      Given "Faith" belongs to "Ben"
      And "Faith" contains "John 3:16" ESV
      When I remove "John 3:16" ESV from "Faith"
      Then "Faith" contains "John 3:16" ESV

  Rule: Require a session for verse lookup
    As a signed-in person
    I want verse lookup to require a session
    So that a signed-out caller cannot read the Bible text from the action

    Scenario: Lookup without a session is unauthorized
      Given I am not signed in
      When I fetch "John 3:16" ESV through the verse action
      Then the result is "Unauthorized"
      When I request "GET /api/fetch_verse" for "John 3:16" ESV
      Then the response is "Unauthorized"
