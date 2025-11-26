#!/bin/bash

# EHR Connect Deployment Script
# Usage: ./deploy.sh [environment] [command]
# Example: ./deploy.sh dev up
# Example: ./deploy.sh prod down

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    print_error "Environment not specified!"
    echo "Usage: ./deploy.sh [environment] [command]"
    echo "Environments: dev, staging, prod"
    echo "Commands: up, down, restart, logs, ps"
    exit 1
fi

ENVIRONMENT=$1
COMMAND=${2:-up}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Valid environments: dev, staging, prod"
    exit 1
fi

# Set docker-compose file based on environment
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
ENV_FILE=".env.${ENVIRONMENT}"

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_warning "Please create $ENV_FILE based on ${ENV_FILE}.example"

    if [ -f "${ENV_FILE}.example" ]; then
        echo "Do you want to copy from ${ENV_FILE}.example? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp "${ENV_FILE}.example" "$ENV_FILE"
            print_info "Created $ENV_FILE from example"
            print_warning "Please edit $ENV_FILE and update the values before deployment!"
            exit 0
        fi
    fi
    exit 1
fi

print_info "Deploying EHR Connect to ${ENVIRONMENT} environment..."
print_info "Using compose file: $COMPOSE_FILE"
print_info "Using env file: $ENV_FILE"

# Execute docker-compose command
case $COMMAND in
    up)
        print_info "Starting services..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
        print_info "Services started successfully!"
        echo ""
        print_info "View logs: ./deploy.sh $ENVIRONMENT logs"
        print_info "Check status: ./deploy.sh $ENVIRONMENT ps"
        ;;
    down)
        print_info "Stopping services..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
        print_info "Services stopped successfully!"
        ;;
    restart)
        print_info "Restarting services..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
        print_info "Services restarted successfully!"
        ;;
    logs)
        SERVICE=$3
        if [ -z "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
        else
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "$SERVICE"
        fi
        ;;
    ps)
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        ;;
    exec)
        if [ -z "$3" ]; then
            print_error "Service name required for exec command"
            echo "Usage: ./deploy.sh $ENVIRONMENT exec [service] [command]"
            exit 1
        fi
        SERVICE=$3
        shift 3
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec "$SERVICE" "$@"
        ;;
    pull)
        print_info "Pulling latest images..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
        ;;
    build)
        print_info "Building images..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo "Available commands: up, down, restart, logs, ps, exec, pull, build"
        exit 1
        ;;
esac
