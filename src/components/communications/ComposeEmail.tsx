import { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ComposeEmailData, CommunicationUser } from '@/types/communication';
import { useToast } from '@/hooks/use-toast';

interface ComposeEmailProps {
  selectedUser: CommunicationUser | undefined;
  onSend: (data: ComposeEmailData) => void;
}

export default function ComposeEmail({ selectedUser, onSend }: ComposeEmailProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setSubject('');
    setBody('');
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
    onSend({ subject: subject.trim(), body: body.trim(), attachments: [] });
    toast({
      title: 'Email sent',
      description: `Email sent to ${selectedUser?.name}.`,
    });
    reset();
    setConfirmOpen(false);
    setOpen(false);
  };

  if (!selectedUser) return null;

  return (
    <div className="card-elevated p-4 md:p-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
          <Input
            placeholder="Email subject…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background border-input h-10"
            maxLength={200}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
        <Textarea
          placeholder="Write your email…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="bg-background border-input min-h-[100px] resize-none"
          maxLength={5000}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          To: <span className="font-medium text-foreground">{selectedUser.email}</span>
        </p>
        <div className="flex items-center gap-2">
          {(subject || body) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            size="sm"
            className="bg-secondary text-secondary-foreground hover:opacity-90"
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim()}
          >
            <Send className="h-4 w-4 mr-1" />
            Send Email
          </Button>
        </div>
      </div>

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
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
