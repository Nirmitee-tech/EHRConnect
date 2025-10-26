#!/bin/bash

# Rebuild EHR Web with correct environment variables for DEV
cd ehr-web

echo "🔨 Building ehr-web:dev with production URLs..."

docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client \
  -t jitendratech/ehr-web:dev \
  .

echo "✅ Build complete!"
echo ""
echo "📤 Pushing to DockerHub..."

docker push jitendratech/ehr-web:dev

echo "✅ Push complete!"
echo ""
echo "🎉 Done! Now restart your container on Dokploy to pull the new image."
