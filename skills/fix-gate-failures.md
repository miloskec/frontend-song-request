# Skill: Fix Gate Failures

## Goal
Resolve failing gates in a disciplined and traceable way.

## Process
1. Read the gate output carefully.
2. Classify the failure:
   - lint
   - types
   - tests
   - build
   - spec sync
3. Apply the smallest reasonable fix.
4. Re-run the targeted gate.
5. Re-run full gate suite.
6. Record the change in `CHANGELOG.md`.

## Best practices
- Do not hide failing tests.
- Do not skip docs if the failure indicates drift.
- Prefer reversible fixes over broad refactors during repair.
