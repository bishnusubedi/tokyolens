#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[setup]${NC} $*"; }
warn()    { echo -e "${YELLOW}[setup]${NC} $*"; }
error()   { echo -e "${RED}[setup]${NC} $*" >&2; exit 1; }

# ── prerequisites ────────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || error "Docker not found. Install Docker Desktop first."
command -v pnpm    >/dev/null 2>&1 || error "pnpm not found. Run: npm install -g pnpm"
command -v node    >/dev/null 2>&1 || error "Node.js not found."

# ── .env ─────────────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  info "Creating .env from .env.example"
  cp .env.example .env
  warn "Review .env and update secrets before production use."
else
  info ".env already exists — skipping copy."
fi

# ── dependencies ─────────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install

# ── docker services ──────────────────────────────────────────────────
info "Starting Docker services (PostgreSQL)..."
docker compose -f docker-compose.dev.yml up -d

# ── wait for postgres ─────────────────────────────────────────────────
info "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.dev.yml exec -T postgres \
       pg_isready -U postgres >/dev/null 2>&1; then
    info "PostgreSQL is ready."
    break
  fi
  if [[ $i -eq 30 ]]; then
    error "PostgreSQL did not become ready in time."
  fi
  sleep 1
done

# ── prisma ───────────────────────────────────────────────────────────
info "Generating Prisma client..."
pnpm db:generate

info "Running database migrations..."
pnpm --filter @repo/database db:migrate

info "Seeding database..."
pnpm --filter @repo/database db:seed

# ── build shared packages ─────────────────────────────────────────────
info "Building shared packages..."
pnpm --filter @repo/shared build
pnpm --filter @repo/ui build

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "  Start dev servers:    pnpm dev"
echo "  API:                  http://localhost:3001"
echo "  Web:                  http://localhost:3000"
echo "  Prisma Studio:        pnpm db:studio"
echo ""
