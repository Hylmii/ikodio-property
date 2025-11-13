#!/bin/bash

# Deployment script for ikodio-property
SERVER="ikodioxlapo@192.168.100.6"
PORT="7420"
REMOTE_DIR="~/ikodio-property"

echo "🚀 Starting deployment to server..."

# Step 1: Create tarball (exclude unnecessary files)
echo "📦 Creating tarball..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dev.pid' \
    --exclude='*.tar.gz' \
    --exclude='TODO_DEPLOYMENT.md' \
    -czf build.tar.gz .

if [ ! -f build.tar.gz ]; then
    echo "❌ Failed to create tarball"
    exit 1
fi

echo "✅ Tarball created successfully"

# Step 2: Upload to server
echo "📤 Uploading to server..."
rsync -avz -e "ssh -p $PORT" build.tar.gz $SERVER:$REMOTE_DIR/

if [ $? -ne 0 ]; then
    echo "❌ Failed to upload to server"
    exit 1
fi

echo "✅ Upload successful"

# Step 3: Extract and build on server
echo "🔧 Building on server..."
ssh -p $PORT $SERVER << 'ENDSSH'
    cd ~/ikodio-property
    echo "📂 Extracting files..."
    tar -xzf build.tar.gz
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "🏗️  Building application..."
    npm run build
    
    echo "♻️  Restarting PM2 process..."
    pm2 restart ikodio-property
    
    echo "🧹 Cleaning up..."
    rm build.tar.gz
    
    echo "✅ Deployment complete!"
    pm2 status
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Failed to build on server"
    exit 1
fi

# Step 4: Clean up local tarball
echo "🧹 Cleaning up local files..."
rm build.tar.gz

echo "
🎉 Deployment successful!
🌐 Server: http://192.168.100.6:8081
"
