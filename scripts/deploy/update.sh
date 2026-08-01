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
BEFORE_HEAD="$(git rev-parse HEAD 2>/dev/null || echo "")"

git fetch origin "$BRANCH" 2>&1 | tee -a "$LOG"
git reset --hard "origin/$BRANCH" 2>&1 | tee -a "$LOG"

AFTER_LOCK=""
[ -f package-lock.json ] && AFTER_LOCK="$(sha256sum package-lock.json)"
AFTER_HEAD="$(git rev-parse HEAD 2>/dev/null || echo "")"

if [ "$BEFORE_LOCK" != "$AFTER_LOCK" ] || [ ! -d node_modules ]; then
  log "dependencies changed, running npm install"
  npm install --no-audit --no-fund 2>&1 | tee -a "$LOG"
else
  log "dependencies unchanged, skipping npm install"
fi

log "building"
npm run build 2>&1 | tee -a "$LOG"

log "reloading plint via pm2 (zero-downtime)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --only plint --update-env 2>&1 | tee -a "$LOG"
else
  log "pm2 not found on PATH, start the app manually: pm2 start ecosystem.config.cjs"
fi

# This script is itself run by scripts/deploy/webhook-server.js. If that
# process's own code or config changed, it needs a restart too, but it
# can't safely restart its own PM2 process from here: pm2 reload/restart
# kills the whole process tree of the target app, which would kill this
# very script before it finishes. So the restart is scheduled as a
# detached job that fires a couple seconds after this script has already
# exited cleanly.
WEBHOOK_CHANGED=false
if [ -n "$BEFORE_HEAD" ] && [ -n "$AFTER_HEAD" ] && [ "$BEFORE_HEAD" != "$AFTER_HEAD" ]; then
  if git diff --name-only "$BEFORE_HEAD" "$AFTER_HEAD" 2>/dev/null | grep -qE '^(ecosystem\.config\.cjs|scripts/deploy/webhook-server\.js)$'; then
    WEBHOOK_CHANGED=true
  fi
fi

if [ "$WEBHOOK_CHANGED" = true ] && command -v pm2 >/dev/null 2>&1; then
  log "webhook config/code changed, scheduling a detached plint-webhook restart"
  setsid bash -c '
    sleep 3
    cd "'"$(pwd)"'"
    pm2 reload ecosystem.config.cjs --only plint-webhook --update-env >> logs/deploy.log 2>&1
  ' </dev/null >/dev/null 2>&1 &
  disown
fi

log "== deploy done =="
