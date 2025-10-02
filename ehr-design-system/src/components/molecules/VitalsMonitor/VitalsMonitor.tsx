import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Card } from '../../atoms/Card/Card';
import { Badge } from '../../atoms/Badge/Badge';
import { Typography } from '../../atoms/Typography/Typography';
import { Grid } from '../../atoms/Grid/Grid';

const vitalsMonitorVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white',
        compact: 'bg-white',
        dashboard: 'bg-gradient-to-br from-white to-gray-50',
      },
      status: {
        normal: 'border-success-200 shadow-success-sm',
        warning: 'border-warning-200 shadow-warning-sm',
        critical: 'border-danger-200 shadow-danger-md',
        offline: 'border-gray-200 bg-gray-50',
      },
      animated: {
        true: 'animate-pulse-slow',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      status: 'normal',
      animated: false,
    },
  }
);

const vitalCardVariants = cva(
  'text-center p-4 rounded-lg transition-all duration-200 hover:scale-105',
  {
    variants: {
      status: {
        normal: 'bg-success-50 border border-success-200',
        warning: 'bg-warning-50 border border-warning-200',
        critical: 'bg-danger-50 border border-danger-200 animate-heartbeat',
        offline: 'bg-gray-100 border border-gray-300 opacity-50',
      },
      size: {
        compact: 'p-2',
        default: 'p-4',
        large: 'p-6',
      },
    },
    defaultVariants: {
      status: 'normal',
      size: 'default',
    },
  }
);

export interface VitalSign {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  normalRange?: {
    min: number;
    max: number;
  };
  status: 'normal' | 'warning' | 'critical' | 'offline';
  timestamp?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: 'heart-rate' | 'blood-pressure' | 'temperature' | 'oxygen-sat' | 'blood-glucose';
}

export interface VitalsMonitorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof vitalsMonitorVariants> {
  vitals: VitalSign[];
  patientName?: string;
  lastUpdated?: string;
  showTrends?: boolean;
  showTimestamps?: boolean;
  showNormalRanges?: boolean;
  onVitalClick?: (vital: VitalSign) => void;
  refreshInterval?: number;
  compact?: boolean;
}

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up':
      return <span className="text-danger-500">↗</span>;
    case 'down':
      return <span className="text-success-500">↘</span>;
    case 'stable':
      return <span className="text-gray-500">→</span>;
    default:
      return null;
  }
};

const getOverallStatus = (vitals: VitalSign[]) => {
  if (vitals.some(v => v.status === 'critical')) return 'critical';
  if (vitals.some(v => v.status === 'warning')) return 'warning';
  if (vitals.every(v => v.status === 'offline')) return 'offline';
  return 'normal';
};

