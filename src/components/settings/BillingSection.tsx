import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Download, ArrowUpRight, Check } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending';
}

const PLANS = [
  { name: 'Starter', price: '$29/mo', features: ['5 properties', 'Basic reports', 'Email support'], current: false },
  { name: 'Pro', price: '$79/mo', features: ['50 properties', 'Advanced reports', 'Priority support', 'API access'], current: true },
  { name: 'Enterprise', price: 'Custom', features: ['Unlimited properties', 'Custom integrations', 'Dedicated support', 'SLA'], current: false },
];

const DEMO_INVOICES: Invoice[] = [
  { id: '1', number: 'INV-2026-001', date: '2026-02-01', amount: '$79.00', status: 'paid' },
  { id: '2', number: 'INV-2026-002', date: '2026-01-01', amount: '$79.00', status: 'paid' },
  { id: '3', number: 'INV-2025-012', date: '2025-12-01', amount: '$79.00', status: 'paid' },
  { id: '4', number: 'INV-2025-011', date: '2025-11-01', amount: '$29.00', status: 'paid' },
];

export default function BillingSection() {
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');

  const handleDownloadInvoice = (inv: Invoice) => {
    toast({ title: 'Download started', description: `Downloading ${inv.number}.pdf` });
  };

  const handleDownloadAll = () => {
    toast({ title: 'Exporting invoices', description: 'All invoices are being prepared.' });
  };

  const handleSavePayment = () => {
    toast({ title: 'Payment method updated' });
    setPaymentOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current Plan */}
      <Card className="card-elevated border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>You are on the Pro plan</CardDescription>
            </div>
            <Badge className="bg-primary/20 text-primary-foreground border-primary/30">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">$79</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-1.5">
            {PLANS[1].features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-secondary" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground pt-2">Next billing date: March 1, 2026</p>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`card-elevated ${plan.current ? 'ring-2 ring-primary/40' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <p className="text-2xl font-semibold">{plan.price}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-secondary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? 'outline' : 'default'}
                className="w-full"
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : (
                  <>
                    Upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Payment Method */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{cardNumber}</p>
              <p className="text-xs text-muted-foreground">Expires {cardExpiry}</p>
            </div>
          </div>
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CVV</Label>
                    <Input placeholder="•••" type="password" />
                  </div>
                </div>
                <Button onClick={handleSavePayment} className="w-full">Save Card</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="card-elevated overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Invoice History</CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-1.5" />
            Export All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'paid' ? 'default' : 'outline'} className="capitalize">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadInvoice(inv)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
