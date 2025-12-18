'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Phone, Calendar, Users, Clock, FileText, Globe, RefreshCw } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 z-10"
        onClick={handleCopy}
      >
        {copied ? (
          <><Check className="h-4 w-4 mr-1" /> Copied</>
        ) : (
          <><Copy className="h-4 w-4 mr-1" /> Copy</>
        )}
      </Button>
      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default function VAPIDocumentationPage() {
  const { orgId } = useOrganization();
  const defaultBaseUrl = typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : 'http://localhost:8000';
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Phone className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">VAPI / Voice Assistant Integration</h1>
        </div>
        <p className="text-muted-foreground">
          Complete API documentation for integrating voice assistants with EHRConnect
        </p>

        {/* Configuration Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Org ID */}
          {orgId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium mb-1">Your Organization ID:</p>
              <code className="text-blue-700 font-mono text-lg">{orgId}</code>
            </div>
          )}

          {/* Base URL Configuration */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-green-700" />
              <p className="text-sm font-medium">API Base URL:</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customUrl || baseUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (customUrl.trim()) {
                    setBaseUrl(customUrl.trim());
                  }
                }}
                className="whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Update
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBaseUrl(defaultBaseUrl);
                  setCustomUrl('');
                }}
                className="whitespace-nowrap"
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-green-700 mt-1">
              All curl examples will use this URL
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="bg-slate-100 px-3 py-1 rounded">{baseUrl}/api/public/v2</code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <Badge variant="secondary">No Authentication Required</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                All endpoints require an <code>org_id</code> parameter instead of authentication headers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Voice Call Workflow</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Check if patient exists by phone/email</li>
                <li>If not, create new patient</li>
                <li>Get list of available practitioners</li>
                <li>Get available time slots for selected practitioner</li>
                <li>Book appointment</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Tabs */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow">Complete Workflow</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="practitioners">Practitioners</TabsTrigger>
          <TabsTrigger value="slots">Available Slots</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Complete Workflow Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Complete Voice Call Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Step 1</Badge>
                  <h3 className="font-semibold">Check if Patient Exists</h3>
                </div>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/check-patient?org_id=${orgId || 'YOUR_ORG_ID'}&phone=555-1234`} />
                <div className="mt-2 bg-slate-50 p-3 rounded text-sm">
                  <p className="font-medium mb-1">Response:</p>
                  <pre className="text-xs">{JSON.stringify({ success: true, exists: true, patient: { id: "patient-123", name: "John Doe" } }, null, 2)}</pre>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Step 2</Badge>
                  <h3 className="font-semibold">Get Available Practitioners</h3>
                </div>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/practitioners?org_id=${orgId || 'YOUR_ORG_ID'}`} />
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Step 3</Badge>
                  <h3 className="font-semibold">Get Available Time Slots</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Option A: Get slots for a specific practitioner
                </p>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/available-slots?org_id=${orgId || 'YOUR_ORG_ID'}&practitioner_id=PRACTITIONER_ID&date=2025-10-25`} />
                <p className="text-sm text-muted-foreground mb-2 mt-3">
                  Option B: Get slots for ALL practitioners (NEW!)
                </p>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/available-slots?org_id=${orgId || 'YOUR_ORG_ID'}&date=2025-10-25`} />
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Step 4</Badge>
                  <h3 className="font-semibold">Book Appointment</h3>
                </div>
                <CodeBlock code={`curl -X POST ${baseUrl}/api/public/v2/book-appointment \\
  -H "Content-Type: application/json" \\
  -d '{
    "org_id": "${orgId || 'YOUR_ORG_ID'}",
    "patientId": "patient-123",
    "practitionerId": "practitioner-456",
    "startTime": "2025-10-25T10:00:00Z",
    "endTime": "2025-10-25T10:30:00Z",
    "appointmentType": "ROUTINE",
    "reason": "Annual checkup"
  }'`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Check Patient Exists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/check-patient?org_id=${orgId || 'YOUR_ORG_ID'}&phone=555-1234
# OR
GET ${baseUrl}/api/public/v2/check-patient?org_id=${orgId || 'YOUR_ORG_ID'}&email=patient@example.com`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Create New Patient
                  <Badge variant="secondary" className="text-xs">Streamlined for VAPI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Simplified API - just send simple fields, we automatically build the FHIR structure for you!
                </p>

                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium mb-2">✨ Required Fields:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc text-green-900">
                    <li><code>firstName</code> or <code>lastName</code> (at least one required)</li>
                    <li><code>phone</code> - Phone number</li>
                  </ul>
                  <p className="text-sm font-medium mt-3 mb-2">📋 Optional Fields:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc text-green-900">
                    <li><code>email</code>, <code>birthDate</code>, <code>gender</code></li>
                    <li><code>street</code>, <code>city</code>, <code>state</code>, <code>zip</code></li>
                  </ul>
                </div>

                <h4 className="font-semibold mb-2 text-sm">Minimal Example (Just Name + Phone):</h4>
                <CodeBlock code={`curl -X POST ${baseUrl}/api/public/v2/patients?org_id=${orgId || 'YOUR_ORG_ID'} \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "555-123-4567"
  }'`} />

                <h4 className="font-semibold mb-2 mt-4 text-sm">Complete Example (All Fields):</h4>
                <CodeBlock code={`curl -X POST ${baseUrl}/api/public/v2/patients?org_id=${orgId || 'YOUR_ORG_ID'} \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "555-123-4567",
    "email": "john.smith@example.com",
    "birthDate": "1990-01-15",
    "gender": "male",
    "street": "123 Main Street",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  }'`} />

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-medium mb-1">💡 VAPI Integration Tip:</p>
                  <p className="text-xs text-blue-900 mb-2">
                    No need to know FHIR structure! Just send simple key-value pairs and we handle the rest.
                  </p>
                  <p className="text-xs text-blue-900">
                    The API automatically builds proper FHIR-compliant resources, validates data, and returns a simplified response.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get All Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/patients?org_id=${orgId || 'YOUR_ORG_ID'}
