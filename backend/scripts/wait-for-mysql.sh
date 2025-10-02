#!/bin/bash
# wait-for-mysql.sh - Wait for MySQL to be ready

set -e

host="$1"
shift
user="$1"
shift
password="$1"
shift
cmd="$@"

echo "Waiting for MySQL at $host..."

# Maximum wait time (seconds)
max_attempts=60
attempt=0

until php -r "
\$mysqli = @new mysqli('$host', '$user', '$password', '', 3306);
if (\$mysqli->connect_errno) {
    exit(1);
}
\$mysqli->close();
exit(0);
" 2>/dev/null
do
  attempt=$((attempt+1))
  if [ $attempt -ge $max_attempts ]; then
    echo "ERROR: MySQL at $host did not become ready in time"
    exit 1
  fi
  echo "MySQL is unavailable (attempt $attempt/$max_attempts) - sleeping"
  sleep 2
done

echo "✅ MySQL is up and accepting connections!"

exec $cmd
