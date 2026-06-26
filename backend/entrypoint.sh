#!/bin/sh
set -e

echo "Aguardando banco de dados..."
node dist/scripts/migrate.js
node dist/scripts/ensure-admin.js
echo "Iniciando servidor..."
exec node dist/server.js
