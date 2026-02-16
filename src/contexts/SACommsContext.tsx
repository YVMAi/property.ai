import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SAMessage, SAThread, SACommTemplate, SACommType } from '@/types/superAdmin';

interface SACommsContextType {
  threads: SAThread[];
  messages: SAMessage[];
  templates: SACommTemplate[];
  selectedThreadId: string | null;
  selectThread: (id: string | null) => void;
  getThreadMessages: (threadId: string) => SAMessage[];
  sendMessage: (threadId: string, content: string, type: SACommType, subject?: string, attachments?: SAMessage['attachments']) => void;
  createThread: (pmcId: string, pmcName: string, pmcAdminEmail: string, type: SACommType, subject?: string) => string;
  broadcastMessage: (pmcIds: string[], content: string, type: SACommType, subject?: string) => void;
  markThreadRead: (threadId: string) => void;
  togglePin: (threadId: string) => void;
  deleteMessage: (messageId: string) => void;
  addTemplate: (t: Omit<SACommTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  totalUnread: number;
}

const SACommsContext = createContext<SACommsContextType | undefined>(undefined);

const DEMO_THREADS: SAThread[] = [
  { id: 'th-1', pmcId: 'pmc-1', pmcName: 'Skyline Property Group', pmcAdminEmail: 'admin@skylinepg.com', type: 'chat', lastMessage: 'Thanks for the update on the new features!', lastTimestamp: '2026-02-16T10:30:00', unreadCount: 2, online: true, pinned: true },
  { id: 'th-2', pmcId: 'pmc-2', pmcName: 'Greenfield Realty', pmcAdminEmail: 'admin@greenfield.com', type: 'chat', lastMessage: 'When will the Zillow sync issue be resolved?', lastTimestamp: '2026-02-16T09:15:00', unreadCount: 1, online: true },
  { id: 'th-3', pmcId: 'pmc-3', pmcName: 'Harbor View Mgmt', pmcAdminEmail: 'admin@harborview.com', type: 'email', subject: 'Trial Expiration Notice', lastMessage: 'Your trial period will expire on Feb 20, 2026.', lastTimestamp: '2026-02-15T14:00:00', unreadCount: 0, online: false },
  { id: 'th-4', pmcId: 'pmc-4', pmcName: 'Summit Estates LLC', pmcAdminEmail: 'admin@summit.com', type: 'email', subject: 'Account Suspension Notice', lastMessage: 'Your account has been suspended due to payment failure.', lastTimestamp: '2026-02-15T22:30:00', unreadCount: 0, online: false },
];

const DEMO_MESSAGES: SAMessage[] = [
  // Thread 1 - chat
  { id: 'msg-1', threadId: 'th-1', senderId: 'sa-1', senderName: 'System Administrator', senderType: 'super', content: 'Hi Skyline team! We\'ve deployed new AI Chat features for Pro Max subscribers. You should see them live now.', type: 'chat', timestamp: '2026-02-16T09:00:00', read: true },
  { id: 'msg-2', threadId: 'th-1', senderId: 'pmc-1-admin', senderName: 'Skyline Admin', senderType: 'pmc', content: 'That\'s great news! We noticed the AI suggestions are much faster now.', type: 'chat', timestamp: '2026-02-16T09:45:00', read: true },
  { id: 'msg-3', threadId: 'th-1', senderId: 'pmc-1-admin', senderName: 'Skyline Admin', senderType: 'pmc', content: 'Thanks for the update on the new features!', type: 'chat', timestamp: '2026-02-16T10:30:00', read: false },
  { id: 'msg-4', threadId: 'th-1', senderId: 'sa-1', senderName: 'System Administrator', senderType: 'super', content: 'You\'re welcome! Let us know if you encounter any issues.', type: 'chat', timestamp: '2026-02-16T10:32:00', read: false },
  // Thread 2 - chat
  { id: 'msg-5', threadId: 'th-2', senderId: 'pmc-2-admin', senderName: 'Greenfield Admin', senderType: 'pmc', content: 'We\'ve been experiencing timeouts with the Zillow sync for the past 2 days. Any ETA on a fix?', type: 'chat', timestamp: '2026-02-16T08:30:00', read: true },
  { id: 'msg-6', threadId: 'th-2', senderId: 'sa-1', senderName: 'System Administrator', senderType: 'super', content: 'We\'re aware of the issue and our engineering team is working on it. Should be resolved within 24 hours.', type: 'chat', timestamp: '2026-02-16T08:45:00', read: true },
  { id: 'msg-7', threadId: 'th-2', senderId: 'pmc-2-admin', senderName: 'Greenfield Admin', senderType: 'pmc', content: 'When will the Zillow sync issue be resolved?', type: 'chat', timestamp: '2026-02-16T09:15:00', read: false },
  // Thread 3 - email
  { id: 'msg-8', threadId: 'th-3', senderId: 'sa-1', senderName: 'System Administrator', senderType: 'super', content: 'Dear Harbor View Management,\n\nThis is a friendly reminder that your free trial period will expire on February 20, 2026.\n\nTo continue using all features without interruption, please upgrade to one of our paid plans. We recommend the Pro plan for your team size.\n\nBest regards,\nPropertyAI Support Team', type: 'email', subject: 'Trial Expiration Notice', timestamp: '2026-02-15T14:00:00', read: true },
  // Thread 4 - email
  { id: 'msg-9', threadId: 'th-4', senderId: 'sa-1', senderName: 'System Administrator', senderType: 'super', content: 'Dear Summit Estates,\n\nYour account has been suspended due to a failed payment. We attempted to charge your card on file but the transaction was declined.\n\nPlease update your payment method to restore access to your account.\n\nRegards,\nPropertyAI Billing Team', type: 'email', subject: 'Account Suspension Notice', timestamp: '2026-02-15T22:30:00', read: true },
];

const DEMO_TEMPLATES: SACommTemplate[] = [
  { id: 'tpl-1', name: 'Subscription Due Reminder', type: 'email', subject: 'Subscription Payment Due – [PMCName]', body: 'Dear [PMCName],\n\nThis is a reminder that your subscription payment of $[Amount] is due on [DueDate].\n\nPlease ensure your payment method is up to date to avoid any service interruption.\n\nBest regards,\nPropertyAI Billing Team' },
  { id: 'tpl-2', name: 'System Update Notice', type: 'email', subject: 'Scheduled System Update – [Date]', body: 'Dear [PMCName],\n\nWe will be performing scheduled maintenance on [Date] from [StartTime] to [EndTime].\n\nDuring this window, some features may be temporarily unavailable. We apologize for any inconvenience.\n\nBest regards,\nPropertyAI Support Team' },
  { id: 'tpl-3', name: 'Welcome New PMC', type: 'email', subject: 'Welcome to PropertyAI – [PMCName]', body: 'Dear [PMCName],\n\nWelcome to PropertyAI! Your account has been set up and is ready to use.\n\nHere are your next steps:\n1. Log in at your custom domain\n2. Set up your properties and units\n3. Invite your team members\n\nIf you need any help getting started, don\'t hesitate to reach out.\n\nBest regards,\nPropertyAI Onboarding Team' },
  { id: 'tpl-4', name: 'Quick Check-In', type: 'chat', body: 'Hi [PMCName]! Just checking in to see how everything is going. Let us know if you need any assistance or have questions about our platform.' },
  { id: 'tpl-5', name: 'Feature Announcement', type: 'chat', body: '🎉 Exciting news! We\'ve just released [FeatureName]. This new feature allows you to [Description]. Check it out and let us know your feedback!' },
];

export function SACommsProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<SAThread[]>(DEMO_THREADS);
  const [messages, setMessages] = useState<SAMessage[]>(DEMO_MESSAGES);
  const [templates, setTemplates] = useState<SACommTemplate[]>(DEMO_TEMPLATES);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const selectThread = useCallback((id: string | null) => setSelectedThreadId(id), []);

