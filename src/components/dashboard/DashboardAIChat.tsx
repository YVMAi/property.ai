import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Trash2, Loader2, X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

export default function DashboardAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPanelOpen(true);
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(userMsg.content);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const clearChat = () => {
    setMessages([]);
    setPanelOpen(false);
  };

  // Canva-style prompt bar (shown when panel is closed)
  const PromptBar = () => (
    <div className="relative">
      {/* Hero text */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
          How can I help you today?
        </h1>
        <p className="text-sm text-muted-foreground">Ask anything about your properties, tenants, finances & more</p>
      </div>

      {/* Input bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden transition-shadow focus-within:shadow-lg focus-within:border-primary/30">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center">
            <div className="flex-1 flex items-center px-4">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about your PMC data…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 py-3.5 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="h-9 w-9 rounded-xl mr-2 shrink-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Suggestion chips */}
          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-background hover:bg-accent hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Slide-out chat panel (shown when chatting)
  const ChatPanel = () => (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">PMC Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Scoped to your portfolio</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={clearChat}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setPanelOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border/50 text-foreground rounded-bl-md'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 bg-card">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input
            placeholder="Ask a follow-up…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-10 rounded-xl text-sm"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-10 w-10 rounded-xl shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Prompt bar on dashboard */}
      {!panelOpen && <PromptBar />}

      {/* Floating re-open button when panel is closed but messages exist */}
      {!panelOpen && hasMessages && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setPanelOpen(true)}
            className="h-12 w-12 rounded-full shadow-elevated"
            size="icon"
          >
            <Bot className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Backdrop */}
      {panelOpen && (
        <div className="fixed inset-0 bg-foreground/10 z-40" onClick={() => setPanelOpen(false)} />
      )}

      {/* Chat panel */}
      {panelOpen && <ChatPanel />}
    </>
  );
}
