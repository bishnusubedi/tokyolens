#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[reset-db]${NC} $*"; }
warn() { echo -e "${YELLOW}[reset-db]${NC} $*"; }

warn "This will reset the database and re-run all migrations + seed."
read -rp "Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { info "Aborted."; exit 0; }

info "Resetting database..."
pnpm --filter @repo/database db:reset

info "Seeding..."
pnpm --filter @repo/database db:seed

info "Done."
