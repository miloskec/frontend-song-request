# Requests Module Spec

## Purpose
Capture guest song intentions before they enter the execution queue.

## Request data
- song_id
- guest_name optional
- guest_message optional
- offered_amount optional
- status

## Important rules
- validation errors must be surfaced clearly
- duplicate request handling is scenario-based for demo phase
- DJ must review and move requests into queue explicitly
