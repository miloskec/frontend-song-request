# Architecture Overview

## Current architecture
- React SPA frontend
- Mock-first service layer
- MSW-based fake HTTP responses in demo mode
- Future Laravel REST API compatibility preserved through typed contracts

## Layers
1. Spec layer
2. Governance/harness layer
3. Implementation layer

## Implementation target
- React pages
- lightweight global state with Zustand where needed
- feature-first service modules
- mobile-first UI

## Why not Redux initially?
The project is primarily CRUD and presentation-first.
A smaller store is easier to maintain and explain in the book/harness context.
Redux can be reconsidered only if the state graph proves meaningfully more complex.
