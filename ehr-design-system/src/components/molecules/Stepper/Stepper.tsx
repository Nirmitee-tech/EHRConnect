import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { Check, ChevronRight, Circle, AlertCircle, Clock, X, Minus, Play } from 'lucide-react';

const stepperVariants = cva(
  'flex',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row items-start w-full',
        vertical: 'flex-col w-full',
      },
      variant: {
        default: 'gap-0',
        pills: 'gap-2 flex-wrap',
        dots: 'gap-6',
        arrows: 'gap-0',
        progress: 'relative bg-muted/20 rounded-full p-1',
        timeline: 'gap-0',
        minimal: 'gap-8',
        cards: 'gap-4',
      },
      spacing: {
        compact: 'gap-2',
        normal: 'gap-4',
        relaxed: 'gap-6',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      spacing: 'normal',
    },
  }
);

const stepVariants = cva(
  'relative flex items-center transition-all duration-200',
  {
    variants: {
      orientation: {
        horizontal: 'flex-col text-center',
        vertical: 'flex-row text-left w-full min-h-[60px]',
      },
      variant: {
        default: '',
        pills: 'bg-background rounded-lg border px-3 py-2 shadow-sm',
        dots: 'flex-col',
        arrows: 'bg-background border-2 border-r-0 relative',
        progress: 'flex-1',
        timeline: 'pb-8 last:pb-0',
        minimal: 'flex-col',
        cards: 'bg-background rounded-xl border-2 p-4 shadow-sm min-h-[120px] flex-1',
      },
      status: {
        pending: '',
        current: '',
        completed: '',
        error: '',
        skipped: '',
        warning: '',
      },
    },
    compoundVariants: [
      // Pills variant compound styles
      {
        variant: 'pills',
        status: 'completed',
        class: 'bg-success/10 border-success/20 text-success',
      },
      {
        variant: 'pills',
        status: 'current',
        class: 'bg-primary/10 border-primary text-primary',
      },
      {
        variant: 'pills',
        status: 'error',
        class: 'bg-danger/10 border-danger/20 text-danger',
      },
      // Cards variant compound styles
      {
        variant: 'cards',
        status: 'completed',
        class: 'border-success bg-success/5',
      },
      {
        variant: 'cards',
        status: 'current',
        class: 'border-primary bg-primary/5 shadow-md scale-105',
      },
      {
        variant: 'cards',
        status: 'error',
        class: 'border-danger bg-danger/5',
      },
      // Arrows variant compound styles
      {
        variant: 'arrows',
        status: 'completed',
        class: 'bg-success/10 border-success',
      },
      {
        variant: 'arrows',
        status: 'current',
        class: 'bg-primary/10 border-primary',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      status: 'pending',
    },
  }
);

const stepIndicatorVariants = cva(
  'flex items-center justify-center rounded-full font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-2',
        pills: 'w-6 h-6 text-xs mr-2',
        dots: 'border-4',
        arrows: 'w-8 h-8 text-sm mr-3',
        progress: 'w-8 h-8 text-sm',
        timeline: 'border-4 absolute -left-4 top-2 z-10',
        minimal: 'border-2',
        cards: 'w-12 h-12 text-lg mb-3',
      },
      status: {
        pending: 'border-muted-foreground/30 bg-background text-muted-foreground',
        current: 'border-primary bg-primary text-primary-foreground animate-pulse',
        completed: 'border-success bg-success text-success-foreground',
        error: 'border-danger bg-danger text-danger-foreground',
        skipped: 'border-muted bg-muted text-muted-foreground',
        warning: 'border-warning bg-warning text-warning-foreground',
      },
      size: {
        xs: 'w-4 h-4 text-xs',
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base',
        xl: 'w-12 h-12 text-lg',
      },
      clickable: {
        true: 'cursor-pointer hover:scale-110 hover:shadow-md',
        false: 'cursor-default',
      },
    },
    compoundVariants: [
      {
        variant: 'dots',
        size: 'md',
        class: 'w-4 h-4',
      },
      {
        variant: 'timeline',
        size: 'md',
        class: 'w-6 h-6',
      },
    ],
    defaultVariants: {
      variant: 'default',
      status: 'pending',
      size: 'md',
      clickable: false,
    },
  }
);

