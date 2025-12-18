'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, formatDistanceToNowStrict } from 'date-fns'
import {
  ClipboardList,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { PatientFormAssignment } from '@/services/patient-portal.service'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface FormsResponse {
  current: PatientFormAssignment[]
  past: PatientFormAssignment[]
}

function formatDate(dateString?: string) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return format(date, 'MMMM d, yyyy')
}

function formatRelative(dateString?: string) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  const relative = formatDistanceToNowStrict(date, { addSuffix: true })
  return relative
}

function getStatusBadge(status: PatientFormAssignment['status']) {
  switch (status) {
    case 'not-started':
      return { label: 'Not started', className: 'bg-gray-100 text-gray-700 border-gray-200' }
    case 'in-progress':
      return { label: 'In progress', className: 'bg-blue-100 text-blue-700 border-blue-200' }
    case 'completed':
      return { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' }
  }
}

export default function PatientFormsPage() {
  const [currentForms, setCurrentForms] = useState<PatientFormAssignment[]>([])
  const [pastForms, setPastForms] = useState<PatientFormAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/patient/forms')

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.message || 'Unable to load forms.')
        }

        const data = (await response.json()) as FormsResponse
        setCurrentForms(data.current || [])
        setPastForms(data.past || [])
      } catch (err) {
        console.error('Error loading forms:', err)
        const message = err instanceof Error ? err.message : 'Unable to load forms.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadForms()
  }, [])

  const hasNoForms = useMemo(
    () => !loading && !error && currentForms.length === 0 && pastForms.length === 0,
    [loading, error, currentForms.length, pastForms.length]
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms & Questionnaires</h1>
          <p className="text-gray-600">
            Complete assigned intake forms and questionnaires before your upcoming visits.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Syncing
        </Button>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Assigned forms are grouped by due date and completion status.
              </p>
              <p className="text-sm text-gray-600">
                Complete current forms before their due date. You can review completed forms in the
                past submissions list.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="uppercase">
            Current: {currentForms.length} · Past: {pastForms.length}
          </Badge>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Unable to load forms</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : hasNoForms ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No forms assigned</h3>
            <p className="text-gray-600">
              Your care team has not assigned any questionnaires yet. Check back before your next
              appointment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Current forms</h2>
              <span className="text-sm text-gray-500">
                {currentForms.length} form{currentForms.length === 1 ? '' : 's'} due soon
              </span>
            </div>
            {currentForms.length === 0 ? (
              <Card className="border border-dashed border-gray-200">
                <CardContent className="py-10 text-center space-y-2">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-600">
                    You are all caught up. New forms will appear here when assigned.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentForms.map((form) => {
                const badge = getStatusBadge(form.status)
                const dueDate = formatDate(form.dueDate)
                const dueRelative = formatRelative(form.dueDate)
                const questionnaireTitle =
                  typeof form.questionnaire?.title === 'string'
                    ? form.questionnaire.title
                    : undefined

                return (
                  <Card key={form.id} className="border border-gray-200">
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                          {form.title}
                        </CardTitle>
                        <CardDescription>
                          {form.description || 'Complete this form before your upcoming visit.'}
                        </CardDescription>
                      </div>
                      <Badge className={`${badge.className} border self-start`}>{badge.label}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {dueDate && (
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Due {dueDate}
                          </span>
                        )}
                        {dueRelative && (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {dueRelative}
                          </span>
                        )}
                        {questionnaireTitle && (
                          <span className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-gray-500" />
                            {questionnaireTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <Button>
                          {form.status === 'in-progress' ? 'Resume form' : 'Start form'}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline">Preview questions</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Past submissions</h2>
              <span className="text-sm text-gray-500">
                {pastForms.length} completed form{pastForms.length === 1 ? '' : 's'}
              </span>
            </div>
            {pastForms.length === 0 ? (
              <Card className="border border-dashed border-gray-200">
                <CardContent className="py-10 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Past submissions will appear here once forms are completed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastForms.map((form) => {
                const badge = getStatusBadge(form.status)
                const submittedOn = formatDate(form.submittedOn)

                return (
                  <Card key={form.id} className="border border-gray-200">
                    <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-5">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900">{form.title}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {badge.label}
                          </span>
                          {submittedOn && (
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              Submitted {submittedOn}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline">
                          View submission
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline">Download PDF</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </section>
        </>
      )}
    </div>
  )
}
