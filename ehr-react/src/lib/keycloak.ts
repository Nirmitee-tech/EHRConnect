import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'ehrconnect',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'ehr-web',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

export interface KeycloakUser {
  sub: string;
  email_verified: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  org_id?: string;
  org_slug?: string;
  location_ids?: string[];
  permissions?: string[];
  fhir_user?: string;
}

export function getKeycloakUser(): KeycloakUser | null {
  if (!keycloak.tokenParsed) return null;
  return keycloak.tokenParsed as KeycloakUser;
}

export function getAccessToken(): string | undefined {
  return keycloak.token;
}

export function getRefreshToken(): string | undefined {
  return keycloak.refreshToken;
}

export function getUserRoles(): string[] {
  const user = getKeycloakUser();
  return user?.realm_access?.roles || [];
}

export function getUserPermissions(): string[] {
  const user = getKeycloakUser();
  return user?.permissions || [];
}

export function getOrgId(): string | undefined {
  const user = getKeycloakUser();
  return user?.org_id;
}

export async function updateToken(minValidity = 5): Promise<boolean> {
  try {
    return await keycloak.updateToken(minValidity);
  } catch (error) {
    console.error('Failed to refresh token', error);
    return false;
  }
}
