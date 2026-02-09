import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, MessageSquare, Mail, Phone, ExternalLink, Send, Paperclip } from 'lucide-react';

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

export default function HelpSupportSection() {
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! How can I help you today? Try asking about properties, billing, or user management.' },
  ]);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim().toLowerCase();
    setChatMessages((prev) => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');

    // Simple FAQ matching
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
    toast({ title: 'Ticket submitted', description: 'Our team will respond within 24 hours.' });
    setTicketOpen(false);
    setTicketSubject('');
    setTicketDesc('');
  };

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
    </div>
  );
}
