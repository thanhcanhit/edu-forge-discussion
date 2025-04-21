#!/bin/sh
set -e

# This script is a convenience wrapper for running database seeds in production

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

echo "Running database seed..."
docker-compose run --rm db-tools npx prisma db seed

echo "Seed completed successfully!"
