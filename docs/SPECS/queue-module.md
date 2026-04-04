# Queue Module Spec

## Purpose
Separate operational play order from the song catalog and request inbox.

## Entities
- Queue
- QueueItem

## Visibility modes
- hidden
- current_only
- current_and_next
- top_n
- full

## Core rules
- only one item can be now_playing
- ordering is explicit by `position`
- queue item may come from request or manual add
- guest visibility is a projection, not raw queue access
