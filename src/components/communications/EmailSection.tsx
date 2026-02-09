import { useState, useMemo } from 'react';
import { Mail, MailPlus, Search, Send, ArrowUpDown, Paperclip, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Message, CommunicationUser, ComposeEmailData } from '@/types/communication';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailSectionProps {
  emails: Message[];
  selectedUser: CommunicationUser | undefined;
  onSendEmail: (data: ComposeEmailData) => void;
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function EmailSection({ emails, selectedUser, onSendEmail }: EmailSectionProps) {
  const [emailSearch, setEmailSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const filteredEmails = useMemo(() => {
    if (!emailSearch.trim()) return emails;
    const q = emailSearch.toLowerCase();
    return emails.filter(
      (e) =>
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q)
    );
  }, [emails, emailSearch]);

  const handleAttach = () => {
    const mockFile = `Document_${Date.now().toString(36)}.pdf`;
    setAttachments((prev) => [...prev, mockFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const resetCompose = () => {
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Subject and body are required.',
        variant: 'destructive',
      });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    onSendEmail({ subject: subject.trim(), body: body.trim(), attachments });
    toast({
      title: 'Email sent',
      description: `Email sent to ${selectedUser?.name}.`,
    });
    resetCompose();
    setConfirmOpen(false);
    setComposeOpen(false);
  };

  if (!selectedUser) {
    return (
      <div className="card-elevated flex-1 flex flex-col items-center justify-center text-center p-8">
        <Mail className="h-14 w-14 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No User Selected</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Select a contact above to view email history and send new emails.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated flex-1 flex flex-col min-h-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Email History</h3>
            <p className="text-xs text-muted-foreground">{selectedUser.name} · {filteredEmails.length} emails</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search emails…"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background border-input"
            />
          </div>
          <Button
            size="sm"
            className="bg-secondary text-secondary-foreground hover:opacity-90"
            onClick={() => setComposeOpen(true)}
          >
            <MailPlus className="h-4 w-4 mr-1" />
            Compose
          </Button>
        </div>
      </div>

      {/* Email list */}
      <ScrollArea className="flex-1">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Mail className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {emailSearch ? 'No emails match your search.' : 'No email history yet.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-20">Direction</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-32">Date</TableHead>
                <TableHead className="w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.map((email) => {
                const isExpanded = expandedId === email.id;
                return (
                  <TableRow
                    key={email.id}
                    className="cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : email.id)}
                  >
                    <TableCell className="py-2 px-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        variant={email.direction === 'sent' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {email.direction === 'sent' ? '↑ Sent' : '↓ Received'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div>
                        <p className={cn('text-sm', !isExpanded && 'truncate max-w-xs')}>
                          {email.subject || '(No subject)'}
                        </p>
                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-lg bg-muted text-sm text-foreground/90 leading-relaxed">
                            {email.content}
                            {email.attachments && email.attachments.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {email.attachments.map((att, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-[10px] bg-accent rounded-full px-2 py-0.5 text-accent-foreground"
                                  >
                                    📎 {att}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(email.timestamp)}
                      <br />
                      {formatTime(email.timestamp)}
                    </TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          'text-[10px] font-medium uppercase',
                          email.status === 'read' && 'text-secondary-foreground',
                          email.status === 'delivered' && 'text-primary-foreground',
                          email.status === 'sent' && 'text-muted-foreground'
                        )}
                      >
                        {email.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ScrollArea>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-primary" />
              New Email
            </DialogTitle>
            <DialogDescription>
              Send email to <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
              <Input
                placeholder="Email subject…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-background border-input"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body</label>
              <Textarea
                placeholder="Write your email…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-background border-input min-h-[120px] resize-none"
                maxLength={5000}
              />
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Attachments</label>
                <Button variant="ghost" size="sm" onClick={handleAttach} className="h-7 text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  Attach File
                </Button>
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {attachments.map((att, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-1"
                    >
                      📎 {att}
                      <button
                        onClick={() => removeAttachment(i)}
                        className="ml-0.5 hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { resetCompose(); setComposeOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!subject.trim() || !body.trim()}>
              <Send className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send Email</DialogTitle>
            <DialogDescription>
              Send this email to <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">{subject}</p>
            <p className="text-muted-foreground mt-1 line-clamp-3">{body}</p>
            {attachments.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{attachments.length} attachment(s)</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmSend}>
              <Send className="h-4 w-4 mr-1" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
