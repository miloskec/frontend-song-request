# Observability

## Purpose
Define how this frontend detects runtime issues, emits useful signals, and supports diagnosis without breaking existing architecture boundaries.

## Scope and ownership
- `src/utils/diagnostics.ts` owns structured diagnostic emission.
- `src/services/*` owns transport/contract checks and service-level signals.
- `mocks/api/*` owns mock-domain invariant checks and constrained mock-side repair.
- `src/pages/*` owns UI-flow precondition signals (not backend/business logic ownership).

## Runtime issue categories in this repo
1. Contract shape mismatch
- Source: service responses that do not match expected frontend contract shape.
- Current guard points:
  - `src/services/publicService.ts`
  - `src/utils/contractGuards.ts`

2. Invalid status transition
- Source: request status updates that violate allowed transitions in mock mode.
- Current guard points:
  - `mocks/api/requests.ts`

3. Queue invariant violation
- Source: impossible queue state combinations.
- Invariants:
  - only one `now_playing` queue item
  - unique `position` values per queue
  - `current_queue_item_id` aligns with queue items and now playing state
- Current guard/repair points:
  - `mocks/api/queue.ts`
  - `src/services/djQueueService.ts` (signal-only detection)

4. Public projection mismatch
- Source: mismatch between queue visibility settings and rendered/public projection payloads.
- Current signal points:
  - `src/pages/guest/PublicPage.tsx`

5. Stale local context assumptions
- Source: persisted selected queue ID no longer matching active queue reality.
- Current signal/repair points:
  - `src/pages/dj/QueuePage.tsx`

## Structured signal format
All diagnostics are emitted through `emitDiagnostic(level, payload)` in `src/utils/diagnostics.ts`.

Payload fields:
- `event`
- `flow`
- `entityId` optional
- `expected` optional
- `actual` optional
- `status` optional
- `metadata` optional

Envelope fields added automatically:
- `level`
- `timestamp`

## Environment gating
- Diagnostics are enabled only when `VITE_ENABLE_DIAGNOSTICS=true`.
- Default is off.
- This keeps normal UI output clean and avoids random, scattered console statements.

## Signal-to-diagnosis mapping
1. `public_playlist_load_failed` / `public_queue_load_failed`
- Probable layer: `services` or `mocks/api/public`.
- Inspect first: `src/services/publicService.ts`, `src/utils/contractGuards.ts`.
- Invariant: public payload shape must satisfy API contract.

2. `public.visibility_mode_mismatch` / `public.queue_projection_mismatch`
- Probable layer: queue projection (`mocks/api/public.ts`, `src/utils/visibility.ts`) or stale page assumptions.
- Inspect first: `mocks/api/public.ts`, `src/utils/visibility.ts`, `src/pages/guest/PublicPage.tsx`.
- Invariant: visibility mode and projected queue should align.

3. `queue.multiple_now_playing` / `queue.current_pointer_missing` / `queue.duplicate_positions`
- Probable layer: queue mutation logic in mocks or service mapping.
- Inspect first: `mocks/api/queue.ts`, `src/services/djQueueService.ts`.
- Invariant: queue state model rules from `docs/STATE_MODEL.md` and `docs/SPECS/queue-module.md`.

4. `dj.stale_selected_queue_id`
- Probable layer: store/page context sync.
- Inspect first: `src/stores/djDashboardStore.ts`, `src/pages/dj/QueuePage.tsx`.
- Invariant: selected queue context should resolve to active queue.

## Diagnosis checklist
1. Capture the diagnostic event code, flow, and expected vs actual values.
2. Map event to owning layer using the mapping above.
3. Confirm invariant in `docs/STATE_MODEL.md` and module specs.
4. Reproduce through the smallest route/service path.
5. Form repair in owning layer only (service/store/mock, not arbitrary component patching).
6. Validate with targeted tests first, then `npm run gate:all`.
