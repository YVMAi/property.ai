import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Trash2, Mic, MicOff, Paperclip, X, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string }[];
}

const MOCK_RESPONSES: Record<string, string> = {
  'default': "I can help you with property management insights. Try asking about rent collection, vacant units, expiring leases, or task summaries.",
  'rent': "**Overdue Rent Summary (Last 30 Days)**\n\n- 3 units with outstanding balances totaling **$3,200**\n- Unit 205 — Mike Davis: $1,400 (15 days overdue)\n- Unit 104 — Pending payment: $800\n- Unit 302 — Partial payment: $1,000\n\nCollection rate: **93.4%**. Would you like me to create follow-up tasks?",
  'lease': "**Expiring Leases This Month**\n\n- Unit 302 (Sunrise Apartments) — Expires in 45 days\n- Unit 104 (Sunrise Apartments) — Expires in 58 days\n\n📊 Occupancy is at **98%**. I recommend sending renewal offers soon. Want me to create tasks for these?",
  'vacant': "**Current Vacancies**\n\n- 2 vacant units across your portfolio\n- Average days vacant: **18 days**\n- Projected monthly revenue loss: **$2,400**\n\nOccupancy dropped **4%** — 2 long-vacant units may need listing updates.",
  'task': "**Task Summary**\n\n- ✅ 1 completed this week\n- 🔴 1 overdue (Follow up on late rent)\n- 🟡 3 pending tasks\n- Next due: HVAC Inspection (in 2 days)\n\nWould you like to see details or create a new task?",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('rent') || lower.includes('overdue') || lower.includes('payment')) return MOCK_RESPONSES['rent'];
  if (lower.includes('lease') || lower.includes('expir') || lower.includes('renewal')) return MOCK_RESPONSES['lease'];
  if (lower.includes('vacant') || lower.includes('occupancy') || lower.includes('vacancy')) return MOCK_RESPONSES['vacant'];
  if (lower.includes('task') || lower.includes('pending') || lower.includes('todo')) return MOCK_RESPONSES['task'];
  return MOCK_RESPONSES['default'];
}

const suggestions = [
  'Show overdue rent',
  'Expiring leases',
  'Vacancy report',
  'Task summary',
];

interface DashboardAIChatProps {
  initialMessage?: string;
  onBack?: () => void;
}

export default function DashboardAIChat({ initialMessage, onBack }: DashboardAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialSent = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Auto-send initial message from dashboard
  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const sendMessage = (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(text);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg && attachments.length === 0) return;
    const content = msg || `Sent ${attachments.length} attachment(s)`;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(content);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const clearChat = () => {
    setMessages([]);
    setAttachments([]);
    if (onBack) onBack();
  };

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    // Mock: stop recording after 2s and add transcription
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
    const newAttachments = Array.from(files).map(f => ({ name: f.name, type: f.type }));
    setAttachments(prev => [...prev, ...newAttachments]);
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

  // ── Full-page chat view (Gemini-inspired) ──
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in -mx-4 sm:-mx-6 -mt-6">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">PMC Assistant</h3>
              <p className="text-[10px] text-muted-foreground">Scoped to your portfolio</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={clearChat}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className="max-w-[80%] space-y-1.5">
                <div
                  className={cn(
                    'rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-muted/50 text-foreground rounded-bl-lg'
                  )}
                >
                  {msg.content}
                </div>
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.attachments.map((att, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-muted/40 rounded-full px-2.5 py-1 text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        {att.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-3xl rounded-bl-lg px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer bar (bottom, Gemini-style pill) */}
      <div className="border-t border-border/30 bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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

          <div className="relative rounded-[24px] border border-border/50 bg-background overflow-hidden transition-all focus-within:border-primary/20 focus-within:shadow-md">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-1 px-3 py-2">
              {/* Attach */}
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                placeholder="Ask a follow-up…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 py-2.5 px-1 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground resize-none max-h-32 leading-relaxed"
                style={{ minHeight: '36px' }}
              />

              {/* Voice */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-9 w-9 rounded-full shrink-0 transition-all',
                  isRecording
                    ? 'bg-destructive/10 text-destructive animate-pulse'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              {/* Send */}
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && attachments.length === 0) || isTyping}
                className="h-9 w-9 rounded-full shrink-0 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