const stepConnectorVariants = cva(
  'transition-all duration-300',
  {
    variants: {
      orientation: {
        horizontal: 'h-0.5 flex-1',
        vertical: 'w-0.5 min-h-[40px] ml-3',
      },
      variant: {
        default: '',
        pills: 'hidden',
        dots: 'h-1 rounded-full',
        arrows: 'w-0 h-0 absolute right-0 top-1/2 -translate-y-1/2 border-l-[20px] border-y-[20px] border-r-0 border-y-transparent z-10',
        progress: 'absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full',
        timeline: 'absolute left-[-15px] top-8 w-0.5 h-full',
        minimal: 'h-px',
        cards: 'h-1 flex-1 rounded-full mx-2',
      },
      status: {
        pending: 'bg-muted',
        completed: 'bg-success',
        current: 'bg-primary/30',
      },
    },
    compoundVariants: [
      {
        variant: 'arrows',
        status: 'completed',
        class: 'border-l-success',
      },
      {
        variant: 'arrows',
        status: 'current',
        class: 'border-l-primary',
      },
      {
        variant: 'arrows',
        status: 'pending',
        class: 'border-l-muted',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      status: 'pending',
    },
  }
);

export type StepStatus = 'pending' | 'current' | 'completed' | 'error' | 'skipped' | 'warning';

export interface StepData {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  icon?: React.ReactNode;
  estimatedTime?: string;
  requirement?: string;
}

export interface StepperProps extends VariantProps<typeof stepperVariants> {
  steps: StepData[];
  currentStep: number;
  completedSteps?: number[];
  errorSteps?: number[];
  skippedSteps?: number[];
  warningSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  allowClickNavigation?: boolean;
  showStepNumbers?: boolean;
  showProgress?: boolean;
  showEstimatedTime?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  stepClassName?: string;
  connectorClassName?: string;
  colorScheme?: 'default' | 'medical' | 'clinical' | 'administrative';
}

const getStepStatus = (
  stepIndex: number,
  currentStep: number,
  completedSteps: number[] = [],
  errorSteps: number[] = [],
  skippedSteps: number[] = [],
  warningSteps: number[] = []
): StepStatus => {
  if (errorSteps.includes(stepIndex)) return 'error';
  if (warningSteps.includes(stepIndex)) return 'warning';
  if (skippedSteps.includes(stepIndex)) return 'skipped';
  if (completedSteps.includes(stepIndex)) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'pending';
};

const getStepIcon = (
  step: StepData,
  status: StepStatus,
  stepIndex: number,
  showStepNumbers: boolean,
  variant: string
) => {
  // Custom icons take priority except for completed/error states
  if (step.icon && status !== 'completed' && status !== 'error') {
    return React.cloneElement(step.icon as React.ReactElement, {
      className: cn(
        'w-4 h-4',
        variant === 'cards' && 'w-6 h-6',
        variant === 'timeline' && 'w-3 h-3'
      )
    });
  }

  const iconProps = {
    className: cn(
      'w-4 h-4',
      variant === 'cards' && 'w-6 h-6',
      variant === 'timeline' && 'w-3 h-3'
    )
  };

  switch (status) {
    case 'completed':
      return <Check {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'warning':
      return <Clock {...iconProps} />;
    case 'skipped':
      return <Minus {...iconProps} />;
    case 'current':
      if (variant === 'progress' || variant === 'dots') {
        return <Play {...iconProps} />;
      }
      return showStepNumbers ? stepIndex + 1 : <Circle className={cn(iconProps.className, 'fill-current')} />;
    default:
      if (variant === 'dots') {
        return <Circle className={cn(iconProps.className, 'w-2 h-2 fill-current')} />;
      }
      return showStepNumbers ? stepIndex + 1 : <Circle className={cn(iconProps.className, 'w-3 h-3 fill-current')} />;
  }
};

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({
    className,
    orientation = 'horizontal',
    variant = 'default',
    spacing,
    steps,
    currentStep,
    completedSteps = [],
    errorSteps = [],
    skippedSteps = [],
    warningSteps = [],
    onStepClick,
    allowClickNavigation = false,
    showStepNumbers = false,
    showProgress = false,
    showEstimatedTime = false,
    size = 'md',
    stepClassName,
    connectorClassName,
    colorScheme = 'default',
    ...props
  }, ref) => {
    const handleStepClick = (stepIndex: number) => {
      if (allowClickNavigation && onStepClick) {
        onStepClick(stepIndex);
      }
    };

    const totalProgress = steps.length > 0 ? ((completedSteps.length / steps.length) * 100) : 0;

    return (
      <div className="w-full">
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(stepperVariants({ orientation, variant, spacing }), className)}
          {...props}
        >
          {variant === 'progress' && (
            <div className="absolute inset-0 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          )}
          
          {steps.map((step, index) => {
            const status = getStepStatus(index, currentStep, completedSteps, errorSteps, skippedSteps, warningSteps);
            const isClickable = allowClickNavigation && onStepClick;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    stepVariants({ orientation, variant, status }),
                    stepClassName,
                    isClickable && 'cursor-pointer hover:opacity-80'
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Arrow connector for arrows variant */}
                  {variant === 'arrows' && !isLast && (
                    <div
                      className={cn(
                        stepConnectorVariants({
                          orientation,
                          variant,
                          status: completedSteps.includes(index) ? 'completed' : 'pending'
                        })
                      )}
                    />
                  )}
                  
                  {/* Timeline connector */}
                  {variant === 'timeline' && !isLast && (
                    <div
                      className={cn(
                        stepConnectorVariants({
                          orientation: 'vertical',
                          variant,
                          status: completedSteps.includes(index) ? 'completed' : 'pending'
                        }),
                        connectorClassName
                      )}
                    />
                  )}
                  
                  <div
                    className={cn(
                      stepIndicatorVariants({ 
                        variant, 
                        status, 
                        size, 
                        clickable: isClickable 
                      })
                    )}
                  >
                    {getStepIcon(step, status, index, showStepNumbers, variant)}
                  </div>
                  
                  <div className={cn(
                    'flex flex-col',
                    orientation === 'horizontal' && variant !== 'pills' ? 'mt-2 max-w-[140px]' : '',
                    orientation === 'vertical' || variant === 'pills' ? 'ml-3 flex-1' : '',
                    variant === 'cards' && 'items-center text-center'
                  )}>
                    <span className={cn(
                      'font-medium transition-colors',
                      variant === 'cards' ? 'text-lg mb-2' : 'text-sm',
                      status === 'current' && 'text-primary',
                      status === 'completed' && 'text-success',
                      status === 'error' && 'text-danger',
                      status === 'warning' && 'text-warning',
                      status === 'pending' && 'text-muted-foreground',
                      status === 'skipped' && 'text-muted-foreground line-through'
                    )}>
                      {step.title}
                      {step.optional && (
                        <span className="text-xs text-muted-foreground ml-1 font-normal">
                          (Optional)
                        </span>
                      )}
                    </span>
                    
                    {step.description && (
                      <span className={cn(
                        'text-xs mt-1 opacity-80',
                        variant === 'cards' ? 'text-center' : '',
                        status === 'current' && 'text-primary/80',
                        status === 'completed' && 'text-success/80',
                        status === 'error' && 'text-danger/80',
                        status === 'warning' && 'text-warning/80',
                        (status === 'pending' || status === 'skipped') && 'text-muted-foreground'
                      )}>
                        {step.description}
                      </span>
                    )}
                    
                    {showEstimatedTime && step.estimatedTime && (
                      <span className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.estimatedTime}
                      </span>
                    )}
                    
                    {step.requirement && status === 'current' && (
                      <span className="text-xs text-primary/80 mt-1 font-medium">
                        {step.requirement}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Regular connectors (not arrows or timeline) */}
                {!isLast && variant !== 'arrows' && variant !== 'timeline' && variant !== 'pills' && variant !== 'progress' && (
                  <div
                    className={cn(
                      stepConnectorVariants({
                        orientation,
                        variant,
                        status: completedSteps.includes(index) || status === 'completed' ? 'completed' : 'pending'
                      }),
                      connectorClassName
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

// Enhanced Progress indicator with more options
export interface StepperProgressProps {
  totalSteps: number;
  currentStep: number;
  completedSteps?: number[];
  showPercentage?: boolean;
  showStepCount?: boolean;
  variant?: 'default' | 'clinical' | 'administrative';
  className?: string;
}

const StepperProgress = React.forwardRef<HTMLDivElement, StepperProgressProps>(
  ({ 
    totalSteps, 
    currentStep, 
    completedSteps = [], 
    showPercentage = true,
    showStepCount = true,
    variant = 'default',
    className, 
    ...props 
  }, ref) => {
    const progress = ((completedSteps.length + (currentStep > completedSteps.length ? 1 : 0)) / totalSteps) * 100;
    
    const getVariantClasses = () => {
      switch (variant) {
        case 'clinical':
          return 'bg-blue-500';
        case 'administrative':
          return 'bg-purple-500';
        default:
          return 'bg-primary';
      }
    };

    return (
      <div ref={ref} className={cn('w-full space-y-2', className)} {...props}>
        {(showPercentage || showStepCount) && (
          <div className="flex justify-between text-sm text-muted-foreground">
            {showStepCount && <span>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>}
            {showPercentage && <span>{Math.round(progress)}% Complete</span>}
          </div>
        )}
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-500 relative overflow-hidden',
              getVariantClasses()
            )}
            style={{ width: `${Math.max(progress, 8)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        {variant === 'clinical' && (
          <div className="text-xs text-blue-600 font-medium">
            Clinical Protocol Progress
          </div>
        )}
        {variant === 'administrative' && (
          <div className="text-xs text-purple-600 font-medium">
            Administrative Process
          </div>
        )}
      </div>
    );
  }
);

StepperProgress.displayName = 'StepperProgress';

export { Stepper, StepperProgress, stepperVariants };