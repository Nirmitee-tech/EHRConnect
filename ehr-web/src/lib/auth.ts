import NextAuth, { NextAuthOptions } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import CredentialsProvider from 'next-auth/providers/credentials'

// =====================================================
// AUTH PROVIDER CONFIGURATION
// =====================================================
// Set AUTH_PROVIDER to 'postgres' or 'keycloak' (defaults to 'keycloak')
const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'keycloak'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

console.log('🔐 Auth Provider:', AUTH_PROVIDER)

// =====================================================
// KEYCLOAK CONFIGURATION
// =====================================================
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || process.env.NEXT_PUBLIC_KEYCLOAK_REALM
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET

// Validate required environment variables based on AUTH_PROVIDER
if (AUTH_PROVIDER === 'keycloak') {
  const requiredEnvVars = {
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error('❌ Missing required Keycloak environment variables:', missingVars)
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('KEYCLOAK') || k.includes('NEXTAUTH')))
  }

  const keycloakIssuer = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`
  console.log('🔐 Keycloak issuer:', keycloakIssuer)
  console.log('🔐 NextAuth URL:', process.env.NEXTAUTH_URL)
  console.log('🔐 Client ID:', KEYCLOAK_CLIENT_ID)
} else if (AUTH_PROVIDER === 'postgres') {
  console.log('🔐 Using Postgres authentication')
  console.log('🔐 API URL:', API_URL)
}

// =====================================================
// AUTHENTICATION PROVIDERS
// =====================================================
const providers = []

if (AUTH_PROVIDER === 'keycloak') {
  const keycloakIssuer = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`
  providers.push(
    KeycloakProvider({
      clientId: KEYCLOAK_CLIENT_ID!,
      clientSecret: KEYCLOAK_CLIENT_SECRET!,
      issuer: keycloakIssuer,
    })
  )
} else if (AUTH_PROVIDER === 'postgres') {
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Login failed')
          }

          // Return user object with token
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            org_id: data.user.org_id,
            org_slug: data.user.org_slug,
            org_name: data.user.org_name,
            onboarding_completed: data.user.onboarding_completed,
            scope: data.user.scope,
            location_ids: data.user.location_ids,
            roles: data.user.roles,
            permissions: data.user.permissions,
            accessToken: data.token,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  providers,
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Handle Keycloak authentication
      if (AUTH_PROVIDER === 'keycloak') {
        if (account) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          token.idToken = account.id_token
        }

        if (profile) {
          // Map user information from Keycloak profile
          token.id = profile.sub || token.sub
          token.name = profile.name || profile.preferred_username || profile.given_name
          token.email = profile.email
          token.roles = profile.realm_access?.roles || []
          token.fhirUser = profile.fhir_user

          // Map multi-tenant claims from Keycloak (custom claims via client mappers)
          const profileWithClaims = profile as Record<string, unknown>
          token.org_id = profileWithClaims.org_id as string
          token.org_slug = profileWithClaims.org_slug as string
          token.org_name = profileWithClaims.org_name as string
          token.onboarding_completed = profileWithClaims.onboarding_completed as boolean
          token.location_ids = profileWithClaims.location_ids as string[]
          token.permissions = profileWithClaims.permissions as string[]
          token.scope = profileWithClaims.scope as string
        }

        // Ensure id is set from sub if not already set
        if (!token.id && token.sub) {
          token.id = token.sub
        }
      }

      // Handle Postgres authentication (Credentials provider)
      if (AUTH_PROVIDER === 'postgres' && user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.org_id = user.org_id
        token.org_slug = user.org_slug
        token.org_name = user.org_name
        token.onboarding_completed = user.onboarding_completed
        token.scope = user.scope
        token.location_ids = user.location_ids
        token.roles = user.roles
        token.permissions = user.permissions
      }

      return token
    },
    async session({ session, token }) {
      // Map user information to session
      if (session.user) {
        session.user.id = token.id as string || token.sub as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }

      // Map authentication tokens
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.idToken = token.idToken as string

      // Map roles and permissions
      session.roles = token.roles as string[]
      session.fhirUser = token.fhirUser as string
      session.permissions = token.permissions as string[]

      // Map multi-tenant claims to session
      session.org_id = token.org_id as string
      session.org_slug = token.org_slug as string
      session.org_name = token.org_name as string
      session.onboarding_completed = token.onboarding_completed as boolean
      session.location_ids = token.location_ids as string[]
      session.scope = token.scope as string

      return session
    },
    async redirect({ url, baseUrl }) {
      // Parse the URL to check the pathname
      let targetUrl = url;
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        targetUrl = `${baseUrl}${url}`;
      }
      
      // If URL is on the same origin, check if it's valid
      if (targetUrl.startsWith(baseUrl)) {
        const urlObj = new URL(targetUrl);
        const pathname = urlObj.pathname;
        
        // NEVER redirect to API routes - these should not be navigation destinations
        if (pathname.startsWith('/api/')) {
          console.warn(`Blocked redirect to API route: ${pathname}. Redirecting to default page.`);
          // Let the default logic below handle this
          targetUrl = baseUrl;
        } else {
          // For valid page routes, return them
          return targetUrl;
        }
      }
      
      // For default redirects (no specific URL or API route blocked),
      // the dashboard will check onboarding status and redirect if needed
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signOut({ token }) {
      // Handle Keycloak logout
      if (AUTH_PROVIDER === 'keycloak' && token?.idToken) {
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM
        const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`

        try {
          // Call Keycloak logout endpoint with id_token_hint
          const params = new URLSearchParams({
            id_token_hint: token.idToken as string,
            post_logout_redirect_uri: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          })

          await fetch(`${logoutUrl}?${params.toString()}`, {
            method: 'GET',
          })
        } catch (error) {
          console.error('Error logging out from Keycloak:', error)
        }
      }

      // Handle Postgres logout (optional: log audit event)
      if (AUTH_PROVIDER === 'postgres') {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': token?.id as string,
              'x-org-id': token?.org_id as string,
            },
            body: JSON.stringify({ reason: 'user_logout' }),
          })
        } catch (error) {
          console.error('Error logging out:', error)
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)
