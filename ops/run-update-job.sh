#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR=${SOURCE_DIR:-/home/ubuntu/.openclaw/product}
DEPLOY_DIR=${DEPLOY_DIR:-/opt/gcm/app}
COMPOSE_FILE=${COMPOSE_FILE:-/opt/gcm/docker-compose.yml}
OPS_DIR=${OPS_DIR:-/opt/gcm/ops}
LOCAL_URL=${LOCAL_URL:-http://127.0.0.1:3000}

JOBS_DIR="$OPS_DIR/jobs"
REPORTS_DIR="$OPS_DIR/reports"
LOGS_DIR="$OPS_DIR/logs"

mkdir -p "$JOBS_DIR" "$REPORTS_DIR" "$LOGS_DIR"

JOB_FILE=$(find "$JOBS_DIR" -maxdepth 1 -type f -name '*.json' | sort | head -n 1 || true)
[ -z "$JOB_FILE" ] && exit 0

JOB_ID=$(basename "$JOB_FILE" .json)
REPORT_FILE="$REPORTS_DIR/$JOB_ID.json"
LOG_FILE="$LOGS_DIR/$JOB_ID.log"

ACTION=$(python3 - <<PY
import json
print(json.load(open("$JOB_FILE", "r", encoding="utf-8")).get("action", "all"))
PY
)

update_report() {
  local status="$1" message="$2" error="${3:-}"
  python3 - <<PY
import json,datetime
path="$REPORT_FILE"
try:
  data=json.load(open(path, "r", encoding="utf-8"))
except Exception:
  data={"jobId":"$JOB_ID","action":"$ACTION","createdAt":"","status":"queued"}
data["status"]="$status"
data["updatedAt"]=datetime.datetime.utcnow().isoformat()+"Z"
data["message"]="$message"
data["logFile"]="$LOG_FILE"
if "$error": data["error"]="$error"
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PY
}

run_step() {
  echo "[$(date -u +%FT%TZ)] $*" | tee -a "$LOG_FILE"
  bash -lc "$*" >>"$LOG_FILE" 2>&1
}

update_report "running" "Job en ejecución"

trap 'update_report "failed" "Job falló" "Revisar logs"; rm -f "$JOB_FILE"' ERR

case "$ACTION" in
  product|all) run_step "cd '$SOURCE_DIR' && git fetch --all --prune && git checkout master && git pull --ff-only" ;;
esac
case "$ACTION" in
  deploy|all) run_step "rsync -a --delete '$SOURCE_DIR/' '$DEPLOY_DIR/'" ;;
esac
case "$ACTION" in
  tests|all) run_step "cd '$DEPLOY_DIR' && npm run lint && npm run build && npm run test:unit" ;;
esac
case "$ACTION" in
  docker|all) run_step "docker compose -f '$COMPOSE_FILE' up -d --build gcm-app" ;;
esac
case "$ACTION" in
  smoke|all) run_step "cd '$DEPLOY_DIR' && npm run qa:smoke:postdeploy" ;;
esac

update_report "success" "Job completado"
rm -f "$JOB_FILE"
