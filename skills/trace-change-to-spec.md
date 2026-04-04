# Skill: Trace Change To Spec

## Goal
Keep implementation, specs, contracts, diagrams, and tests synchronized whenever a code path changes.

## Process
1. Identify touched code paths (routes/pages, stores, services, mocks, shared utils).
2. Map each touched path to source-of-truth docs:
   - feature behavior -> `docs/SPECS/*.md`, `docs/UI_SCREENS.md`
   - shared state/derived rules -> `docs/STATE_MODEL.md`
   - API shapes/mock payloads -> `docs/API_CONTRACT_MOCK.md`
   - flow/visibility/queue sequencing -> `docs/ARCHITECTURE/*.puml`
3. Mark required updates by category:
   - `spec`: behavior, states, actions, constraints
   - `state`: ownership, transitions, derived rules
   - `contract`: request/response DTOs, ids, enum values
   - `diagram`: sequence/ownership/dependency flow changes
   - `test`: focused rules and regression coverage
4. Apply doc updates first when behavior intent is unclear.
5. Implement code changes with boundaries preserved:
   - pages coordinate workflows
   - stores own shared client state
   - services own transport/API interaction
   - mocks mirror backend contracts
6. Run targeted tests for touched flows, then full gates.
7. Update `CHANGELOG.md` with what changed and why.

## Best practices
- Treat docs as truth and code as implementation of that truth.
- If UI behavior changed but no spec update was needed, write why.
- If store/service boundaries moved, verify architecture notes/diagrams explicitly.
- Prefer deterministic mock scenarios over ad hoc test data.
- Do not merge a change when any required sync category is unresolved.
