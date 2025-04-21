#!/bin/sh
set -e

# Check if username and password are provided
if [ -z "$PRISMA_STUDIO_USERNAME" ] || [ -z "$PRISMA_STUDIO_PASSWORD" ]; then
    echo "Error: PRISMA_STUDIO_USERNAME and PRISMA_STUDIO_PASSWORD must be set"
    exit 1
fi

# Generate .htpasswd file
htpasswd -bc /etc/nginx/.htpasswd "$PRISMA_STUDIO_USERNAME" "$PRISMA_STUDIO_PASSWORD"
echo "Basic auth credentials generated for user: $PRISMA_STUDIO_USERNAME"
