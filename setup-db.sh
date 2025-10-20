#!/bin/bash

# Start Prisma dev server in background
echo "Starting Prisma Postgres server..."
npx prisma dev &

# Wait for server to be ready
sleep 5

# Push database schema
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Database setup complete!"
