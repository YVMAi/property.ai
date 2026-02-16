import { useState, useRef, useEffect } from 'react';
import { useSAComms } from '@/contexts/SACommsContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, MessageSquare, Mail, Send, Paperclip, Pin, PinOff, MoreHorizontal,
  Megaphone, FileText, Plus, ChevronLeft, CheckCheck, Check, Trash2, ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SACommType } from '@/types/superAdmin';

export default function SuperAdminComms() {
  const {
    threads, templates, selectedThreadId, selectThread,
    getThreadMessages, sendMessage, createThread, broadcastMessage,
    markThreadRead, togglePin, deleteMessage, addTemplate, deleteTemplate, totalUnread,
  } = useSAComms();
  const { pmcs } = useSuperAdmin();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [msgInput, setMsgInput] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // New thread state
  const [newPmcId, setNewPmcId] = useState('');
  const [newType, setNewType] = useState<SACommType>('chat');
  const [newSubject, setNewSubject] = useState('');

  // Email composer state
  const [emailTo, setEmailTo] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Broadcast state
  const [broadcastPmcIds, setBroadcastPmcIds] = useState<string[]>([]);
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState<SACommType>('email');
  const [broadcastSubject, setBroadcastSubject] = useState('');

  // Template state
  const [newTplName, setNewTplName] = useState('');
  const [newTplType, setNewTplType] = useState<SACommType>('email');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplBody, setNewTplBody] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const threadMessages = selectedThreadId ? getThreadMessages(selectedThreadId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  useEffect(() => {
    if (selectedThreadId) markThreadRead(selectedThreadId);
  }, [selectedThreadId, markThreadRead]);

  const filteredThreads = threads
    .filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (search && !t.pmcName.toLowerCase().includes(search.toLowerCase()) && !t.pmcAdminEmail.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime();
    });

  const handleSend = () => {
    if (!msgInput.trim() || !selectedThreadId || !selectedThread) return;
    sendMessage(selectedThreadId, msgInput, selectedThread.type);
    setMsgInput('');
    toast({ title: 'Message Sent' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreateThread = () => {
    if (!newPmcId) return;
    const pmc = pmcs.find(p => p.id === newPmcId);
    if (!pmc) return;
    createThread(newPmcId, pmc.name, pmc.adminEmail, newType, newSubject || undefined);
    setShowNewThread(false);
    setNewPmcId(''); setNewSubject('');
    setMobileShowThread(true);
    toast({ title: 'Thread Created', description: `New ${newType} thread with ${pmc.name}` });
  };

  const handleSendEmail = () => {
    if (!emailTo.length || !emailSubject.trim() || !emailBody.trim()) return;
    emailTo.forEach(pmcId => {
      const pmc = pmcs.find(p => p.id === pmcId);
      if (!pmc) return;
      const existing = threads.find(t => t.pmcId === pmcId && t.type === 'email');
      if (existing) {
        sendMessage(existing.id, emailBody, 'email', emailSubject);
      } else {
        const tid = createThread(pmcId, pmc.name, pmc.adminEmail, 'email', emailSubject);
        sendMessage(tid, emailBody, 'email', emailSubject);
      }
    });
    setShowEmailComposer(false);
    setEmailTo([]); setEmailSubject(''); setEmailBody('');
    toast({ title: 'Email Sent', description: `Sent to ${emailTo.length} recipient(s)` });
  };

  const handleBroadcast = () => {
    if (!broadcastPmcIds.length || !broadcastContent.trim()) return;
    broadcastMessage(broadcastPmcIds, broadcastContent, broadcastType, broadcastSubject || undefined);
    setShowBroadcast(false);
    setBroadcastPmcIds([]); setBroadcastContent(''); setBroadcastSubject('');
    toast({ title: 'Broadcast Sent', description: `Message sent to ${broadcastPmcIds.length} PMC(s)` });
  };

  const handleAddTemplate = () => {
    if (!newTplName.trim() || !newTplBody.trim()) return;
    addTemplate({ name: newTplName, type: newTplType, subject: newTplSubject || undefined, body: newTplBody });
    setNewTplName(''); setNewTplSubject(''); setNewTplBody('');
    toast({ title: 'Template Added' });
  };

  const loadTemplate = (tpl: typeof templates[0]) => {
    if (tpl.type === 'email') {
      setEmailSubject(tpl.subject || '');
      setEmailBody(tpl.body);
      setShowEmailComposer(true);
    } else {
      setMsgInput(tpl.body);
    }
    setShowTemplates(false);
  };

  const handleSelectThread = (threadId: string) => {
    selectThread(threadId);
    setMobileShowThread(true);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="border-border/50 mt-4 overflow-hidden">
      <div className="flex h-[calc(100vh-320px)] min-h-[500px]">
        {/* Contact List - Left Panel */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border/50 flex flex-col ${mobileShowThread ? 'hidden md:flex' : 'flex'}`}>
          {/* Toolbar */}
          <div className="p-3 border-b border-border/30 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setShowNewThread(true)}>
                <Plus className="h-3 w-3" /> New Chat
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setShowEmailComposer(true)}>
                <Mail className="h-3 w-3" /> Email
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowBroadcast(true)}>
                <Megaphone className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowTemplates(true)}>
                <FileText className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Thread List */}
          <ScrollArea className="flex-1">
            {filteredThreads.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No conversations found</div>
            )}
            {filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`w-full text-left p-3 border-b border-border/20 hover:bg-muted/50 transition-colors ${selectedThreadId === thread.id ? 'bg-primary/10' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative mt-0.5">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                      {thread.pmcName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    {thread.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-secondary border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {thread.pinned && <Pin className="h-3 w-3 text-primary-foreground flex-shrink-0" />}
                        <span className="text-sm font-medium text-foreground truncate">{thread.pmcName}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(thread.lastTimestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {thread.type === 'email' ? <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      <p className="text-xs text-muted-foreground truncate">{thread.subject || thread.lastMessage}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <Badge className="mt-1 bg-destructive/80 text-white text-[10px] h-4 px-1.5">{thread.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Thread - Right Panel */}
        <div className={`flex-1 flex flex-col ${!mobileShowThread && selectedThreadId ? 'hidden md:flex' : mobileShowThread ? 'flex' : 'hidden md:flex'}`}>
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => { setMobileShowThread(false); selectThread(null); }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {selectedThread.pmcName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedThread.pmcName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {selectedThread.online && <span className="h-1.5 w-1.5 rounded-full bg-secondary inline-block" />}
                      {selectedThread.pmcAdminEmail}
                      {selectedThread.subject && <> · {selectedThread.subject}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePin(selectedThread.id)}>
                    {selectedThread.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Search className="h-3.5 w-3.5" /> Search in Thread</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><FileText className="h-3.5 w-3.5" /> Export Thread PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3 max-w-3xl mx-auto">
                  {threadMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'super' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] group relative`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                          msg.senderType === 'super'
                            ? 'bg-primary/20 text-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}>
                          {msg.subject && <p className="text-xs font-semibold mb-1 text-muted-foreground">Re: {msg.subject}</p>}
                          {msg.content}
                          {msg.attachments?.map(att => (
                            <div key={att.name} className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-foreground">
                              <Paperclip className="h-3 w-3" /> {att.name} ({att.size})
                            </div>
                          ))}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${msg.senderType === 'super' ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                          {msg.senderType === 'super' && (
                            msg.read ? <CheckCheck className="h-3 w-3 text-primary-foreground" /> : <Check className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {msg.senderType === 'super' && (
                          <Button variant="ghost" size="icon" className="absolute -left-8 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteMessage(msg.id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border/30">
                <div className="flex items-end gap-2 max-w-3xl mx-auto">
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Textarea
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Type a ${selectedThread.type === 'email' ? 'reply' : 'message'}...`}
                    className="min-h-[40px] max-h-32 resize-none text-sm"
                    rows={1}
                  />
                  <Button size="icon" className="h-9 w-9 flex-shrink-0 btn-primary" onClick={handleSend} disabled={!msgInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs">or start a new chat / email</p>
              {totalUnread > 0 && <Badge className="bg-destructive/80 text-white">{totalUnread} unread</Badge>}
            </div>
          )}
        </div>
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Conversation</DialogTitle><DialogDescription>Start a chat or email thread with a PMC admin.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">PMC</Label>
              <Select value={newPmcId} onValueChange={setNewPmcId}>
                <SelectTrigger><SelectValue placeholder="Select PMC..." /></SelectTrigger>
                <SelectContent>
                  {pmcs.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.adminEmail})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={newType} onValueChange={v => setNewType(v as SACommType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newType === 'email' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Email subject..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewThread(false)}>Cancel</Button>
            <Button onClick={handleCreateThread} disabled={!newPmcId}>Create Thread</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Dialog */}
      <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Compose Email</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">To (PMC Admins)</Label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {pmcs.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={emailTo.includes(p.id)} onCheckedChange={c => {
                      setEmailTo(prev => c ? [...prev, p.id] : prev.filter(id => id !== p.id));
                    }} />
                    {p.name} ({p.adminEmail})
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email subject..." />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Body</Label>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setShowTemplates(true)}>
                  <FileText className="h-3 w-3" /> Load Template
                </Button>
              </div>
              <Textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Email content..." rows={8} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailComposer(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={!emailTo.length || !emailSubject.trim() || !emailBody.trim()} className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Broadcast Message</DialogTitle>
            <DialogDescription>Send a message to multiple PMC admins at once.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Select PMCs</Label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Checkbox
                    checked={broadcastPmcIds.length === pmcs.length}
                    onCheckedChange={c => setBroadcastPmcIds(c ? pmcs.map(p => p.id) : [])}
                  />
                  Select All ({pmcs.length})
                </label>
                <Separator />
                {pmcs.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={broadcastPmcIds.includes(p.id)} onCheckedChange={c => {
                      setBroadcastPmcIds(prev => c ? [...prev, p.id] : prev.filter(id => id !== p.id));
                    }} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={broadcastType} onValueChange={v => setBroadcastType(v as SACommType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {broadcastType === 'email' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} placeholder="Subject..." />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} placeholder="Broadcast message..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBroadcast(false)}>Cancel</Button>
            <Button onClick={handleBroadcast} disabled={!broadcastPmcIds.length || !broadcastContent.trim()} className="gap-1.5">
              <Megaphone className="h-3.5 w-3.5" /> Send to {broadcastPmcIds.length} PMC(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Message Templates</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-3">
              {templates.map(tpl => (
                <div key={tpl.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{tpl.type === 'email' ? 'Email' : 'Chat'}</Badge>
                      <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => loadTemplate(tpl)}>Use</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteTemplate(tpl.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  {tpl.subject && <p className="text-xs text-muted-foreground mb-0.5">Subject: {tpl.subject}</p>}
                  <p className="text-xs text-muted-foreground line-clamp-2">{tpl.body}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />
            <h4 className="text-sm font-semibold mb-3">Add New Template</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={newTplName} onChange={e => setNewTplName(e.target.value)} placeholder="Template name" className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={newTplType} onValueChange={v => setNewTplType(v as SACommType)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newTplType === 'email' && (
                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Input value={newTplSubject} onChange={e => setNewTplSubject(e.target.value)} placeholder="Subject template..." className="h-8" />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Body</Label>
                <Textarea value={newTplBody} onChange={e => setNewTplBody(e.target.value)} placeholder="Template body... Use [PMCName], [DueDate], etc." rows={4} />
              </div>
              <Button size="sm" onClick={handleAddTemplate} disabled={!newTplName.trim() || !newTplBody.trim()} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Template
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
