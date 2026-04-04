# State Model

## Principles
- Keep global state small.
- Prefer local component state when scope is local.
- Use a lightweight global store only for auth, UI preferences, and shared public session context.
- Keep async service logic in service modules, not UI components.

## Suggested state approach
Use Zustand for lightweight app-level stores.
Do not start with Redux.

## Stores
### Auth store
- user
- tokens
- isAuthenticated
- authStatus
- persisted in localStorage for mock login continuity

### Public session store
- qrUuid
- publicPlaylist
- nowPlaying
- visibleQueue
- requestFormState
- publicSettings
- persisted in localStorage for QR session continuity in demo mode

### DJ dashboard store
- activePlaylistId
- selectedQueueId
- filters
- UI flags only
- selected context persisted in localStorage

## Service-managed states
Feature pages can manage:
- loading
- error
- empty
- data
through simple hooks/services until complexity proves otherwise.

## Lists management state (current prototype)
- Lists page keeps selected playlist/list context in local page state.
- Playlist CRUD and playlist-song mappings are mock-persisted in localStorage.
- Song editing remains song-level, while remove actions in Lists are list-scoped (detach from selected list).

## Required UI state coverage
Every major page must define:
- loading state
- empty state
- success state
- error state

## Queue-specific derived rules
- only one now_playing item at a time
- queue ordering must be stable
- public projection depends on `visibility_mode`
- `top_n` depends on `visible_count`
- hidden queue returns empty item list to guests

## Mock mode behavior
All stores and pages must work identically regardless of whether data originates from MSW mocks or a real backend.

## Local persistence in current prototype
- Mutable mock-backed queue/request/settings data is persisted in localStorage.
- Queue visibility and queue mutations survive refresh until storage is cleared.
- Mock auth session survives refresh until explicit logout/storage clear.
