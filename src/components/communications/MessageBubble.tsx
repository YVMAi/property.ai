import { MessageSquare } from 'lucide-react';
import type { Message } from '@/types/communication';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.direction === 'sent';

  return (
    <div className={cn('flex mb-3', isSent ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-soft animate-slide-up',
          isSent
            ? 'bg-primary/20 text-foreground rounded-br-md'
            : 'bg-card text-foreground border border-border rounded-bl-md'
        )}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mb-1">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isSent ? 'Sent' : 'Received'}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90">{message.content}</p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.attachments.map((att, i) => (
              <span key={i} className="text-[10px] bg-accent rounded px-1.5 py-0.5 text-accent-foreground">
                📎 {att}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}
