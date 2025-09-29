import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    roles?: string[]
    fhirUser?: string
    permissions?: string[]
    userId?: string
  }

  interface Profile {
    realm_access?: {
      roles: string[]
    }
    fhir_user?: string
    permissions?: string[]
  }

  interface User {
    id?: string
    roles?: string[]
    permissions?: string[]
    fhirUser?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    roles?: string[]
    fhirUser?: string
    permissions?: string[]
    userId?: string
  }
}
