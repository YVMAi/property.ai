import { useRef, useEffect, useMemo } from 'react';
import { MessageSquareOff, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { Message, CommunicationUser } from '@/types/communication';
import MessageBubble from './MessageBubble';
import { useState } from 'react';

interface ChatTimelineProps {
  messages: Message[];
  selectedUser: CommunicationUser | undefined;
}

function formatDateHeader(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function ChatTimeline({ messages, selectedUser }: ChatTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chatSearch, setChatSearch] = useState('');

  const filteredMessages = useMemo(() => {
    if (!chatSearch.trim()) return messages;
    const q = chatSearch.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.subject && m.subject.toLowerCase().includes(q))
    );
  }, [messages, chatSearch]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    filteredMessages.forEach((msg) => {
      const dateStr = formatDateHeader(msg.timestamp);
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [filteredMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  if (!selectedUser) {
    return (
      <div className="card-elevated flex-1 flex flex-col items-center justify-center text-center p-8">
        <MessageSquareOff className="h-14 w-14 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Conversation Selected</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Choose a user type and select a contact above to view their communication history.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated flex-1 flex flex-col min-h-0 animate-fade-in">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{selectedUser.name}</h3>
          <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
        </div>
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages…"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background border-input"
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 md:px-5 py-4">
        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquareOff className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {chatSearch
                ? 'No messages match your search.'
                : 'No communications yet with this user. Start by sending an email.'}
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
