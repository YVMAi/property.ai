import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, MessageSquare, Mail, Phone, ExternalLink, Send, Paperclip, Ticket, Eye } from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'How do I add a new property?', a: 'Navigate to Properties from the sidebar, then click "Add Property". Fill in the address, unit details, and assign an owner.' },
  { q: 'How do I invite an owner?', a: 'Go to Users → Owners, click "Add Owner", complete the form, and the system will send an invite email with a setup link.' },
  { q: 'Trouble with MFA / two-factor authentication?', a: "If you're locked out of MFA, contact your administrator to reset your MFA. They can do this from Settings → People." },
  { q: 'How do I generate a financial report?', a: 'Go to Reports, select the date range and report type (P&L, Balance Sheet, etc.), then click "Generate". You can export to PDF or CSV.' },
  { q: 'Can I change my email address?', a: 'Email changes require administrator action for security. Contact your admin or submit a support ticket.' },
  { q: 'How does the broadcast messaging work?', a: 'In Communications, click "Broadcast". Select recipient types (Owners, Tenants, Vendors), pick individual recipients, type your message, and send.' },
  { q: 'What payment methods are supported?', a: 'We support credit/debit cards (Visa, Mastercard, Amex) and bank transfers. Configure these in Settings → Billing.' },
  { q: 'How do I export tenant data?', a: 'Go to Users → Tenants, use the export button at the top right to download a CSV of all tenant records.' },
];

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  response?: string;
}

const INITIAL_TICKETS: SupportTicket[] = [
  { id: 'TKT-001', subject: 'Unable to generate P&L report', description: 'Report page shows a blank screen when selecting Q4 2025.', status: 'resolved', priority: 'high', createdAt: '2026-01-15', updatedAt: '2026-01-17', response: 'Fixed in the latest update. Please clear your cache and retry.' },
  { id: 'TKT-002', subject: 'Owner invite email not received', description: 'Sent invite to owner but they did not get the email.', status: 'in_progress', priority: 'medium', createdAt: '2026-01-28', updatedAt: '2026-02-01' },
  { id: 'TKT-003', subject: 'Request to add custom fields on tenant form', description: 'We need a custom "Emergency Contact" field on tenant profiles.', status: 'open', priority: 'low', createdAt: '2026-02-05', updatedAt: '2026-02-05' },
  { id: 'TKT-004', subject: 'MFA reset for user john@acme.com', description: 'User locked out of MFA, needs reset.', status: 'closed', priority: 'high', createdAt: '2025-12-10', updatedAt: '2025-12-11', response: 'MFA has been reset. User can re-enroll.' },
  { id: 'TKT-005', subject: 'CSV export includes wrong columns', description: 'Tenant export CSV has duplicate address columns.', status: 'resolved', priority: 'medium', createdAt: '2026-01-20', updatedAt: '2026-01-22', response: 'Column mapping corrected. Export should work properly now.' },
];

const STATUS_BADGE: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', variant: 'destructive' },
  in_progress: { label: 'In Progress', variant: 'default' },
  resolved: { label: 'Resolved', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'outline' },
};

export default function HelpSupportSection() {
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! How can I help you today? Try asking about properties, billing, or user management.' },
  ]);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [ticketFilter, setTicketFilter] = useState<'all' | TicketStatus>('all');
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim().toLowerCase();
    setChatMessages((prev) => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');

    const match = FAQ_ITEMS.find((faq) =>
      faq.q.toLowerCase().includes(question) ||
      question.split(' ').some((w) => w.length > 3 && faq.q.toLowerCase().includes(w))
    );

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: match
            ? match.a
            : "I'm not sure about that. You can browse the FAQ below or submit a support ticket for detailed assistance.",
        },
      ]);
    }, 600);
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: ticketSubject.trim(),
      description: ticketDesc.trim(),
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTickets((prev) => [newTicket, ...prev]);
    toast({ title: 'Ticket submitted', description: `Ticket ${newTicket.id} created. Our team will respond within 24 hours.` });
    setTicketOpen(false);
    setTicketSubject('');
    setTicketDesc('');
  };

  const filteredTickets = ticketFilter === 'all' ? tickets : tickets.filter((t) => t.status === ticketFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Help Chat */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Quick Help
          </CardTitle>
          <CardDescription>Ask a question and get instant answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-3 h-48 overflow-y-auto mb-3 space-y-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            />
            <Button onClick={handleChatSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Separator />

      {/* Contact & Ticket */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>support@propertyai.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+1 (555) 123-4567</span>
            </div>
            <p className="text-xs text-muted-foreground">Mon–Fri, 9 AM – 6 PM EST</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Knowledge Base
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Submit a Ticket</CardTitle>
            <CardDescription>Get personalized help from our team</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-1.5" />
                  Open Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Submit Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Input placeholder="Brief description…" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe your issue in detail…" value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Attachment (optional)</Label>
                    <Input type="file" />
                  </div>
                  <Button onClick={handleSubmitTicket} className="w-full">
                    <Send className="h-4 w-4 mr-1.5" />
                    Submit Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Ticket History */}
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Ticket History
            </CardTitle>
            <CardDescription>Track all your submitted support tickets</CardDescription>
          </div>
          <SearchableSelect
            options={[
              { value: 'all', label: 'All' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            value={ticketFilter}
            onValueChange={(v) => setTicketFilter(v as typeof ticketFilter)}
            placeholder="Filter"
            triggerClassName="w-36"
          />
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tickets found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.subject}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[t.status].variant}>{STATUS_BADGE[t.status].label}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{t.priority}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.createdAt}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setViewTicket(t)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={!!viewTicket} onOpenChange={(open) => !open && setViewTicket(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewTicket?.id} — {viewTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="flex gap-2">
                <Badge variant={STATUS_BADGE[viewTicket.status].variant}>{STATUS_BADGE[viewTicket.status].label}</Badge>
                <Badge variant="outline" className="capitalize">{viewTicket.priority} priority</Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{viewTicket.description}</p>
              </div>
              {viewTicket.response && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <Label className="text-muted-foreground">Support Response</Label>
                  <p className="mt-1">{viewTicket.response}</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created: {viewTicket.createdAt}</span>
                <span>Updated: {viewTicket.updatedAt}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