# Filter by phone
GET ${baseUrl}/api/public/v2/patients?org_id=${orgId || 'YOUR_ORG_ID'}&phone=555-1234
# Filter by email
GET ${baseUrl}/api/public/v2/patients?org_id=${orgId || 'YOUR_ORG_ID'}&email=patient@example.com`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Practitioners Tab */}
        <TabsContent value="practitioners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Get All Practitioners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={`GET ${baseUrl}/api/public/v2/practitioners?org_id=${orgId || 'YOUR_ORG_ID'}`} />

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Response Structure:</p>
                <pre className="text-xs overflow-x-auto">{JSON.stringify({
                  success: true,
                  orgId: "YOUR_ORG_ID",
                  count: 2,
                  practitioners: [
                    {
                      id: "pract-123",
                      name: "Dr. John Smith",
                      phone: "+1-555-999-8888",
                      email: "dr.smith@clinic.com",
                      active: true,
                      specialty: "Family Medicine",
                      officeHours: "[{dayOfWeek:1,startTime:'09:00',endTime:'17:00',isWorking:true}]"
                    }
                  ]
                }, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Slots Tab */}
        <TabsContent value="slots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Get Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Endpoint</h3>
                <CodeBlock code={`GET ${baseUrl}/api/public/v2/available-slots?org_id=${orgId || 'YOUR_ORG_ID'}&practitioner_id=PRACT_ID&date=2025-10-25`} />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Parameters</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>org_id</code> (required) - Your organization ID</li>
                  <li><code>practitioner_id</code> (optional) - Practitioner ID. If omitted, returns slots for ALL practitioners</li>
                  <li><code>date</code> (required) - Date in YYYY-MM-DD format</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Response Example (Specific Practitioner):</p>
                <pre className="text-xs overflow-x-auto">{JSON.stringify({
                  success: true,
                  practitionerId: "pract-123",
                  practitionerName: "Dr. John Smith",
                  date: "2025-10-25",
                  workingHours: { start: "09:00", end: "17:00" },
                  totalSlots: 16,
                  availableSlots: [
                    { start: "2025-10-25T14:00:00Z", end: "2025-10-25T14:30:00Z", duration: 30 },
                    { start: "2025-10-25T14:30:00Z", end: "2025-10-25T15:00:00Z", duration: 30 }
                  ]
                }, null, 2)}</pre>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="font-medium mb-2 text-blue-900">Response Example (All Practitioners - NEW!):</p>
                <pre className="text-xs overflow-x-auto">{JSON.stringify({
                  success: true,
                  orgId: "YOUR_ORG_ID",
                  date: "2025-10-25",
                  totalPractitioners: 5,
                  workingPractitioners: 3,
                  totalAvailableSlots: 48,
                  practitioners: [
                    {
                      practitionerId: "pract-123",
                      practitionerName: "Dr. Sarah Johnson",
                      specialty: "Family Medicine",
                      phone: "+1-555-999-8888",
                      totalSlots: 16,
                      availableSlots: [
                        { start: "2025-10-25T14:00:00Z", end: "2025-10-25T14:30:00Z", duration: 30 }
                      ]
                    }
                  ]
                }, null, 2)}</pre>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Note:</p>
                <p className="text-sm text-blue-800 mt-1">
                  Slots are generated in 30-minute intervals based on practitioner's office hours.
                  Already booked slots are automatically excluded.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`curl -X POST ${baseUrl}/api/public/v2/book-appointment \\
  -H "Content-Type: application/json" \\
  -d '{
    "org_id": "${orgId || 'YOUR_ORG_ID'}",
    "patientId": "patient-id",
    "practitionerId": "practitioner-id",
    "startTime": "2025-10-25T14:00:00Z",
    "endTime": "2025-10-25T14:30:00Z",
    "appointmentType": "ROUTINE",
    "reason": "Annual checkup"
  }'`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`# Get all appointments for organization
