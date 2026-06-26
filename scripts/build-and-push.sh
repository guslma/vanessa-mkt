#!/bin/sh
# Builda a imagem combinada (backend + frontend) e publica no Docker Hub
# para ser usada pelo deploy/docker-compose.yml no ZimaOS.
#
# Uso: DOCKERHUB_USER=seu-usuario ./scripts/build-and-push.sh [tag]
set -e

TAG="${1:-latest}"
USER="${DOCKERHUB_USER:?Defina DOCKERHUB_USER antes de rodar este script}"

cd "$(dirname "$0")/.."

docker build -f backend/Dockerfile -t "$USER/marketing-tracker:$TAG" .
docker push "$USER/marketing-tracker:$TAG"

echo "Imagem publicada: $USER/marketing-tracker:$TAG"
