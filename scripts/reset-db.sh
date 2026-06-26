#!/bin/sh
# Apaga o volume de dados do Postgres do ambiente de desenvolvimento local
# e recria o banco do zero (extensões + schema, sem seed — o backend
# aplica o seed automaticamente ao subir). Use apenas em ambiente de dev.
set -e

cd "$(dirname "$0")/.."

echo "Isso vai apagar TODOS os dados do banco local (docker-compose.yml). Continuar? [s/N]"
read -r CONFIRM
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Cancelado."
  exit 0
fi

docker compose down -v
docker compose up -d db
echo "Banco recriado. Suba o backend (docker compose up -d backend) para aplicar migrations e seed."
