#!/bin/bash

# Maximum number of retries (30 * 2 seconds = 1 minute timeout)
MAX_RETRIES=30
RETRY_COUNT=0

# wait until Postgres is ready
echo "Attempting to connect to Postgres at ${POSTGRES_HOST}:${POSTGRES_PORT} with user ${POSTGRES_USER}"
while ! pg_isready -q -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER}
do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "$(date) - waiting for database to start"
  sleep 2
done

# run migrations
if ! ./bin/migrate; then
  echo "Database migration failed"
  exit 1
fi

# run seed
# if ! ./bin/seed; then
#   echo "Database seeding failed"
#   exit 1
# fi
# FIXME: uncomment this when ArithmeticError from seed is solved
./bin/seed

# start the elixir application
if ! ./bin/server; then
  echo "Failed to start the application server"
  exit 1
fi