'use client'

import { Phone, Mail, MessageSquare, LifeBuoy, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600">
          Need help with the portal? Our support team is here to assist with appointments, billing,
          prescriptions, and technical questions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              Call us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">(800) 555-1200</p>
            <p className="text-sm text-gray-600">Monday – Friday, 8:00 AM – 6:00 PM (local time)</p>
            <Button variant="outline" size="sm">
              Request a call back
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-purple-600" />
              Email support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">portal.support@ehrconnect.io</p>
            <p className="text-sm text-gray-600">
              Typical response within 1 business day. Please avoid sharing sensitive information by email.
            </p>
            <Button variant="outline" size="sm">
              Send secure message
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Quick help topics
          </CardTitle>
          <CardDescription>Find answers to common questions before reaching out.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Accessing lab results</p>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to Documents or Health Records to download lab results as soon as they&apos;re
              released.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Updating insurance</p>
            <p className="text-sm text-gray-600 mt-1">
              Visit the Billing section to review your coverage or submit new insurance information.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Resetting your password</p>
            <p className="text-sm text-gray-600 mt-1">
              Use the “Forgot password” link on the login screen. Still need help? Contact support.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Requesting records</p>
            <p className="text-sm text-gray-600 mt-1">
              You can download your summary from Health Records or request a full export from our team.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Medical emergency?</p>
              <p className="text-sm text-gray-700">
                Call 911 or your local emergency services immediately. The patient portal is not monitored for urgent medical needs.
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            View urgent care options
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LifeBuoy className="w-5 h-5 text-blue-600" />
            Schedule a support session
          </CardTitle>
          <CardDescription>
            Need extra help? Book a 1:1 session for guided portal assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">15-minute virtual walkthrough</p>
              <p className="text-sm text-gray-600">Monday – Friday, 9 AM – 4 PM</p>
            </div>
          </div>
          <Button>Book a session</Button>
        </CardContent>
      </Card>
    </div>
  )
}
