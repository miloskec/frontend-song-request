# Frontend Song Request

Frontend-only repository for the QR-based song request platform.

This repo is intentionally governed by a specification-driven, harness-friendly workflow:
- React SPA only
- Laravel REST API as future backend target
- Mock-first delivery for presentation/demo
- Mobile-first UI
- Typed contracts
- Unit tests and quality gates
- PlantUML-backed architecture docs

## Current phase

Phase 1: governance, specs, mock contracts, gates, and repo discipline.

## Planned stack

- React + TypeScript
- Vite
- React Router
- Zustand for lightweight state where global state is needed
- TanStack Query only if needed later; avoid by default in the first pass
- Vitest + Testing Library
- MSW for mock/fake HTTP layer
- CSS Modules or scoped plain CSS with design tokens

## Key rule

Do not implement behavior outside the documented frontend-only scope without first updating the relevant spec file.
