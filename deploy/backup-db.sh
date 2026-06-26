#!/bin/sh
# Backup do banco do Marketing Tracker em produção (ZimaOS/CasaOS).
# Gera um dump compactado com data no nome e apaga backups com mais de
# RETENTION_DAYS dias. Pensado para rodar via cron no host (fora de
# qualquer container).
#
# Uso: ./backup-db.sh [pasta-destino]
# Agendamento sugerido (crontab -e no ZimaOS), todo dia às 3h:
#   0 3 * * * /DATA/AppData/marketing-tracker/backup-db.sh /DATA/AppData/marketing-tracker/backups
set -e

DEST="${1:-/DATA/AppData/marketing-tracker/backups}"
RETENTION_DAYS=14
CONTAINER="marketing-tracker-db"
DB_USER="marketing"
DB_NAME="marketing"

mkdir -p "$DEST"

FILENAME="$DEST/marketing_$(date +%Y%m%d_%H%M%S).sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILENAME"
echo "Backup criado: $FILENAME ($(du -h "$FILENAME" | cut -f1))"

find "$DEST" -name 'marketing_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
echo "Backups com mais de $RETENTION_DAYS dias removidos."
