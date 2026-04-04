# Stores Guide

## Purpose
`src/stores` holds shared client state that must survive navigation and be reused across multiple screens.

## Store ownership
- `authStore.ts`
  - Owns authenticated session state (`user`, tokens, `isAuthenticated`) and profile updates/logout.
  - Persisted via local storage (`song-request.auth`).
- `djDashboardStore.ts`
  - Owns DJ workspace selection context (`activePlaylistId`, `selectedQueueId`).
  - Persisted via local storage (`song-request.dj-dashboard`).
- `publicSessionStore.ts`
  - Owns public guest session context (`qrUuid`) and cached public projections (`publicPlaylist`, `publicQueue`).
  - Persists only `qrUuid` (`song-request.public-session`), while playlist/queue payloads remain runtime-refreshable.

## What is shared state
Treat data as shared store state when at least one applies:
- Used by more than one route/page.
- Needed after navigation or page refresh.
- Represents cross-screen business context (auth session, selected playlist/queue context, QR session context).

## What must stay local component state
Keep these in page/component state, not in global stores:
- Input draft fields and temporary form validation UI.
- Modal open/close toggles and ephemeral panel visibility.
- Hover/focus/animation/UI-only flags.
- One-off derived display-only values that can be computed from props/store selectors.

## Boundary rules
- Pages coordinate workflows.
- Stores own shared client state and transitions.
- Services own transport/API interaction.
- Components own presentation and local UI state.
