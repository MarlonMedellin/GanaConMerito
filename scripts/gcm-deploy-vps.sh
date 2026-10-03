#!/bin/bash
# Agent: Google_Antigravity | Model: Gemini 3.6 Flash
# Official VPS Deployment Script for GanaConMérito Canonical Internal Port (3008)
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Uso: $0 <sha-o-referencia>"
  echo "Despliega un SHA inmutable en el puerto interno canónico 3008 (ganaconmerito.com)"
  exit 1
fi

REF="$1"
PRODUCT_DIR="${PRODUCT_DIR:-/home/ubuntu/.openclaw/product}"
CANONICAL_PORT=3008
ENV_FILE="${ENV_FILE:-/opt/gcm/env/production.env}"

if [ ! -d "$PRODUCT_DIR" ]; then
  echo "Error: Este script debe ejecutarse en el VPS Oracle ($PRODUCT_DIR no existe)."
  exit 1
fi

cd "$PRODUCT_DIR"

SHA=$(git rev-parse "$REF") || { echo "Error: SHA o referencia no encontrada: $REF"; exit 1; }
SHORT_SHA="${SHA:0:7}"
IMAGE_TAG="gcm-canary-app:${SHORT_SHA}"
CONTAINER_NAME="gcm-production-${SHORT_SHA}"

echo "=== Despliegue Canónico VPS ==="
echo "Target SHA: $SHA ($SHORT_SHA)"
echo "Imagen objetivo: $IMAGE_TAG"
echo "Puerto canónico: $CANONICAL_PORT"

# 0. Storage Pre-flight
echo "=== Storage Pre-flight ==="
AVAILABLE_SPACE=$(df -m / | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -lt 10240 ]; then
  echo "ABORT DEPLOY BEFORE BUILD: Espacio insuficiente en disco. Solo hay ${AVAILABLE_SPACE} MB libres. Se requiere un margen de 10GB."
  exit 1
fi
echo "Espacio en disco OK (${AVAILABLE_SPACE} MB libres)."

# Docker Safe Maintenance
echo "Limpiando cache de build de Docker y rotando logs (Mantenimiento preventivo)..."
sudo docker builder prune -f || true
sudo journalctl --vacuum-size=500M || true

# 1. Registrar estado y contenedor actual para rollback
CURRENT_CONTAINER=$(sudo docker ps --filter "publish=${CANONICAL_PORT}" --format "{{.Names}}" | head -n 1 || true)
CURRENT_IMAGE=$(sudo docker ps --filter "publish=${CANONICAL_PORT}" --format "{{.Image}}" | head -n 1 || true)
CURRENT_SHA=""

if [ -n "$CURRENT_CONTAINER" ]; then
  CURRENT_SHA=$(sudo docker inspect "$CURRENT_CONTAINER" --format '{{index .Config.Labels "com.ganaconmerito.commit"}}' 2>/dev/null || echo "")
fi

sudo mkdir -p /opt/gcm/state
cat <<EOF | sudo tee /opt/gcm/state/rollback.json > /dev/null
{
  "previous_container": "$CURRENT_CONTAINER",
  "previous_image": "$CURRENT_IMAGE",
  "previous_sha": "$CURRENT_SHA",
  "canonical_port": "$CANONICAL_PORT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "Rollback metadata guardado en /opt/gcm/state/rollback.json (SHA anterior: ${CURRENT_SHA:-desconocido})"

# 2. Sincronizar repositorio local en VPS a SHA objetivo
git fetch origin
git checkout "$SHA"

# 3. Construir imagen inmutable si no existe
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "Construyendo imagen $IMAGE_TAG..."
sudo docker build \
  --build-arg APP_COMMIT="$SHA" \
  --build-arg APP_BUILD_TIME="$BUILD_TIME" \
  -t "$IMAGE_TAG" \
  "$PRODUCT_DIR"

# 4. Detener contenedor actual en puerto canónico
if [ -n "$CURRENT_CONTAINER" ]; then
  echo "Deteniendo contenedor anterior: $CURRENT_CONTAINER..."
  sudo docker stop "$CURRENT_CONTAINER" || true
  sudo docker rm "$CURRENT_CONTAINER" || true
fi

# 5. Iniciar nuevo contenedor en puerto canónico 3008
echo "Iniciando contenedor $CONTAINER_NAME en puerto $CANONICAL_PORT..."
sudo docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  -e APP_COMMIT="$SHA" \
  -e NEXT_PUBLIC_APP_COMMIT="$SHA" \
  -e APP_BUILD_TIME="$BUILD_TIME" \
  -e NEXT_PUBLIC_APP_BUILD_TIME="$BUILD_TIME" \
  -p 127.0.0.1:${CANONICAL_PORT}:3000 \
  --label com.ganaconmerito.runtime=production \
  --label com.ganaconmerito.commit="$SHA" \
  "$IMAGE_TAG"

# 6. Verificación Health & ReleaseStamp
echo "Verificando salud en http://127.0.0.1:${CANONICAL_PORT}/login..."
HEALTH_PASS=false
for i in {1..15}; do
  sleep 2
  if curl -s -f "http://127.0.0.1:${CANONICAL_PORT}/login" | grep -q "$SHORT_SHA"; then
    HEALTH_PASS=true
    break
  fi
done

if [ "$HEALTH_PASS" = true ]; then
  echo "SUCCESS: Despliegue canónico verificado exitosamente en SHA $SHORT_SHA"
  echo "{\"sha\": \"$SHA\", \"short_sha\": \"$SHORT_SHA\", \"version_build\": \"$BUILD_TIME\", \"status\": \"PASS\"}" | sudo tee /opt/gcm/state/deploy-status.json > /dev/null
else
  echo "ERROR: Health check falló en puerto $CANONICAL_PORT. Ejecutando rollback automático..."
  "${PRODUCT_DIR}/scripts/gcm-rollback-vps.sh"
  exit 1
fi
