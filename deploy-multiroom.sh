#!/bin/bash

echo "🚀 Deploying multi-room booking feature..."

# 1. Sync files to server
echo "📦 Syncing files..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  -e "ssh -p 7420" \
  /Users/hylmii/finpro-hylmixalam/ikodio-property/ \
  hylmixalam@192.168.100.6:~/ikodio-property/

if [ $? -ne 0 ]; then
  echo "❌ Failed to sync files"
  exit 1
fi

# 2. Run SQL migration on server
echo "🗃️  Running database migration..."
ssh -p 7420 hylmixalam@192.168.100.6 << 'ENDSSH'
  cd ~/ikodio-property
  PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -p 5432 -U hylmixalam -d property_ikodio_db -f add-room-count.sql
ENDSSH

if [ $? -ne 0 ]; then
  echo "⚠️  Migration failed (field might already exist)"
fi

# 3. Build and restart on server
echo "🔨 Building and restarting..."
ssh -p 7420 hylmixalam@192.168.100.6 << 'ENDSSH'
  cd ~/ikodio-property
  
  # Generate Prisma client
  npx prisma generate
  
  # Clear Next.js cache
  rm -rf .next
  
  # Build with production settings
  NODE_ENV=production npm run build
  
  # Restart with PM2
  pm2 restart ikodio-property
  pm2 save
ENDSSH

if [ $? -ne 0 ]; then
  echo "❌ Build or restart failed"
  exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Server: http://192.168.100.6:8081"
