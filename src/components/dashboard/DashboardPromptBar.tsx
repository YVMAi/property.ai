import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Paperclip, X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const suggestions = [
  'Show overdue rent',
  'Expiring leases',
  'Vacancy report',
  'Task summary',
];

export default function DashboardPromptBar() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg && attachments.length === 0) return;
    navigate('/ai-chat', { state: { initialMessage: msg || `Sent ${attachments.length} attachment(s)` } });
  };

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput(prev => prev + (prev ? ' ' : '') + 'Show me overdue rent');
      }, 2000);
    }
  }, [isRecording]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAttachments(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name, type: f.type }))]);
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
          How can I help you today?
        </h1>
        <p className="text-sm text-muted-foreground">Ask anything about your properties, tenants, finances & more</p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <div className="relative rounded-[28px] border border-border/50 bg-card shadow-lg overflow-hidden transition-all focus-within:shadow-xl focus-within:border-primary/20">
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 px-5 pt-3 flex-wrap">
              {attachments.map((att, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-muted/60 rounded-full px-3 py-1.5 text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {att.name}
                  <button onClick={() => removeAttachment(i)} className="hover:text-foreground transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-1 px-3 py-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <textarea
              ref={inputRef}
              placeholder="Ask about your PMC data…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-1 py-2.5 px-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground resize-none max-h-32 leading-relaxed"
              style={{ minHeight: '36px' }}
            />
            <Button type="button" variant="ghost" size="icon" className={cn('h-9 w-9 rounded-full shrink-0 transition-all', isRecording ? 'bg-destructive/10 text-destructive animate-pulse' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')} onClick={toggleRecording}>
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" disabled={!input.trim() && attachments.length === 0} className="h-9 w-9 rounded-full shrink-0 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3.5 py-1.5 rounded-full border border-border/50 bg-background hover:bg-accent hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
