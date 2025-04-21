#!/bin/sh
set -e

echo "Running database seed..."
npx prisma db seed

echo "Seed completed successfully!"
