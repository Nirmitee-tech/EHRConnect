'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { IntegrationConfigSchema, IntegrationStep, IntegrationCredential } from '@/types/integration';

interface IntegrationConfigWizardProps {
  schema: IntegrationConfigSchema;
  onComplete: (data: Record<string, string | boolean | number>) => void;
  onCancel: () => void;
  initialData?: Record<string, string | boolean | number>;
}

export function IntegrationConfigWizard({
  schema,
  onComplete,
  onCancel,
  initialData = {}
}: IntegrationConfigWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | boolean | number>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = schema.steps || [];
  const totalSteps = steps.length;

  const validateField = (field: IntegrationCredential, value: string | boolean | number): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.validation && typeof value === 'string') {
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        return field.validation.message || `Invalid format for ${field.label}`;
      }
      if (field.validation.min && value.length < field.validation.min) {
        return `${field.label} must be at least ${field.validation.min} characters`;
      }
      if (field.validation.max && value.length > field.validation.max) {
        return `${field.label} must be less than ${field.validation.max} characters`;
      }
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    const step = steps[currentStep];
    const newErrors: Record<string, string> = {};

    step.fields.forEach(field => {
      // Check if field depends on another field
      if (field.dependsOn) {
        const dependentValue = formData[field.dependsOn.field];
        if (dependentValue !== field.dependsOn.value) {
          return; // Skip validation if dependency not met
        }
      }

      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleFieldChange = (key: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const renderField = (field: IntegrationCredential) => {
    // Check if field should be shown based on dependencies
    if (field.dependsOn) {
      const dependentValue = formData[field.dependsOn.field];
      if (dependentValue !== field.dependsOn.value) {
        return null;
      }
    }

    const value = formData[field.key] ?? field.defaultValue ?? '';
    const error = errors[field.key];

    const baseInputClasses = `w-full px-3 py-2 border rounded-lg transition-colors ${
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    } focus:ring-2 focus:outline-none`;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={String(value)}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseInputClasses} min-h-[100px]`}
              rows={4}
            />
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={String(value)}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={baseInputClasses}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {field.label}
                </div>
                {field.helpText && <p className="text-xs text-gray-500 mt-0.5">{field.helpText}</p>}
              </div>
            </label>
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1 ml-7">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={String(value)}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              className={baseInputClasses}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={String(value)}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {totalSteps > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-gray-500">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-xs ${
                  index < currentStep
                    ? 'text-blue-600'
                    : index === currentStep
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    index === currentStep ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
                  }`}>
                    {index + 1}
                  </span>
                )}
                <span className="hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current step content */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{currentStepData.title}</h3>
          {currentStepData.description && (
            <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {currentStepData.fields.map(renderField)}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:opacity-90 rounded-lg transition-colors flex items-center gap-2"
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
