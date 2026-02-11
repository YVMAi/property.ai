import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
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

export default function DashboardAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(userMsg.content);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <Card className="border-border/50 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">PMC Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask anything about your portfolio</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setMessages([])}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="h-52 overflow-y-auto px-4 py-3 space-y-3 bg-background/50">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Ask about overdue rent, expiring leases, vacancies, or tasks…
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-xl px-3 py-2 rounded-bl-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-3 border-t border-border/50">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input
            placeholder="Ask anything about your PMC data…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-9 text-sm"
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isTyping} className="h-9 px-3">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
