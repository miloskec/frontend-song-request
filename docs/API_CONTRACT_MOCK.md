# API Contract Mock

## Purpose
This document defines the frontend-facing REST contract shapes that mocks must follow.

## General rules
- All IDs are UUID strings.
- Public guest calls use QR UUID from query string.
- All responses are JSON-shaped even in mock mode.
- Errors should mimic realistic API behavior.
- Mock mode must support latency simulation.

## Environment switch
- `VITE_USE_MOCK_API=true` -> use MSW/mock handlers
- `VITE_USE_MOCK_API=false` -> use real HTTP base URL

## Auth endpoints
### POST `/auth/register`
- request: name, email, password
- response: user summary + tokens

### POST `/auth/login`
- request: email, password
- response: user summary + tokens

### POST `/auth/logout`
- response: 204

### GET `/me`
- response: authenticated user profile and settings preview

## Playlists
### GET `/playlists`
Paginated list of owned playlists.
Includes per-playlist `song_count` summary in mock prototype.

### GET `/playlists/:playlistId`
Single playlist with summary counts.

### POST `/playlists`
Creates playlist.

### PATCH `/playlists/:playlistId`
Updates playlist.

### DELETE `/playlists/:playlistId`
Deletes playlist.

## Songs
### GET `/songs`
Paginated list with filters.

### GET `/songs/:songId`
Returns song details.

### POST `/songs`
Create song.

### PATCH `/songs/:songId`
Update song.

### DELETE `/songs/:songId`
Delete song.

## Playlist songs
### GET `/playlists/:playlistId/songs`
Returns ordered songs for one selected playlist/list.

### POST `/playlists/:playlistId/songs`
Attach song to playlist.

### PATCH `/playlists/:playlistId/songs/:playlistSongId`
Update position, custom price, override flags.

### DELETE `/playlists/:playlistId/songs/:playlistSongId`
Remove from playlist.

## Requests
### GET `/requests`
Returns incoming guest requests for owned playlists.

### GET `/requests/:requestId`
Returns request details.

### PATCH `/requests/:requestId/status`
Updates request status.

#### Mock transition guard
- Allowed transitions in current mock module:
  - `pending -> approved`
  - `pending -> rejected`
  - idempotent same-status update
- Disallowed transitions throw an error (example: `rejected -> approved`).

## Queue
### GET `/queues`
Returns owned active queues.

### GET `/queues/:queueId`
Returns queue details and settings.

### PATCH `/queues/:queueId`
Updates queue visibility settings.

### GET `/queues/:queueId/items`
Returns ordered queue items.

### POST `/queues/:queueId/items`
Adds item to queue.

### PATCH `/queues/:queueId/items/:itemId`
Updates queue item.

### DELETE `/queues/:queueId/items/:itemId`
Removes queue item.

### POST `/queues/:queueId/reorder`
Accepts item-position map.

### PATCH `/queues/:queueId/current`
Sets current now playing item.

#### Mock queue invariant checks
Queue mutations and reads enforce:
- max one `now_playing` item per queue
- unique queue positions per queue
- `current_queue_item_id` must align with queue items

Recoverable mismatch handling in mock mode:
- stale `current_queue_item_id` is repaired to aligned value (`now_playing` item or `null`).

Unrecoverable mismatch handling in mock mode:
- multiple `now_playing` items
- duplicate positions
- these throw errors as invariant violations.

## Imports
### POST `/imports`
Accepts file metadata in frontend demo mode.

### GET `/imports`
Returns import job list.

## Public endpoints (QR UUID aware)
### GET `/public/playlists/:qrUuid`
Returns public landing payload for guest view.

### GET `/public/playlists/:qrUuid/songs`
Returns searchable song list.

### GET `/public/playlists/:qrUuid/now-playing`
Returns now playing payload.

### GET `/public/playlists/:qrUuid/queue`
Returns visibility-filtered queue projection.

### POST `/public/playlists/:qrUuid/requests`
Creates guest request.

## Mock scenario matrix
Every endpoint should support at least one success scenario and one edge scenario.

### Required scenarios
- authenticated DJ with data
- authenticated DJ with empty state
- public guest flow with active playlist
- public guest flow with hidden queue
- public guest flow with current_and_next queue
- request validation error
- broken cover fallback
- duplicate request scenario
- long queue scenario
- bidding preview scenario
