#!/usr/bin/env bash
# Build + run the Inertia SSR sidecar (dev). Rails points config.ssr_url here.
set -euo pipefail
cd "$(dirname "$0")/../../app/frontend"
bunx vite build --config vite.ssr.config.ts
node ../../spike/ssr/ssr.mjs
