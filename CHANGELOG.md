# Changelog

## Unreleased

### Added
- Initial harness/governance foundation for frontend-only repo.
- PRD/SRS-aligned documentation set for QR-based song request frontend.
- Agent instructions, skills, gates, mock strategy, and PlantUML skeletons.
- Environment strategy for mock/real API switching.
- Initial Vite React app shell with mobile-first layout, route skeleton (`/guest`, `/dj`), and shared UI primitives.
- Public guest shell wired to QR query-param loading flow with mock service abstraction and loading/empty/error/success states.
- DJ dashboard shell wired to mock summary service and lightweight Zustand state for selected playlist/queue context.
- Added focused tests for guest page rendering states, dashboard shell rendering, and public session store behavior.
- Added baseline ESLint flat config (`eslint.config.js`) so repository lint gate can run under ESLint v9.
- Fixed mock DB typing and Vite env typing to satisfy strict TypeScript gates without expanding feature scope.
- Extended guest flow shell with playlist header, song search/list rendering, request modal/form shell, mock submission, and success/error feedback.
- Added focused guest-page tests for song rendering, search filtering, modal open/close, submit success, and submit validation error path.
- Added DJ requests-management layer with requests route/page shell, request detail cards, accept/reject actions, and action feedback states.
- Added mock DJ request action flow where accepted requests are pushed into active queue items, plus focused tests for render/empty/actions/errors.
- Added DJ queue-management page shell with queue item rendering, mark-now-playing/mark-played/remove actions, and clear status feedback.
- Added queue mock action handlers and DJ queue service wiring to keep accepted request insertions visible in active queue flow.
- Updated public guest page to show read-only "Up Next" song titles from current queue state and added focused now-playing/up-next coverage.
- Added DJ queue visibility settings controls (hidden/current_only/current_and_next/top_n/full) with persisted mock/real service updates.
- Added `top_n` visible-count settings support and connected public queue/now-playing rendering to selected visibility projection mode.
- Added `docs/USAGE_GUIDE.md` with role-based prototype usage instructions for Guest, DJ/Admin, and Super Admin status (planned/not yet implemented).
- Added simple DJ queue reorder shell controls (`Move Up` / `Move Down`) persisted through the existing mock/real service boundary.
- Added focused reorder coverage (up/down actions, boundary disabled states, public reordered projection) and updated usage guide with queue reorder instructions.
- Added a new modern styled DJ showcase page (`/dj/showcase`) with dedicated CSS and HTML/JSX structure inspired by the provided screenshot.
- Updated the guest public page visual layer with a modern dark mobile-first style (`guest-modern.css`) while keeping existing guest functionality and flows unchanged.
- Added a cohesive dark/violet neon-accented visual system (tokens, shared UI classes, polished guest + DJ/Admin layouts, media-rich list rows, chips, and button variants).
- Added mock login flow with `/login`, persisted auth Zustand store, and DJ route protection redirecting unauthenticated users to login.
- Added localStorage-backed persistence for mutable mock data (requests, queue items/order/status, visibility settings, playlists/settings projections) and queue selection UI state.
- Expanded mock datasets (songs/requests/queue items) beyond 10 entries to make long-list rendering and scrolling meaningful in the current prototype.
- Added focused tests for login flow, app shell DJ header/sidebar rendering, mock persistence behavior, and extended guest song-list rendering.
- Refined mock-mode navigation shortcuts and compacted list/action UI density; updated queue card control layout (icon controls in header), guest modal top offset, and guest now-playing/up-next section styling.
- Refined queue control alignment and icon visuals (up/down then spacer then right-aligned red `X`, plastic-style play/remove buttons), and updated guest list interaction with persistent `Requested` disabled state plus green border highlight on item click.
- Updated visible app branding in the frontend UI to `PlayMe`.
- Updated bottom navigation active-state logic so `DJ Login` is highlighted while in DJ/Admin routes.
- Refined DJ navigation flow: default DJ route now opens Queue view, Requests remains adjacent in primary nav, and Dashboard/Settings/Lists are exposed through the hamburger menu.
- Added new DJ `Settings` shell page and `Lists` page with mock CRUD (create/edit/delete songs) plus mock file import action wired through the service boundary.
- Extended `Lists` manual song create/edit flows with cover-image support (URL input plus optional mock image upload for preview/data URL storage).
- Added auth/profile improvements: DJ route guard redirect with `next`, mock login now accepts any non-empty username/password, new `/register` validation flow with redirect to login, and persisted profile edit + logout actions in DJ header profile menu.
- Updated queue `play` behavior in mock flow so selected song becomes `now_playing` and is moved to the top of the admin queue order.
- Expanded DJ `Lists` flow into multi-list management: table overview, create/edit/delete list metadata, list-scoped song CRUD/import, and persisted playlist-song mappings for mock mode.
- Refined `Lists` page layout into separate cards in manage mode: `Lists workspace`, `Add song to ...`, `Import songs`, and final songs list card.
- Added `Generate QR Code` action in DJ `Settings` shell with mock UUID output feedback.
- Added `Copy` action for generated QR UUID in DJ `Settings`, including success/error clipboard feedback.
- Added repository `.gitignore` entries for `node_modules/` and `.env`.
- Extended `.gitignore` to exclude build/temp artifacts (`dist/`, `log.txt`) from commits.
- Expanded `README.md` with a grouped repository-contents section describing app, mocks, tests, governance, and tooling.

### Notes
- First frontend skeleton is now present; feature CRUD flows remain intentionally minimal in this iteration.
- Backend remains Laravel REST API target only.
