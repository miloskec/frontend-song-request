# Failure Repair Loop

## Goal
Standardize this repository's Chapter-11 style loop:

`real-world issue -> detection -> logs/signals -> diagnosis -> constrained repair -> harness verification -> verified state`

## 1) Real-world issue
Typical issues in this app:
- guest cannot submit request
- queue item/state appears inconsistent
- request status transition behaves unexpectedly
- persisted DJ queue selection becomes stale
- service payload shape drifts from expected contract

## 2) Detection
Detection must happen in owning layers:
- `services`: contract and transport checks (`src/services/*`)
- `mocks/api`: domain-state invariants (`mocks/api/*`)
- `pages`: flow precondition checks only (`src/pages/*`)

## 3) Logs/signals
Emit diagnostics only through:
- `src/utils/diagnostics.ts`

Required signal quality:
- what happened (`event`)
- where (`flow`)
- which entity (`entityId`/`metadata`)
- what was expected vs actual
- current status or outcome

## 4) Diagnosis
Use `docs/OBSERVABILITY.md` mapping:
- signal -> probable layer -> first module to inspect -> related invariant

Do not start by patching UI symptoms.

## 5) Constrained repair
Repair rules:
- respect architecture ownership from `docs/ARCHITECTURE/overview.md`
- keep business invariants in `stores/services/mocks`, not presentational components
- keep service layer UI-agnostic
- do not bypass typed contract boundaries
- prefer smallest fix that restores invariant and leaves flow readable

Existing constrained repair examples:
- `mocks/api/queue.ts` repairs stale `current_queue_item_id` when recoverable
- `src/pages/dj/QueuePage.tsx` re-aligns stale `selectedQueueId` to resolved active queue

## 6) Harness verification
Run verification in this order:
1. targeted tests for repaired path
2. full gates: `npm run gate:all`

Harness checks:
- tests (`gate:tests`)
- type integrity (`gate:types`)
- lint (`gate:lint`)
- buildability (`gate:build`)
- law/spec touchpoint discipline (`gate:spec-sync`)

## 7) Verified state
A repair is considered verified only when all are true:
1. user-facing symptom is gone
2. diagnostic signal either disappears or moves to expected healthy signal
3. relevant invariants hold (queue/request/public projection/state ownership)
4. targeted tests pass
5. full gates pass
6. docs/changelog remain aligned with implemented behavior

If symptom disappears but invariants are weakened, state is **not verified**.
