'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Loader2,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formsService } from '@/services/forms.service';
import type { FormResponse } from '@/types/forms';
import { SidebarToggle } from '@/components/forms/sidebar-toggle';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function GlobalResponsesPage() {
    const router = useRouter();
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

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

        loadResponses();
    }, [statusFilter]);

    const loadResponses = async () => {
        try {
            setLoading(true);
            const params: any = { pageSize: 100 };
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const result = await formsService.listResponses(params);
            setResponses(result.responses);
        } catch (error) {
            console.error('Failed to load responses:', error);
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

    const filteredResponses = responses.filter(response => {
        const matchesSearch = searchQuery === '' ||
            (response as any).form_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            response.submitted_by?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SidebarToggle />
                        <Button variant="ghost" size="sm" onClick={() => router.push('/forms')} className="h-8 w-8 p-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-base font-semibold text-gray-900">Form Submissions</h1>
                        <div className="relative ml-4">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <Input
                                placeholder="Search responses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-7 w-64 h-8 text-sm bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 h-8">
                                    <Filter className="h-3.5 w-3.5" />
                                    {statusFilter === 'all' ? 'All Status' : statusFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {['all', 'completed', 'in-progress', 'amended'].map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className="capitalize"
                                    >
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm" className="gap-2 h-8">
                            <Download className="h-3.5 w-3.5" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredResponses.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center py-16">
                        <div className="text-gray-400 mb-4">
                            <FileText className="h-12 w-12 opacity-20" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">No submissions found</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'Try adjusting your search' : 'Form responses will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResponses.map((response) => (
                                    <tr
                                        key={response.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/forms/responses/${response.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded text-blue-600">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {(response as any).form_title || 'Untitled Form'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {response.id.substring(0, 8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn("capitalize font-normal", getStatusColor(response.status))}>
                                                {response.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                {response.submitted_by || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {new Date(response.submitted_at || response.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 pl-5.5">
                                                {new Date(response.submitted_at || response.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
