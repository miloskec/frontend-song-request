# Skill: Extend Mock API

## Goal
Add or refine a mock endpoint while keeping parity with the future Laravel REST API.

## Process
1. Update `docs/API_CONTRACT_MOCK.md`.
2. Update shared TypeScript contracts.
3. Create or extend deterministic mock records in `mocks/db/`.
4. Add or extend endpoint handlers in `mocks/api/`.
5. Add scenario coverage in `mocks/scenarios/`.
6. Ensure the service interface is unchanged between mock and real mode.
7. Add tests for both happy path and at least one edge case.
8. Update `CHANGELOG.md`.

## Best practices
- Use UUIDs consistently.
- Do not generate random shapes at runtime.
- Keep endpoint payloads realistic and small enough for demo clarity.
