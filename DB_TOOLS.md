# Database Tools in Production

This document explains how to run database operations like seeding and migrations in a production environment.

## Running Database Seeds

To run the database seed in production:

```bash
# Run the seed script
docker-compose run --rm db-tools npx prisma db seed
```

This command will:

1. Start a temporary container based on your application image
2. Connect to your production database
3. Run the seed script defined in your package.json
4. Exit and remove the container when finished

## Running Prisma Studio

To run Prisma Studio in production:

```bash
# Start Prisma Studio
docker-compose run --rm -p 5555:5555 db-tools npx prisma studio --port 5555 --hostname 0.0.0.0
```

This will start Prisma Studio in a temporary container and expose it on port 5555. You can access it at http://your-server-ip:5555.

For a more secure setup with authentication, use the dedicated Prisma Studio service described in PRISMA_STUDIO.md.

## Running Migrations

To run database migrations in production:

```bash
# Deploy migrations
docker-compose run --rm db-tools npx prisma migrate deploy
```

## Other Prisma Commands

You can run any Prisma command using the db-tools service:

```bash
# Generate Prisma client
docker-compose run --rm db-tools npx prisma generate

# Reset the database (CAUTION: This will delete all data)
docker-compose run --rm db-tools npx prisma migrate reset --force

# Check database status
docker-compose run --rm db-tools npx prisma migrate status
```

## Security Considerations

- The db-tools service is not started by default (it uses the "tools" profile)
- Always use the `--rm` flag to remove the container after use
- Be careful with commands that modify the database in production
- Consider restricting access to these commands to authorized personnel only
