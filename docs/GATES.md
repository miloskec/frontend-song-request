# Gates

## Purpose
Ensure the repo stays spec-aligned, typed, tested, and buildable.

## Gates
### gate-lint
Runs ESLint and formatting checks.

### gate-types
Runs TypeScript type checks.

### gate-tests
Runs unit/component tests.

### gate-build
Runs production build.

### gate-spec-sync
Checks for discipline signals:
- `CHANGELOG.md` exists and is non-empty
- key docs exist
- architecture docs exist
- skills exist
- agents exist
- `.env.example` defines mock toggle

This gate starts simple. It can evolve later to diff-aware checks.

### gate-all
Runs all gates in order.

## Which law each gate enforces
- `gate-tests`: protects user-facing behavior and regression safety.
- `gate-types`: protects contract correctness and typed boundary integrity.
- `gate-spec-sync`: protects law/city alignment between code, docs, contracts, diagrams, and workflow discipline.
- `gate-build`: protects deployability (the app can compile for production).

## Rule
No feature work is considered complete until `gate-all` passes.
