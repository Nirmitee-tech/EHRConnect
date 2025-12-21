'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Plus, Search, MoreVertical, Loader2, Trash2, Edit, X, Save,
  Layers, Info, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// This is a placeholder for the actual EducationModule interface
// In a real app, this would be imported from a shared types directory
interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'warning_signs' | 'medications' | 'labor_prep' | 'breastfeeding' | 'newborn_care' | 'mental_health';
  trimester: '1' | '2' | '3' | 'all' | 'postpartum';
  contentType: 'video' | 'article' | 'checklist' | 'interactive';
  duration: string;
  required: boolean;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

function PatientEducationSettingsPage() {
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/education-modules');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Failed to fetch education modules', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const handleSelectModule = (module: EducationModule) => {
    setSelectedModule(module);
    setIsNew(false);
  };

  const handleNewModule = () => {
    setSelectedModule({} as EducationModule);
    setIsNew(true);
  };
  
  const handleSave = async (module: Partial<EducationModule>) => {
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/education-modules' : `/api/education-modules/${module.id}`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(module),
        });
        if (!response.ok) {
            throw new Error('Save failed');
        }
        const savedModule = await response.json();
        if (isNew) {
            setModules([...modules, savedModule]);
        } else {
            setModules(modules.map(m => m.id === savedModule.id ? savedModule : m));
        }
        setSelectedModule(null);
        setIsNew(false);
    } catch (error) {
        console.error('Failed to save module', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
        const response = await fetch(`/api/education-modules/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        setModules(modules.filter(m => m.id !== id));
        setSelectedModule(null);
        setIsNew(false);
    } catch (error) {
        console.error('Failed to delete module', error);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-gray-50/50">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Education Modules</h2>
            <Button size="sm" onClick={handleNewModule}><Plus className="h-4 w-4 mr-2" /> New</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search modules..." className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <Loader2 className="animate-spin m-auto" /> : modules.map(module => (
            <ModuleListItem 
              key={module.id} 
              module={module}
              isSelected={selectedModule?.id === module.id}
              onSelect={() => handleSelectModule(module)}
            />
          ))}
        </div>
      </div>
      <div className="w-2/3 flex-1 overflow-y-auto p-6">
        {selectedModule ? (
          <ModuleEditForm 
            module={selectedModule} 
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => { setSelectedModule(null); setIsNew(false); }}
            isNew={isNew}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Layers className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Module Selected</h3>
            <p>Select a module from the list to edit, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleListItem({ module, isSelected, onSelect }: { module: EducationModule; isSelected: boolean; onSelect: () => void; }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100",
        isSelected && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <h3 className="font-semibold">{module.title || 'Untitled'}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{module.description || 'No description'}</p>
    </div>
  );
}

function ModuleEditForm({ module, onSave, onDelete, onCancel, isNew }: { module: Partial<EducationModule>, onSave: (module: Partial<EducationModule>) => void, onDelete: (id: string) => void, onCancel: () => void, isNew: boolean }) {
  const [editedModule, setEditedModule] = useState(module);

  useEffect(() => {
    setEditedModule(module);
  }, [module]);

  const handleChange = (field: keyof EducationModule, value: any) => {
    setEditedModule(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-bold">{isNew ? "Create New Module" : "Edit Module"}</h2>
                <p className="text-gray-500">Manage the details of the education module.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(editedModule)}><Save className="h-4 w-4 mr-2"/> Save</Button>
            </div>
        </div>

        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Core Information</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={editedModule.title || ''} onChange={e => handleChange('title', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={editedModule.description || ''} onChange={e => handleChange('description', e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={editedModule.category} onValueChange={v => handleChange('category', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nutrition">Nutrition</SelectItem>
                                <SelectItem value="exercise">Exercise</SelectItem>
                                <SelectItem value="warning_signs">Warning Signs</SelectItem>
                                <SelectItem value="medications">Medications</SelectItem>
                                <SelectItem value="labor_prep">Labor Prep</SelectItem>
                                <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                                <SelectItem value="newborn_care">Newborn Care</SelectItem>
                                <SelectItem value="mental_health">Mental Health</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="trimester">Trimester</Label>
                        <Select value={editedModule.trimester} onValueChange={v => handleChange('trimester', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="postpartum">Postpartum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="contentType">Content Type</Label>
                        <Select value={editedModule.contentType} onValueChange={v => handleChange('contentType', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="checklist">Checklist</SelectItem>
                                <SelectItem value="interactive">Interactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" value={editedModule.duration || ''} onChange={e => handleChange('duration', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="url">URL</Label>
                        <Input id="url" value={editedModule.url || ''} onChange={e => handleChange('url', e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="required" checked={editedModule.required} onCheckedChange={c => handleChange('required', c)} />
                        <Label htmlFor="required">Required</Label>
                    </div>
                </div>
            </div>
        </div>

        {!isNew && editedModule.id && (
             <div className="mt-8 pt-8 border-t border-red-200">
                <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">Delete this module</h4>
                        <p className="text-sm text-red-700">This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" onClick={() => editedModule.id && onDelete(editedModule.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Module
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}

export default PatientEducationSettingsPage;
