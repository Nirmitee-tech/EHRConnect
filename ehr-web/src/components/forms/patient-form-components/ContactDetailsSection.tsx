import React from 'react';
import { Mail } from 'lucide-react';
import { Input, Label } from '@ehrconnect/design-system';
import { FormSection } from './FormSection';
import { ErrorMessage } from './ErrorMessage';

interface ContactDetailsSectionProps {
  formData: any;
  errors: any;
  onUpdateField: (field: string, value: any) => void;
  onUpdateAddress: (field: string, value: any) => void;
}

export function ContactDetailsSection({
  formData,
  errors,
  onUpdateField,
  onUpdateAddress
}: ContactDetailsSectionProps) {
  return (
    <FormSection title="Contact Details" icon={Mail}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onUpdateField('phone', e.target.value)}
            className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
            placeholder="Phone number"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdateField('email', e.target.value)}
            className={`h-9 text-sm rounded-lg border transition-all ${
              errors.email
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-primary'
            }`}
            placeholder="Email"
          />
          <ErrorMessage error={errors.email} />
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <Label htmlFor="addressLine" className="text-sm font-medium text-gray-700">
          Address
        </Label>
        <Input
          id="addressLine"
          value={formData.address.line[0]}
          onChange={(e) => onUpdateAddress('line', e.target.value)}
          className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
          placeholder="Address"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
          Pincode
        </Label>
        <Input
          id="postalCode"
          value={formData.address.postalCode}
          onChange={(e) => onUpdateAddress('postalCode', e.target.value)}
          className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary"
          placeholder="Pincode"
        />
      </div>
    </FormSection>
  );
}
