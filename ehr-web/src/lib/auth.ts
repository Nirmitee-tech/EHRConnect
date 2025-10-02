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

      return session
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
  // Removed custom pages to use NextAuth default signin
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)
