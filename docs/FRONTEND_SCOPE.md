# Frontend Scope

## Current objective
Build a frontend-only, presentation-ready SPA using mock data and fake HTTP responses while preserving future compatibility with a Laravel REST API.

## In scope
- React SPA setup
- Mock API layer
- Mock scenarios for each endpoint
- Public guest flows
- DJ management flows
- Queue visibility logic
- Unit tests for key behaviors
- Gates and repo governance

## Out of scope for this phase
- Real Laravel integration
- Real auth implementation
- Real payments
- Real QR generation backend
- Production-grade persistence
- WebSocket implementation

## API contract philosophy
All frontend services must call endpoint-like functions that can operate in two modes:
- Mock mode (`VITE_USE_MOCK_API=true`)
- Real mode (`VITE_USE_MOCK_API=false`)

The service interface must stay stable across both modes.

## QR access rule
Public guest pages always accept a QR identifier via query string.
Default query parameter name: `qr`
Expected value: UUID string.

The QR UUID is treated as the public access token for fetching playlist, queue, and request context.
