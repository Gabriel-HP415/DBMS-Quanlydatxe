#!/usr/bin/env bash
set -euo pipefail

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
SERVER="${DB_HOST:-sqlserver}"
SA_PASSWORD="${MSSQL_SA_PASSWORD:?MSSQL_SA_PASSWORD is required}"
SCRIPTS_DIR="${SCRIPTS_DIR:-/scripts}"

echo "[DB-INIT] Waiting for SQL Server at ${SERVER}..."
for i in $(seq 1 60); do
  if ${SQLCMD} -S "${SERVER}" -U sa -P "${SA_PASSWORD}" -C -Q "SELECT 1" >/dev/null 2>&1; then
    echo "[DB-INIT] SQL Server is ready."
    break
  fi
  if [ "${i}" -eq 60 ]; then
    echo "[DB-INIT] Timeout waiting for SQL Server."
    exit 1
  fi
  sleep 2
done

DB_ID=$(${SQLCMD} -S "${SERVER}" -U sa -P "${SA_PASSWORD}" -C -Q "SET NOCOUNT ON; SELECT DB_ID('BusBookingDB')" -h-1 -W 2>/dev/null | tr -d '[:space:]')
if [ -n "${DB_ID}" ] && [ "${DB_ID}" != "NULL" ]; then
  echo "[DB-INIT] BusBookingDB already exists — skip init."
  exit 0
fi

run_script() {
  local file="$1"
  echo "[DB-INIT] Running ${file}..."
  ${SQLCMD} -S "${SERVER}" -U sa -P "${SA_PASSWORD}" -C -i "${SCRIPTS_DIR}/${file}"
}

run_script "01_create_database.sql"
run_script "02_create_tables.sql"
run_script "03_seed_data.sql"
run_script "04_stored_procedures.sql"
run_script "07_sp_deadlock_web.sql"

echo "[DB-INIT] Database initialization complete."