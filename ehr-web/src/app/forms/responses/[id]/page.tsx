'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, Download, Printer, CheckCircle2, AlertCircle, FileText, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formsService } from '@/services/forms.service';
import type { FormResponse } from '@/types/forms';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function ResponseViewerPage() {
  const router = useRouter();
  const params = useParams();
  const responseId = params?.id as string;

  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!response) return;

    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-response-${responseId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'amended':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderResponseItem = (item: any, level: number = 0) => {
    if (!item) return null;

    const hasAnswer = item.answer && item.answer.length > 0;
    const hasNestedItems = item.item && item.item.length > 0;

    if (!hasAnswer && !hasNestedItems) return null;

    return (
      <div key={item.linkId} className={cn("mb-2.5", level > 0 && "ml-4 pl-3 border-l border-gray-200")}>
        <div className="text-xs font-medium text-gray-600 mb-1">{item.text}</div>

        {hasAnswer && (
          <div className="text-sm text-gray-900 bg-blue-50 rounded px-2.5 py-1.5 mb-1.5">
            {item.answer.map((ans: any, idx: number) => {
              const value =
                ans.valueString ||
                ans.valueInteger ||
                ans.valueDecimal ||
                ans.valueBoolean?.toString() ||
                ans.valueDate ||
                ans.valueDateTime ||
                ans.valueTime ||
                ans.valueCoding?.display ||
                'N/A';

              return (
                <div key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{value}</span>
                </div>
              );
            })}
          </div>
        )}

        {hasNestedItems && (
          <div className="space-y-1.5">
            {item.item.map((nestedItem: any) => renderResponseItem(nestedItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Response Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The form response could not be loaded.</p>
          <Button onClick={() => router.push('/forms')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Forms
          </Button>
        </Card>
      </div>
    );
  }

  // TODO: Fetch FHIR QuestionnaireResponse separately
  const responseData = (response as any).response || {};
  const items = responseData.item || [];

  return (
    <div className="flex flex-col h-screen">
      {/* Compact Header - No padding on sides */}
      <div className="flex-shrink-0 bg-white border-b">
        <div className="flex items-center justify-between px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-7 px-2 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handlePrint} className="h-7 px-2 text-xs">
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 px-2 text-xs">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-7 px-2 text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Mail className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Full height scrollable, no horizontal padding */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-2">
          {/* Response Summary */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-2.5">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-gray-900">
                      {(response as any).form_title || 'Untitled Form'}
                    </h2>
                    <p className="text-[10px] text-gray-500">ID: {responseId.substring(0, 8)}</p>
                  </div>
                </div>
                <Badge className={cn("capitalize text-[10px] px-1.5 py-0.5", getStatusColor(response.status))}>
                  {response.status}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1.5 border-t text-[10px]">
                <div>
                  <div className="flex items-center gap-0.5 text-gray-500 mb-0.5">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>Submitted</span>
                  </div>
                  <div className="font-medium text-gray-900 text-xs">
                    {response.submitted_at ? new Date(response.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                  <div className="text-gray-500">
                    {response.submitted_at ? new Date(response.submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5 text-gray-500 mb-0.5">
                    <User className="h-2.5 w-2.5" />
                    <span>By</span>
                  </div>
                  <div className="font-medium text-gray-900 truncate text-xs">
                    {response.submitted_by || 'Anonymous'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5 text-gray-500 mb-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>Answers</span>
                  </div>
                  <div className="font-medium text-gray-900 text-xs">
                    {items.filter((item: any) => item.answer).length} / {items.length}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5 text-gray-500 mb-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span>Updated</span>
                  </div>
                  <div className="font-medium text-gray-900 text-xs">
                    {response.updated_at ? new Date(response.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <Card>
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-2 pb-1.5 border-b">
                <FileText className="h-3 w-3 text-gray-600" />
                <h3 className="text-[10px] font-semibold text-gray-900 uppercase tracking-wide">Responses</h3>
              </div>

              <div className="space-y-0.5">
                {items.length > 0 ? (
                  items.map((item: any) => renderResponseItem(item))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="h-5 w-5 mx-auto mb-1 opacity-50" />
                    <p className="text-[10px]">No answers recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