GET ${baseUrl}/api/public/v2/appointments?org_id=${orgId || 'YOUR_ORG_ID'}

# Filter by patient
GET ${baseUrl}/api/public/v2/appointments?org_id=${orgId || 'YOUR_ORG_ID'}&patient_id=PATIENT_ID

# Filter by date
GET ${baseUrl}/api/public/v2/appointments?org_id=${orgId || 'YOUR_ORG_ID'}&date=2025-10-25

# Filter by status
GET ${baseUrl}/api/public/v2/appointments?org_id=${orgId || 'YOUR_ORG_ID'}&status=booked`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Example 1: Complete Workflow with Existing Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Here's a complete example showing the workflow when the patient already exists:
                  </p>
                  <CodeBlock code={`#!/bin/bash

ORG_ID="${orgId || 'YOUR_ORG_ID'}"
BASE_URL="${baseUrl}/api/public/v2"

# Step 1: Check if patient exists
echo "Step 1: Checking if patient exists..."
PATIENT_CHECK=$(curl -s "$BASE_URL/check-patient?org_id=$ORG_ID&phone=555-1234")
echo $PATIENT_CHECK

# Step 2: Get practitioners
echo "\\nStep 2: Getting available practitioners..."
PRACTITIONERS=$(curl -s "$BASE_URL/practitioners?org_id=$ORG_ID")
PRACTITIONER_ID=$(echo $PRACTITIONERS | jq -r '.practitioners[0].id')
echo "Selected practitioner: $PRACTITIONER_ID"

# Step 3: Get available slots
echo "\\nStep 3: Getting available time slots..."
SLOTS=$(curl -s "$BASE_URL/available-slots?org_id=$ORG_ID&practitioner_id=$PRACTITIONER_ID&date=2025-10-25")
START_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].start')
END_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].end')
echo "Selected slot: $START_TIME to $END_TIME"

