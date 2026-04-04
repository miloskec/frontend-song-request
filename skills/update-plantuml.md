# Skill: Update PlantUML

## Goal
Keep sequence and context diagrams aligned with implemented flows.

## Process
1. Identify whether request flow, queue flow, or visibility flow changed.
2. Update the matching `.puml` file under `docs/ARCHITECTURE/`.
3. Keep actor/action/response naming aligned with the spec.
4. Ensure the diagram reflects current layers: page, service, mock/real API, and data source.
5. Update `CHANGELOG.md`.

## Best practices
- Prefer sequence diagrams for behavior changes.
- Keep diagrams readable and minimal.
