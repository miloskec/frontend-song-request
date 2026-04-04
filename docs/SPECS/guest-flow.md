# Guest Flow Spec

## Entry
Guest opens the public page via URL containing QR UUID query parameter.

## Required states
- loading public playlist
- playlist found
- playlist unavailable
- request success
- request validation error

## Required capabilities
- browse songs
- search songs
- view cover/title/artist
- view now playing
- view queue according to visibility rules
- submit request with optional guest name and message

## Constraints
- guest has read-only access except request submission
- queue visibility strictly follows public settings
