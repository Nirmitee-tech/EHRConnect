import axios from 'axios';
import { getApiHeaders } from './obgyn.service';
import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EducationModule {
    id: string;
    title: string;
    description?: string;
    category?: string;
    trimester?: string;
    contentType?: string;
    duration?: string;
    required?: boolean;
    url?: string;
    // status is not yet in the backend model, but UI had it. 
    // We will keep it in the type but it might not be saved unless we update backend.
    status?: 'draft' | 'active' | 'retired';
    createdAt?: string;
    updatedAt?: string;
}

function getAxiosConfig(headers: Record<string, string> = {}) {
    return {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
}

export async function getEducationModules(): Promise<EducationModule[]> {
    const session = await getSession();
    const headers = getApiHeaders(session);
    const response = await axios.get(`${API_BASE}/api/education-modules`, getAxiosConfig(headers));
    return response.data;
}

export async function createEducationModule(module: Omit<EducationModule, 'id' | 'createdAt' | 'updatedAt'>): Promise<EducationModule> {
    const session = await getSession();
    const headers = getApiHeaders(session);
    const response = await axios.post(`${API_BASE}/api/education-modules`, module, getAxiosConfig(headers));
    return response.data;
}

export async function updateEducationModule(module: EducationModule): Promise<EducationModule> {
    const session = await getSession();
    const headers = getApiHeaders(session);
    const response = await axios.put(`${API_BASE}/api/education-modules/${module.id}`, module, getAxiosConfig(headers));
    return response.data;
}

export async function deleteEducationModule(id: string): Promise<void> {
    const session = await getSession();
    const headers = getApiHeaders(session);
    await axios.delete(`${API_BASE}/api/education-modules/${id}`, getAxiosConfig(headers));
}