# Step 4: Book appointment
echo "\\nStep 4: Booking appointment..."
PATIENT_ID=$(echo $PATIENT_CHECK | jq -r '.patient.id')
curl -X POST "$BASE_URL/book-appointment" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"org_id\\": \\"$ORG_ID\\",
    \\"patientId\\": \\"$PATIENT_ID\\",
    \\"practitionerId\\": \\"$PRACTITIONER_ID\\",
    \\"startTime\\": \\"$START_TIME\\",
    \\"endTime\\": \\"$END_TIME\\",
    \\"appointmentType\\": \\"ROUTINE\\",
    \\"reason\\": \\"Annual checkup\\"
  }"

echo "\\nAppointment booked successfully!"`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 2: Complete Workflow with New Patient Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This example shows how to handle the case when a patient doesn&apos;t exist - create them first, then book:
                  </p>
                  <CodeBlock code={`#!/bin/bash

ORG_ID="${orgId || 'YOUR_ORG_ID'}"
BASE_URL="${baseUrl}/api/public/v2"

# Step 1: Check if patient exists
echo "Step 1: Checking if patient exists..."
PATIENT_CHECK=$(curl -s "$BASE_URL/check-patient?org_id=$ORG_ID&phone=555-9999")
EXISTS=$(echo $PATIENT_CHECK | jq -r '.exists')

if [ "$EXISTS" = "false" ]; then
  echo "Patient doesn't exist. Creating new patient..."

  # Step 2a: Create new patient (STREAMLINED - simple fields!)
  NEW_PATIENT=$(curl -s -X POST "$BASE_URL/patients?org_id=$ORG_ID" \\
    -H "Content-Type: application/json" \\
    -d '{
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "555-999-9999",
      "email": "jane.doe@example.com",
      "birthDate": "1985-05-20",
      "gender": "female",
      "street": "456 Oak Avenue",
      "city": "Springfield",
      "state": "IL",
      "zip": "62702"
    }')

  PATIENT_ID=$(echo $NEW_PATIENT | jq -r '.patient.id')
  echo "Created new patient with ID: $PATIENT_ID"
else
  PATIENT_ID=$(echo $PATIENT_CHECK | jq -r '.patient.id')
  echo "Using existing patient: $PATIENT_ID"
fi

# Step 3: Get available practitioners
echo "\\nStep 3: Getting available practitioners..."
PRACTITIONERS=$(curl -s "$BASE_URL/practitioners?org_id=$ORG_ID")
PRACTITIONER_ID=$(echo $PRACTITIONERS | jq -r '.practitioners[0].id')
echo "Selected practitioner: $PRACTITIONER_ID"

# Step 4: Get available slots
echo "\\nStep 4: Getting available time slots..."
SLOTS=$(curl -s "$BASE_URL/available-slots?org_id=$ORG_ID&practitioner_id=$PRACTITIONER_ID&date=2025-10-25")
START_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].start')
END_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].end')
echo "Selected slot: $START_TIME to $END_TIME"

# Step 5: Book appointment
echo "\\nStep 5: Booking appointment..."
APPOINTMENT=$(curl -s -X POST "$BASE_URL/book-appointment" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"org_id\\": \\"$ORG_ID\\",
    \\"patientId\\": \\"$PATIENT_ID\\",
    \\"practitionerId\\": \\"$PRACTITIONER_ID\\",
    \\"startTime\\": \\"$START_TIME\\",
    \\"endTime\\": \\"$END_TIME\\",
    \\"appointmentType\\": \\"ROUTINE\\",
    \\"reason\\": \\"New patient consultation\\"
  }")

