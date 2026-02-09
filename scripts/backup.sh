#!/bin/bash
# ============================================================
# PraxisPuls Database Backup Script
# Usage: ./scripts/backup.sh
# Requires: DATABASE_URL env var or .env.local file
# ============================================================

set -euo pipefail

# Load .env.local if DATABASE_URL not set
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set. Provide it via env or .env.local"
  exit 1
fi

# Create backup directory
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/praxispuls_${TIMESTAMP}.sql.gz"

echo "Starting backup..."
echo "  Target: $FILENAME"

# pg_dump with custom format, compressed
pg_dump "$DATABASE_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip > "$FILENAME"

SIZE=$(du -h "$FILENAME" | cut -f1)
echo "Backup complete: $FILENAME ($SIZE)"

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/praxispuls_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo "Old backups cleaned (keeping last 10)"

echo ""
echo "To restore:"
echo "  gunzip -c $FILENAME | psql \$DATABASE_URL"