  const getThreadMessages = useCallback((threadId: string) =>
    messages.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages]
  );

  const sendMessage = useCallback((threadId: string, content: string, type: SACommType, subject?: string, attachments?: SAMessage['attachments']) => {
    const newMsg: SAMessage = {
      id: `msg-${Date.now()}`, threadId, senderId: 'sa-1', senderName: 'System Administrator',
      senderType: 'super', content, type, timestamp: new Date().toISOString(), read: true, subject, attachments,
    };
    setMessages(prev => [...prev, newMsg]);
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, lastMessage: content.slice(0, 80), lastTimestamp: newMsg.timestamp } : t));
  }, []);

  const createThread = useCallback((pmcId: string, pmcName: string, pmcAdminEmail: string, type: SACommType, subject?: string): string => {
    const id = `th-${Date.now()}`;
    const thread: SAThread = { id, pmcId, pmcName, pmcAdminEmail, type, subject, lastMessage: '', lastTimestamp: new Date().toISOString(), unreadCount: 0, online: false };
    setThreads(prev => [thread, ...prev]);
    setSelectedThreadId(id);
    return id;
  }, []);

  const broadcastMessage = useCallback((pmcIds: string[], content: string, type: SACommType, subject?: string) => {
    pmcIds.forEach(pmcId => {
      const existing = threads.find(t => t.pmcId === pmcId && t.type === type);
      if (existing) {
        sendMessage(existing.id, content, type, subject);
      }
    });
  }, [threads, sendMessage]);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
    setMessages(prev => prev.map(m => m.threadId === threadId ? { ...m, read: true } : m));
  }, []);

  const togglePin = useCallback((threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, pinned: !t.pinned } : t));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const addTemplate = useCallback((t: Omit<SACommTemplate, 'id'>) => {
    setTemplates(prev => [...prev, { ...t, id: `tpl-${Date.now()}` }]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const totalUnread = threads.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <SACommsContext.Provider value={{
      threads, messages, templates, selectedThreadId, selectThread,
      getThreadMessages, sendMessage, createThread, broadcastMessage,
      markThreadRead, togglePin, deleteMessage, addTemplate, deleteTemplate, totalUnread,
    }}>
      {children}
    </SACommsContext.Provider>
  );
}

export function useSAComms() {
  const ctx = useContext(SACommsContext);
  if (!ctx) throw new Error('useSAComms must be used within SACommsProvider');
  return ctx;
}
