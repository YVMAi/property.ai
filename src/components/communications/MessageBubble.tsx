import { MessageSquare, Reply, Bot } from 'lucide-react';
import type { Message } from '@/types/communication';
import { cn } from '@/lib/utils';
import AttachmentPreview from './AttachmentPreview';

interface MessageBubbleProps {
  message: Message;
  replyToMessage?: Message;
  onReply?: (message: Message) => void;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, replyToMessage, onReply }: MessageBubbleProps) {
  const isSent = message.direction === 'sent';
  const isSystem = message.senderId === 'system';

  // System messages render as center-aligned banners
  if (isSystem) {
    return (
      <div className="flex justify-center mb-3">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-2.5 bg-warning/20 border border-warning/30 shadow-soft animate-slide-up">
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="h-3.5 w-3.5 text-warning-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
              System
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{message.content}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex mb-3 group', isSent ? 'justify-end' : 'justify-start')}>
      {/* Reply button - shown on hover (left side for sent, right for received) */}
      {!isSent && onReply && (
        <button
          onClick={() => onReply(message)}
          className="self-center mr-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
          aria-label="Reply to message"
        >
          <Reply className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}

      <div
        className={cn(
          'max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-soft animate-slide-up relative',
          isSent
            ? 'bg-primary/20 text-foreground rounded-br-md'
            : 'bg-card text-foreground border border-border rounded-bl-md'
        )}
      >
        {/* Sender name */}
        <div className="flex items-center gap-1.5 mb-1">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {message.senderName || (isSent ? 'Admin' : 'User')}
          </span>
          {message.broadcastRecipients && (
            <span className="text-[10px] bg-primary/10 text-primary-foreground rounded-full px-1.5 py-0.5 ml-1">
              📢 Broadcast
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
          </span>
        </div>

        {/* Reply reference */}
        {replyToMessage && (
          <div className="mb-2 pl-2 border-l-2 border-primary/40 bg-primary/5 rounded-r px-2 py-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground">
              ↩ {replyToMessage.senderName || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">{replyToMessage.content}</p>
          </div>
        )}

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90">{message.content}</p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.attachments.map((att, i) => (
              <AttachmentPreview key={i} filename={att} variant="chip" />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{formatTime(message.timestamp)}</p>
      </div>

      {/* Reply button - shown on hover (right side for sent messages) */}
      {isSent && onReply && (
        <button
          onClick={() => onReply(message)}
          className="self-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
          aria-label="Reply to message"
        >
          <Reply className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
