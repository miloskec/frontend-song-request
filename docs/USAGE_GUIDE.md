# Usage Guide (Current Frontend Prototype)

## Scope and status
This guide describes the **current frontend demo/prototype** behavior only.

Status labels used in this document:
- **Implemented**: available now in the current frontend routes/pages.
- **Scaffolded**: shell-level support exists, but deeper feature flow is intentionally minimal.
- **Planned**: not currently available in the frontend prototype.

## Local demo entry points
- Guest flow: `/guest?qr=<playlist-qr-uuid>`
- DJ login: `/login`
- DJ register: `/register`
- DJ default (queue): `/dj`
- DJ dashboard: `/dj/dashboard`
- DJ requests: `/dj/requests`
- DJ queue: `/dj/queue`
- DJ settings: `/dj/settings`
- DJ lists: `/dj/lists`

Example guest URL:
- `/guest?qr=44444444-4444-4444-8444-444444444444`

Notes:
- Guest flow depends on the QR UUID query param key defined by `VITE_QR_QUERY_PARAM` (default: `qr`).
- Data mode is environment-driven:
  - `VITE_USE_MOCK_API=true` for mock mode
  - `VITE_USE_MOCK_API=false` for real API boundary calls

## Guest
### Purpose
Allow a public guest to browse songs from a QR-linked playlist, view now playing/up next projection, and submit song requests.

### Available screens/pages
- **Implemented**: `/guest` public page (QR-based entry).
- **Implemented**: request modal/sheet shell inside the guest page.

### Current supported actions
- **Implemented**: load playlist context by QR UUID query param.
- **Implemented**: view playlist header.
- **Implemented**: search songs by title/artist.
- **Implemented**: open request form and submit request (mock/real service boundary).
- **Implemented**: view request submit success/error feedback.
- **Implemented**: read-only now playing/up next projection based on current queue visibility mode:
  - `hidden`: queue section hidden to guests
  - `current_only`: now playing only
  - `current_and_next`: now playing + next visible item
  - `top_n`: now playing + first N upcoming visible items
  - `full`: now playing + all visible upcoming items

### Current limitations
- **Implemented constraint**: guest is read-only except request submission.
- **Scaffolded**: queue display is projection-focused, not full queue management.
- **Planned**: richer guest-side request features (advanced validations/scenario UX) beyond current prototype level.

## DJ/Admin
### Purpose
Allow a DJ/Admin to review request intake, route approved requests into queue, manage queue item status, and control guest queue visibility projection.

### Available screens/pages
- **Implemented**: `/login` mock login screen.
- **Implemented**: `/register` mock register screen (validation-first flow).
- **Implemented**: `/dj` default route (redirects to queue view).
- **Implemented**: `/dj/dashboard` dashboard overview shell.
- **Implemented**: `/dj/requests` requests management page.
- **Implemented**: `/dj/queue` queue management + visibility settings page.
- **Implemented**: `/dj/settings` settings shell page.
- **Implemented**: `/dj/lists` lists management page.

### Current supported actions
- **Implemented** (`/login`):
  - Enter non-empty username/email + password and click `Login` in mock mode.
  - In mock mode, any non-empty username/password is accepted.
  - Session is persisted in local storage and reused across refresh.
- **Implemented** (`/register`):
  - Validate required fields/password rules in frontend.
  - In mock mode, submit redirects back to login after successful validation.
- **Implemented** (profile menu in DJ header):
  - Edit profile name/email.
  - Save profile updates to persisted auth state.
  - Logout from DJ/Admin session.
- **Implemented** (DJ navigation):
  - Primary DJ nav defaults to `Queue` and `Requests`.
  - `Dashboard`, `Settings`, and `Lists` are available from the hamburger menu.
- **Implemented** (`/dj/dashboard`):
  - Load overview counts and selected active context.
- **Implemented** (`/dj/settings`):
  - Use `Generate QR Code` button to create a mock QR UUID in the settings shell.
- **Implemented** (`/dj/requests`):
  - List requests with loading/empty/error/success states.
  - Accept request -> updates request status and inserts into active queue (mock/real boundary).
  - Reject request -> updates request status.
  - Action feedback banners for success/error.
- **Implemented** (`/dj/queue`):
  - List active queue items (including items inserted from accepted requests).
  - Reorder queue with simple controls (`Move Up` / `Move Down`) without drag-and-drop.
  - Mark item as now playing (single play/check control pattern in current UI).
  - Remove item from queue.
  - Configure queue visibility mode:
    - `hidden`
    - `current_only`
    - `current_and_next`
    - `top_n` (+ visible count input)
    - `full`
  - Persist visibility settings through service boundary and reflect in guest projection.
- **Implemented** (`/dj/lists`):
  - See all lists in a table (name, details, total songs).
  - Create a new list (name + details).
  - Select one list and open selected-list editor tab.
  - Edit selected list name/details.
  - Delete a list.
  - Add songs to selected list (with optional cover URL/upload in mock UI).
  - Edit existing song title/artist/cover data.
  - Remove songs from selected list.
  - Import songs into selected list via mock file import action (`CSV/TXT/JSON` file picker shell).

- **Implemented** (mock data mutability persistence):
  - Request status changes, newly created requests, queue actions (accept->queue, reorder, now playing, played, remove), and visibility settings are persisted in local storage until storage is cleared.

### Current limitations
- **Scaffolded**: dashboard and management pages are intentionally shell-oriented and focused on core flow.
- **Planned**: drag-and-drop queue reorder UX is not available yet.
- **Planned**: lock/unlock queue item controls are not available yet.
- **Planned**: dedicated visibility settings page is not separate; currently embedded in `/dj/queue`.
- **Implemented constraint**: login is mock-only and does not call a production auth backend.

## Super Admin
### Purpose
Platform-level administration across DJs/tenants/settings.

### Available screens/pages
- **Planned**: no Super Admin route/page is currently implemented in the frontend prototype.

### Current supported actions
- **Planned**: none in current prototype.

### Current limitations
- **Not yet implemented**: Super Admin UI/flows are outside the currently delivered frontend scope.

## Quick role-based walkthrough
### Guest quick start
1. Open `/guest?qr=<uuid>`.
2. Browse/search songs.
3. Click `Request Song`.
4. Submit optional name/message.
5. Confirm feedback banner after submit.

### DJ/Admin quick start
1. Open `/login` and click `Login` with non-empty fields.
2. (Optional) open `/register` to test mock register validation and redirect.
3. Open `/dj/requests`, accept/reject requests.
4. Open `/dj/queue` and use `Move Up` / `Move Down` for simple reorder.
5. Manage queue statuses and remove items.
6. Update visibility mode (and top_n count when relevant) and save.
7. Verify guest projection by opening `/guest?qr=<uuid>`.
