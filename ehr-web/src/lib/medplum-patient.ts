import { MedplumClient } from '@medplum/core'

/**
 * Create an authenticated Medplum client for a patient
 * This should be used in API routes where we have access to the patient's session token
 */
export function createPatientMedplumClient(accessToken: string): MedplumClient {
  const client = new MedplumClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    fhirUrlPath: 'fhir/R4',
    clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID || 'medplum-client',
  })

  // Set the access token for authenticated requests
  client.setAccessToken(accessToken)

  return client
}

/**
 * Alternative: Call ehr-api endpoints that handle auth internally
 * This is more reliable than using Medplum client directly
 */
export async function fetchWithPatientAuth(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}
