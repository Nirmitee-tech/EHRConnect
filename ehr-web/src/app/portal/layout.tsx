import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PatientPortalLayout from '@/components/portal/patient-portal-layout'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to patient login if not authenticated
  if (!session) {
    redirect('/patient-login')
  }

  // Verify user is a patient (check for userType in session)
  // Patient sessions have: session.userType === 'patient' and session.patientId
  const isPatient = session.userType === 'patient' || !!session.patientId

  if (!isPatient) {
    // Not a patient, redirect to provider login
    redirect('/login')
  }

  return <PatientPortalLayout>{children}</PatientPortalLayout>
}
