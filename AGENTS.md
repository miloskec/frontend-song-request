# AGENTS.md

## Mission
This repository is built with a specification-driven, harness-friendly workflow for a frontend-only React SPA that currently runs on mock data but is designed to align with a future Laravel REST API.

## Global rules
1. Read the relevant specs before editing code.
2. Summarize the intended change in 2-4 lines before implementation.
3. List exact files to modify before editing.
4. Prefer updating specs before implementation when behavior is unclear.
5. Keep mock contracts aligned with future Laravel REST API shapes.
6. Keep the stack lightweight and avoid unnecessary third-party libraries.
7. Respect mobile-first design and CRUD-oriented simplicity.
8. Update `CHANGELOG.md` for any meaningful change.
9. Update PlantUML diagrams when request, queue, visibility, or state flow changes.
10. Run targeted tests first, then full gates.
11. Do not add backend logic to this repo.
12. Use UUID-based entities in mocks and types.
13. Public guest flows must support a QR UUID delivered as a query parameter.
14. Mock/real API switching must remain environment-driven.

## Scope guardrails
- This repo is only for frontend implementation, docs, mocks, tests, and harness guidance.
- The future backend is Laravel REST API only.
- Do not introduce FastAPI, GraphQL, or unnecessary architecture layers.
- Avoid Redux unless a simple store proves insufficient; prefer lighter solutions.

## Preferred implementation style
- React + TypeScript
- Small, focused components
- Feature folders when implementation starts
- Presentational components separated from service/state wiring
- Test important business rules, not only snapshots
- Favor deterministic mock scenarios over random fake data

## Required doc touchpoints
Depending on the change, review and update as needed:
- `docs/FRONTEND_SCOPE.md`
- `docs/API_CONTRACT_MOCK.md`
- `docs/STATE_MODEL.md`
- `docs/UI_SCREENS.md`
- `docs/TEST_STRATEGY.md`
- `docs/GATES.md`
- `docs/ARCHITECTURE/*.puml`
- `docs/SPECS/*.md`

## Completion checklist
- Relevant spec reviewed
- Types/contracts updated
- Mock data updated
- Tests updated
- Changelog updated
- Gates passed
