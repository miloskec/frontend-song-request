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

changed_files=()

collect_changed_files() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return
  fi

  while IFS= read -r file; do
    [ -n "$file" ] && changed_files+=("$file")
  done < <(git diff --name-only --cached --)

  while IFS= read -r file; do
    [ -n "$file" ] && changed_files+=("$file")
  done < <(git diff --name-only --)

  if [ "${#changed_files[@]}" -eq 0 ] && git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    while IFS= read -r file; do
      [ -n "$file" ] && changed_files+=("$file")
    done < <(git diff --name-only HEAD~1..HEAD --)
  fi
}

has_changed_matching() {
  local pattern="$1"
  local file
  for file in "${changed_files[@]}"; do
    if printf '%s\n' "$file" | grep -Eq "$pattern"; then
      return 0
    fi
  done
  return 1
}

is_file_changed() {
  local target="$1"
  local file
  for file in "${changed_files[@]}"; do
    if [ "$file" = "$target" ]; then
      return 0
    fi
  done
  return 1
}

require_file_changed() {
  local required_file="$1"
  local reason="$2"
  if ! is_file_changed "$required_file"; then
    echo "Spec sync check failed: $reason"
    echo "Required doc touchpoint not updated: $required_file"
    exit 1
  fi
}

require_any_file_changed() {
  local reason="$1"
  shift
  local candidate
  for candidate in "$@"; do
    if is_file_changed "$candidate"; then
      return 0
    fi
  done
  echo "Spec sync check failed: $reason"
  echo "Expected one of these architecture diagrams to be updated:"
  for candidate in "$@"; do
    echo "- $candidate"
  done
  exit 1
}

collect_changed_files

if [ "${#changed_files[@]}" -gt 0 ]; then
  if has_changed_matching '^src/stores/'; then
    require_file_changed "docs/STATE_MODEL.md" \
      "Store-layer change detected under src/stores; state model must be reviewed/updated when needed."
  fi

  if has_changed_matching '^(src/pages/dj/(QueuePage|RequestsPage)\.tsx|src/services/dj(Queue|Requests)Service\.ts|src/utils/visibility\.ts|mocks/(api|db)/(queue|requests|settings)\.ts)'; then
    require_any_file_changed \
      "Request/queue/visibility flow change detected; related architecture sequence diagram must be reviewed/updated." \
      "docs/ARCHITECTURE/dj-queue-management-sequence.puml" \
      "docs/ARCHITECTURE/queue-visibility-sequence.puml" \
      "docs/ARCHITECTURE/guest-request-sequence.puml"
  fi

  if has_changed_matching '^(src/types/api\.ts|mocks/api/)'; then
    require_file_changed "docs/API_CONTRACT_MOCK.md" \
      "API contract-shape change detected in src/types/api.ts or mocks/api; API contract doc must be reviewed/updated when needed."
  fi
fi

echo "Spec sync gate passed"
