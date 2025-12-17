/**
 * Step Editor Component
 * Edit current step properties, navigation settings, and validation rules
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings2, Navigation, ShieldCheck } from 'lucide-react';
import { StepRuleBuilder } from './StepRuleBuilder';
import { formsService } from '@/services/forms.service';
import type {
  StepRule,
  CreateStepRuleRequest,
  RuleTestResult,
} from '@/types/forms';

export function StepEditor() {
  const { steps, currentStepIndex, updateStep } = useFormBuilderStore();
  const currentStep = steps[currentStepIndex];
  const [stepRules, setStepRules] = useState<StepRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Load rules when step changes
  useEffect(() => {
    if (currentStep?.id) {
      loadStepRules();
    }
  }, [currentStep?.id]);

  const loadStepRules = async () => {
    if (!currentStep?.id) return;

    try {
      setRulesLoading(true);
      const response = await formsService.getStepRules(currentStep.id);
      setStepRules(response.rules || []);
    } catch (error) {
      console.error('Failed to load step rules:', error);
    } finally {
      setRulesLoading(false);
    }
  };

  const handleCreateRule = async (ruleData: CreateStepRuleRequest) => {
    if (!currentStep?.id) return;

    try {
      await formsService.createStepRule(currentStep.id, ruleData);
      await loadStepRules(); // Reload rules
    } catch (error) {
      console.error('Failed to create rule:', error);
      throw error;
    }
  };

  const handleUpdateRule = async (ruleId: string, ruleData: Partial<StepRule>) => {
    if (!currentStep?.id) return;

    try {
      await formsService.updateStepRule(currentStep.id, ruleId, ruleData);
      await loadStepRules(); // Reload rules
    } catch (error) {
      console.error('Failed to update rule:', error);
      throw error;
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!currentStep?.id) return;

    try {
      await formsService.deleteStepRule(currentStep.id, ruleId);
      await loadStepRules(); // Reload rules
    } catch (error) {
      console.error('Failed to delete rule:', error);
      throw error;
    }
  };

  const handleTestRule = async (ruleId: string, mockData: Record<string, any>): Promise<RuleTestResult> => {
    if (!currentStep?.id) throw new Error('No step selected');

    try {
      return await formsService.testStepRule(currentStep.id, ruleId, mockData);
    } catch (error) {
      console.error('Failed to test rule:', error);
      throw error;
    }
  };

  if (!currentStep) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No step selected</p>
          <p className="text-sm mt-2">Select a step from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  const handleTitleChange = (value: string) => {
    updateStep(currentStep.id, { title: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateStep(currentStep.id, { description: value });
  };

  const handleNavigationChange = (key: keyof typeof currentStep.navigationConfig, value: boolean) => {
    updateStep(currentStep.id, {
      navigationConfig: {
        ...currentStep.navigationConfig,
        [key]: value,
      },
    });
  };

  const handleValidationChange = (key: keyof typeof currentStep.validationConfig, value: boolean) => {
    updateStep(currentStep.id, {
      validationConfig: {
        ...currentStep.validationConfig,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted/30">
      {/* Active Step Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-6 py-3 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
              {currentStepIndex + 1}
            </div>
            <div>
              <div className="text-sm font-semibold">{currentStep.title || 'Untitled Step'}</div>
              <div className="text-xs opacity-80">Step Configuration</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Step Header Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Step Information
            </CardTitle>
            <CardDescription>
              Configure the title and description for this step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step-title" className="text-sm font-medium">
                Step Title *
              </Label>
              <Input
                id="step-title"
                value={currentStep.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter step title..."
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                A clear, concise title for this step (e.g., "Personal Information", "Medical History")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="step-description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="step-description"
                value={currentStep.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Provide instructions or context for this step..."
                rows={3}
                className="text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional instructions or context to help users complete this step
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Navigation Settings
            </CardTitle>
            <CardDescription>
              Control how users can navigate through this step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="allow-back" className="text-sm font-medium">
                  Allow Back Navigation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let users go back to previous steps
                </p>
              </div>
              <Switch
                id="allow-back"
                checked={currentStep.navigationConfig.allowBack}
                onCheckedChange={(checked) => handleNavigationChange('allowBack', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="allow-skip" className="text-sm font-medium">
                  Allow Skip Step
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let users skip this step if not required
                </p>
              </div>
              <Switch
                id="allow-skip"
                checked={currentStep.navigationConfig.allowSkip}
                onCheckedChange={(checked) => handleNavigationChange('allowSkip', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Validation Settings
            </CardTitle>
            <CardDescription>
              Configure validation rules for this step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="validate-on-next" className="text-sm font-medium">
                  Validate on Next
                </Label>
                <p className="text-xs text-muted-foreground">
                  Validate all fields before allowing navigation to next step
                </p>
              </div>
              <Switch
                id="validate-on-next"
                checked={currentStep.validationConfig.validateOnNext}
                onCheckedChange={(checked) => handleValidationChange('validateOnNext', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step Validation Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Step Validation Rules</CardTitle>
            <CardDescription>
              Advanced rules for validation, visibility, and navigation logic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StepRuleBuilder
              stepId={currentStep.id}
              rules={stepRules}
              onCreateRule={handleCreateRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onTestRule={handleTestRule}
            />
          </CardContent>
        </Card>

        {/* Form Fields Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>
              Fields assigned to this step ({currentStep.fields?.length || 0} fields)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep.fields?.length > 0 ? (
              <div className="space-y-2">
                {currentStep.fields.map((field) => (
                  <div
                    key={field.linkId}
                    className="p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{field.text || field.linkId}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Type: {field.type}
                          {field.required && <span className="ml-2 text-destructive">*</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No fields assigned to this step yet</p>
                <p className="text-xs mt-2">Drag fields from the component palette to add them</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
