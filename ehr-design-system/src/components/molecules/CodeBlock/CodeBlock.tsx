import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const codeBlockVariants = cva(
  'relative rounded-lg border bg-muted/50 font-mono text-sm',
  {
    variants: {
      variant: {
        default: 'bg-muted/50 border-border',
        primary: 'bg-primary/5 border-primary/20',
        success: 'bg-success/5 border-success/20',
        warning: 'bg-warning/5 border-warning/20',
        danger: 'bg-danger/5 border-danger/20',
      },
      size: {
        sm: 'p-3 text-xs',
        md: 'p-4 text-sm',
        lg: 'p-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CodeBlockProps
  extends React.HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof codeBlockVariants> {
  language?: string;
  title?: string;
  copyable?: boolean;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  onCopy?: () => void;
  maxHeight?: string;
}

const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({
    className,
    variant,
    size,
    children,
    language,
    title,
    copyable = true,
    showLineNumbers = false,
    highlightLines = [],
    onCopy,
    maxHeight,
    ...props
  }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      const text = typeof children === 'string' ? children : getTextContent(children);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    const getTextContent = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return node.toString();
      if (React.isValidElement(node)) {
        return getTextContent(node.props.children);
      }
      if (Array.isArray(node)) {
        return node.map(getTextContent).join('');
      }
      return '';
    };

    const processContent = (content: React.ReactNode) => {
      const text = getTextContent(content);
      const lines = text.split('\n');

      if (!showLineNumbers && highlightLines.length === 0) {
        return content;
      }

      return lines.map((line, index) => {
        const lineNumber = index + 1;
        const isHighlighted = highlightLines.includes(lineNumber);
        
        return (
          <div
            key={index}
            className={cn(
              'flex',
              isHighlighted && 'bg-warning/10 -mx-4 px-4'
            )}
          >
            {showLineNumbers && (
              <span className="select-none pr-4 text-muted-foreground/70 text-right w-8 flex-shrink-0">
                {lineNumber}
              </span>
            )}
            <span className="flex-1">{line}</span>
          </div>
        );
      });
    };

    return (
      <div className="relative">
        {/* Header */}
        {(title || language || copyable) && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 rounded-t-lg">
            <div className="flex items-center gap-2">
              {title && (
                <span className="text-sm font-medium">{title}</span>
              )}
              {language && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {language}
                </span>
              )}
            </div>
            {copyable && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded p-1.5 hover:bg-muted transition-colors"
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}

        {/* Code Content */}
        <pre
          className={cn(
            codeBlockVariants({ variant, size }),
            (title || language || copyable) && 'rounded-t-none border-t-0',
            className
          )}
          style={{ maxHeight }}
          ref={ref}
          {...props}
        >
          <code className="block overflow-x-auto">
            {processContent(children)}
          </code>
        </pre>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';

export { CodeBlock, codeBlockVariants };