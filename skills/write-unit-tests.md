# Skill: Write Unit Tests

## Goal
Add focused tests for important business and UI rules.

## Process
1. Identify the rule being protected.
2. Test the smallest stable unit possible.
3. Cover at least:
   - happy path
   - empty/edge case
   - invalid state if applicable
4. Prefer explicit data builders or scenario fixtures over ad hoc inline shapes.
5. Keep assertions readable.

## Best practices
- Prioritize queue visibility, request validation, and service-mode branching.
- Avoid giant snapshot files.
- Name tests by behavior, not implementation detail.
