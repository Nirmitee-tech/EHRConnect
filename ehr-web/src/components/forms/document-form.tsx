'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { ClinicalService } from '@/services/clinical.service';
import { DOCUMENT_TYPES, DOCUMENT_STATUS, DOCUMENT_CATEGORIES } from '@/constants/clinical.constants';

interface DocumentFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DocumentForm({ patientId, patientName, onSuccess, onCancel }: DocumentFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    typeCode: '',
    typeDisplay: '',
    category: 'clinical-note',
    status: 'current',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    content: '',
    fileAttachment: null as File | null
  });

  const handleTypeChange = (code: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.code === code);
    if (docType) {
      setFormData({
        ...formData,
        typeCode: code,
        typeDisplay: docType.display
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, fileAttachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.typeCode || !formData.title) {
      alert('Please provide document type and title');
      return;
    }

    setSaving(true);
    try {
      await ClinicalService.createDocumentReference(patientId, patientName, formData);
      onSuccess();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Document Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Document Information</h3>

          <div>
            <Label>Document Type <span className="text-red-500">*</span></Label>
            <Select
              value={formData.typeCode}
              onValueChange={handleTypeChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Document Title <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g., Annual Physical Exam, Follow-up Visit Note"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              placeholder="Brief description of the document"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Document Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Document Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Document Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Author / Provider</Label>
              <Input
                placeholder="e.g., Dr. Smith"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Document Content Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Document Content</h3>

          <div>
            <Label>Document Text / Notes</Label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={8}
              placeholder="Enter document content, clinical notes, findings, or summary..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the main content of the document here
            </p>
          </div>

          <div>
            <Label>File Attachment (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to upload file
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
              </p>
              {formData.fileAttachment && (
                <p className="text-xs text-green-600 mt-2">
                  Selected: {formData.fileAttachment.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Add Document'
          )}
        </Button>
      </div>
    </form>
  );
}
