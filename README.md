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

## Repository Contents (Current)

The current prototype/repo includes:
- **Frontend Application**: React + TypeScript SPA for Guest and DJ/Admin flows (login/register, requests, queue, settings, lists), with shared UI primitives and mobile-first styling.
- **Mock API + Data Layer**: Mock endpoints, persisted mock DB modules, and deterministic scenarios aligned with future Laravel REST shapes.
- **Testing Suite**: Vitest + Testing Library coverage for critical behavior (auth, guest flow, requests, queue actions/visibility, lists, persistence, service mode).
- **Specifications & Architecture Docs**: Scope/contracts/state/UI/test strategy docs, module specs, and PlantUML sequence/context diagrams.
- **Governance & Harness**: Repo rulebook (`AGENTS.md`), gate scripts, and prompt/guidance assets for spec-driven execution.
- **Agent Profiles & Skills**: Role-based agent docs and reusable implementation/testing/change-management playbooks.
- **Tooling**: Vite/TS/ESLint setup, package scripts, and full quality-gate pipeline (spec sync, lint, typecheck, tests, build).
