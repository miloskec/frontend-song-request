# Test Strategy

## Goal
Protect key CRUD and queue visibility behavior in a lightweight frontend-first repository.

## Test levels
### Unit tests
- utility functions
- selectors/derived projections
- visibility mode logic
- request validation helpers
- queue reorder helpers

### Component tests
- critical public pages
- queue visibility rendering
- request form validation
- empty/loading/error states

## Not required in first phase
- full E2E suite
- visual regression tooling
- broad snapshot-only coverage

## Priority cases
1. Public queue visibility projection
2. Now playing rendering
3. Request form validation
4. Mock/real mode service branching
5. Queue reorder helper correctness
6. Hidden queue behavior
7. Top N queue behavior

## Coverage philosophy
Test business rules and user-facing outcomes, not implementation trivia.
