import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
  className?: string;
  content: string;
}

export function ChatMarkdown({ className, content }: ChatMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }: ComponentPropsWithoutRef<'a'>) => (
            <a
              {...props}
              rel="noreferrer noopener"
              target="_blank"
            />
          ),
          table: ({ ...props }: ComponentPropsWithoutRef<'table'>) => (
            <div className="chat-markdown-table-wrap">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
