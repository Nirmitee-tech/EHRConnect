import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const codeVariants = cva(
  'relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
        outline: 'border border-muted text-muted-foreground',
      },
      size: {
        sm: 'text-xs px-1 py-0.5',
        md: 'text-sm px-[0.3rem] py-[0.2rem]',
        lg: 'text-base px-2 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {
  copyable?: boolean;
  onCopy?: () => void;
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, variant, size, children, copyable = false, onCopy, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      if (typeof children === 'string') {
        try {
          await navigator.clipboard.writeText(children);
          setCopied(true);
          onCopy?.();
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      }
    };

    return (
      <code
        className={cn(codeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-2 inline-flex items-center justify-center rounded p-1 hover:bg-muted transition-colors"
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </code>
    );
  }
);

Code.displayName = 'Code';

export { Code, codeVariants };