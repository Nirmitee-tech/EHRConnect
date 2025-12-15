#!/bin/bash
# Test what the PHR Web Login Search API actually accepts

echo "Testing mobile search..."
curl -X POST 'https://abhasbx.abdm.gov.in/abha/api/v3/phr/web/login/abha/search' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"mobile": "9876543210"}' \
  2>&1 | head -20

echo -e "\n\nTesting with different field names..."
echo "Checking ABDM documentation..."
