'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  FileText,
  Download,
  Search,
  Filter,
  RefreshCcw,
  ShieldCheck,
  Folder,
  Link as LinkIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DocumentReference } from '@medplum/fhirtypes'

type DocumentRow = DocumentReference & { id?: string }

const CATEGORY_COLORS: Record<string, string> = {
  'lab-report': 'bg-sky-100 text-sky-700',
  'imaging-report': 'bg-purple-100 text-purple-700',
  discharge: 'bg-teal-100 text-teal-700',
  prescription: 'bg-amber-100 text-amber-700',
}

export default function PatientDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/documents')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load documents')
      }

      const data = (await response.json()) as { documents?: DocumentRow[] }
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Error loading documents:', err)
      const message = err instanceof Error ? err.message : 'Unable to load documents right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const allCategories = new Set<string>()

    documents.forEach((doc) => {
      doc.category?.forEach((category) => {
        category.coding?.forEach((coding) => {
          if (coding.code) {
            allCategories.add(coding.code)
          }
        })
      })
    })

    return Array.from(allCategories)
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        (doc.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (doc.type?.text || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' ||
        doc.category?.some((category) =>
          category.coding?.some((coding) => coding.code === selectedCategory)
        )
      return matchesSearch && matchesCategory
    })
  }, [documents, search, selectedCategory])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">
            Access lab reports, visit summaries, imaging results, and other shared documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDocuments}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm" className="hidden sm:inline-flex">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Share Securely
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for newly shared records.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((document) => {
            const documentDate = document.date || document.created
            const attachment = document.content?.[0]?.attachment
            const categoryCode =
              document.category?.[0]?.coding?.[0]?.code?.toLowerCase() || 'document'
            const badgeClass =
              CATEGORY_COLORS[categoryCode] || 'bg-blue-100 text-blue-700 border-blue-200'

            return (
              <Card key={document.id || document.identifier?.[0]?.value}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-xl text-gray-900">
                          {document.description || document.type?.text || 'Clinical Document'}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        {documentDate
                          ? `Created on ${format(new Date(documentDate), 'MMMM d, yyyy h:mma')}`
                          : 'Date not available'}
                      </CardDescription>
                      {document.category?.[0]?.text && (
                        <p className="text-sm text-gray-600">{document.category[0].text}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {document.category?.flatMap((category) =>
                          category.coding?.map((coding) =>
                            coding.code ? (
                              <Badge
                                key={`${document.id}-${coding.code}`}
                                className={`${badgeClass} border`}
                              >
                                {coding.code.replace(/-/g, ' ')}
                              </Badge>
                            ) : null
                          ) || []
                        )}
                        {document.status && (
                          <Badge variant="outline" className="uppercase">
                            {document.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[180px]">
                      {attachment?.url ? (
                        <Button asChild variant="default">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            View / Download
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Not available
                        </Button>
                      )}
                      {attachment?.title && (
                        <p className="text-xs text-gray-500 text-center">{attachment.title}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
