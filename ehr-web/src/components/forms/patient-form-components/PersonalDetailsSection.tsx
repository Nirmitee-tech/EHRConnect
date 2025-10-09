import React from 'react';
import { User } from 'lucide-react';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nirmitee.io/design-system';
import { FormSection } from './FormSection';
import { ErrorMessage } from './ErrorMessage';
import { PhotoUpload } from './PhotoUpload';

interface PersonalDetailsSectionProps {
  formData: any;
  errors: any;
  onUpdateField: (field: string, value: any) => void;
  photoPreview: string;
  onPhotoChange: (photo: string) => void;
}

export function PersonalDetailsSection({
  formData,
  errors,
  onUpdateField,
  photoPreview,
  onPhotoChange
}: PersonalDetailsSectionProps) {
  return (
    <FormSection title="Personal Details" icon={User}>
      <PhotoUpload photoPreview={photoPreview} onPhotoChange={onPhotoChange} />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label htmlFor="prefix" className="text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-4 gap-2">
            <Select
              value={formData.prefix}
              onValueChange={(value) => onUpdateField('prefix', value)}
            >
              <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onUpdateField('firstName', e.target.value)}
              className={`col-span-3 h-9 text-sm rounded-lg border transition-all ${
                errors.firstName
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-primary'
              }`}
              placeholder="Full name"
            />
          </div>
          <ErrorMessage error={errors.firstName} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => onUpdateField('gender', value)}
          >
            <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
            Date of birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onUpdateField('dateOfBirth', e.target.value)}
            className={`h-9 text-sm rounded-lg border transition-all ${
              errors.dateOfBirth
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-primary'
            }`}
            placeholder="dd/mm/yyyy"
          />
          <ErrorMessage error={errors.dateOfBirth} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="relation" className="text-sm font-medium text-gray-700">
            Relation
          </Label>
          <Select
            value={formData.relation}
            onValueChange={(value) => onUpdateField('relation', value)}
          >
            <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S/o">S/o</SelectItem>
              <SelectItem value="D/o">D/o</SelectItem>
              <SelectItem value="W/o">W/o</SelectItem>
              <SelectItem value="H/o">H/o</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
            Hospital Id
          </Label>
          <Input
            id="hospitalId"
            value={formData.hospitalId}
            onChange={(e) => onUpdateField('hospitalId', e.target.value)}
            className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
            placeholder="Hospital ID"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="healthId" className="text-sm font-medium text-gray-700">
            Health Id
          </Label>
          <Input
            id="healthId"
            value={formData.healthId}
            onChange={(e) => onUpdateField('healthId', e.target.value)}
            className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
            placeholder="Health ID"
          />
        </div>
      </div>
    </FormSection>
  );
}
