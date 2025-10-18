#!/bin/bash

# Replace next/link imports with react-router-dom Link in all files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e "s|import Link from ['\"]next/link['\"]|import { Link } from 'react-router-dom'|g" \
  {} +

echo "Fixed next/link imports"
