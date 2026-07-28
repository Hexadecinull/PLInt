#!/usr/bin/env bash
# Pulls the latest code, rebuilds if needed, and reloads PLInt under PM2.
# Called by webhook-server.js on every push to DEPLOY_BRANCH, or run by
# hand any time: bash scripts/deploy/update.sh
set -euo pipefail

cd "$(dirname "$0")/../.."
mkdir -p logs
LOG="logs/deploy.log"
BRANCH="${DEPLOY_BRANCH:-main}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"; }

log "== deploy start (branch: $BRANCH) =="

BEFORE_LOCK=""
[ -f package-lock.json ] && BEFORE_LOCK="$(sha256sum package-lock.json)"

git fetch origin "$BRANCH" 2>&1 | tee -a "$LOG"
git reset --hard "origin/$BRANCH" 2>&1 | tee -a "$LOG"

AFTER_LOCK=""
[ -f package-lock.json ] && AFTER_LOCK="$(sha256sum package-lock.json)"

if [ "$BEFORE_LOCK" != "$AFTER_LOCK" ] || [ ! -d node_modules ]; then
  log "dependencies changed — running npm install"
  npm install --no-audit --no-fund 2>&1 | tee -a "$LOG"
else
  log "dependencies unchanged — skipping npm install"
fi

log "building"
npm run build 2>&1 | tee -a "$LOG"

log "reloading plint via pm2 (zero-downtime)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --only plint --update-env 2>&1 | tee -a "$LOG"
else
  log "pm2 not found on PATH — start the app manually: pm2 start ecosystem.config.cjs"
fi

log "== deploy done =="