const VitalCard: React.FC<{
  vital: VitalSign;
  size?: 'compact' | 'default' | 'large';
  showTrend?: boolean;
  showTimestamp?: boolean;
  showNormalRange?: boolean;
  onClick?: () => void;
}> = ({ 
  vital, 
  size = 'default', 
  showTrend = true, 
  showTimestamp = false,
  showNormalRange = false,
  onClick 
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      className={cn(
        vitalCardVariants({ status: vital.status, size }),
        isClickable && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {vital.icon && <div className="text-lg">{vital.icon}</div>}
          {showTrend && vital.trend && getTrendIcon(vital.trend)}
        </div>
        <Badge
          variant={
            vital.status === 'critical' ? 'danger' :
            vital.status === 'warning' ? 'warning' :
            vital.status === 'offline' ? 'secondary' : 'success'
          }
          size="sm"
        >
          {vital.status.toUpperCase()}
        </Badge>
      </div>

      {/* Vital Name */}
      <Typography 
        variant="vital-label" 
        color={vital.color || 'default'}
        className="mb-1"
      >
        {vital.name}
      </Typography>

      {/* Vital Value */}
      <div className="mb-1">
        <Typography 
          variant="vital" 
          color={vital.color || (
            vital.status === 'critical' ? 'danger' :
            vital.status === 'warning' ? 'warning' : 'default'
          )}
        >
          {vital.status === 'offline' ? '--' : vital.value}
        </Typography>
        <Typography variant="body-small" color="muted">
          {vital.unit}
        </Typography>
      </div>

      {/* Normal Range */}
      {showNormalRange && vital.normalRange && (
        <Typography variant="body-small" color="muted" className="text-xs">
          Normal: {vital.normalRange.min}-{vital.normalRange.max} {vital.unit}
        </Typography>
      )}

      {/* Timestamp */}
      {showTimestamp && vital.timestamp && (
        <Typography variant="body-small" color="muted" className="text-xs mt-1">
          {new Date(vital.timestamp).toLocaleTimeString()}
        </Typography>
      )}
    </div>
  );
};

const VitalsMonitor = React.forwardRef<HTMLDivElement, VitalsMonitorProps>(
  ({ 
    className, 
    variant, 
    status,
    animated,
    vitals, 
    patientName,
    lastUpdated,
    showTrends = true,
    showTimestamps = false,
    showNormalRanges = false,
    onVitalClick,
    compact = false,
    ...props 
  }, ref) => {
    const overallStatus = status || getOverallStatus(vitals);
    const vitalSize = compact ? 'compact' : 'default';
    
    React.useEffect(() => {
      // Auto-update logic could be added here
    }, []);

    return (
      <Card
        className={cn(
          vitalsMonitorVariants({ 
            variant, 
            status: overallStatus, 
            animated: animated || overallStatus === 'critical'
          }),
          'p-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="heading-medium">
              {patientName ? `${patientName} - Vitals` : 'Vital Signs Monitor'}
            </Typography>
            {lastUpdated && (
              <Typography variant="body-small" color="muted" className="mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </Typography>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                overallStatus === 'critical' ? 'danger' :
                overallStatus === 'warning' ? 'warning' :
                overallStatus === 'offline' ? 'secondary' : 'success'
              }
            >
              {overallStatus === 'offline' ? 'OFFLINE' : 
               overallStatus === 'critical' ? 'CRITICAL' :
               overallStatus === 'warning' ? 'WARNING' : 'STABLE'}
            </Badge>
            
            {overallStatus === 'critical' && (
              <div className="w-3 h-3 bg-danger-500 rounded-full animate-ping"></div>
            )}
          </div>
        </div>

        {/* Vitals Grid */}
        <Grid 
          cols={2} 
          gap={4}
          responsive={{ 
            md: vitals.length > 4 ? 3 : (Math.min(vitals.length, 4) as any),
            lg: Math.min(vitals.length, 4) as any
          }}
        >
          {vitals.map((vital) => (
            <VitalCard
              key={vital.id}
              vital={vital}
              size={vitalSize}
              showTrend={showTrends}
              showTimestamp={showTimestamps}
              showNormalRange={showNormalRanges}
              onClick={onVitalClick ? () => onVitalClick(vital) : undefined}
            />
          ))}
        </Grid>

        {/* Footer */}
        {overallStatus === 'critical' && (
          <div className="mt-6 p-4 bg-danger-100 border-l-4 border-danger-500 rounded">
            <Typography variant="body-default-medium" color="danger">
              ⚠ Critical Alert: Immediate medical attention required
            </Typography>
          </div>
        )}
        
        {overallStatus === 'warning' && (
          <div className="mt-6 p-4 bg-warning-100 border-l-4 border-warning-500 rounded">
            <Typography variant="body-default-medium" color="warning">
              ⚠ Warning: Vital signs require monitoring
            </Typography>
          </div>
        )}
      </Card>
    );
  }
);

VitalsMonitor.displayName = 'VitalsMonitor';

export { VitalsMonitor, VitalCard, vitalsMonitorVariants, vitalCardVariants };