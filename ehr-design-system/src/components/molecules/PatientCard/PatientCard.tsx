import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Card } from '../../atoms/Card/Card';
import { Badge } from '../../atoms/Badge/Badge';
import { Typography } from '../../atoms/Typography/Typography';
import { Flex } from '../../atoms/Grid/Grid';

const patientCardVariants = cva(
  'transition-all duration-200 hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-white border-border',
        urgent: 'bg-danger-50 border-danger-200 shadow-danger-sm',
        warning: 'bg-warning-50 border-warning-200 shadow-warning-sm',
        stable: 'bg-success-50 border-success-200 shadow-success-sm',
      },
      size: {
        compact: 'p-3',
        default: 'p-4',
        detailed: 'p-6',
      },
      interactive: {
        true: 'hover:shadow-lg cursor-pointer hover:-translate-y-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
    },
  }
);

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mrn?: string; // Medical Record Number
  room?: string;
  admissionDate?: string;
  status?: 'stable' | 'warning' | 'critical' | 'discharged';
  department?: string;
  primaryPhysician?: string;
  allergies?: string[];
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  alerts?: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  profileImage?: string;
}

export interface PatientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof patientCardVariants> {
  patient: Patient;
  showVitals?: boolean;
  showAlerts?: boolean;
  showAllergies?: boolean;
  onPatientClick?: (patient: Patient) => void;
  actions?: React.ReactNode;
}

const PatientCard = React.forwardRef<HTMLDivElement, PatientCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive = false,
    patient, 
    showVitals = true, 
    showAlerts = true,
    showAllergies = true,
    onPatientClick,
    actions,
    ...props 
  }, ref) => {
    const getStatusVariant = (status?: string) => {
      switch (status) {
        case 'critical':
          return 'urgent';
        case 'warning':
          return 'warning';
        case 'stable':
          return 'stable';
        default:
          return variant || 'default';
      }
    };

    const getStatusBadgeVariant = (status?: string) => {
      switch (status) {
        case 'critical':
          return 'destructive';
        case 'warning':
          return 'warning';
        case 'stable':
          return 'success';
        case 'discharged':
          return 'secondary';
        default:
          return 'default';
      }
    };

    const getGenderIcon = (gender: string) => {
      switch (gender.toLowerCase()) {
        case 'male':
          return '♂';
        case 'female':
          return '♀';
        default:
          return '⚬';
      }
    };

    const actualVariant = getStatusVariant(patient.status);
    const isInteractive = interactive || !!onPatientClick;

    const handleClick = () => {
      if (onPatientClick) {
        onPatientClick(patient);
      }
    };

    return (
      <Card
        className={cn(
          patientCardVariants({ 
            variant: actualVariant, 
            size, 
            interactive: isInteractive 
          }),
          className
        )}
        onClick={isInteractive ? handleClick : undefined}
        ref={ref}
        {...props}
      >
        {/* Header with basic info */}
        <Flex justify="between" align="start" className="mb-3">
          <div className="flex items-start space-x-3 flex-1">
            {/* Patient Avatar */}
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg flex-shrink-0">
              {patient.profileImage ? (
                <img 
                  src={patient.profileImage} 
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              )}
            </div>
            
            {/* Patient Details */}
            <div className="flex-1 min-w-0">
              <Flex justify="between" align="start" className="mb-1">
                <div>
                  <Typography variant="body-default-medium" className="truncate">
                    {patient.name}
                  </Typography>
                  <Flex align="center" gap={2} className="mt-1">
                    <Typography variant="body-small" color="muted">
                      {getGenderIcon(patient.gender)} {patient.age}y
                    </Typography>
                    {patient.mrn && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Typography variant="body-small" color="muted">
                          MRN: {patient.mrn}
                        </Typography>
                      </>
                    )}
                  </Flex>
                </div>
                
                {patient.status && (
                  <Badge variant={getStatusBadgeVariant(patient.status)} size="sm">
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </Badge>
                )}
              </Flex>
              
              {/* Room and Department */}
              {(patient.room || patient.department) && (
                <Flex align="center" gap={2} className="mb-2">
                  {patient.room && (
                    <Typography variant="body-small" color="muted">
                      Room {patient.room}
                    </Typography>
                  )}
                  {patient.room && patient.department && (
                    <span className="text-gray-300">•</span>
                  )}
                  {patient.department && (
                    <Typography variant="body-small" color="muted">
                      {patient.department}
                    </Typography>
                  )}
                </Flex>
              )}
              
              {/* Primary Physician */}
              {patient.primaryPhysician && (
                <Typography variant="body-small" color="muted">
                  Dr. {patient.primaryPhysician}
                </Typography>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </Flex>

        {/* Alerts */}
        {showAlerts && patient.alerts && patient.alerts.length > 0 && (
          <div className="mb-3">
            <div className="space-y-1">
              {patient.alerts.slice(0, 2).map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    {
                      'bg-danger-100 text-danger-700': alert.type === 'critical',
                      'bg-warning-100 text-warning-700': alert.type === 'warning',
                      'bg-info-100 text-info-700': alert.type === 'info',
                    }
                  )}
                >
                  {alert.message}
                </div>
              ))}
              {patient.alerts.length > 2 && (
                <Typography variant="body-small" color="muted">
                  +{patient.alerts.length - 2} more alerts
                </Typography>
              )}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        {showVitals && patient.vitals && (
          <div className="mb-3">
            <Typography variant="body-small-medium" className="mb-2">
              Vital Signs
            </Typography>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {patient.vitals.heartRate && (
                <div className="text-center">
                  <Typography variant="body-small" color="heart-rate" className="font-medium">
                    {patient.vitals.heartRate}
                  </Typography>
                  <Typography variant="body-small" color="muted">
                    HR
                  </Typography>
                </div>
              )}
              {patient.vitals.bloodPressure && (
                <div className="text-center">
                  <Typography variant="body-small" color="blood-pressure" className="font-medium">
                    {patient.vitals.bloodPressure}
                  </Typography>
                  <Typography variant="body-small" color="muted">
                    BP
                  </Typography>
                </div>
              )}
              {patient.vitals.temperature && (
                <div className="text-center">
                  <Typography variant="body-small" color="temperature" className="font-medium">
                    {patient.vitals.temperature}°F
                  </Typography>
                  <Typography variant="body-small" color="muted">
                    Temp
                  </Typography>
                </div>
              )}
              {patient.vitals.oxygenSaturation && (
                <div className="text-center">
                  <Typography variant="body-small" color="oxygen-sat" className="font-medium">
                    {patient.vitals.oxygenSaturation}%
                  </Typography>
                  <Typography variant="body-small" color="muted">
                    SpO2
                  </Typography>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Allergies */}
        {showAllergies && patient.allergies && patient.allergies.length > 0 && (
          <div>
            <Typography variant="body-small-medium" className="mb-1">
              Allergies
            </Typography>
            <div className="flex flex-wrap gap-1">
              {patient.allergies.slice(0, 3).map((allergy, index) => (
                <Badge key={index} variant="outline" size="sm">
                  {allergy}
                </Badge>
              ))}
              {patient.allergies.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{patient.allergies.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Admission Date */}
        {patient.admissionDate && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Typography variant="body-small" color="muted">
              Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
            </Typography>
          </div>
        )}
      </Card>
    );
  }
);

PatientCard.displayName = 'PatientCard';

export { PatientCard, patientCardVariants };