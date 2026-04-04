# Skill: Update State Contract

## Goal
Safely evolve state shape without allowing UI and service layers to drift.

## Process
1. Update `docs/STATE_MODEL.md` if shared state rules change.
2. Identify whether the new state belongs in local component state or a small shared store.
3. Prefer derived helpers/selectors for queue projection logic.
4. Keep async transport concerns inside services.
5. Add tests for derived business logic.
6. Update `CHANGELOG.md`.

## Best practices
- Use Zustand only where shared state is genuinely needed.
- Keep stores serializable where practical.
- Avoid large nested mutable objects.
