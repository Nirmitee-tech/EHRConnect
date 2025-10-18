import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from '../lib/keycloak';
import type { KeycloakUser } from '../lib/keycloak';
import { getKeycloakUser } from '../lib/keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: KeycloakUser | null;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  roles: string[];
  permissions: string[];
  orgId: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (!initialized) {
      initKeycloak();
    }
  }, [initialized]);

  const initKeycloak = async () => {
    // Check if already initialized
    if (keycloak.authenticated !== undefined) {
      setIsAuthenticated(keycloak.authenticated);
      if (keycloak.authenticated) {
        setUser(getKeycloakUser());
      }
      setIsLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(getKeycloakUser());

        // Set up token refresh
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed');
              setUser(getKeycloakUser());
            }
          }).catch(() => {
            console.error('Failed to refresh token');
            logout();
          });
        };
      }
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
      setInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      // Check if keycloak is properly initialized
      if (!keycloak || typeof keycloak.login !== 'function') {
        const error = new Error('Keycloak is not initialized. Please ensure Keycloak server is running.');
        console.error('Keycloak not initialized properly', error);
        throw error;
      }

      await keycloak.login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw so the calling component can handle it
    }
  };

  const logout = () => {
    try {
      if (keycloak.logout) {
        keycloak.logout({
          redirectUri: window.location.origin,
        });
      }
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshed = await keycloak.updateToken(5);
      if (refreshed) {
        setUser(getKeycloakUser());
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token', error);
      return false;
    }
  };

  const roles = user?.realm_access?.roles || [];
  const permissions = user?.permissions || [];
  const orgId = user?.org_id;

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token: keycloak.token,
    login,
    logout,
    refreshToken,
    roles,
    permissions,
    orgId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
