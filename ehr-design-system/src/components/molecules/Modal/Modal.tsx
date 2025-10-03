import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

const modalVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg',
  {
    variants: {
      size: {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        full: 'max-w-[95vw] max-h-[95vh] overflow-auto',
      },
      variant: {
        default: 'border-border',
        primary: 'border-primary/20',
        success: 'border-success/20',
        warning: 'border-warning/20',
        danger: 'border-danger/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const modalHeaderVariants = cva(
  'flex flex-col space-y-1.5 text-center sm:text-left',
  {
    variants: {
      variant: {
        default: '',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  trigger?: React.ReactNode;
}

export interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a Modal component');
  }
  return context;
};

const Modal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalProps
>(({
  className,
  size,
  variant,
  title,
  description,
  children,
  footer,
  closeButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  open,
  onOpenChange,
  trigger,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const controlled = open !== undefined;
  const modalOpen = controlled ? open : isOpen;
  const setModalOpen = controlled ? (onOpenChange || (() => {})) : setIsOpen;
  
  const handleClose = () => setModalOpen(false);
  
  const contextValue: ModalContextValue = {
    onClose: handleClose,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={modalOpen} onOpenChange={setModalOpen}>
        {trigger && (
          <DialogPrimitive.Trigger asChild>
            {trigger}
          </DialogPrimitive.Trigger>
        )}
        
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          
          <DialogPrimitive.Content
            ref={ref}
            className={cn(modalVariants({ size, variant }), className)}
            onPointerDownOutside={!closeOnOutsideClick ? (e) => e.preventDefault() : undefined}
            onEscapeKeyDown={!closeOnEscape ? (e) => e.preventDefault() : undefined}
            {...props}
          >
            {(title || description || closeButton) && (
              <div className={cn(modalHeaderVariants({ variant }))}>
                {title && (
                  <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-muted-foreground">
                    {description}
                  </DialogPrimitive.Description>
                )}
                {closeButton && (
                  <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
            
            {children && (
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            )}
            
            {footer && (
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t pt-4">
                {footer}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
});

Modal.displayName = 'Modal';

// Confirmation Modal Helper Component
export interface ConfirmationModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  trigger?: React.ReactNode;
}

export const ConfirmationModal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ConfirmationModalProps
>(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  trigger,
  ...props
}, ref) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'primary':
        return 'primary';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      ref={ref}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      size="sm"
      trigger={trigger}
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant() as any}
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      }
      {...props}
    />
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export { Modal, modalVariants };