#!/usr/bin/env bash
# Runs both React↔ERB parity suites against a running app (BASE, default :3013).
set -euo pipefail
cd "$(dirname "$0")"
bun install --frozen-lockfile >/dev/null 2>&1 || bun install >/dev/null 2>&1
echo "== works-index parity =="; bun harness.mjs
echo "== work-show parity =="; bun workshow.mjs
echo "== bookmarks parity =="; bun bookmarks.mjs
