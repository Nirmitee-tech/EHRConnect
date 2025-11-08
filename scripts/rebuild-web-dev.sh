#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
WEB_DIR="${PROJECT_ROOT}/ehr-web"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker CLI is not installed or not on PATH." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Cannot reach the Docker daemon. Ensure Orbstack is running and this shell has access to /Users/apple/.orbstack/run/docker.sock." >&2
  exit 1
fi

cd "${WEB_DIR}"

IMAGE_TAG="jitendratech/ehr-web:dev"

echo "🔨 Building ${IMAGE_TAG} with production URLs..."
if docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client \
  -t "${IMAGE_TAG}" \
  .; then
  echo "✅ Build complete!"
else
  echo "❌ Build failed. See logs above." >&2
  exit 1
fi

echo ""
echo "📤 Pushing to DockerHub..."
if docker push "${IMAGE_TAG}"; then
  echo "✅ Push complete!"
else
  echo "❌ Docker push failed. Ensure you're logged in and have permission to push ${IMAGE_TAG}." >&2
  exit 1
fi

echo ""
echo "🎉 Done! Restart the Dokploy container to pull the new image."
