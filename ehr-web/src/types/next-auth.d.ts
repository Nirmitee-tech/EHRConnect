import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    idToken?: string
    roles?: string[]
    fhirUser?: string
    permissions?: string[]
    // Multi-tenant fields
    org_id?: string
    org_slug?: string
    org_name?: string
    org_type?: string
    org_logo?: string
    org_specialties?: string[]
    onboarding_completed?: boolean
    location_ids?: string[]
    scope?: string
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
    }
  }

  interface Profile {
    realm_access?: {
      roles: string[]
    }
    fhir_user?: string
    permissions?: string[]
    preferred_username?: string
    given_name?: string
    family_name?: string
    // Multi-tenant fields from Keycloak
    org_id?: string
    org_slug?: string
    location_ids?: string[]
  }

  interface User {
    id?: string
    name?: string
    email?: string
    roles?: string[]
    permissions?: string[]
    fhirUser?: string
    // Multi-tenant fields (for postgres auth)
    org_id?: string
    org_slug?: string
    org_name?: string
    org_type?: string
    org_logo?: string
    org_specialties?: string[]
    onboarding_completed?: boolean
    location_ids?: string[]
    scope?: string
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    refreshToken?: string
    idToken?: string
    expiresAt?: number
    roles?: string[]
    fhirUser?: string
    permissions?: string[]
    // Multi-tenant fields
    org_id?: string
    org_slug?: string
    org_name?: string
    org_type?: string
    org_logo?: string
    org_specialties?: string[]
    onboarding_completed?: boolean
    location_ids?: string[]
    scope?: string
  }
}
