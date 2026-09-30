#!/usr/bin/env sh
# Season reset for the FC26 tracker running under Docker (Portainer stack).
#
# 1. Dumps the whole database (players, matches, admin users, sessions)
#    to ./backups/fc26-<timestamp>.dump using pg_dump inside the Postgres container.
# 2. Removes every row from "matches". Players, admin users and sessions are kept.
#    Leaderboard, streaks, badges and history are all computed from matches,
#    so this resets every stat to zero.
#
# Run on the Docker host (OMV):   sh script/reset-season.sh
# Backup only, no reset:          sh script/reset-season.sh --backup-only
# Skip the confirmation prompt:   sh script/reset-season.sh --yes
#
# Restore a dump (server can stay up):
#   docker exec -i fc26-postgres pg_restore -U fc26 -d fc26_tracker --clean --if-exists < backups/<file>.dump

set -eu

PG_CONTAINER="${PG_CONTAINER:-fc26-postgres}"
PG_USER="${PG_USER:-fc26}"
PG_DB="${PG_DB:-fc26_tracker}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

BACKUP_ONLY=0
ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --backup-only) BACKUP_ONLY=1 ;;
    --yes) ASSUME_YES=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

psql_q() {
  docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -At -c "$1"
}

if ! docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
  echo "Container '$PG_CONTAINER' is not running." >&2
  exit 1
fi

PLAYERS=$(psql_q "SELECT count(*) FROM players")
MATCHES=$(psql_q "SELECT count(*) FROM matches")
echo "Current data: players=$PLAYERS matches=$MATCHES"

mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y-%m-%d_%H-%M-%S)
DUMP="$BACKUP_DIR/fc26-$STAMP.dump"
docker exec "$PG_CONTAINER" pg_dump -U "$PG_USER" -d "$PG_DB" -Fc > "$DUMP"
echo "Backup written: $DUMP ($(wc -c < "$DUMP" | tr -d ' ') bytes)"

# Sanity check: the dump must contain the matches table data.
if ! docker exec -i "$PG_CONTAINER" pg_restore -l < "$DUMP" | grep -q "TABLE DATA public matches"; then
  echo "Backup verification failed: matches table data not found in dump. Aborting." >&2
  exit 1
fi
echo "Backup verified (contains matches table data)."

if [ "$BACKUP_ONLY" -eq 1 ]; then
  exit 0
fi

if [ "$ASSUME_YES" -ne 1 ]; then
  printf 'Type RESET to clear all %s matches (players are kept): ' "$MATCHES"
  read -r ANSWER
  if [ "$ANSWER" != "RESET" ]; then
    echo "Aborted. Nothing was changed."
    exit 0
  fi
fi

# Clear the season. Only the matches table is touched.
REMOVED=$(psql_q "WITH cleared AS (DELETE FROM matches RETURNING 1) SELECT count(*) FROM cleared")
echo "Cleared $REMOVED matches."
echo "After reset: players=$(psql_q "SELECT count(*) FROM players") matches=$(psql_q "SELECT count(*) FROM matches")"
echo "Restore with: docker exec -i $PG_CONTAINER pg_restore -U $PG_USER -d $PG_DB --clean --if-exists < $DUMP"
