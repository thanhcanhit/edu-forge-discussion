#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres
do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Execute the main command
echo "Starting the application..."
exec "$@"
