import { useState } from 'react';
import { Radio, Send, Paperclip, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { CommunicationUser } from '@/types/communication';

interface BroadcastDialogProps {
  users: CommunicationUser[];
  onSendBroadcast: (content: string, attachments: string[], recipientIds: string[]) => void;
}

export default function BroadcastDialog({ users, onSendBroadcast }: BroadcastDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredUsers = searchQuery.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedRecipients.length === filteredUsers.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredUsers.map((u) => u.id));
    }
  };

  const handleAttach = () => {
    const mockFile = `Broadcast_Attachment_${Date.now().toString(36)}.pdf`;
    setAttachments((prev) => [...prev, mockFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!message.trim() || selectedRecipients.length === 0) return;
    onSendBroadcast(message.trim(), attachments, selectedRecipients);
    toast({
      title: 'Broadcast sent',
      description: `Message sent to ${selectedRecipients.length} recipient(s).`,
    });
    setMessage('');
    setAttachments([]);
    setSelectedRecipients([]);
    setSearchQuery('');
    setOpen(false);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'owner': return 'Owner';
      case 'tenant': return 'Tenant';
      case 'vendor': return 'Vendor';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Radio className="h-3.5 w-3.5" />
          Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Broadcast Message
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Send a message to multiple contacts at once. Each recipient receives it as an individual message.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Recipients */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Recipients ({selectedRecipients.length} selected)
            </label>
            <div className="relative mb-2">
              <Input
                placeholder="Search contacts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs bg-background border-input"
              />
            </div>
            <ScrollArea className="h-40 border border-border rounded-lg">
              {/* Select all */}
              <button
                onClick={selectAll}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent border-b border-border transition-colors"
              >
                <Checkbox
                  checked={filteredUsers.length > 0 && selectedRecipients.length === filteredUsers.length}
                  className="h-3.5 w-3.5"
                />
                <span className="font-medium text-foreground">Select All</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {filteredUsers.length}
                </Badge>
              </button>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleRecipient(user.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={selectedRecipients.includes(user.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="font-medium text-foreground truncate">{user.name}</span>
                  <Badge variant="outline" className="ml-auto text-[9px] shrink-0">
                    {typeLabel(user.type)}
                  </Badge>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">No contacts found.</p>
              )}
            </ScrollArea>

            {/* Selected chips */}
            {selectedRecipients.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedRecipients.slice(0, 5).map((id) => {
                  const user = users.find((u) => u.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="text-[10px] gap-1">
                      <Check className="h-2.5 w-2.5" />
                      {user?.name || id}
                    </Badge>
                  );
                })}
                {selectedRecipients.length > 5 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{selectedRecipients.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
            <Textarea
              placeholder="Type your broadcast message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-background border-input text-sm resize-none"
              maxLength={2000}
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((att, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-1"
                >
                  📎 {att}
                  <button onClick={() => removeAttachment(i)} aria-label={`Remove ${att}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleAttach} className="gap-1.5 text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
              Attach
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() || selectedRecipients.length === 0}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Send to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