echo "\\nAppointment booked successfully!"
echo $APPOINTMENT`} />

                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="font-medium mb-1">✅ Key Points:</p>
                    <ul className="text-xs text-green-900 space-y-1 ml-4 list-disc">
                      <li>Always check if patient exists first using <code>check-patient</code></li>
                      <li>If <code>exists: false</code>, create the patient with <code>POST /v2/patients</code></li>
                      <li>Collect minimal info (name + phone) or full details (address, email, DOB)</li>
                      <li>Use the returned <code>patient.id</code> to book the appointment</li>
                      <li>Patient will be visible in UI immediately after creation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 3: Voice Assistant JavaScript Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Here's how you might implement this in a voice assistant (VAPI, Twilio, etc.):
                  </p>
                  <CodeBlock language="javascript" code={`// Voice Assistant Function for Booking Appointment
async function bookAppointmentViaVoice(callerPhone, callerInfo) {
  const ORG_ID = "${orgId || 'YOUR_ORG_ID'}";
  const BASE_URL = "${baseUrl}/api/public/v2";

  // Step 1: Check if patient exists by phone
  const checkResponse = await fetch(
    \`\${BASE_URL}/check-patient?org_id=\${ORG_ID}&phone=\${callerPhone}\`
  );
  const checkData = await checkResponse.json();

  let patientId;

  if (!checkData.exists) {
    // Patient doesn't exist - create new patient (STREAMLINED!)
    const createResponse = await fetch(
      \`\${BASE_URL}/patients?org_id=\${ORG_ID}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: callerInfo.firstName,
          lastName: callerInfo.lastName,
          phone: callerPhone,
          email: callerInfo.email,
          birthDate: callerInfo.birthDate,
          gender: callerInfo.gender,
          street: callerInfo.address?.street,
          city: callerInfo.address?.city,
          state: callerInfo.address?.state,
          zip: callerInfo.address?.zip
        })
      }
    );

    const newPatient = await createResponse.json();
    patientId = newPatient.patient.id;

    // Say to caller: "I've created your patient record."
  } else {
    patientId = checkData.patient.id;
    // Say to caller: "Welcome back, [name]! I have your info on file."
  }

  // Step 2: Get available practitioners
  const pracResponse = await fetch(
    \`\${BASE_URL}/practitioners?org_id=\${ORG_ID}\`
  );
  const pracData = await pracResponse.json();

  // Let user choose or pick first available
  const practitionerId = pracData.practitioners[0].id;

  // Step 3: Get available slots
  const slotsResponse = await fetch(
    \`\${BASE_URL}/available-slots?org_id=\${ORG_ID}&practitioner_id=\${practitionerId}&date=\${callerInfo.preferredDate}\`
  );
  const slotsData = await slotsResponse.json();

  if (slotsData.totalSlots === 0) {
    return { error: 'No slots available on that date' };
  }

  // Let user choose time or pick first available
  const selectedSlot = slotsData.availableSlots[0];

  // Step 4: Book appointment
  const bookResponse = await fetch(\`\${BASE_URL}/book-appointment\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      org_id: ORG_ID,
      patientId: patientId,
      practitionerId: practitionerId,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      appointmentType: 'ROUTINE',
      reason: callerInfo.reason || 'Phone booking'
    })
  });

  const appointment = await bookResponse.json();

  return {
    success: true,
    appointmentId: appointment.appointment.id,
    message: \`Appointment confirmed for \${selectedSlot.start}\`
  };
}`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Testing Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Health Check</h3>
            <CodeBlock code={`GET ${baseUrl}/api/public/health`} />
            <p className="text-sm text-muted-foreground mt-2">
              Use this endpoint to verify the API is running and see all available endpoints.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✓ Data Visibility</h4>
            <p className="text-sm text-green-800">
              All patients and appointments created via these APIs are immediately visible in the EHRConnect
              web interface. Navigate to the Patients or Appointments page to view them.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h4>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              <li>Always use ISO 8601 format for dates: <code>2025-10-25T14:00:00Z</code></li>
              <li>Time slots are 30 minutes by default</li>
              <li>Practitioner office hours must be configured in the system</li>
              <li>All endpoints return JSON responses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
