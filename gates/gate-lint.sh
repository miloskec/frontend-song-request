#!/usr/bin/env bash
set -euo pipefail
if [ -f package.json ]; then
  npm run lint
else
  echo "package.json missing"
  exit 1
fi
