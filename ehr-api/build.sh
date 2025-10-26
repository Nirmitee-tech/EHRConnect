#!/bin/bash
set -e

echo "======================================"
echo "Building EHR API Docker Image"
echo "======================================"
echo ""

# Configuration
IMAGE_NAME="jitendratech/ehr-api"
IMAGE_TAG="dev"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo "Building: ${FULL_IMAGE}"
echo ""

# Build the Docker image
docker build -t ${FULL_IMAGE} .
docker push ${FULL_IMAGE}
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Docker image built successfully!"
  echo ""
  echo "======================================"
  echo "Image: ${FULL_IMAGE}"
  echo "======================================"
  echo ""
  echo "To push to Docker Hub:"
  echo "  docker push ${FULL_IMAGE}"
  echo ""
  echo "To run locally:"
  echo "  docker run -d -p 8000:8000 --name ehr-api ${FULL_IMAGE}"
  echo ""
  echo "To view logs:"
  echo "  docker logs -f ehr-api"
  echo ""
else
  echo ""
  echo "❌ Docker build failed!"
  exit 1
fi
