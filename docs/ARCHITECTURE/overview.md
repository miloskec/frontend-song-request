# Architecture Overview

## Current architecture
- React SPA frontend
- Mock-first service layer
- MSW-based fake HTTP responses in demo mode
- Future Laravel REST API compatibility preserved through typed contracts

## Layers
1. Spec layer (`docs/SPECS`, contracts, state model)
2. Governance/harness layer (gates, test strategy, agent workflow)
3. Implementation layer (pages, stores, services, mocks, UI components)

## Ownership by layer
- `pages` render workflows and compose screen-level behavior.
- `stores` own shared client state and state transitions used across screens.
- `services` own API interaction, request/response mapping, and error normalization.
- `mocks` simulate backend contracts and deterministic scenarios for local/demo mode.
- `components` own presentation concerns and local UI state only.

## Dependency direction (allowed)
- `pages -> stores -> services -> contracts/types`
- `pages -> components`
- `services -> contracts/types`
- `mocks -> contracts/types`
- `components` can depend on shared UI primitives and local props, not on service modules directly.

## Dependency direction (not allowed)
- `services -> stores` (service layer must stay UI-agnostic)
- `services -> pages/components` (no UI decisions in service logic)
- `components -> mocks` (UI must consume store/service abstractions)
- `pages -> mock internals` (page must not bypass service/store boundary)

## Implementation target
- React pages
- lightweight global state with Zustand where needed
- feature-first service modules
- mobile-first UI

## State vs Service vs UI boundary
- State rules and shared transitions live in `stores`.
- IO and backend-shape adaptation live in `services` (mock or real, env-driven).
- Rendering and interaction affordances live in `pages/components`.
- Business rules that impact multiple screens must be moved to store/service, never duplicated in page components.

## What Must Never Happen
- A component becomes the source of truth for shared business state.
- Services start owning UI decisions (copy text, toasts, layout behavior, navigation).
- Page-level shortcuts bypass stores or typed contracts.
- Business rules are scattered across multiple components without a single store/service owner.

## Why not Redux initially?
The project is primarily CRUD and presentation-first.
A smaller store is easier to maintain and explain in the book/harness context.
Redux can be reconsidered only if the state graph proves meaningfully more complex.
