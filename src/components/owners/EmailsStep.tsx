import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Plus, Trash2, Send, ToggleLeft, ToggleRight, KeyRound,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OwnerEmail, EmailStatus } from '@/types/owner';

type EmailEntry = Omit<OwnerEmail, 'loginCount' | 'lastLogin'> & {
  loginCount?: number;
  lastLogin?: string;
};

interface EmailsStepProps {
  emails: EmailEntry[];
  onChange: (emails: EmailEntry[]) => void;
  errors: Record<string, string>;
}

export default function EmailsStep({ emails, onChange, errors }: EmailsStepProps) {
  const [newEmail, setNewEmail] = useState('');
  const { toast } = useToast();

  const addEmail = () => {
    if (!newEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    if (emails.some((e) => e.email.toLowerCase() === newEmail.toLowerCase())) {
      toast({
        title: 'Duplicate email',
        description: 'This email is already added.',
        variant: 'destructive',
      });
      return;
    }
    const entry: EmailEntry = {
      id: Math.random().toString(36).substring(2, 11),
      email: newEmail,
      isPrimary: emails.length === 0,
      status: 'active' as EmailStatus,
    };
    onChange([...emails, entry]);
    setNewEmail('');
  };

  const removeEmail = (id: string) => {
    const updated = emails.filter((e) => e.id !== id);
    if (updated.length > 0 && !updated.some((e) => e.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const toggleEmailStatus = (id: string) => {
    onChange(
      emails.map((e) =>
        e.id === id
          ? { ...e, status: (e.status === 'active' ? 'deactivated' : 'active') as EmailStatus }
          : e
      )
    );
  };

  const setPrimary = (id: string) => {
    onChange(emails.map((e) => ({ ...e, isPrimary: e.id === id })));
  };

  const sendInvite = (email: string) => {
    toast({
      title: 'Invite sent',
      description: `Invitation email sent to ${email}.`,
    });
  };

  const sendPasswordReset = (email: string) => {
    toast({
      title: 'Password reset sent',
      description: `Password reset link sent to ${email}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Owner Emails</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add one or more emails. The primary email is used for login and notifications.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="owner@example.com"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addEmail}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {errors.emails && (
        <p className="text-sm text-destructive-foreground">{errors.emails}</p>
      )}

      {emails.length > 0 && (
        <RadioGroup
          value={emails.find((e) => e.isPrimary)?.id || ''}
          onValueChange={setPrimary}
          className="space-y-2"
        >
          {emails.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <RadioGroupItem value={entry.id} id={entry.id} />
                <Label htmlFor={entry.id} className="font-normal cursor-pointer truncate">
                  {entry.email}
                </Label>
                {entry.isPrimary && (
                  <Badge className="bg-primary/20 text-primary border-0 text-xs shrink-0">
                    Primary
                  </Badge>
                )}
                <Badge
                  className={
                    entry.status === 'active'
                      ? 'bg-secondary/30 text-secondary-foreground border-0 text-xs shrink-0'
                      : 'bg-warning/30 text-warning-foreground border-0 text-xs shrink-0'
                  }
                >
                  {entry.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Send Invite"
                  onClick={() => sendInvite(entry.email)}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Reset Password"
                  onClick={() => sendPasswordReset(entry.email)}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title={entry.status === 'active' ? 'Deactivate' : 'Activate'}
                  onClick={() => toggleEmailStatus(entry.id)}
                >
                  {entry.status === 'active' ? (
                    <ToggleRight className="h-3.5 w-3.5 text-secondary" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5 text-warning-foreground" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Remove"
                  onClick={() => removeEmail(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Login Logs for existing emails */}
      {emails.some((e) => (e as any).loginCount > 0) && (
        <div className="mt-4">
          <Label className="mb-2 block">Login Activity</Label>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card">
                  <th className="text-left p-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Logins</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {emails
                  .filter((e) => (e as any).loginCount > 0)
                  .map((e) => (
                    <tr key={e.id} className="border-t border-border/30">
                      <td className="p-2">{e.email}</td>
                      <td className="p-2 text-center">{(e as any).loginCount}</td>
                      <td className="p-2 text-muted-foreground">
                        {(e as any).lastLogin
                          ? new Date((e as any).lastLogin).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
