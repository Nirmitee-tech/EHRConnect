import NextAuth, { NextAuthOptions } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.idToken = account.id_token
      }
      
      if (profile) {
        // Map user information from Keycloak profile
        token.name = profile.name || profile.preferred_username || profile.given_name
        token.email = profile.email
        token.roles = profile.realm_access?.roles || []
        token.fhirUser = profile.fhir_user
        
        // Map multi-tenant claims from Keycloak (custom claims via client mappers)
        const profileWithClaims = profile as Record<string, unknown>
        token.org_id = profileWithClaims.org_id as string
        token.org_slug = profileWithClaims.org_slug as string
        token.location_ids = profileWithClaims.location_ids as string[]
        token.permissions = profileWithClaims.permissions as string[]
      }

      return token
    },
    async session({ session, token }) {
      // Map user information to session
      if (session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.idToken = token.idToken as string
      session.roles = token.roles as string[]
      session.fhirUser = token.fhirUser as string
      
      // Map multi-tenant claims to session
      session.org_id = token.org_id as string
      session.org_slug = token.org_slug as string
      session.location_ids = token.location_ids as string[]
      session.permissions = token.permissions as string[]

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
      // Construct Keycloak logout URL to clear Keycloak session
      if (token?.idToken) {
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
    },
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)
