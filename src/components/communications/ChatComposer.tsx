import { useState } from 'react';
import { Send, Paperclip, X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/types/communication';

interface ChatComposerProps {
  onSend: (content: string, attachments: string[], replyToId?: string) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

export default function ChatComposer({ onSend, replyTo, onCancelReply }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAttach = () => {
    const mockFile = `Attachment_${Date.now().toString(36)}.pdf`;
    setAttachments((prev) => [...prev, mockFile]);
    toast({ title: 'File attached', description: mockFile });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSend(text.trim(), attachments, replyTo?.id);
    setText('');
    setAttachments([]);
    onCancelReply?.();
    toast({ title: 'Message sent', description: 'Your message has been shared on the portal.' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border px-4 md:px-5 py-3">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-start gap-2 mb-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <Reply className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary-foreground/70">
              Replying to {replyTo.senderName || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 hover:text-destructive-foreground transition-colors"
            aria-label="Cancel reply"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-1"
            >
              📎 {att}
              <button
                onClick={() => removeAttachment(i)}
                className="ml-0.5 hover:text-destructive-foreground transition-colors"
                aria-label={`Remove ${att}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleAttach}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder={replyTo ? 'Type a reply…' : 'Type a message…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-background border-input h-10 flex-1"
          maxLength={2000}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={!text.trim() && attachments.length === 0}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
