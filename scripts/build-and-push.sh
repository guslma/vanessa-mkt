#!/bin/sh
# Builda a imagem combinada (backend + frontend) para amd64 e arm64, e
# publica no Docker Hub para ser usada pelo deploy/docker-compose.yml no
# ZimaOS (precisa de multi-arquitetura: ZimaOS roda tanto em mini-PCs
# x86_64 quanto em placas ARM, e o Mac que builda é arm64).
#
# Uso: DOCKERHUB_USER=seu-usuario ./scripts/build-and-push.sh [tag]
set -e

TAG="${1:-latest}"
USER="${DOCKERHUB_USER:?Defina DOCKERHUB_USER antes de rodar este script}"

cd "$(dirname "$0")/.."

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f backend/Dockerfile \
  -t "$USER/marketing-tracker:$TAG" \
  --push \
  .

echo "Imagem publicada (amd64 + arm64): $USER/marketing-tracker:$TAG"
