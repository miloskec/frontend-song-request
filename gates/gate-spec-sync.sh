#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "AGENTS.md"
  "CHANGELOG.md"
  "docs/FRONTEND_SCOPE.md"
  "docs/API_CONTRACT_MOCK.md"
  "docs/STATE_MODEL.md"
  "docs/UI_SCREENS.md"
  "docs/TEST_STRATEGY.md"
  "docs/GATES.md"
  "docs/ARCHITECTURE/frontend-context.puml"
  "agents/frontend-architect.md"
  "agents/ui-implementer.md"
  "agents/state-keeper.md"
  "agents/test-guardian.md"
  "agents/harness-auditor.md"
  "skills/create-screen-from-spec.md"
  "skills/extend-mock-api.md"
  "skills/update-state-contract.md"
  "skills/write-unit-tests.md"
  ".env.example"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file"
    exit 1
  fi
done

if ! grep -q "VITE_USE_MOCK_API" .env.example; then
  echo "Missing VITE_USE_MOCK_API in .env.example"
  exit 1
fi

echo "Spec sync gate passed"
