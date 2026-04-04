# Skill: Create Screen From Spec

## Goal
Create a React screen from documented requirements without bypassing the contract/mocks/test flow.

## Process
1. Read the relevant spec under `docs/SPECS/` and `docs/UI_SCREENS.md`.
2. Identify the route, page states, and required actions.
3. Confirm whether data comes from local page state, a shared store, or a service call.
4. Define or update the TypeScript types first.
5. Create or update the mock contract if the response shape changed.
6. Build the page shell with explicit loading/empty/error/success handling.
7. Keep the page lean; push presentational pieces into components.
8. Add component or rule-based tests.
9. Update `CHANGELOG.md`.

## Best practices
- Mobile-first layout first, desktop second.
- Do not fetch directly from UI components when a service layer exists.
- Avoid hidden side effects in components.
- Prefer controlled forms for CRUD screens when it keeps logic clearer.
