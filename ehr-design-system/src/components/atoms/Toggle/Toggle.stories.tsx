import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Atoms/Toggle',
  component: Toggle,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Toggle (Switch) component following Atlassian Design System patterns. Provides an accessible toggle interface with support for variants, sizes, labels, descriptions, and healthcare-specific use cases for settings, preferences, and binary choices.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        variant="default"
        label="Default toggle"
        defaultChecked
      />
      <Toggle 
        variant="success"
        label="Success toggle"
        defaultChecked
      />
      <Toggle 
        variant="warning"
        label="Warning toggle"
        defaultChecked
      />
      <Toggle 
        variant="danger"
        label="Danger toggle"
        defaultChecked
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        size="sm"
        label="Small toggle"
        defaultChecked
      />
      <Toggle 
        size="md"
        label="Medium toggle (default)"
        defaultChecked
      />
      <Toggle 
        size="lg"
        label="Large toggle"
        defaultChecked
      />
    </div>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        label="Label on the right (default)"
        labelPosition="right"
        defaultChecked
      />
      <Toggle 
        label="Label on the left"
        labelPosition="left"
        defaultChecked
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        label="Email notifications"
        description="Receive email alerts for important updates"
      />
      <Toggle 
        label="SMS alerts"
        description="Get text message notifications for urgent matters"
        defaultChecked
      />
      <Toggle 
        label="Push notifications"
        description="Show notifications on your mobile device"
        labelPosition="left"
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        label="Valid setting"
        variant="success"
        description="This setting is properly configured"
        defaultChecked
      />
      <Toggle 
        label="Warning setting"
        variant="warning"
        description="This setting may impact performance"
        defaultChecked
      />
      <Toggle 
        label="Error setting"
        variant="danger"
        error="This setting is causing issues"
        defaultChecked
      />
      <Toggle 
        label="Required setting"
        description="This setting is required for proper operation"
        required
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <Toggle 
        label="Unchecked state"
        description="Toggle is currently off"
      />
      <Toggle 
        label="Checked state"
        description="Toggle is currently on"
        defaultChecked
      />
      <Toggle 
        label="Disabled unchecked"
        description="Cannot be toggled"
        disabled
      />
      <Toggle 
        label="Disabled checked"
        description="Cannot be toggled"
        disabled
        defaultChecked
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Preferences</h3>
        <div className="space-y-4">
          <Toggle 
            label="Receive appointment reminders"
            description="Get notifications 24 hours before appointments"
            variant="success"
            defaultChecked
          />
          <Toggle 
            label="Share data with family"
            description="Allow designated family members to access health information"
            labelPosition="left"
          />
          <Toggle 
            label="Medication adherence tracking"
            description="Enable automatic medication reminders and tracking"
            variant="warning"
            defaultChecked
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Alerts</h3>
        <div className="space-y-4">
          <Toggle 
            label="Critical lab values"
            description="Alert when lab values exceed critical thresholds"
            variant="danger"
            defaultChecked
            size="sm"
          />
          <Toggle 
            label="Drug interaction warnings"
            description="Show alerts for potential drug interactions"
            variant="warning"
            defaultChecked
            size="sm"
          />
          <Toggle 
            label="Allergy alerts"
            description="Display patient allergy warnings during prescribing"
            variant="danger"
            defaultChecked
            size="sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Care Team Settings</h3>
        <div className="space-y-4">
          <Toggle 
            label="Real-time patient updates"
            description="Notify care team of patient status changes"
            variant="success"
            defaultChecked
          />
          <Toggle 
            label="Shift handoff alerts"
            description="Enable notifications for shift changes"
            labelPosition="left"
            defaultChecked
          />
          <Toggle 
            label="Emergency contact notifications"
            description="Automatically notify emergency contacts when needed"
            variant="warning"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
        <div className="space-y-4">
          <Toggle 
            label="Auto-save clinical notes"
            description="Automatically save notes every 30 seconds"
            variant="success"
            defaultChecked
            size="lg"
          />
          <Toggle 
            label="Voice recognition"
            description="Enable voice-to-text for faster documentation"
            size="lg"
          />
          <Toggle 
            label="Offline mode"
            description="Allow limited functionality when internet is unavailable"
            variant="warning"
            size="lg"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
        <div className="space-y-4">
          <Toggle 
            label="Two-factor authentication"
            description="Require additional verification for login"
            variant="success"
            defaultChecked
            labelPosition="left"
          />
          <Toggle 
            label="Session timeout"
            description="Automatically log out after 15 minutes of inactivity"
            variant="warning"
            defaultChecked
            labelPosition="left"
          />
          <Toggle 
            label="Audit logging"
            description="Track all access to patient information"
            variant="danger"
            defaultChecked
            labelPosition="left"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Monitoring</h3>
        <div className="space-y-4">
          <Toggle 
            label="Vital signs monitoring"
            description="Continuous monitoring of patient vital signs"
            variant="success"
            defaultChecked
          />
          <Toggle 
            label="Fall risk alerts"
            description="Monitor and alert for high fall risk patients"
            variant="warning"
            defaultChecked
          />
          <Toggle 
            label="Pain assessment reminders"
            description="Regular prompts for pain level assessments"
          />
          <Toggle 
            label="Medication administration alerts"
            description="Alerts for scheduled medication times"
            variant="danger"
            defaultChecked
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      notifications: true,
      autoSave: false,
      realTimeUpdates: true,
      voiceRecognition: false,
      twoFactorAuth: true,
      sessionTimeout: true,
      auditLogging: true,
      emergencyAlerts: false,
    });

    const handleToggleChange = (key: string) => (checked: boolean) => {
      setSettings(prev => ({ ...prev, [key]: checked }));
    };

    const getSecurityScore = () => {
      const securityFeatures = ['twoFactorAuth', 'sessionTimeout', 'auditLogging'];
      const enabledCount = securityFeatures.filter(key => settings[key as keyof typeof settings]).length;
      return Math.round((enabledCount / securityFeatures.length) * 100);
    };

    const getProductivityScore = () => {
      const productivityFeatures = ['autoSave', 'realTimeUpdates', 'voiceRecognition'];
      const enabledCount = productivityFeatures.filter(key => settings[key as keyof typeof settings]).length;
      return Math.round((enabledCount / productivityFeatures.length) * 100);
    };

    const securityScore = getSecurityScore();
    const productivityScore = getProductivityScore();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
            <div className="space-y-4">
              <Toggle 
                label="Email notifications"
                description="Receive email alerts for updates"
                checked={settings.notifications}
                onCheckedChange={handleToggleChange('notifications')}
                variant="success"
              />
              <Toggle 
                label="Auto-save documents"
                description="Automatically save changes every 30 seconds"
                checked={settings.autoSave}
                onCheckedChange={handleToggleChange('autoSave')}
                variant="warning"
              />
              <Toggle 
                label="Real-time updates"
                description="Show live updates from other users"
                checked={settings.realTimeUpdates}
                onCheckedChange={handleToggleChange('realTimeUpdates')}
              />
              <Toggle 
                label="Voice recognition"
                description="Enable voice-to-text input"
                checked={settings.voiceRecognition}
                onCheckedChange={handleToggleChange('voiceRecognition')}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <Toggle 
                label="Two-factor authentication"
                description="Additional security for login"
                checked={settings.twoFactorAuth}
                onCheckedChange={handleToggleChange('twoFactorAuth')}
                variant="success"
                labelPosition="left"
              />
              <Toggle 
                label="Session timeout"
                description="Auto-logout after inactivity"
                checked={settings.sessionTimeout}
                onCheckedChange={handleToggleChange('sessionTimeout')}
                variant="warning"
                labelPosition="left"
              />
              <Toggle 
                label="Audit logging"
                description="Track all system access"
                checked={settings.auditLogging}
                onCheckedChange={handleToggleChange('auditLogging')}
                variant="danger"
                labelPosition="left"
              />
              <Toggle 
                label="Emergency alerts"
                description="Critical system notifications"
                checked={settings.emergencyAlerts}
                onCheckedChange={handleToggleChange('emergencyAlerts')}
                variant="danger"
                labelPosition="left"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Settings Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-sm">
              <span className="font-medium">Security Score:</span>{' '}
              <span className={`font-semibold ${
                securityScore >= 80 ? 'text-success' :
                securityScore >= 60 ? 'text-warning' : 'text-danger'
              }`}>
                {securityScore}%
              </span>
              <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    securityScore >= 80 ? 'bg-success' :
                    securityScore >= 60 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Productivity Score:</span>{' '}
              <span className={`font-semibold ${
                productivityScore >= 80 ? 'text-success' :
                productivityScore >= 60 ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {productivityScore}%
              </span>
              <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    productivityScore >= 80 ? 'bg-success' :
                    productivityScore >= 60 ? 'bg-warning' : 'bg-muted-foreground'
                  }`}
                  style={{ width: `${productivityScore}%` }}
                />
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Total Features:</span>{' '}
              <span className="font-semibold">
                {Object.values(settings).filter(Boolean).length}/8 enabled
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Active Features:</span>
                <ul className="mt-1 space-y-1 text-xs">
                  {Object.entries(settings)
                    .filter(([_, enabled]) => enabled)
                    .map(([key, _]) => (
                      <li key={key} className="flex items-center text-success">
                        <span className="mr-2">✓</span>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <span className="font-medium">Inactive Features:</span>
                <ul className="mt-1 space-y-1 text-xs">
                  {Object.entries(settings)
                    .filter(([_, enabled]) => !enabled)
                    .map(([key, _]) => (
                      <li key={key} className="flex items-center text-muted-foreground">
                        <span className="mr-2">○</span>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            
            {securityScore < 80 && (
              <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/20 text-warning text-xs">
                💡 Consider enabling more security features to improve your security score
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};