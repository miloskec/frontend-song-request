#!/usr/bin/env bash
set -euo pipefail
bash ./gates/gate-spec-sync.sh
bash ./gates/gate-lint.sh
bash ./gates/gate-types.sh
bash ./gates/gate-tests.sh
bash ./gates/gate-build.sh
