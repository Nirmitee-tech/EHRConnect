import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getServerSession(authOptions);
  return handleFHIRRequest('GET', request, path, session);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getServerSession(authOptions);
  return handleFHIRRequest('POST', request, path, session);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getServerSession(authOptions);
  return handleFHIRRequest('PUT', request, path, session);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getServerSession(authOptions);
  return handleFHIRRequest('PATCH', request, path, session);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getServerSession(authOptions);
  return handleFHIRRequest('DELETE', request, path, session);
}

async function handleFHIRRequest(
  method: string,
  request: NextRequest,
  pathSegments: string[],
  session: any
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();

    const fhirUrl = `${FHIR_BASE_URL}/fhir/R4/${path}${queryParams ? `?${queryParams}` : ''}`;

    console.log(`\n========== [FHIR Proxy] ${method} REQUEST ==========`);
    console.log(`[FHIR Proxy] URL: ${fhirUrl}`);
    console.log(`[FHIR Proxy] Session:`, JSON.stringify(session, null, 2));

    // Get org_id from session
    const orgId = session?.org_id as string | undefined;

    console.log(`[FHIR Proxy] Extracted org_id:`, orgId);

    // Simple pass-through to our FHIR backend
    const headers: HeadersInit = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };

    // First, try to get org_id from client request headers (takes priority)
    const clientOrgId = request.headers.get('x-org-id');

    // Use client org_id if provided, otherwise fall back to session org_id
    const finalOrgId = clientOrgId || orgId;

    // Add org_id header
    if (finalOrgId) {
      headers['x-org-id'] = finalOrgId;
      console.log(`[FHIR Proxy] ✅ Forwarding org_id: ${finalOrgId} (source: ${clientOrgId ? 'client header' : 'session'})`);
    } else {
      console.error('[FHIR Proxy] ❌ No org_id found in session or client headers');
      console.error('[FHIR Proxy] Session object:', session);
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    const response = await fetch(fhirUrl, requestOptions);
    
    console.log(`[FHIR Proxy] Response: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    // Create response with proper CORS headers
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy important headers from FHIR response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      nextResponse.headers.set('Content-Type', contentType);
    }

    // Set CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return nextResponse;
    
  } catch (error) {
    console.error('[FHIR Proxy] Error:', error);

    // Provide helpful error message
    let diagnostics = 'Unknown error occurred';
    if (error instanceof Error) {
      diagnostics = error.message;

      // Provide more helpful message for common errors
      if (error.message.includes('ECONNREFUSED') || error.message === 'fetch failed') {
        diagnostics = `Cannot connect to backend API at ${FHIR_BASE_URL}. Please ensure:
1. Backend server is running (npm run dev in ehr-api folder)
2. Backend is accessible at ${FHIR_BASE_URL}
3. NEXT_PUBLIC_API_URL environment variable is set correctly`;
      }
    }

    const errorResponse = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'exception',
          diagnostics: diagnostics
        }
      ]
    };

    const nextResponse = NextResponse.json(errorResponse, { status: 500 });
    
    // Set CORS headers even for error responses
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}
