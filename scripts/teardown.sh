#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[teardown]${NC} $*"; }
warn()  { echo -e "${YELLOW}[teardown]${NC} $*"; }

DESTROY_VOLUMES=false
if [[ "${1:-}" == "--destroy" || "${1:-}" == "-d" ]]; then
  DESTROY_VOLUMES=true
  warn "Volume destruction requested — all database data will be lost."
fi

info "Stopping Docker services..."
if $DESTROY_VOLUMES; then
  docker compose -f docker-compose.dev.yml down -v
  info "Volumes destroyed."
else
  docker compose -f docker-compose.dev.yml down
  info "Containers stopped. Data volumes preserved."
fi

echo ""
echo -e "${GREEN}✓ Teardown complete.${NC}"
if ! $DESTROY_VOLUMES; then
  echo ""
  echo "  To also destroy volumes (wipe all data):"
  echo "    pnpm teardown -- --destroy"
fi
