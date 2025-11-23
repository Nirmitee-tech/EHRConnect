'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formsService } from '@/services/forms.service';
import { cn } from '@/lib/utils';

interface FormResponse {
  id: string;
  form_template_id: string;
  response: any;
  status: string;
  submitted_by: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  patient_id?: string;
  encounter_id?: string;
}

export default function ResponseViewerPage() {
  const router = useRouter();
  const params = useParams();
  const responseId = params.id as string;

  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure auth headers are set in localStorage
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', '0df77487-970d-4245-acd5-b2a6504e88cd');
      }
      if (!localStorage.getItem('orgId')) {
        localStorage.setItem('orgId', '1200d873-8725-439a-8bbe-e6d4e7c26338');
      }
    }

    loadResponse();
  }, [responseId]);

  const loadResponse = async () => {
    try {
      setLoading(true);
      const data = await formsService.getResponse(responseId);
      setResponse(data);
    } catch (error) {
      console.error('Failed to load response:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'amended':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entered-in-error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'entered-in-error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getAnswerDisplay = (answer: any) => {
    if (!answer || answer.length === 0) return <span className="text-gray-400">No answer</span>;

    return answer.map((ans: any, idx: number) => {
      if (ans.valueString) return ans.valueString;
      if (ans.valueInteger !== undefined) return ans.valueInteger;
      if (ans.valueDecimal !== undefined) return ans.valueDecimal;
      if (ans.valueBoolean !== undefined) return ans.valueBoolean ? 'Yes' : 'No';
      if (ans.valueDate) return new Date(ans.valueDate).toLocaleDateString();
      if (ans.valueTime) return ans.valueTime;
      if (ans.valueDateTime) return new Date(ans.valueDateTime).toLocaleString();
      if (ans.valueCoding) return ans.valueCoding.display || ans.valueCoding.code;
      return JSON.stringify(ans);
    }).join(', ');
  };

  const renderResponseItem = (item: any, level: number = 0) => {
    if (!item) return null;

    return (
      <div key={item.linkId} className={cn('space-y-4', level > 0 && 'ml-8 pl-4 border-l-2 border-gray-200')}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-medium text-gray-900 flex-1">{item.text}</h4>
            {item.answer && item.answer.length > 0 && (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
          </div>
          {item.answer && (
            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-900 font-medium">{getAnswerDisplay(item.answer)}</p>
            </div>
          )}
        </div>
        {item.item && item.item.map((child: any) => renderResponseItem(child, level + 1))}
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!response) return;

    const dataStr = JSON.stringify(response.response, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-${response.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading response...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Not Found</h2>
          <p className="text-gray-600 mb-6">The response you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/forms')}>Back to Forms</Button>
        </Card>
      </div>
    );
  }

  const questionnaireResponse = response.response;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header - Hidden on print */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/forms')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Form Response</h1>
                <p className="text-sm text-gray-600">View submitted form</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Response Header */}
        <Card className="mb-6 shadow-lg border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {questionnaireResponse.questionnaire || 'Form Response'}
                    </h2>
                    <div className="flex items-center gap-3">
                      <Badge className={cn('gap-1 border', getStatusColor(response.status))}>
                        {getStatusIcon(response.status)}
                        <span className="capitalize">{response.status}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">Response ID: {response.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(response.submitted_at || response.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(response.submitted_at || response.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <User className="h-3 w-3" />
                      <span>Submitted By</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {response.submitted_by || 'Unknown'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <FileText className="h-3 w-3" />
                      <span>Questions</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {questionnaireResponse.item?.length || 0} answered
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Clock className="h-3 w-3" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(response.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Content */}
        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Form Answers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {questionnaireResponse.item && questionnaireResponse.item.length > 0 ? (
              <div className="space-y-4">
                {questionnaireResponse.item.map((item: any) => renderResponseItem(item))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No answers recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between text-xs text-gray-500">
            <p>Generated on {new Date().toLocaleString()}</p>
            <p>Response ID: {response.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
