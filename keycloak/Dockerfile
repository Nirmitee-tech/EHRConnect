# Custom Keycloak with EHR Theme
FROM quay.io/keycloak/keycloak:26.0

# Copy theme files
COPY themes/ /opt/keycloak/providers/

# Copy realm export
COPY realm-export.json /opt/keycloak/data/import/realm-export.json

# Set working directory
WORKDIR /opt/keycloak

# Entry point is inherited from base image
