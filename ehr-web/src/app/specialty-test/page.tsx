'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SpecialtyTestPage() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<string>('Not tested');

  const testAPI = async () => {
    try {
      if (!session?.org_id) {
        setTestResult('No org_id in session');
        return;
      }

      const response = await fetch('http://localhost:8000/api/specialties/packs', {
        headers: {
          'x-org-id': session.org_id,
          'x-user-id': session.user?.id || '',
          'x-user-roles': JSON.stringify(session.roles || []),
          'x-location-id': session.location_ids?.[0] || '',
          'x-department-id': ''
        }
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow mb-4">
          <h1 className="text-2xl font-bold mb-4">Specialty API Test</h1>

          <div className="space-y-4">
            <div>
              <strong>Session Status:</strong> <span className="ml-2 px-2 py-1 bg-blue-100 rounded">{status}</span>
            </div>

            {session && (
              <div className="bg-gray-50 p-4 rounded">
                <div><strong>Session exists:</strong> Yes ✅</div>
                <div><strong>User ID:</strong> {session.user?.id || 'N/A'}</div>
                <div><strong>Org ID:</strong> {session.org_id || 'N/A'}</div>
                <div><strong>Email:</strong> {session.user?.email || 'N/A'}</div>
                <div><strong>Roles:</strong> {JSON.stringify(session.roles) || 'N/A'}</div>
              </div>
            )}

            {!session && status === 'unauthenticated' && (
              <div className="bg-red-50 p-4 rounded text-red-700">
                Not authenticated. Please log in.
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={testAPI}
                disabled={!session}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Test API Call
              </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
              <pre>{testResult}</pre>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <a
            href="/admin/specialties"
            className="text-blue-600 hover:underline"
          >
            → Go to Admin Specialties Page
          </a>
        </div>
      </div>
    </div>
  );
}
