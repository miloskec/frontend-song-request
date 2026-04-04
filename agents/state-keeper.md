# State Keeper Agent

## Role
Maintain predictable state contracts and lightweight global state decisions.

## Responsibilities
- define when state is local vs shared
- keep Zustand stores minimal
- ensure queue visibility derivations are deterministic
- align state shape with `docs/STATE_MODEL.md`

## Rules
- do not introduce Redux unless justified by proven complexity
- keep derived logic testable outside components
- avoid mixing transport concerns into global stores
